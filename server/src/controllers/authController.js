import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/db.js';
import { users } from '../data/skylinkData.js';
import { getPublicAppUrl, sendAccountVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { AppError, asyncHandler } from '../utils/errors.js';

let ensureVerificationSchemaPromise;
const PASSWORD_RESET_TOKEN_MINUTES = 30;

function resolveFullName(user) {
  return user.full_name || user.fullName || [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
}

function splitFullName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return { firstName: '', lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ') || parts[0]
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

function sanitizeUser(user) {
  const fullName = resolveFullName(user);
  const { firstName, lastName } = splitFullName(fullName);

  return {
    user_id: user.user_id,
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
    email: user.email,
    phone: user.phone,
    nationality: user.nationality,
    role: user.role,
    created_at: user.created_at,
    email_verified_at: user.email_verified_at || null,
    is_email_verified: Boolean(user.email_verified_at || !user.email_verification_token_hash)
  };
}

function memoryLogin(email, password) {
  const user = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) throw new AppError('Invalid email or password.', 401);
  if (user.email_verification_token_hash && !user.email_verified_at) {
    throw new AppError('Please confirm your email before logging in. Check your inbox for the SkyLink verification message.', 403);
  }
  return user;
}

function createVerificationToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
}

function createVerificationUrl(rawToken) {
  return `${getPublicAppUrl()}/verify-email?token=${encodeURIComponent(rawToken)}`;
}

function createPasswordResetUrl(rawToken) {
  return `${getPublicAppUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

function buildVerificationResponse(email, deliveryStatus, deliveryReason) {
  const baseMessage =
    deliveryStatus === 'sent'
      ? 'Account created. Check your inbox and confirm your email before logging in.'
      : 'Account created, but the confirmation email could not be sent yet. Please configure email delivery and resend verification.';

  return {
    requiresEmailVerification: true,
    email,
    emailDeliveryStatus: deliveryStatus,
    emailDeliveryReason: deliveryReason || null,
    message: baseMessage
  };
}

async function safelySendVerificationEmail(payload) {
  try {
    return await sendAccountVerificationEmail(payload);
  } catch (error) {
    return {
      status: 'failed',
      reason: error.message || 'The verification email request failed.'
    };
  }
}

async function safelySendPasswordResetEmail(payload) {
  try {
    return await sendPasswordResetEmail(payload);
  } catch (error) {
    return {
      status: 'failed',
      reason: error.message || 'The password reset email request failed.'
    };
  }
}

async function ensureVerificationSchema(pool) {
  if (!ensureVerificationSchemaPromise) {
    ensureVerificationSchemaPromise = pool.request().batch(`
      IF COL_LENGTH('dbo.Users', 'email_verification_token_hash') IS NULL
        ALTER TABLE dbo.Users ADD email_verification_token_hash NVARCHAR(255) NULL;

      IF COL_LENGTH('dbo.Users', 'email_verification_sent_at') IS NULL
        ALTER TABLE dbo.Users ADD email_verification_sent_at DATETIME2 NULL;

      IF COL_LENGTH('dbo.Users', 'email_verified_at') IS NULL
        ALTER TABLE dbo.Users ADD email_verified_at DATETIME2 NULL;

      IF COL_LENGTH('dbo.Users', 'password_reset_token_hash') IS NULL
        ALTER TABLE dbo.Users ADD password_reset_token_hash NVARCHAR(255) NULL;

      IF COL_LENGTH('dbo.Users', 'password_reset_sent_at') IS NULL
        ALTER TABLE dbo.Users ADD password_reset_sent_at DATETIME2 NULL;

      IF COL_LENGTH('dbo.Users', 'password_reset_expires_at') IS NULL
        ALTER TABLE dbo.Users ADD password_reset_expires_at DATETIME2 NULL;
    `).catch((error) => {
      ensureVerificationSchemaPromise = null;
      throw error;
    });
  }

  return ensureVerificationSchemaPromise;
}

export const register = asyncHandler(async (req, res) => {
  const { fullName, firstName, lastName, email, password, phone, nationality } = req.body;
  const normalizedFirstName = String(firstName || '').trim();
  const normalizedLastName = String(lastName || '').trim();
  const normalizedFullName = String(fullName || `${normalizedFirstName} ${normalizedLastName}`.trim()).trim();

  if (!normalizedFullName || !email || !password) {
    throw new AppError('First name, last name, email, and password are required.', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { rawToken, tokenHash } = createVerificationToken();

  try {
    const pool = await getPool();
    await ensureVerificationSchema(pool);
    const exists = await pool
      .request()
      .input('email', sql.NVarChar(180), normalizedEmail)
      .query('SELECT user_id FROM dbo.Users WHERE email = @email');

    if (exists.recordset.length) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool
      .request()
      .input('full_name', sql.NVarChar(120), normalizedFullName)
      .input('email', sql.NVarChar(180), normalizedEmail)
      .input('password_hash', sql.NVarChar(255), passwordHash)
      .input('phone', sql.NVarChar(40), phone || null)
      .input('nationality', sql.NVarChar(80), nationality || null)
      .input('email_verification_token_hash', sql.NVarChar(255), tokenHash)
      .query(`
        INSERT INTO dbo.Users (
          full_name, email, password_hash, phone, nationality, role, email_verification_token_hash, email_verification_sent_at
        )
        OUTPUT inserted.user_id, inserted.full_name, inserted.email, inserted.phone, inserted.nationality, inserted.role,
               inserted.created_at, inserted.email_verified_at, inserted.email_verification_token_hash
        VALUES (
          @full_name, @email, @password_hash, @phone, @nationality, N'customer', @email_verification_token_hash, SYSUTCDATETIME()
        )
      `);

    const user = result.recordset[0];
    const verificationUrl = createVerificationUrl(rawToken);
    const delivery = await safelySendVerificationEmail({
      email: user.email,
      fullName: resolveFullName(user),
      verificationUrl
    });

    return res.status(201).json(buildVerificationResponse(user.email, delivery.status, delivery.reason));
  } catch (error) {
    if (error instanceof AppError && error.statusCode !== 500) throw error;
    const exists = users.find((item) => item.email.toLowerCase() === normalizedEmail);
    if (exists) {
      throw new AppError('An account with this email already exists.', 409);
    }
    const user = {
      user_id: users.length + 1,
      full_name: normalizedFullName,
      first_name: normalizedFirstName || splitFullName(normalizedFullName).firstName,
      last_name: normalizedLastName || splitFullName(normalizedFullName).lastName,
      email: normalizedEmail,
      password,
      phone,
      nationality,
      role: 'customer',
      created_at: new Date().toISOString(),
      email_verification_token_hash: tokenHash,
      email_verification_sent_at: new Date().toISOString(),
      email_verified_at: null
    };
    users.push(user);
    const delivery = await safelySendVerificationEmail({
      email: user.email,
      fullName: resolveFullName(user),
      verificationUrl: createVerificationUrl(rawToken)
    });
    return res.status(201).json(buildVerificationResponse(user.email, delivery.status, delivery.reason));
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!email) {
    throw new AppError('Email is required.', 400);
  }

  const genericMessage = 'If this email belongs to a SkyLink account, a password reset link has been sent.';
  const { rawToken, tokenHash } = createVerificationToken();

  try {
    const pool = await getPool();
    await ensureVerificationSchema(pool);
    const result = await pool
      .request()
      .input('email', sql.NVarChar(180), email)
      .query('SELECT user_id, full_name, email FROM dbo.Users WHERE email = @email');
    const user = result.recordset[0];

    if (!user) {
      return res.json({ message: genericMessage, emailDeliveryStatus: 'not_needed' });
    }

    await pool
      .request()
      .input('user_id', sql.Int, user.user_id)
      .input('tokenHash', sql.NVarChar(255), tokenHash)
      .input('expiresAt', sql.DateTime2, new Date(Date.now() + PASSWORD_RESET_TOKEN_MINUTES * 60 * 1000))
      .query(`
        UPDATE dbo.Users
        SET password_reset_token_hash = @tokenHash,
            password_reset_sent_at = SYSUTCDATETIME(),
            password_reset_expires_at = @expiresAt
        WHERE user_id = @user_id
      `);

    const delivery = await safelySendPasswordResetEmail({
      email: user.email,
      fullName: resolveFullName(user),
      resetUrl: createPasswordResetUrl(rawToken)
    });

    return res.json({
      message: genericMessage,
      emailDeliveryStatus: delivery.status,
      emailDeliveryReason: delivery.reason || null
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    const user = users.find((item) => item.email.toLowerCase() === email);
    if (!user) {
      return res.json({ message: genericMessage, emailDeliveryStatus: 'not_needed' });
    }

    user.password_reset_token_hash = tokenHash;
    user.password_reset_sent_at = new Date().toISOString();
    user.password_reset_expires_at = new Date(Date.now() + PASSWORD_RESET_TOKEN_MINUTES * 60 * 1000).toISOString();

    const delivery = await safelySendPasswordResetEmail({
      email: user.email,
      fullName: resolveFullName(user),
      resetUrl: createPasswordResetUrl(rawToken)
    });

    return res.json({
      message: genericMessage,
      emailDeliveryStatus: delivery.status,
      emailDeliveryReason: delivery.reason || null
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = String(req.body?.token || '').trim();
  const password = String(req.body?.password || '');

  if (!token || !password) {
    throw new AppError('Reset token and new password are required.', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400);
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const pool = await getPool();
    await ensureVerificationSchema(pool);
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool
      .request()
      .input('tokenHash', sql.NVarChar(255), tokenHash)
      .input('password_hash', sql.NVarChar(255), passwordHash)
      .query(`
        UPDATE dbo.Users
        SET password_hash = @password_hash,
            password_reset_token_hash = NULL,
            password_reset_sent_at = NULL,
            password_reset_expires_at = NULL
        OUTPUT inserted.user_id
        WHERE password_reset_token_hash = @tokenHash
          AND password_reset_expires_at > SYSUTCDATETIME()
      `);

    if (!result.recordset.length) {
      throw new AppError('This password reset link is invalid or has expired.', 400);
    }

    return res.json({ message: 'Password reset successfully. You can log in with your new password.' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    const user = users.find(
      (item) => item.password_reset_token_hash === tokenHash && new Date(item.password_reset_expires_at || 0).getTime() > Date.now()
    );
    if (!user) {
      throw new AppError('This password reset link is invalid or has expired.', 400);
    }

    user.password = password;
    user.password_reset_token_hash = null;
    user.password_reset_sent_at = null;
    user.password_reset_expires_at = null;

    return res.json({ message: 'Password reset successfully. You can log in with your new password.' });
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  try {
    const pool = await getPool();
    await ensureVerificationSchema(pool);
    const result = await pool
      .request()
      .input('email', sql.NVarChar(180), email.trim().toLowerCase())
      .query('SELECT * FROM dbo.Users WHERE email = @email');

    let user = result.recordset[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      user = memoryLogin(email, password);
    }

    if (user.email_verification_token_hash && !user.email_verified_at) {
      throw new AppError('Please confirm your email before logging in. Check your inbox for the SkyLink verification message.', 403);
    }

    return res.json({ token: signToken(user), user: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof AppError) throw error;
    const user = memoryLogin(email, password);
    return res.json({ token: signToken(user), user: sanitizeUser(user) });
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = String(req.body?.token || '').trim();

  if (!token) {
    throw new AppError('Verification token is required.', 400);
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const pool = await getPool();
    await ensureVerificationSchema(pool);
    const result = await pool
      .request()
      .input('tokenHash', sql.NVarChar(255), tokenHash)
      .query(`
        UPDATE dbo.Users
        SET email_verified_at = COALESCE(email_verified_at, SYSUTCDATETIME()),
            email_verification_token_hash = NULL,
            email_verification_sent_at = NULL
        OUTPUT inserted.user_id, inserted.full_name, inserted.email, inserted.phone, inserted.nationality, inserted.role,
               inserted.created_at, inserted.email_verified_at, inserted.email_verification_token_hash
        WHERE email_verification_token_hash = @tokenHash AND email_verified_at IS NULL
      `);

    if (!result.recordset.length) {
      throw new AppError('This confirmation link is invalid or has already been used.', 400);
    }

    return res.json({
      message: 'Your SkyLink account has been confirmed. You can log in now.',
      user: sanitizeUser(result.recordset[0])
    });
  } catch (error) {
    if (error instanceof AppError) throw error;

    const user = users.find((item) => item.email_verification_token_hash === tokenHash && !item.email_verified_at);
    if (!user) {
      throw new AppError('This confirmation link is invalid or has already been used.', 400);
    }

    user.email_verified_at = new Date().toISOString();
    user.email_verification_token_hash = null;
    user.email_verification_sent_at = null;

    return res.json({
      message: 'Your SkyLink account has been confirmed. You can log in now.',
      user: sanitizeUser(user)
    });
  }
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!email) {
    throw new AppError('Email is required.', 400);
  }

  const { rawToken, tokenHash } = createVerificationToken();

  try {
    const pool = await getPool();
    await ensureVerificationSchema(pool);
    const result = await pool
      .request()
      .input('email', sql.NVarChar(180), email)
      .query('SELECT * FROM dbo.Users WHERE email = @email');

    const user = result.recordset[0];

    if (!user) {
      throw new AppError('No account was found for this email.', 404);
    }

    if (user.email_verified_at) {
      return res.json({ message: 'This account is already verified.' });
    }

    await pool
      .request()
      .input('email', sql.NVarChar(180), email)
      .input('tokenHash', sql.NVarChar(255), tokenHash)
      .query(`
        UPDATE dbo.Users
        SET email_verification_token_hash = @tokenHash,
            email_verification_sent_at = SYSUTCDATETIME()
        WHERE email = @email
      `);

    const delivery = await safelySendVerificationEmail({
      email,
      fullName: resolveFullName(user),
      verificationUrl: createVerificationUrl(rawToken)
    });

    return res.json({
      message:
        delivery.status === 'sent'
          ? 'A new confirmation email has been sent.'
          : 'We updated the verification token, but email delivery is not ready yet.',
      emailDeliveryStatus: delivery.status,
      emailDeliveryReason: delivery.reason || null
    });
  } catch (error) {
    if (error instanceof AppError) throw error;

    const user = users.find((item) => item.email === email);
    if (!user) {
      throw new AppError('No account was found for this email.', 404);
    }

    if (user.email_verified_at) {
      return res.json({ message: 'This account is already verified.' });
    }

    user.email_verification_token_hash = tokenHash;
    user.email_verification_sent_at = new Date().toISOString();

    const delivery = await safelySendVerificationEmail({
      email,
      fullName: resolveFullName(user),
      verificationUrl: createVerificationUrl(rawToken)
    });

    return res.json({
      message:
        delivery.status === 'sent'
          ? 'A new confirmation email has been sent.'
          : 'We updated the verification token, but email delivery is not ready yet.',
      emailDeliveryStatus: delivery.status,
      emailDeliveryReason: delivery.reason || null
    });
  }
});
