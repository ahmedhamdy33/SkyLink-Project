import { bookingPassengers, bookings, discounts, enrichFlight, flights, setBookingPassengers, setBookings } from '../data/skylinkData.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { calculateDiscountAmount, calculatePassengerSubtotal } from '../utils/pricing.js';

function enrichBooking(booking) {
  const flight = flights.find((item) => item.flight_id === Number(booking.flight_id));
  return {
    ...booking,
    ...(flight ? enrichFlight(flight) : {}),
    passengers: bookingPassengers.filter((item) => item.booking_id === booking.booking_id)
  };
}

function findDiscount(code, flightId) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) return null;

  return (
    discounts.find((item) => item.active !== false && item.scope === 'all' && String(item.code).toUpperCase() === normalizedCode) ||
    discounts.find(
      (item) =>
        item.active !== false &&
        item.scope === 'flight' &&
        String(item.code).toUpperCase() === normalizedCode &&
        Number(item.flight_id) === Number(flightId)
    ) ||
    flights.find((item) => Number(item.flight_id) === Number(flightId) && String(item.discount_code || '').toUpperCase() === normalizedCode)
  );
}

function calculateBookingTotal(flight, passengers, tripType, discountCode) {
  const subtotal = calculatePassengerSubtotal(passengers, flight.price, tripType);
  const discountAmount = calculateDiscountAmount(findDiscount(discountCode, flight.flight_id), subtotal);
  return Math.max(0, subtotal - discountAmount);
}

export const createBooking = asyncHandler(async (req, res) => {
  const flight = flights.find((item) => item.flight_id === Number(req.body.flightId));
  if (!flight) throw new AppError('Flight not found.', 404);
  const passengersInput = req.body.passengers || [];
  const tripType = req.body.tripType === 'roundTrip' ? 'roundTrip' : 'oneWay';
  const totalAmount = calculateBookingTotal(flight, passengersInput, tripType, req.body.discountCode);

  const booking = {
    booking_id: Math.max(0, ...bookings.map((item) => item.booking_id)) + 1,
    user_id: req.body.userId,
    flight_id: req.body.flightId,
    status: 'confirmed',
    payment_status: 'pending',
    total_amount: totalAmount,
    passenger_count: passengersInput.length || 1,
    trip_type: tripType,
    created_at: new Date().toISOString()
  };

  const passengers = passengersInput.map((passenger, index) => ({
    passenger_id: Math.max(0, ...bookingPassengers.map((item) => item.passenger_id)) + index + 1,
    booking_id: booking.booking_id,
    full_name: passenger.fullName,
    passport_number: passenger.passportNumber,
    class_type: passenger.classType,
    seat_number: req.body.seats?.[index] || null
  }));

  setBookings([booking, ...bookings]);
  setBookingPassengers([...bookingPassengers, ...passengers]);
  res.status(201).json(enrichBooking(booking));
});

export const getUserBookings = asyncHandler(async (req, res) => {
  res.json(bookings.filter((item) => Number(item.user_id) === Number(req.params.userId)).map(enrichBooking));
});

export const updateBooking = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = bookings.find((item) => item.booking_id === id);
  if (!existing) throw new AppError('Booking not found.', 404);
  const flight = flights.find((item) => item.flight_id === Number(req.body.flightId || existing.flight_id));
  if (!flight) throw new AppError('Flight not found.', 404);

  const passengerCount = req.body.passengers?.length || req.body.passenger_count || existing.passenger_count;
  const tripType = req.body.tripType === 'roundTrip' ? 'roundTrip' : req.body.trip_type || existing.trip_type || 'oneWay';
  const totalAmount = Array.isArray(req.body.passengers)
    ? calculateBookingTotal(flight, req.body.passengers, tripType, req.body.discountCode)
    : req.body.totalAmount ?? req.body.total_amount ?? existing.total_amount;
  const nextBookings = bookings.map((item) =>
    item.booking_id === id
      ? {
          ...item,
          flight_id: req.body.flightId ?? item.flight_id,
          total_amount: totalAmount,
          passenger_count: passengerCount,
          trip_type: tripType,
          payment_status: req.body.payment_status ?? item.payment_status,
          status: req.body.status ?? item.status
        }
      : item
  );
  setBookings(nextBookings);
  const updated = nextBookings.find((item) => item.booking_id === id);

  if (Array.isArray(req.body.passengers)) {
    const remainingPassengers = bookingPassengers.filter((item) => item.booking_id !== id);
    const nextPassengerId = Math.max(0, ...bookingPassengers.map((item) => item.passenger_id)) + 1;
    const replacementPassengers = req.body.passengers.map((passenger, index) => ({
      passenger_id: nextPassengerId + index,
      booking_id: id,
      full_name: passenger.fullName || passenger.full_name,
      passport_number: passenger.passportNumber || passenger.passport_number,
      class_type: passenger.classType || passenger.class_type || 'Economy',
      seat_number: req.body.seats?.[index] || passenger.seat_number || null
    }));
    setBookingPassengers([...remainingPassengers, ...replacementPassengers]);
  }

  res.json(enrichBooking(updated));
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const nextBookings = bookings.map((item) => (item.booking_id === id ? { ...item, status: 'cancelled' } : item));
  setBookings(nextBookings);
  res.status(204).send();
});
