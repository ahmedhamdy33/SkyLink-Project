import { bookings, setBookings } from '../data/skylinkData.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const confirmCardPayment = asyncHandler(async (req, res) => {
  const id = Number(req.params.bookingId);
  const booking = bookings.find((item) => item.booking_id === id);
  if (!booking) throw new AppError('Booking not found.', 404);

  if (!req.body.cardholder || !req.body.cardNumber || !req.body.expiry || !req.body.cvv) {
    throw new AppError('Card details are required.', 400);
  }

  const nextBookings = bookings.map((item) => (item.booking_id === id ? { ...item, payment_status: 'paid' } : item));
  setBookings(nextBookings);
  res.json({ booking_id: id, payment_status: 'paid', transaction_id: `TX-${Date.now()}` });
});
