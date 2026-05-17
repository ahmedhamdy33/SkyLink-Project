import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/db.js';
import { bookingPassengers, bookings, flights, users } from '../data/skylinkData.js';
import { getPublicAppUrl, sendAccountChangeEmail, sendAccountVerificationEmail } from '../services/emailService.js';
import { AppError, asyncHandler } from '../utils/errors.js';

function resolveFullName(user) {
  return user.full_name || user.fullName || [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
}

function sanitizeMemoryUser(user) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function sanitizeAccount(user) {
  return {
    user_id: user.user_id,
    full_name: resolveFullName(user),
    email: user.email,
    phone: user.phone || null,
    nationality: user.nationality || null,
    role: user.role,
    created_at: user.created_at,
    email_verified_at: user.email_verified_at || null,
    is_email_verified: Boolean(user.email_verified_at || !user.email_verification_token_hash)
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      role: user.role,
      fullName: resolveFullName(user)
    },
    process.env.JWT_SECRET || 'skylink-secret-123',
    { expiresIn: '7d' }
  );
}

function createVerificationToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
}

function createVerificationUrl(rawToken) {
  return `${getPublicAppUrl()}/verify-email?token=${encodeURIComponent(rawToken)}`;
}

async function safeSendEmail(fn, payload) {
  try {
    return await fn(payload);
  } catch (error) {
    return { status: 'failed', reason: error.message || 'Email request failed.' };
  }
}

export const getUsers = asyncHandler(async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT user_id, full_name, email, phone, nationality, role, created_at
      FROM dbo.Users
      ORDER BY created_at DESC
    `);
    return res.json(result.recordset);
  } catch {
    return res.json(users.map(sanitizeMemoryUser));
  }
});

export const getMyAccount = asyncHandler(async (req, res) => {
  const userId = Number(req.user.id);

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT user_id, full_name, email, phone, nationality, role, created_at,
               email_verified_at, email_verification_token_hash
        FROM dbo.Users
        WHERE user_id = @user_id
      `);

    if (!result.recordset.length) throw new AppError('User not found.', 404);
    return res.json({ user: sanitizeAccount(result.recordset[0]) });
  } catch (error) {
    if (error instanceof AppError) throw error;
    const user = users.find((item) => Number(item.user_id) === userId);
    if (!user) throw new AppError('User not found.', 404);
    return res.json({ user: sanitizeAccount(user) });
  }
});

export const updateMyAccount = asyncHandler(async (req, res) => {
  const userId = Number(req.user.id);
  const fullName = String(req.body.fullName || req.body.full_name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim() || null;
  const nationality = String(req.body.nationality || '').trim() || null;

  if (!fullName || !email) {
    throw new AppError('Name and email are required.', 400);
  }

  try {
    const pool = await getPool();
    const currentResult = await pool
      .request()
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM dbo.Users WHERE user_id = @user_id');
    const current = currentResult.recordset[0];
    if (!current) throw new AppError('User not found.', 404);

    const emailChanged = current.email.toLowerCase() !== email;
    if (emailChanged) {
      const duplicate = await pool
        .request()
        .input('email', sql.NVarChar(180), email)
        .input('user_id', sql.Int, userId)
        .query('SELECT user_id FROM dbo.Users WHERE email = @email AND user_id <> @user_id');
      if (duplicate.recordset.length) throw new AppError('An account with this email already exists.', 409);
    }

    const { rawToken, tokenHash } = emailChanged ? createVerificationToken() : {};
    const result = await pool
      .request()
      .input('user_id', sql.Int, userId)
      .input('full_name', sql.NVarChar(120), fullName)
      .input('email', sql.NVarChar(180), email)
      .input('phone', sql.NVarChar(40), phone)
      .input('nationality', sql.NVarChar(80), nationality)
      .input('tokenHash', sql.NVarChar(255), tokenHash || null)
      .query(`
        UPDATE dbo.Users
        SET full_name = @full_name,
            email = @email,
            phone = @phone,
            nationality = @nationality,
            email_verification_token_hash = CASE WHEN @tokenHash IS NULL THEN email_verification_token_hash ELSE @tokenHash END,
            email_verification_sent_at = CASE WHEN @tokenHash IS NULL THEN email_verification_sent_at ELSE SYSUTCDATETIME() END,
            email_verified_at = CASE WHEN @tokenHash IS NULL THEN email_verified_at ELSE NULL END
        OUTPUT inserted.user_id, inserted.full_name, inserted.email, inserted.phone, inserted.nationality, inserted.role,
               inserted.created_at, inserted.email_verified_at, inserted.email_verification_token_hash
        WHERE user_id = @user_id
      `);

    const updated = result.recordset[0];
    const delivery = emailChanged
      ? await safeSendEmail(sendAccountVerificationEmail, {
          email: updated.email,
          fullName: resolveFullName(updated),
          verificationUrl: createVerificationUrl(rawToken),
          subject: 'Confirm your new SkyLink email'
        })
      : { status: 'not_needed' };

    return res.json({
      user: sanitizeAccount(updated),
      token: signToken(updated),
      emailChanged,
      emailDeliveryStatus: delivery.status,
      emailDeliveryReason: delivery.reason || null
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    const user = users.find((item) => Number(item.user_id) === userId);
    if (!user) throw new AppError('User not found.', 404);

    const emailChanged = String(user.email).toLowerCase() !== email;
    if (emailChanged && users.some((item) => item.email.toLowerCase() === email && Number(item.user_id) !== userId)) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const token = emailChanged ? createVerificationToken() : null;
    user.full_name = fullName;
    user.email = email;
    user.phone = phone;
    user.nationality = nationality;
    if (token) {
      user.email_verification_token_hash = token.tokenHash;
      user.email_verification_sent_at = new Date().toISOString();
      user.email_verified_at = null;
    }

    const delivery = token
      ? await safeSendEmail(sendAccountVerificationEmail, {
          email: user.email,
          fullName: resolveFullName(user),
          verificationUrl: createVerificationUrl(token.rawToken),
          subject: 'Confirm your new SkyLink email'
        })
      : { status: 'not_needed' };

    return res.json({
      user: sanitizeAccount(user),
      token: signToken(user),
      emailChanged,
      emailDeliveryStatus: delivery.status,
      emailDeliveryReason: delivery.reason || null
    });
  }
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const userId = Number(req.user.id);
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required.', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters.', 400);
  }

  try {
    const pool = await getPool();
    const currentResult = await pool
      .request()
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM dbo.Users WHERE user_id = @user_id');
    const user = currentResult.recordset[0];
    if (!user) throw new AppError('User not found.', 404);
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      throw new AppError('Current password is incorrect.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool
      .request()
      .input('user_id', sql.Int, userId)
      .input('password_hash', sql.NVarChar(255), passwordHash)
      .query('UPDATE dbo.Users SET password_hash = @password_hash WHERE user_id = @user_id');

    const delivery = await safeSendEmail(sendAccountChangeEmail, {
      email: user.email,
      fullName: resolveFullName(user),
      subject: 'Your SkyLink password was changed',
      title: 'Password changed',
      message: 'Your SkyLink account password was changed successfully.'
    });

    return res.json({
      message: 'Password updated successfully.',
      emailDeliveryStatus: delivery.status,
      emailDeliveryReason: delivery.reason || null
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    const user = users.find((item) => Number(item.user_id) === userId);
    if (!user) throw new AppError('User not found.', 404);
    if (user.password !== currentPassword) throw new AppError('Current password is incorrect.', 400);
    user.password = newPassword;

    const delivery = await safeSendEmail(sendAccountChangeEmail, {
      email: user.email,
      fullName: resolveFullName(user),
      subject: 'Your SkyLink password was changed',
      title: 'Password changed',
      message: 'Your SkyLink account password was changed successfully.'
    });

    return res.json({
      message: 'Password updated successfully.',
      emailDeliveryStatus: delivery.status,
      emailDeliveryReason: delivery.reason || null
    });
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const roleResult = await new sql.Request(transaction)
      .input('user_id', sql.Int, id)
      .query('SELECT role FROM dbo.Users WHERE user_id = @user_id');

    const user = roleResult.recordset[0];
    if (!user || user.role === 'admin') {
      await transaction.rollback();
      throw new AppError('Cannot delete this user.', 400);
    }

    await new sql.Request(transaction)
      .input('user_id', sql.Int, id)
      .query(`
        DELETE p
        FROM dbo.Payments p
        INNER JOIN dbo.Bookings b ON b.booking_id = p.booking_id
        WHERE b.user_id = @user_id;

        DELETE fsb
        FROM dbo.FlightSeatBookings fsb
        INNER JOIN dbo.Bookings b ON b.booking_id = fsb.booking_id
        WHERE b.user_id = @user_id;

        DELETE bp
        FROM dbo.BookingPassengers bp
        INNER JOIN dbo.Bookings b ON b.booking_id = bp.booking_id
        WHERE b.user_id = @user_id;

        DELETE FROM dbo.Bookings WHERE user_id = @user_id;
        DELETE FROM dbo.Users WHERE user_id = @user_id;
      `);

    await transaction.commit();
    return res.status(204).send();
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    if (error instanceof AppError) throw error;
    const user = users.find((item) => item.user_id === id);
    if (!user || user.role === 'admin') throw new AppError('Cannot delete this user.', 400);
    const index = users.findIndex((item) => item.user_id === user.user_id);
    users.splice(index, 1);
    return res.status(204).send();
  }
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  try {
    const pool = await getPool();
    const [totalsResult, flightsResult, classesResult] = await Promise.all([
      pool.request().query(`
        SELECT
          (SELECT COUNT(*) FROM dbo.Users) AS totalUsers,
          (SELECT COUNT(*) FROM dbo.Bookings) AS totalBookings,
          (SELECT ISNULL(SUM(total_amount), 0) FROM dbo.Bookings WHERE payment_status = N'paid') AS totalRevenue
      `),
      pool.request().query(`
        SELECT f.flight_code, COUNT(b.booking_id) AS bookingCount
        FROM dbo.Flights f
        LEFT JOIN dbo.Bookings b ON b.flight_id = f.flight_id
        GROUP BY f.flight_code
        ORDER BY bookingCount DESC, f.flight_code
      `),
      pool.request().query(`
        SELECT
          bp.class_type,
          COUNT(*) AS passengerCount,
          COUNT(DISTINCT bp.booking_id) AS bookingCount
        FROM dbo.BookingPassengers bp
        GROUP BY bp.class_type
      `)
    ]);

    return res.json({
      totalUsers: totalsResult.recordset[0]?.totalUsers || 0,
      totalBookings: totalsResult.recordset[0]?.totalBookings || 0,
      totalRevenue: Number(totalsResult.recordset[0]?.totalRevenue || 0),
      mostBookedFlights: flightsResult.recordset,
      classCategories: classesResult.recordset
    });
  } catch {
    const totalRevenue = bookings.filter((item) => item.payment_status === 'paid').reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
    const flightCounts = flights
      .map((flight) => ({
        flight_code: flight.flight_code,
        bookingCount: bookings.filter((booking) => booking.flight_id === flight.flight_id).length
      }))
      .sort((left, right) => right.bookingCount - left.bookingCount);

    const classMap = bookingPassengers.reduce((acc, passenger) => {
      const key = passenger.class_type || 'Economy';
      acc[key] ||= { class_type: key, passengerCount: 0, bookingCount: 0 };
      acc[key].passengerCount += 1;
      acc[key].bookingCount += 1;
      return acc;
    }, {});

    return res.json({
      totalUsers: users.length,
      totalBookings: bookings.length,
      totalRevenue,
      mostBookedFlights: flightCounts,
      classCategories: Object.values(classMap)
    });
  }
});
