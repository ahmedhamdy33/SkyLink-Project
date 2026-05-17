const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function getJsonOrNull(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getPublicAppUrl() {
  return String(process.env.APP_BASE_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/+$/, '');
}

export function isTransactionalEmailConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM);
}

async function sendTransactionalEmail({ email, fullName, subject, htmlContent }) {
  if (!isTransactionalEmailConfigured()) {
    return {
      status: 'skipped',
      reason: 'Transactional email is not configured. Add BREVO_API_KEY and EMAIL_FROM to server/.env.'
    };
  }

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME || 'SkyLink'
      },
      to: [{ email, name: fullName || email }],
      subject,
      htmlContent
    })
  });

  if (!response.ok) {
    const raw = await response.text();
    const payload = getJsonOrNull(raw);
    const message = payload?.message || raw || 'Brevo email request failed.';

    return {
      status: 'failed',
      reason: message
    };
  }

  return { status: 'sent' };
}

export async function sendAccountVerificationEmail({ email, fullName, verificationUrl, subject = 'Confirm your SkyLink account' }) {
  return sendTransactionalEmail({
    email,
    fullName,
    subject,
    htmlContent: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10254b;padding:24px">
          <h2 style="margin:0 0 12px">Welcome to SkyLink</h2>
          <p style="margin:0 0 16px">Please confirm your email address to activate your account and keep your bookings secure.</p>
          <p style="margin:0 0 20px">
            <a href="${verificationUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#2f6cff;color:#ffffff;text-decoration:none;font-weight:700">
              Confirm account
            </a>
          </p>
          <p style="margin:0 0 10px">If the button does not open, use this link:</p>
          <p style="margin:0;word-break:break-all">${verificationUrl}</p>
        </div>
      `
  });
}

export async function sendAccountChangeEmail({ email, fullName, subject, title, message }) {
  return sendTransactionalEmail({
    email,
    fullName,
    subject,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10254b;padding:24px">
        <h2 style="margin:0 0 12px">${title}</h2>
        <p style="margin:0 0 16px">${message}</p>
        <p style="margin:0;color:#5f6f8f">If you did not make this change, contact SkyLink support immediately.</p>
      </div>
    `
  });
}

export async function sendBookingCreatedEmail({ email, fullName, booking }) {
  return sendTransactionalEmail({
    email,
    fullName,
    subject: `SkyLink booking #${booking.booking_id} is reserved`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10254b;padding:24px">
        <h2 style="margin:0 0 12px">Your SkyLink booking is reserved</h2>
        <p style="margin:0 0 16px">Booking #${booking.booking_id} has been created and is waiting for payment confirmation.</p>
        <p style="margin:0 0 8px"><strong>Flight:</strong> ${booking.flight_code || booking.flight_id}</p>
        <p style="margin:0 0 8px"><strong>Total:</strong> $${Number(booking.total_amount || 0).toFixed(2)}</p>
        <p style="margin:0;color:#5f6f8f">You can finish payment from your SkyLink bookings page.</p>
      </div>
    `
  });
}

export async function sendBookingPaidEmail({ email, fullName, booking }) {
  return sendTransactionalEmail({
    email,
    fullName,
    subject: `SkyLink payment confirmed for booking #${booking.booking_id}`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10254b;padding:24px">
        <h2 style="margin:0 0 12px">Your SkyLink payment is confirmed</h2>
        <p style="margin:0 0 16px">Booking #${booking.booking_id} is now paid and confirmed.</p>
        <p style="margin:0 0 8px"><strong>Flight:</strong> ${booking.flight_code || booking.flight_id}</p>
        <p style="margin:0 0 8px"><strong>Total paid:</strong> $${Number(booking.total_amount || 0).toFixed(2)}</p>
        <p style="margin:0;color:#5f6f8f">Your itinerary is available from your SkyLink bookings page.</p>
      </div>
    `
  });
}

export async function sendPasswordResetEmail({ email, fullName, resetUrl }) {
  return sendTransactionalEmail({
    email,
    fullName,
    subject: 'Reset your SkyLink password',
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10254b;padding:24px">
        <h2 style="margin:0 0 12px">Reset your SkyLink password</h2>
        <p style="margin:0 0 16px">Use the secure link below to choose a new password. This link expires in 30 minutes.</p>
        <p style="margin:0 0 20px">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#2f6cff;color:#ffffff;text-decoration:none;font-weight:700">
            Reset password
          </a>
        </p>
        <p style="margin:0 0 10px">If the button does not open, use this link:</p>
        <p style="margin:0 0 16px;word-break:break-all">${resetUrl}</p>
        <p style="margin:0;color:#5f6f8f">If you did not request this, you can ignore this email.</p>
      </div>
    `
  });
}
