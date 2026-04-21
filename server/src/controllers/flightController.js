import { aircraft, enrichFlight, flights, setFlights } from '../data/skylinkData.js';
import { AppError, asyncHandler } from '../utils/errors.js';

function filterFlights(items, query) {
  return items.filter((flight) => {
    const byDeparture = !query.departureAirportId || Number(flight.departure_airport_id) === Number(query.departureAirportId);
    const byArrival = !query.arrivalAirportId || Number(flight.arrival_airport_id) === Number(query.arrivalAirportId);
    const byDate = !query.departureDate || String(flight.departure_time).slice(0, 10) === query.departureDate;
    return byDeparture && byArrival && byDate;
  });
}

export const listFlights = asyncHandler(async (req, res) => {
  res.json(filterFlights(flights, req.query).map(enrichFlight));
});

export const searchFlights = asyncHandler(async (req, res) => {
  res.json(filterFlights(flights, req.query).map(enrichFlight));
});

export const getFlightSeats = asyncHandler(async (req, res) => {
  const flight = flights.find((item) => item.flight_id === Number(req.params.id));
  if (!flight) throw new AppError('Flight not found.', 404);
  const plane = aircraft.find((item) => item.aircraft_id === Number(flight.aircraft_id));
  const total = plane?.total_seats || flight.available_seats || 24;
  const rows = Math.ceil(total / 4);
  const seats = [];
  for (let row = 1; row <= rows; row += 1) {
    for (const letter of ['A', 'B', 'C', 'D']) {
      if (seats.length < total) {
        seats.push({ seat_id: seats.length + 1, seat_number: `${row}${letter}`, status: seats.length % 11 === 0 ? 'booked' : 'available' });
      }
    }
  }
  res.json(seats);
});

export const createFlight = asyncHandler(async (req, res) => {
  const next = {
    flight_id: Math.max(0, ...flights.map((item) => item.flight_id)) + 1,
    flight_code: req.body.flightCode,
    airline_id: req.body.airlineId,
    aircraft_id: req.body.aircraftId,
    departure_airport_id: req.body.departureAirportId,
    arrival_airport_id: req.body.arrivalAirportId,
    departure_time: req.body.departureTime,
    arrival_time: req.body.arrivalTime,
    price: req.body.price,
    available_seats: req.body.availableSeats,
    status: req.body.status || 'active',
    discount_value: req.body.discountValue || 0,
    discount_type: req.body.discountType || null,
    discount_code: req.body.discountCode || null
  };
  setFlights([next, ...flights]);
  res.status(201).json(enrichFlight(next));
});

export const updateFlight = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const index = flights.findIndex((item) => item.flight_id === id);
  if (index === -1) throw new AppError('Flight not found.', 404);
  const updated = {
    ...flights[index],
    flight_code: req.body.flightCode,
    airline_id: req.body.airlineId,
    aircraft_id: req.body.aircraftId,
    departure_airport_id: req.body.departureAirportId,
    arrival_airport_id: req.body.arrivalAirportId,
    departure_time: req.body.departureTime,
    arrival_time: req.body.arrivalTime,
    price: req.body.price,
    available_seats: req.body.availableSeats,
    status: req.body.status || flights[index].status,
    discount_value: req.body.discountValue || 0,
    discount_type: req.body.discountType || null,
    discount_code: req.body.discountCode || null
  };
  const nextFlights = flights.slice();
  nextFlights[index] = updated;
  setFlights(nextFlights);
  res.json(enrichFlight(updated));
});

export const deleteFlight = asyncHandler(async (req, res) => {
  setFlights(flights.filter((item) => item.flight_id !== Number(req.params.id)));
  res.status(204).send();
});

export const updateFlightStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const nextFlights = flights.map((item) => (item.flight_id === id ? { ...item, status: req.body.status } : item));
  setFlights(nextFlights);
  const updated = nextFlights.find((item) => item.flight_id === id);
  if (!updated) throw new AppError('Flight not found.', 404);
  res.json(enrichFlight(updated));
});
