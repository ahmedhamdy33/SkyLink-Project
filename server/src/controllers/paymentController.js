import { getPool, sql } from '../config/db.js';
import { bookings, setBookings, users } from '../data/skylinkData.js';
import { sendBookingPaidEmail } from '../services/emailService.js';
import { confirmSandboxPayment, getSandboxPaymentOptions } from '../services/sandboxPaymentGateway.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const getSandboxPaymentConfig = asyncHandler(async (_req, res) => {
  res.json(getSandboxPaymentOptions());
});

function getAuthenticatedUserId(req) {
  return Number(req.user?.id || req.user?.user_id || 0);
}

function assertCanPayBooking(req, booking) {
  const authUserId = getAuthenticatedUserId(req);
  if (req.user?.role !== 'admin' && authUserId && Number(booking.user_id) !== authUserId) {
    throw new AppError('Booking not found.', 404);
  }
}

function findMemoryUser(req, userId) {
  return (
    users.find((item) => Number(item.user_id) === Number(userId)) || {
      email: req.user?.email,
      full_name: req.user?.fullName
    }
  );
}

async function safelySendPaidEmail(payload) {
  try {
    return await sendBookingPaidEmail(payload);
  } catch (error) {
    return { status: 'failed', reason: error.message || 'Email request failed.' };
  }
}

async function getDbPaidBookingEmailPayload(pool, bookingId) {
  const result = await pool
    .request()
    .input('booking_id', sql.Int, Number(bookingId))
    .query(`
      SELECT
        b.booking_id,
        b.user_id,
        b.flight_id,
        b.total_amount,
        b.payment_status,
        f.flight_code,
        u.email,
        u.full_name
      FROM dbo.Bookings b
      INNER JOIN dbo.Users u ON u.user_id = b.user_id
      LEFT JOIN dbo.Flights f ON f.flight_id = b.flight_id
      WHERE b.booking_id = @booking_id
    `);

  return result.recordset[0] || null;
}

async function recordPaymentIfPossible(pool, booking, payment) {
  try {
    const metadata = await new sql.Request(pool).query(`
      SELECT
        CASE WHEN OBJECT_ID(N'dbo.Payments', N'U') IS NULL THEN 0 ELSE 1 END AS has_table,
        CASE WHEN COL_LENGTH('dbo.Payments', 'amount') IS NULL THEN 0 ELSE 1 END AS has_amount,
        CASE WHEN COL_LENGTH('dbo.Payments', 'method') IS NULL THEN 0 ELSE 1 END AS has_method,
        CASE WHEN COL_LENGTH('dbo.Payments', 'status') IS NULL THEN 0 ELSE 1 END AS has_status,
        CASE WHEN COL_LENGTH('dbo.Payments', 'transaction_id') IS NULL THEN 0 ELSE 1 END AS has_transaction_id,
        CASE WHEN COL_LENGTH('dbo.Payments', 'currency_code') IS NULL THEN 0 ELSE 1 END AS has_currency_code
    `);
    const columns = metadata.recordset[0];

    if (!columns?.has_table) {
      return { status: 'skipped', reason: 'Payments table is not available.' };
    }

    const existing = await new sql.Request(pool)
      .input('booking_id', sql.Int, Number(booking.booking_id))
      .query('SELECT COUNT(*) AS count FROM dbo.Payments WHERE booking_id = @booking_id');

    const method = payment.brand === 'Visa' ? 'Visa' : 'Credit Card';
    const request = new sql.Request(pool)
      .input('booking_id', sql.Int, Number(booking.booking_id))
      .input('amount', sql.Decimal(10, 2), Number(booking.total_amount || 0))
      .input('method', sql.NVarChar(40), method)
      .input('status', sql.NVarChar(20), 'paid')
      .input('transaction_id', sql.NVarChar(80), payment.transactionId)
      .input('currency_code', sql.NVarChar(10), payment.currency);

    if (Number(existing.recordset[0]?.count || 0) > 0) {
      const updates = [];
      if (columns.has_amount) updates.push('amount = @amount');
      if (columns.has_method) updates.push('method = @method');
      if (columns.has_status) updates.push('status = @status');
      if (columns.has_transaction_id) updates.push('transaction_id = @transaction_id');
      if (columns.has_currency_code) updates.push('currency_code = @currency_code');

      if (!updates.length) {
        return { status: 'skipped', reason: 'Payments table has no supported update columns.' };
      }

      await request.query(`UPDATE dbo.Payments SET ${updates.join(', ')} WHERE booking_id = @booking_id`);
      return { status: 'updated' };
    }

    const insertColumns = ['booking_id'];
    const insertValues = ['@booking_id'];

    if (columns.has_amount) {
      insertColumns.push('amount');
      insertValues.push('@amount');
    }
    if (columns.has_method) {
      insertColumns.push('method');
      insertValues.push('@method');
    }
    if (columns.has_status) {
      insertColumns.push('status');
      insertValues.push('@status');
    }
    if (columns.has_transaction_id) {
      insertColumns.push('transaction_id');
      insertValues.push('@transaction_id');
    }
    if (columns.has_currency_code) {
      insertColumns.push('currency_code');
      insertValues.push('@currency_code');
    }

    await request.query(`
      INSERT INTO dbo.Payments (${insertColumns.join(', ')})
      VALUES (${insertValues.join(', ')})
    `);
    return { status: 'inserted' };
  } catch (error) {
    return { status: 'skipped', reason: error.message || 'Payment record could not be saved.' };
  }
}

export const confirmCardPayment = asyncHandler(async (req, res) => {
  const id = Number(req.params.bookingId);
  let transaction;

  async function confirmMemoryBooking() {
    const booking = bookings.find((item) => Number(item.booking_id) === id);
    if (!booking) throw new AppError('Booking not found.', 404);
    assertCanPayBooking(req, booking);

    const payment = confirmSandboxPayment({
      amount: booking.total_amount,
      currency: 'USD',
      card: req.body
    });

    const paidBooking = { ...booking, payment_status: 'paid' };
    const nextBookings = bookings.map((item) => (Number(item.booking_id) === id ? paidBooking : item));
    setBookings(nextBookings);
    const user = findMemoryUser(req, paidBooking.user_id);
    const emailDelivery = user?.email
      ? await safelySendPaidEmail({
          email: user.email,
          fullName: user.full_name || user.fullName,
          booking: paidBooking
        })
      : { status: 'skipped', reason: 'User email was not found.' };

    return {
      booking_id: id,
      payment_status: 'paid',
      transaction_id: payment.transactionId,
      provider: payment.provider,
      mode: payment.mode,
      card_last4: payment.cardLast4,
      emailDeliveryStatus: emailDelivery.status,
      emailDeliveryReason: emailDelivery.reason || null
    };
  }

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const bookingResult = await new sql.Request(transaction)
      .input('booking_id', sql.Int, id)
      .query('SELECT booking_id, user_id, flight_id, total_amount, payment_status FROM dbo.Bookings WHERE booking_id = @booking_id');

    const booking = bookingResult.recordset[0];
    if (!booking) {
      await transaction.rollback();
      transaction = null;
      return res.json(await confirmMemoryBooking());
    }
    assertCanPayBooking(req, booking);

    const payment = confirmSandboxPayment({
      amount: booking.total_amount,
      currency: 'USD',
      card: req.body
    });

    await new sql.Request(transaction)
      .input('booking_id', sql.Int, id)
      .query(`UPDATE dbo.Bookings SET payment_status = N'paid' WHERE booking_id = @booking_id`);

    await transaction.commit();
    transaction = null;
    const paymentRecord = await recordPaymentIfPossible(pool, booking, payment);
    const emailBooking = await getDbPaidBookingEmailPayload(pool, id);
    const emailDelivery = emailBooking?.email
      ? await safelySendPaidEmail({
          email: emailBooking.email,
          fullName: emailBooking.full_name,
          booking: emailBooking
        })
      : { status: 'skipped', reason: 'User email was not found.' };

    return res.json({
      booking_id: id,
      payment_status: 'paid',
      transaction_id: payment.transactionId,
      provider: payment.provider,
      mode: payment.mode,
      card_last4: payment.cardLast4,
      paymentRecordStatus: paymentRecord.status,
      emailDeliveryStatus: emailDelivery.status,
      emailDeliveryReason: emailDelivery.reason || null
    });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    if (error instanceof AppError) throw error;
    return res.json(await confirmMemoryBooking());
  }
});
