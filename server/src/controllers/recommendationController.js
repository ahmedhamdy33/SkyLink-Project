import { bookingPassengers, bookings, enrichFlight, flights } from '../data/skylinkData.js';

function topValue(items) {
  const counts = new Map();
  for (const item of items) {
    if (item === undefined || item === null || item === '') continue;
    counts.set(item, (counts.get(item) || 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

export function getRecommendations(req, res) {
  const userId = Number(req.query.userId || 0);
  const userBookings = bookings.filter((booking) => Number(booking.user_id) === userId && booking.status !== 'cancelled');
  const bookedFlightIds = new Set(userBookings.map((booking) => Number(booking.flight_id)));
  const bookedFlights = userBookings
    .map((booking) => flights.find((flight) => Number(flight.flight_id) === Number(booking.flight_id)))
    .filter(Boolean);
  const passengerClasses = bookingPassengers
    .filter((passenger) => userBookings.some((booking) => booking.booking_id === passenger.booking_id))
    .map((passenger) => passenger.class_type);

  const preferredArrivalAirport = topValue(bookedFlights.map((flight) => Number(flight.arrival_airport_id)));
  const preferredDepartureAirport = topValue(bookedFlights.map((flight) => Number(flight.departure_airport_id)));
  const preferredClass = topValue(passengerClasses) || 'Economy';

  const candidates = flights
    .filter((flight) => flight.status === 'active' && !bookedFlightIds.has(Number(flight.flight_id)))
    .map((flight) => {
      let score = 0;
      const reasons = [];

      if (preferredArrivalAirport && Number(flight.arrival_airport_id) === Number(preferredArrivalAirport)) {
        score += 5;
        reasons.push('matches a destination you booked before');
      }

      if (preferredDepartureAirport && Number(flight.departure_airport_id) === Number(preferredDepartureAirport)) {
        score += 3;
        reasons.push('starts from an airport you use often');
      }

      if (Number(flight.discount_value || 0) > 0) {
        score += 2;
        reasons.push('has an active discount');
      }

      if (Number(flight.available_seats || 0) >= 10) {
        score += 1;
        reasons.push('has good seat availability');
      }

      return {
        ...enrichFlight(flight),
        preferred_class: preferredClass,
        recommendation_score: score,
        recommendation_reason: reasons.length ? reasons.join(', ') : 'popular active SkyLink route'
      };
    })
    .sort((a, b) => b.recommendation_score - a.recommendation_score || Number(a.price) - Number(b.price))
    .slice(0, 6);

  res.json(candidates);
}
