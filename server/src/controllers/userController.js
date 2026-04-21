import { bookings, bookingPassengers, flights, users } from '../data/skylinkData.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const getUsers = asyncHandler(async (_req, res) => {
  res.json(users.map(({ password: _password, ...user }) => user));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = users.find((item) => item.user_id === Number(req.params.id));
  if (!user || user.role === 'admin') throw new AppError('Cannot delete this user.', 400);
  const index = users.findIndex((item) => item.user_id === user.user_id);
  users.splice(index, 1);
  res.status(204).send();
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  const totalRevenue = bookings.filter((item) => item.payment_status === 'paid').reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
  const flightCounts = flights
    .map((flight) => ({
      flight_code: flight.flight_code,
      bookingCount: bookings.filter((booking) => booking.flight_id === flight.flight_id).length
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount);

  const classMap = bookingPassengers.reduce((acc, passenger) => {
    const key = passenger.class_type || 'Economy';
    acc[key] ||= { class_type: key, passengerCount: 0, bookingCount: 0 };
    acc[key].passengerCount += 1;
    acc[key].bookingCount += 1;
    return acc;
  }, {});

  res.json({
    totalUsers: users.length,
    totalBookings: bookings.length,
    totalRevenue,
    mostBookedFlights: flightCounts,
    classCategories: Object.values(classMap)
  });
});
