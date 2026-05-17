import { getPool, sql } from '../config/db.js';
import { aircraft as memoryAircraft, bookingPassengers, bookings, flights } from '../data/skylinkData.js';
import { AppError } from '../utils/errors.js';

export const CABIN_CLASSES = ['First', 'Business', 'Premium Economy', 'Economy'];

function toInt(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeClassType(value) {
  return CABIN_CLASSES.includes(value) ? value : 'Economy';
}

function getLayoutForAircraft(item = {}) {
  if (item.model === 'Airbus A380') return { letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'], aisles: new Set([3, 4, 7, 8]) };
  if (item.aircraft_type === 'Wide-Body') return { letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'], aisles: new Set([3, 4, 6, 7]) };
  if (item.aircraft_type === 'Regional') return { letters: ['A', 'B', 'C', 'D'], aisles: new Set([2, 3]) };
  return { letters: ['A', 'B', 'C', 'D', 'E', 'F'], aisles: new Set([3, 4]) };
}

export function getAircraftClassCounts(item = {}) {
  const first = toInt(item.first_seats ?? item.firstSeats);
  const business = toInt(item.business_seats ?? item.businessSeats);
  const premiumEconomy = toInt(item.premium_economy_seats ?? item.premiumEconomySeats);
  const explicitEconomy = item.economy_seats ?? item.economySeats;
  const total = toInt(item.total_seats ?? item.totalSeats, first + business + premiumEconomy + toInt(explicitEconomy));
  const economy = explicitEconomy === undefined || explicitEconomy === null ? Math.max(0, total - first - business - premiumEconomy) : toInt(explicitEconomy);

  return {
    First: first,
    Business: business,
    'Premium Economy': premiumEconomy,
    Economy: economy
  };
}

export function generateAircraftSeatMap(item = {}, bookedSeatIds = new Set(), bookedSeatNumbers = new Set()) {
  const counts = getAircraftClassCounts(item);
  const layout = getLayoutForAircraft(item);
  const seats = [];
  let index = 0;

  for (const classType of CABIN_CLASSES) {
    for (let classIndex = 0; classIndex < counts[classType]; classIndex += 1) {
      const position = (index % layout.letters.length) + 1;
      const rowNumber = Math.floor(index / layout.letters.length) + 1;
      const seatLetter = layout.letters[position - 1];
      const seatNumber = `${rowNumber}${seatLetter}`;
      const seatId = toInt(item.aircraft_id) * 1000 + index + 1;
      const isBooked = bookedSeatIds.has(seatId) || bookedSeatNumbers.has(seatNumber);

      seats.push({
        seat_id: seatId,
        aircraft_id: item.aircraft_id,
        seat_number: seatNumber,
        class_type: classType,
        row_number: rowNumber,
        seat_letter: seatLetter,
        deck_number: item.model === 'Airbus A380' ? (index + 1 > 400 ? 2 : 1) : null,
        is_window: position === 1 || position === layout.letters.length,
        is_aisle: layout.aisles.has(position),
        is_booked: isBooked,
        is_available: !isBooked,
        status: isBooked ? 'booked' : 'available'
      });
      index += 1;
    }
  }

  return seats;
}

function groupAircraft(items = []) {
  return ['Narrow-Body', 'Wide-Body', 'Regional'].map((type) => ({
    aircraft_type: type,
    aircraft: items.filter((item) => item.aircraft_type === type)
  }));
}

export async function listAircraftGrouped() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        ac.aircraft_id,
        ac.airline_id,
        al.airline_name,
        ac.model,
        ac.aircraft_type,
        ac.total_seats,
        ac.first_seats,
        ac.business_seats,
        ac.premium_economy_seats,
        ac.economy_seats
      FROM dbo.Aircraft ac
      INNER JOIN dbo.Airlines al ON al.airline_id = ac.airline_id
      ORDER BY ac.aircraft_type, ac.model
    `);

    return groupAircraft(result.recordset);
  } catch {
    return groupAircraft(memoryAircraft.map((item) => ({ aircraft_type: 'Narrow-Body', first_seats: 0, business_seats: 0, premium_economy_seats: 0, economy_seats: item.total_seats, ...item })));
  }
}

export async function getAircraftById(aircraftId) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('aircraft_id', sql.Int, Number(aircraftId))
      .query(`
        SELECT
          ac.aircraft_id,
          ac.airline_id,
          al.airline_name,
          ac.model,
          ac.aircraft_type,
          ac.total_seats,
          ac.first_seats,
          ac.business_seats,
          ac.premium_economy_seats,
          ac.economy_seats
        FROM dbo.Aircraft ac
        INNER JOIN dbo.Airlines al ON al.airline_id = ac.airline_id
        WHERE ac.aircraft_id = @aircraft_id
      `);

    return result.recordset[0] || null;
  } catch {
    return memoryAircraft.find((item) => Number(item.aircraft_id) === Number(aircraftId)) || null;
  }
}

export async function getAircraftSeats(aircraftId) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('aircraft_id', sql.Int, Number(aircraftId))
      .query(`
        SELECT seat_id, aircraft_id, seat_number, class_type, row_number, seat_letter, deck_number, is_window, is_aisle
        FROM dbo.Seats
        WHERE aircraft_id = @aircraft_id
        ORDER BY ISNULL(deck_number, 1), row_number, seat_letter
      `);

    return result.recordset;
  } catch {
    const item = await getAircraftById(aircraftId);
    return item ? generateAircraftSeatMap(item) : [];
  }
}

export async function getFlightAvailability(flightId) {
  try {
    const pool = await getPool();
    const flightResult = await pool
      .request()
      .input('flight_id', sql.Int, Number(flightId))
      .query(`
        SELECT f.flight_id, ac.aircraft_id, ac.model, ac.aircraft_type
        FROM dbo.Flights f
        INNER JOIN dbo.Aircraft ac ON ac.aircraft_id = f.aircraft_id
        WHERE f.flight_id = @flight_id
      `);

    const flight = flightResult.recordset[0];
    if (!flight) throw new AppError('Flight not found.', 404);

    const result = await pool
      .request()
      .input('flight_id', sql.Int, Number(flightId))
      .query(`
        SELECT
          s.class_type,
          COUNT(s.seat_id) AS total_seats,
          COUNT(fsb.seat_id) AS booked_seats,
          COUNT(s.seat_id) - COUNT(fsb.seat_id) AS available_seats
        FROM dbo.Flights f
        INNER JOIN dbo.Seats s ON s.aircraft_id = f.aircraft_id
        LEFT JOIN (
          SELECT active_fsb.flight_id, active_fsb.seat_id
          FROM dbo.FlightSeatBookings active_fsb
          INNER JOIN dbo.Bookings active_b ON active_b.booking_id = active_fsb.booking_id AND active_b.status <> N'cancelled'
        ) fsb ON fsb.flight_id = f.flight_id AND fsb.seat_id = s.seat_id
        WHERE f.flight_id = @flight_id
        GROUP BY s.class_type
      `);

    const byClass = new Map(result.recordset.map((row) => [row.class_type, row]));
    return {
      flight_id: Number(flight.flight_id),
      aircraft: {
        aircraft_id: flight.aircraft_id,
        model: flight.model,
        aircraft_type: flight.aircraft_type
      },
      classes: CABIN_CLASSES.map((classType) => {
        const row = byClass.get(classType);
        const total = toInt(row?.total_seats);
        const booked = toInt(row?.booked_seats);
        const available = Math.max(0, total - booked);
        return {
          class_type: classType,
          total_seats: total,
          booked_seats: booked,
          available_seats: available,
          is_available: total > 0 && available > 0
        };
      })
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    const flight = flights.find((item) => Number(item.flight_id) === Number(flightId));
    if (!flight) throw new AppError('Flight not found.', 404);
    const item = memoryAircraft.find((entry) => Number(entry.aircraft_id) === Number(flight.aircraft_id));
    const bookedNumbers = getMemoryBookedSeatNumbers(flightId);
    const seats = item ? generateAircraftSeatMap(item, new Set(), bookedNumbers) : [];

    return {
      flight_id: Number(flight.flight_id),
      aircraft: {
        aircraft_id: item?.aircraft_id || flight.aircraft_id,
        model: item?.model || flight.aircraft_model,
        aircraft_type: item?.aircraft_type || 'Narrow-Body'
      },
      classes: CABIN_CLASSES.map((classType) => {
        const classSeats = seats.filter((seat) => seat.class_type === classType);
        const booked = classSeats.filter((seat) => seat.is_booked).length;
        const available = Math.max(0, classSeats.length - booked);
        return {
          class_type: classType,
          total_seats: classSeats.length,
          booked_seats: booked,
          available_seats: available,
          is_available: classSeats.length > 0 && available > 0
        };
      })
    };
  }
}

export async function getFlightSeatMap(flightId) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('flight_id', sql.Int, Number(flightId))
      .query(`
        SELECT
          s.seat_id,
          s.aircraft_id,
          s.seat_number,
          s.class_type,
          s.row_number,
          s.seat_letter,
          s.deck_number,
          s.is_window,
          s.is_aisle,
          CASE WHEN fsb.seat_id IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS is_booked
        FROM dbo.Flights f
        INNER JOIN dbo.Seats s ON s.aircraft_id = f.aircraft_id
        LEFT JOIN (
          SELECT active_fsb.flight_id, active_fsb.seat_id
          FROM dbo.FlightSeatBookings active_fsb
          INNER JOIN dbo.Bookings active_b ON active_b.booking_id = active_fsb.booking_id AND active_b.status <> N'cancelled'
        ) fsb ON fsb.flight_id = f.flight_id AND fsb.seat_id = s.seat_id
        WHERE f.flight_id = @flight_id
        ORDER BY ISNULL(s.deck_number, 1), s.row_number, s.seat_letter
      `);

    return result.recordset.map((seat) => ({
      ...seat,
      is_available: !seat.is_booked,
      status: seat.is_booked ? 'booked' : 'available'
    }));
  } catch {
    const flight = flights.find((item) => Number(item.flight_id) === Number(flightId));
    const item = memoryAircraft.find((entry) => Number(entry.aircraft_id) === Number(flight?.aircraft_id));
    return item ? generateAircraftSeatMap(item, new Set(), getMemoryBookedSeatNumbers(flightId)) : [];
  }
}

export async function validateSeatSelection(request, { flightId, seatId, seatNumber, classType, currentBookingId = null }) {
  const normalizedClass = normalizeClassType(classType);
  const suffix = String(seatId || seatNumber || 'selected').replace(/[^a-zA-Z0-9_]/g, '_');
  const dbRequest = request
    .input(`flight_id_${suffix}`, sql.Int, Number(flightId))
    .input(`class_type_${suffix}`, sql.NVarChar(30), normalizedClass);

  let query = `
    SELECT TOP 1
      s.seat_id,
      s.seat_number,
      s.class_type
    FROM dbo.Flights f
    INNER JOIN dbo.Seats s ON s.aircraft_id = f.aircraft_id
    LEFT JOIN dbo.FlightSeatBookings fsb ON fsb.flight_id = f.flight_id AND fsb.seat_id = s.seat_id
    LEFT JOIN dbo.Bookings b ON b.booking_id = fsb.booking_id AND b.status <> N'cancelled'
    WHERE f.flight_id = @flight_id_${suffix}
      AND s.class_type = @class_type_${suffix}
      AND (fsb.flight_seat_booking_id IS NULL OR b.booking_id IS NULL
  `;

  if (currentBookingId) {
    dbRequest.input(`current_booking_id_${suffix}`, sql.Int, Number(currentBookingId));
    query += ` OR b.booking_id = @current_booking_id_${suffix}`;
  }

  query += ')';

  if (seatId) {
    dbRequest.input(`seat_id_${suffix}`, sql.Int, Number(seatId));
    query += ` AND s.seat_id = @seat_id_${suffix}`;
  } else {
    dbRequest.input(`seat_number_${suffix}`, sql.NVarChar(10), String(seatNumber || ''));
    query += ` AND s.seat_number = @seat_number_${suffix}`;
  }

  const result = await dbRequest.query(query);
  return result.recordset[0] || null;
}

export function getMemoryBookedSeatNumbers(flightId) {
  const bookingIds = bookings
    .filter((booking) => Number(booking.flight_id) === Number(flightId) && booking.status !== 'cancelled')
    .map((booking) => Number(booking.booking_id));

  return new Set(
    bookingPassengers
      .filter((passenger) => bookingIds.includes(Number(passenger.booking_id)))
      .map((passenger) => passenger.seat_number)
      .filter(Boolean)
  );
}
