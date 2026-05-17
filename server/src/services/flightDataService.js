import { getPool, sql } from '../config/db.js';
import {
  aircraft,
  airlines,
  airports,
  bookingPassengers,
  bookings,
  enrichFlight,
  flights,
  searchHistory,
  setFlights,
  setSearchHistory
} from '../data/skylinkData.js';
import { AppError } from '../utils/errors.js';
import { getClassMultiplier, getTripMultiplier } from '../utils/pricing.js';
import { ensureFlightCabinColumns } from './cabinSeatService.js';
import { CABIN_CLASSES, generateAircraftSeatMap, getFlightSeatMap, getMemoryBookedSeatNumbers } from './aircraftSeatService.js';
import { ensureTransitSchema, formatTransitSummary, loadTransitStopsForFlights } from './transitService.js';

const MIN_FUTURE_LEAD_HOURS = 18;
const FUTURE_SCHEDULE_SPAN_DAYS = 42;
const MIN_DURATION_MINUTES = 55;

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function normalizeTripType(value) {
  return value === 'roundTrip' ? 'roundTrip' : 'oneWay';
}

function normalizeClassType(value) {
  return CABIN_CLASSES.includes(value) ? value : 'Economy';
}

function getClassSeatCount(flight, classType) {
  const keyByClass = {
    First: ['aircraft_first_seats', 'first_seats'],
    Business: ['aircraft_business_seats', 'business_seats'],
    'Premium Economy': ['aircraft_premium_economy_seats', 'premium_economy_seats'],
    Economy: ['aircraft_economy_seats', 'economy_seats', 'available_seats']
  };

  return (keyByClass[classType] || keyByClass.Economy).reduce((value, key) => value || Number(flight[key] || 0), 0);
}

function asDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getFlightSeed(flight) {
  if (Number.isFinite(Number(flight.flight_id))) {
    return Number(flight.flight_id);
  }

  return String(flight.flight_code || '')
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);
}

function getDurationMinutes(flight) {
  const start = new Date(flight.departure_time).getTime();
  const end = new Date(flight.arrival_time).getTime();
  const diff = end - start;
  return Number.isFinite(diff) && diff > 0 ? Math.round(diff / 60000) : null;
}

function formatDuration(durationMinutes) {
  if (!durationMinutes) return 'N/A';
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function decorateFlight(flight, options = {}) {
  const passengers = clamp(options.passengers, 1, 9, 1);
  const classType = normalizeClassType(options.classType);
  const tripType = normalizeTripType(options.tripType);
  const classMultiplier = getClassMultiplier(classType);
  const tripMultiplier = getTripMultiplier(tripType);
  const estimatedTotal = Number(flight.price || 0) * classMultiplier * tripMultiplier * passengers;
  const durationMinutes = getDurationMinutes(flight);
  const transitStops = flight.transit_stops || [];
  const transitCount = Number(flight.transit_count ?? transitStops.length ?? 0);
  const layoverMinutes = transitStops.reduce((total, stop) => total + Number(stop.layover_minutes || 0), 0);
  const totalDuration = Number(flight.total_duration || durationMinutes || 0);
  const baseScore = Number(flight.recommendation_score || 100);
  const recommendationScore = baseScore - transitCount * 10 - (layoverMinutes / 60) * 5;

  return {
    ...flight,
    is_direct: Boolean(flight.is_direct ?? transitCount === 0),
    transit_count: transitCount,
    transit_stops: transitStops,
    total_duration: totalDuration,
    total_layover_minutes: layoverMinutes,
    transit_summary: formatTransitSummary({ ...flight, transit_stops: transitStops, transit_count: transitCount }),
    recommendation_score: Number(recommendationScore.toFixed(2)),
    passengers,
    class_type: classType,
    trip_type: tripType,
    estimated_total: Number(estimatedTotal.toFixed(2)),
    duration_minutes: totalDuration || durationMinutes,
    duration_label: formatDuration(totalDuration || durationMinutes),
    route_label: `${flight.departure_code} to ${flight.arrival_code}`,
    discount_label:
      Number(flight.discount_value || 0) > 0
        ? `${flight.discount_type === 'percentage' ? `${flight.discount_value}% off` : `$${flight.discount_value} off`}${flight.discount_code ? ` with ${flight.discount_code}` : ''}`
        : null
  };
}

function resolveAirportIdsByReference(reference, fallbackId, airportItems) {
  if (fallbackId) return [Number(fallbackId)];

  const normalizedReference = normalizeText(reference);
  if (!normalizedReference) return [];

  return airportItems
    .filter((airport) =>
      [airport.airport_code, airport.city, airport.airport_name, airport.country].some((field) =>
        normalizeText(field).includes(normalizedReference)
      )
    )
    .map((airport) => Number(airport.airport_id));
}

function filterFlightsByQuery(items, query = {}, airportItems = []) {
  const departureAirportIds = resolveAirportIdsByReference(query.departure, query.departureAirportId, airportItems);
  const arrivalAirportIds = resolveAirportIdsByReference(query.arrival, query.arrivalAirportId, airportItems);

  return items.filter((flight) => {
    const byDeparture = !departureAirportIds.length || departureAirportIds.includes(Number(flight.departure_airport_id));
    const byArrival = !arrivalAirportIds.length || arrivalAirportIds.includes(Number(flight.arrival_airport_id));
    const byDate = !query.departureDate || String(flight.departure_time).slice(0, 10) === query.departureDate;
    const byStatus = query.excludeCancelled ? flight.status !== 'cancelled' : true;
    const byDirect = String(query.directOnly).toLowerCase() === 'true' ? Boolean(flight.is_direct) : true;
    const maxStops = query.maxStops === undefined || query.maxStops === '' ? null : Number(query.maxStops);
    const byStops = Number.isFinite(maxStops) ? Number(flight.transit_count || 0) <= maxStops : true;
    const maxLayoverTime = query.maxLayoverTime === undefined || query.maxLayoverTime === '' ? null : Number(query.maxLayoverTime);
    const layoverMinutes = Number(flight.total_layover_minutes || 0);
    const byLayover = Number.isFinite(maxLayoverTime) ? layoverMinutes <= maxLayoverTime : true;
    return byDeparture && byArrival && byDate && byStatus && byDirect && byStops && byLayover;
  });
}

async function attachTransitStops(items) {
  const stopsByFlight = await loadTransitStopsForFlights(items.map((flight) => flight.flight_id));
  return items.map((flight) => {
    const transitStops = stopsByFlight.get(Number(flight.flight_id)) || [];
    const transitCount = Number(flight.transit_count ?? transitStops.length ?? 0);
    const isDirect = Boolean(flight.is_direct ?? transitCount === 0);
    const totalLayoverMinutes = transitStops.reduce((total, stop) => total + Number(stop.layover_minutes || 0), 0);
    const durationMinutes = Number(flight.total_duration || getDurationMinutes(flight) || 0);
    return {
      ...flight,
      is_direct: isDirect,
      transit_count: transitCount,
      total_duration: durationMinutes,
      total_layover_minutes: totalLayoverMinutes,
      transit_stops: transitStops,
      transit_summary: formatTransitSummary({ ...flight, is_direct: isDirect, transit_stops: transitStops })
    };
  });
}

function normalizeFlightSchedule(flight, referenceDate = new Date()) {
  const departureDate = asDate(flight.departure_time);
  const arrivalDate = asDate(flight.arrival_time);

  if (!departureDate || !arrivalDate) {
    return { flight, changed: false };
  }

  const minimumFutureDate = new Date(referenceDate.getTime() + MIN_FUTURE_LEAD_HOURS * 60 * 60 * 1000);
  if (departureDate.getTime() > minimumFutureDate.getTime()) {
    return { flight, changed: false };
  }

  const seed = getFlightSeed(flight);
  const durationMs = Math.max(
    MIN_DURATION_MINUTES * 60 * 1000,
    arrivalDate.getTime() - departureDate.getTime()
  );

  const nextDeparture = new Date(referenceDate);
  nextDeparture.setUTCHours(
    departureDate.getUTCHours(),
    departureDate.getUTCMinutes(),
    departureDate.getUTCSeconds(),
    0
  );
  nextDeparture.setUTCDate(nextDeparture.getUTCDate() + ((seed - 1) % FUTURE_SCHEDULE_SPAN_DAYS) + 1);

  while (nextDeparture.getTime() <= minimumFutureDate.getTime()) {
    nextDeparture.setUTCDate(nextDeparture.getUTCDate() + 7);
  }

  const nextArrival = new Date(nextDeparture.getTime() + durationMs);

  return {
    changed: true,
    flight: {
      ...flight,
      departure_time: nextDeparture.toISOString(),
      arrival_time: nextArrival.toISOString()
    }
  };
}

function buildMemoryFlightRows() {
  const referenceDate = new Date();
  const normalized = flights.map((flight) => normalizeFlightSchedule(flight, referenceDate));
  const changed = normalized.some((entry) => entry.changed);

  if (changed) {
    setFlights(normalized.map((entry) => entry.flight));
  }

  return normalized.map((entry) => enrichFlight(entry.flight));
}

function getMemoryReferenceData() {
  return {
    airports,
    airlines,
    aircraft
  };
}

async function loadReferenceDataFromDb() {
  const pool = await getPool();
  const [airportsResult, airlinesResult, aircraftResult] = await Promise.all([
    pool.request().query(`
      SELECT airport_id, airport_code, airport_name, city, country, image_url
      FROM dbo.vAirportDirectory
      ORDER BY city, airport_code
    `),
    pool.request().query(`
      SELECT airline_id, airline_name, country
      FROM dbo.vAirlineDirectory
      ORDER BY airline_name
    `),
    pool.request().query(`
      SELECT
        aircraft_id,
        airline_id,
        model,
        aircraft_type,
        total_seats,
        first_seats,
        business_seats,
        premium_economy_seats,
        economy_seats
      FROM dbo.Aircraft
      ORDER BY aircraft_id
    `)
  ]);

  return {
    airports: airportsResult.recordset,
    airlines: airlinesResult.recordset,
    aircraft: aircraftResult.recordset
  };
}

export async function loadReferenceDataSnapshot() {
  try {
    return await loadReferenceDataFromDb();
  } catch {
    return getMemoryReferenceData();
  }
}

async function loadFlightsFromDb() {
  const pool = await getPool();
  await ensureFlightCabinColumns(pool);
  await ensureTransitSchema(pool);
  const result = await pool.request().query(`
    SELECT
      f.flight_id,
      f.flight_code,
      f.airline_id,
      f.aircraft_id,
      f.departure_airport_id,
      f.arrival_airport_id,
      f.departure_time,
      f.arrival_time,
      f.price,
      f.available_seats,
      f.first_seats,
      f.business_seats,
      f.premium_economy_seats,
      f.economy_seats,
      f.status,
      f.discount_value,
      f.discount_type,
      f.discount_code,
      f.is_direct,
      f.transit_count,
      f.total_duration,
      dep.airport_code AS departure_code,
      dep.city AS departure_city,
      dep.airport_name AS departure_airport_name,
      arr.airport_code AS arrival_code,
      arr.city AS arrival_city,
      arr.airport_name AS arrival_airport_name,
      al.airline_name,
      ac.model AS aircraft_model,
      ac.aircraft_type,
      ac.total_seats,
      ac.first_seats AS aircraft_first_seats,
      ac.business_seats AS aircraft_business_seats,
      ac.premium_economy_seats AS aircraft_premium_economy_seats,
      ac.economy_seats AS aircraft_economy_seats
    FROM dbo.Flights f
    INNER JOIN dbo.Airports dep ON dep.airport_id = f.departure_airport_id
    INNER JOIN dbo.Airports arr ON arr.airport_id = f.arrival_airport_id
    INNER JOIN dbo.Airlines al ON al.airline_id = f.airline_id
    INNER JOIN dbo.Aircraft ac ON ac.aircraft_id = f.aircraft_id
    ORDER BY f.departure_time
  `);

  const referenceDate = new Date();
  const normalized = result.recordset.map((flight) => normalizeFlightSchedule(flight, referenceDate));
  const changedFlights = normalized.filter((entry) => entry.changed).map((entry) => entry.flight);

  if (changedFlights.length) {
    await Promise.all(
      changedFlights.map((flight) =>
        pool
          .request()
          .input('flight_id', sql.Int, Number(flight.flight_id))
          .input('departure_time', sql.DateTime2, new Date(flight.departure_time))
          .input('arrival_time', sql.DateTime2, new Date(flight.arrival_time))
          .query(`
            UPDATE dbo.Flights
            SET departure_time = @departure_time,
                arrival_time = @arrival_time
            WHERE flight_id = @flight_id
          `)
      )
    );
  }

  return normalized.map((entry) => entry.flight);
}

export async function loadFlightsSnapshot() {
  try {
    return await attachTransitStops(await loadFlightsFromDb());
  } catch {
    return attachTransitStops(buildMemoryFlightRows());
  }
}

async function loadBookingsFromDb() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT booking_id, user_id, flight_id, status, payment_status, total_amount, passenger_count, created_at
    FROM dbo.Bookings
  `);

  return result.recordset;
}

async function loadBookingPassengersFromDb() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT passenger_id, booking_id, full_name, passport_number, class_type, seat_number
    FROM dbo.BookingPassengers
  `);

  return result.recordset;
}

async function ensureSearchHistoryTable(pool) {
  await pool.request().batch(`
    IF OBJECT_ID(N'dbo.FlightSearchHistory', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.FlightSearchHistory (
        search_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        departure_airport_id INT NULL,
        arrival_airport_id INT NULL,
        departure_date DATE NULL,
        return_date DATE NULL,
        passengers INT NOT NULL CONSTRAINT DF_FlightSearchHistory_Passengers DEFAULT 1,
        class_type NVARCHAR(30) NOT NULL CONSTRAINT DF_FlightSearchHistory_Class DEFAULT N'Economy',
        trip_type NVARCHAR(20) NOT NULL CONSTRAINT DF_FlightSearchHistory_Trip DEFAULT N'oneWay',
        result_count INT NOT NULL CONSTRAINT DF_FlightSearchHistory_ResultCount DEFAULT 0,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_FlightSearchHistory_CreatedAt DEFAULT SYSUTCDATETIME()
      );
    END
  `);
}

export async function recordFlightSearchForUser(userId, payload = {}) {
  const normalizedUserId = Number(userId || 0);
  if (!normalizedUserId) {
    throw new AppError('User is required to save search history.', 400);
  }

  const entry = {
    search_id: Math.max(0, ...searchHistory.map((item) => Number(item.search_id || 0))) + 1,
    user_id: normalizedUserId,
    departure_airport_id: payload.departureAirportId ? Number(payload.departureAirportId) : null,
    arrival_airport_id: payload.arrivalAirportId ? Number(payload.arrivalAirportId) : null,
    departure_date: payload.departureDate || null,
    return_date: payload.returnDate || null,
    passengers: clamp(payload.passengers, 1, 9, 1),
    class_type: normalizeClassType(payload.classType),
    trip_type: normalizeTripType(payload.tripType),
    result_count: clamp(payload.resultCount, 0, 1000, 0),
    created_at: new Date().toISOString()
  };

  try {
    const pool = await getPool();
    await ensureSearchHistoryTable(pool);
    const result = await pool
      .request()
      .input('user_id', sql.Int, entry.user_id)
      .input('departure_airport_id', sql.Int, entry.departure_airport_id)
      .input('arrival_airport_id', sql.Int, entry.arrival_airport_id)
      .input('departure_date', sql.Date, entry.departure_date)
      .input('return_date', sql.Date, entry.return_date)
      .input('passengers', sql.Int, entry.passengers)
      .input('class_type', sql.NVarChar(30), entry.class_type)
      .input('trip_type', sql.NVarChar(20), entry.trip_type)
      .input('result_count', sql.Int, entry.result_count)
      .query(`
        INSERT INTO dbo.FlightSearchHistory (
          user_id, departure_airport_id, arrival_airport_id, departure_date, return_date,
          passengers, class_type, trip_type, result_count
        )
        OUTPUT inserted.search_id, inserted.user_id, inserted.departure_airport_id, inserted.arrival_airport_id,
               inserted.departure_date, inserted.return_date, inserted.passengers, inserted.class_type,
               inserted.trip_type, inserted.result_count, inserted.created_at
        VALUES (
          @user_id, @departure_airport_id, @arrival_airport_id, @departure_date, @return_date,
          @passengers, @class_type, @trip_type, @result_count
        )
      `);

    return result.recordset[0] || entry;
  } catch {
    setSearchHistory([entry, ...searchHistory].slice(0, 80));
    return entry;
  }
}

export async function loadSearchHistoryForUser(userId, limit = 12) {
  const normalizedUserId = Number(userId || 0);
  if (!normalizedUserId) return [];

  try {
    const pool = await getPool();
    await ensureSearchHistoryTable(pool);
    const result = await pool
      .request()
      .input('user_id', sql.Int, normalizedUserId)
      .input('limit', sql.Int, clamp(limit, 1, 50, 12))
      .query(`
        SELECT TOP (@limit)
          search_id,
          user_id,
          departure_airport_id,
          arrival_airport_id,
          departure_date,
          return_date,
          passengers,
          class_type,
          trip_type,
          result_count,
          created_at
        FROM dbo.FlightSearchHistory
        WHERE user_id = @user_id
        ORDER BY created_at DESC
      `);

    return result.recordset;
  } catch {
    return searchHistory
      .filter((item) => Number(item.user_id) === normalizedUserId)
      .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
      .slice(0, limit);
  }
}

async function getBookedSeatNumbersForFlight(flightId) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('flightId', sql.Int, Number(flightId))
      .query(`
        SELECT bp.seat_number
        FROM dbo.Bookings b
        INNER JOIN dbo.BookingPassengers bp ON bp.booking_id = b.booking_id
        WHERE b.flight_id = @flightId
          AND b.status <> N'cancelled'
          AND bp.seat_number IS NOT NULL
      `);

    return result.recordset.map((row) => row.seat_number).filter(Boolean);
  } catch {
    const flightBookingIds = bookings
      .filter((booking) => Number(booking.flight_id) === Number(flightId) && booking.status !== 'cancelled')
      .map((booking) => booking.booking_id);

    return bookingPassengers
      .filter((passenger) => flightBookingIds.includes(passenger.booking_id))
      .map((passenger) => passenger.seat_number)
      .filter(Boolean);
  }
}

export async function listFlightsByQuery(query = {}) {
  const [flightItems, referenceData] = await Promise.all([loadFlightsSnapshot(), loadReferenceDataSnapshot()]);
  return filterFlightsByQuery(flightItems, query, referenceData.airports);
}

export async function searchFlightsWithInsights(query = {}) {
  const passengers = clamp(query.passengers, 1, 9, 1);
  const classType = normalizeClassType(query.classType);
  const tripType = normalizeTripType(query.tripType);
  const maxBudget = toNumber(query.maxBudget);
  const sortBy = ['earliest', 'fastest', 'cheapest'].includes(query.sortBy) ? query.sortBy : 'cheapest';
  const limit = clamp(query.limit, 1, 8, 5);
  const [flightItems, referenceData] = await Promise.all([loadFlightsSnapshot(), loadReferenceDataSnapshot()]);

  const allMatches = filterFlightsByQuery(flightItems, query, referenceData.airports)
    .filter((flight) => flight.status !== 'cancelled')
    .map((flight) => decorateFlight(flight, { passengers, classType, tripType }));

  const decorated = allMatches
    .filter((flight) => !maxBudget || flight.estimated_total <= maxBudget)
    .sort((left, right) => {
      if (sortBy === 'fastest') return (left.duration_minutes || Infinity) - (right.duration_minutes || Infinity);
      if (sortBy === 'earliest') return new Date(left.departure_time).getTime() - new Date(right.departure_time).getTime();
      return Number(left.estimated_total || 0) - Number(right.estimated_total || 0);
    })
    .slice(0, limit);

  return {
    filters: {
      departureAirportId: query.departureAirportId || null,
      arrivalAirportId: query.arrivalAirportId || null,
      departure: query.departure || null,
      arrival: query.arrival || null,
      departureDate: query.departureDate || null,
      passengers,
      classType,
      tripType,
      maxBudget,
      sortBy
    },
    totalMatches: allMatches.filter((flight) => !maxBudget || flight.estimated_total <= maxBudget).length,
    flights: decorated
  };
}

export async function getFlightById(flightId, options = {}) {
  const flightItems = await loadFlightsSnapshot();
  const flight = flightItems.find((item) => Number(item.flight_id) === Number(flightId));
  if (!flight) return null;
  return decorateFlight(flight, options);
}

export async function getFlightSeatsById(flightId) {
  const flightItems = await loadFlightsSnapshot();
  const flight = flightItems.find((item) => Number(item.flight_id) === Number(flightId));
  if (!flight) throw new AppError('Flight not found.', 404);

  const seats = await getFlightSeatMap(flight.flight_id);
  if (seats.length) return seats;

  const aircraftItem = aircraft.find((item) => Number(item.aircraft_id) === Number(flight.aircraft_id)) || {
    aircraft_id: flight.aircraft_id,
    model: flight.aircraft_model,
    aircraft_type: flight.aircraft_type || 'Narrow-Body',
    total_seats: flight.total_seats || flight.available_seats,
    first_seats: flight.aircraft_first_seats || flight.first_seats || 0,
    business_seats: flight.aircraft_business_seats || flight.business_seats || 0,
    premium_economy_seats: flight.aircraft_premium_economy_seats || flight.premium_economy_seats || 0,
    economy_seats: flight.aircraft_economy_seats || flight.economy_seats || flight.available_seats
  };

  return generateAircraftSeatMap(aircraftItem, new Set(), getMemoryBookedSeatNumbers(flight.flight_id));
}

export async function compareFlightsForAssistant(options = {}) {
  const flightIds = Array.isArray(options.flightIds) ? options.flightIds.map(Number).filter(Number.isFinite) : [];
  const passengers = clamp(options.passengers, 1, 9, 1);
  const classType = normalizeClassType(options.classType);
  const tripType = normalizeTripType(options.tripType);

  const comparedFlights =
    flightIds.length > 0
      ? (await Promise.all(flightIds.map((flightId) => getFlightById(flightId, { passengers, classType, tripType })))).filter(Boolean)
      : (await searchFlightsWithInsights({ ...options, passengers, classType, tripType, limit: clamp(options.limit, 2, 5, 3) })).flights;

  if (!comparedFlights.length) {
    return {
      comparedFlights: [],
      highlights: null
    };
  }

  const cheapest = [...comparedFlights].sort((left, right) => left.estimated_total - right.estimated_total)[0];
  const fastest = [...comparedFlights].sort((left, right) => (left.duration_minutes || Infinity) - (right.duration_minutes || Infinity))[0];
  const mostAvailable = [...comparedFlights].sort((left, right) => Number(right.available_seats || 0) - Number(left.available_seats || 0))[0];

  return {
    comparedFlights,
    highlights: {
      cheapestFlightId: cheapest?.flight_id || null,
      fastestFlightId: fastest?.flight_id || null,
      bestAvailabilityFlightId: mostAvailable?.flight_id || null
    }
  };
}

export async function suggestDestinationsFromFlights(options = {}) {
  const departureAirportId = options.departureAirportId ? Number(options.departureAirportId) : null;
  const maxBudget = toNumber(options.maxBudget);
  const passengers = clamp(options.passengers, 1, 9, 1);
  const classType = normalizeClassType(options.classType);
  const tripType = normalizeTripType(options.tripType);
  const season = String(options.season || '').trim().toLowerCase();
  const durationDays = clamp(options.durationDays, 1, 30, null);
  const limit = clamp(options.limit, 1, 6, 4);
  const [flightItems, referenceData] = await Promise.all([loadFlightsSnapshot(), loadReferenceDataSnapshot()]);
  const departureAirportIds = resolveAirportIdsByReference(options.departure, departureAirportId, referenceData.airports);

  const candidates = flightItems
    .filter((flight) => flight.status === 'active')
    .filter((flight) => !departureAirportIds.length || departureAirportIds.includes(Number(flight.departure_airport_id)))
    .map((flight) => decorateFlight(flight, { passengers, classType, tripType }))
    .filter((flight) => !maxBudget || flight.estimated_total <= maxBudget);

  const grouped = new Map();
  for (const flight of candidates) {
    const current = grouped.get(flight.arrival_airport_id) || [];
    current.push(flight);
    grouped.set(flight.arrival_airport_id, current);
  }

  const suggestions = [...grouped.entries()]
    .map(([arrivalAirportId, routes]) => {
      const airport = referenceData.airports.find((item) => Number(item.airport_id) === Number(arrivalAirportId));
      const cheapestFlight = [...routes].sort((left, right) => left.estimated_total - right.estimated_total)[0];
      const averagePrice =
        routes.reduce((total, route) => total + Number(route.estimated_total || 0), 0) / Math.max(routes.length, 1);
      const reasons = [
        cheapestFlight.discount_label ? 'includes a live promotional fare' : 'offers a strong price for this route',
        routes.length > 1 ? 'has multiple active departures to choose from' : 'has a direct active option right now'
      ];

      if (season === 'summer' && ['Dubai', 'Alexandria', 'Cape Town', 'Sydney'].includes(airport?.city)) {
        reasons.unshift('fits well for a warm-weather getaway');
      }

      if (season === 'winter' && ['London', 'Paris', 'Rome', 'Amsterdam'].includes(airport?.city)) {
        reasons.unshift('works well for a cooler seasonal city break');
      }

      if (durationDays && durationDays <= 4) {
        reasons.push('suits a shorter trip window');
      }

      return {
        airport_id: airport?.airport_id || null,
        airport_code: airport?.airport_code || cheapestFlight.arrival_code,
        city: airport?.city || cheapestFlight.arrival_city,
        country: airport?.country || null,
        image_url: airport?.image_url || null,
        cheapest_flight: cheapestFlight,
        average_estimated_total: Number(averagePrice.toFixed(2)),
        route_count: routes.length,
        reasons: reasons.slice(0, 3)
      };
    })
    .sort((left, right) => left.cheapest_flight.estimated_total - right.cheapest_flight.estimated_total)
    .slice(0, limit);

  return {
    filters: {
      departureAirportId: departureAirportIds[0] || null,
      departure: options.departure || null,
      maxBudget,
      passengers,
      classType,
      tripType,
      season: season || null,
      durationDays
    },
    destinations: suggestions
  };
}

export async function predictBestBookingTime(options = {}) {
  const [referenceData, bookingItems, flightItems] = await Promise.all([
    loadReferenceDataSnapshot(),
    (async () => {
      try {
        return await loadBookingsFromDb();
      } catch {
        return bookings;
      }
    })(),
    loadFlightsSnapshot()
  ]);

  const departureAirportIds = resolveAirportIdsByReference(options.departure, options.departureAirportId, referenceData.airports);
  const arrivalAirportIds = resolveAirportIdsByReference(options.arrival, options.arrivalAirportId, referenceData.airports);
  const departureDate = options.departureDate ? new Date(options.departureDate) : null;
  const currentDate = new Date();
  const routeDemand = bookingItems.filter((booking) => {
    const flight = flightItems.find((item) => Number(item.flight_id) === Number(booking.flight_id));
    if (!flight) return false;
    return (
      (!departureAirportIds.length || departureAirportIds.includes(Number(flight.departure_airport_id))) &&
      (!arrivalAirportIds.length || arrivalAirportIds.includes(Number(flight.arrival_airport_id))) &&
      booking.status !== 'cancelled'
    );
  }).length;

  const daysUntilDeparture =
    departureDate ? Math.max(0, Math.ceil((departureDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))) : null;

  let recommendation = 'monitor';
  let summary = 'Monitor the fare for a little longer if your travel dates are flexible.';
  let suggestedWindow = 'Aim to book 21 to 60 days before departure for the best balance of price and seat availability.';

  if (daysUntilDeparture !== null && daysUntilDeparture <= 21) {
    recommendation = 'book_now';
    summary = 'Book now because the trip is close and waiting usually increases the risk of higher fares or limited seats.';
    suggestedWindow = 'Trips inside 3 weeks are usually best confirmed immediately.';
  } else if (daysUntilDeparture !== null && daysUntilDeparture >= 90) {
    recommendation = 'wait';
    summary = 'You likely have time to wait and monitor, because fares are still early and availability is usually healthy.';
    suggestedWindow = 'Check again when the trip is 45 to 75 days away.';
  }

  if (routeDemand >= 3 && recommendation !== 'book_now') {
    recommendation = 'book_soon';
    summary = 'This route shows signs of demand in current booking activity, so booking soon is safer than waiting too long.';
  }

  return {
    data_source: 'heuristic_placeholder',
    confidence: 'low',
    recommendation,
    summary,
    suggested_window: suggestedWindow,
    days_until_departure: daysUntilDeparture,
    route_activity_score: routeDemand,
    note: 'This forecast currently uses route activity and a placeholder timing heuristic because historical fare tracking is not yet connected.'
  };
}

export async function loadRecommendationsForUser(userId) {
  const [flightItems, bookingItems, passengerItems, userSearches] = await Promise.all([
    loadFlightsSnapshot(),
    (async () => {
      try {
        return await loadBookingsFromDb();
      } catch {
        return bookings;
      }
    })(),
    (async () => {
      try {
        return await loadBookingPassengersFromDb();
      } catch {
        return bookingPassengers;
      }
    })(),
    loadSearchHistoryForUser(userId, 25)
  ]);

  function topValue(items) {
    const counts = new Map();
    for (const item of items) {
      if (item === undefined || item === null || item === '') continue;
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || null;
  }

  const userBookings = bookingItems.filter((booking) => Number(booking.user_id) === Number(userId || 0) && booking.status !== 'cancelled');
  const bookedFlightIds = new Set(userBookings.map((booking) => Number(booking.flight_id)));
  const bookedFlights = userBookings
    .map((booking) => flightItems.find((flight) => Number(flight.flight_id) === Number(booking.flight_id)))
    .filter(Boolean);
  const passengerClasses = passengerItems
    .filter((passenger) => userBookings.some((booking) => Number(booking.booking_id) === Number(passenger.booking_id)))
    .map((passenger) => passenger.class_type);

  const preferredArrivalAirport = topValue(bookedFlights.map((flight) => Number(flight.arrival_airport_id)));
  const preferredDepartureAirport = topValue(bookedFlights.map((flight) => Number(flight.departure_airport_id)));
  const searchedArrivalAirport = topValue(userSearches.map((entry) => Number(entry.arrival_airport_id)));
  const searchedDepartureAirport = topValue(userSearches.map((entry) => Number(entry.departure_airport_id)));
  const searchedClass = topValue(userSearches.map((entry) => entry.class_type));
  const preferredClass = topValue(passengerClasses) || searchedClass || 'Economy';

  return flightItems
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

      if (searchedArrivalAirport && Number(flight.arrival_airport_id) === Number(searchedArrivalAirport)) {
        score += 4;
        reasons.push('matches a destination from your search history');
      }

      if (searchedDepartureAirport && Number(flight.departure_airport_id) === Number(searchedDepartureAirport)) {
        score += 2;
        reasons.push('uses an origin you searched recently');
      }

      if (preferredClass && getClassSeatCount(flight, preferredClass) > 0) {
        score += 1;
        reasons.push(`supports your usual ${preferredClass} cabin`);
      }

      if (Number(flight.discount_value || 0) > 0) {
        score += 2;
        reasons.push('has an active discount');
      }

      if (Number(flight.available_seats || 0) >= 10) {
        score += 1;
        reasons.push('has good seat availability');
      }

      const transitCount = Number(flight.transit_count || 0);
      const layoverHours = Number(flight.total_layover_minutes || 0) / 60;
      score = score - transitCount * 10 - layoverHours * 5;

      if (transitCount === 0) {
        reasons.push('direct flight ranks higher');
      } else {
        reasons.push(`${transitCount} stop option after transit penalty`);
      }

      return {
        ...flight,
        preferred_class: preferredClass,
        recommendation_score: score,
        learned_from_searches: userSearches.length,
        learned_from_bookings: userBookings.length,
        recommendation_reason: reasons.length ? reasons.join(', ') : 'popular active SkyLink route'
      };
    })
    .sort((left, right) => right.recommendation_score - left.recommendation_score || Number(left.price) - Number(right.price))
    .slice(0, 6);
}
