import { getPool, sql } from '../config/db.js';
import { airports, flightTransitStops, setFlightTransitStops } from '../data/skylinkData.js';
import { AppError } from '../utils/errors.js';

const MIN_LAYOVER_MINUTES = 45;
const MAX_LAYOVER_MINUTES = 720;

function parseBoolean(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  if (String(value).toLowerCase() === 'true') return true;
  if (String(value).toLowerCase() === 'false') return false;
  return fallback;
}

function minutesBetween(start, end) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(diff)) return 0;
  return Math.max(0, Math.round(diff / 60000));
}

function normalizeStopAirport(stop) {
  const airportId = Number(stop.airportId || stop.airport_id || 0);
  const airport = airportId
    ? airports.find((item) => Number(item.airport_id) === airportId)
    : airports.find((item) => String(item.airport_code).toUpperCase() === String(stop.airportCode || stop.airport_code || '').toUpperCase());

  return {
    airport_code: stop.airportCode || stop.airport_code || airport?.airport_code || '',
    airport_name: stop.airportName || stop.airport_name || airport?.airport_name || ''
  };
}

export function formatTransitSummary(flight) {
  const stops = flight.transit_stops || [];
  if (flight.is_direct || !stops.length) return 'Direct Flight';
  const names = stops.map((stop) => stop.airport_code || stop.airport_name).filter(Boolean).join(', ');
  return `${stops.length} ${stops.length === 1 ? 'Stop' : 'Stops'}${names ? ` - ${names}` : ''}`;
}

export function normalizeTransitPayload(payload = {}) {
  const isDirect = parseBoolean(payload.is_direct ?? payload.isDirect, true);
  const rawStops = Array.isArray(payload.transit_stops) ? payload.transit_stops : Array.isArray(payload.transitStops) ? payload.transitStops : [];

  if (isDirect) {
    return {
      isDirect: true,
      transitCount: 0,
      totalDuration: minutesBetween(payload.departureTime || payload.departure_time, payload.arrivalTime || payload.arrival_time),
      transitStops: []
    };
  }

  if (!rawStops.length) {
    throw new AppError('Transit flights must include at least one transit stop.', 400);
  }

  const normalizedStops = rawStops.map((stop, index) => {
    const arrivalTime = stop.arrivalTime || stop.arrival_time;
    const departureTime = stop.departureTime || stop.departure_time;
    const layoverMinutes = Math.round(Number(stop.layoverMinutes || stop.layover_minutes || minutesBetween(arrivalTime, departureTime)));
    const airport = normalizeStopAirport(stop);

    if (!airport.airport_code || !airport.airport_name) {
      throw new AppError('Each transit stop must include a valid airport.', 400);
    }

    if (!arrivalTime || !departureTime || new Date(departureTime) <= new Date(arrivalTime)) {
      throw new AppError('Transit stop departure time must be after arrival time.', 400);
    }

    if (layoverMinutes < MIN_LAYOVER_MINUTES || layoverMinutes > MAX_LAYOVER_MINUTES) {
      throw new AppError('Layover must be between 45 minutes and 12 hours.', 400);
    }

    return {
      airport_code: airport.airport_code,
      airport_name: airport.airport_name,
      arrival_time: arrivalTime,
      departure_time: departureTime,
      layover_minutes: layoverMinutes,
      stop_order: Number(stop.stopOrder || stop.stop_order || index + 1)
    };
  });

  normalizedStops.sort((left, right) => left.stop_order - right.stop_order);

  return {
    isDirect: false,
    transitCount: normalizedStops.length,
    totalDuration: minutesBetween(payload.departureTime || payload.departure_time, payload.arrivalTime || payload.arrival_time),
    transitStops: normalizedStops.map((stop, index) => ({ ...stop, stop_order: index + 1 }))
  };
}

export async function ensureTransitSchema(pool) {
  await pool.request().batch(`
    IF COL_LENGTH('dbo.Flights', 'is_direct') IS NULL
      ALTER TABLE dbo.Flights ADD is_direct BIT NOT NULL CONSTRAINT DF_Flights_IsDirect DEFAULT 1;

    IF COL_LENGTH('dbo.Flights', 'transit_count') IS NULL
      ALTER TABLE dbo.Flights ADD transit_count INT NOT NULL CONSTRAINT DF_Flights_TransitCount DEFAULT 0;

    IF COL_LENGTH('dbo.Flights', 'total_duration') IS NULL
      ALTER TABLE dbo.Flights ADD total_duration INT NOT NULL CONSTRAINT DF_Flights_TotalDuration DEFAULT 0;

    IF OBJECT_ID(N'dbo.Flight_Transit_Stops', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Flight_Transit_Stops (
        transit_id INT IDENTITY(1,1) PRIMARY KEY,
        flight_id INT NOT NULL,
        airport_code NVARCHAR(10) NOT NULL,
        airport_name NVARCHAR(160) NOT NULL,
        arrival_time DATETIME2 NOT NULL,
        departure_time DATETIME2 NOT NULL,
        layover_minutes INT NOT NULL,
        stop_order INT NOT NULL,
        CONSTRAINT FK_FlightTransitStops_Flights FOREIGN KEY (flight_id) REFERENCES dbo.Flights(flight_id) ON DELETE CASCADE
      );
    END
  `);
}

export async function loadTransitStopsForFlights(flightIds = []) {
  const ids = flightIds.map(Number).filter(Number.isFinite);
  if (!ids.length) return new Map();

  try {
    const pool = await getPool();
    await ensureTransitSchema(pool);
    const values = ids.map((id, index) => `(@id${index})`).join(',');
    const request = pool.request();
    ids.forEach((id, index) => request.input(`id${index}`, sql.Int, id));
    const result = await request.query(`
      SELECT ts.transit_id, ts.flight_id, ts.airport_code, ts.airport_name,
             ts.arrival_time, ts.departure_time, ts.layover_minutes, ts.stop_order
      FROM dbo.Flight_Transit_Stops ts
      INNER JOIN (VALUES ${values}) ids(flight_id) ON ids.flight_id = ts.flight_id
      ORDER BY ts.flight_id, ts.stop_order
    `);

    return groupStops(result.recordset);
  } catch {
    return groupStops(flightTransitStops.filter((stop) => ids.includes(Number(stop.flight_id))));
  }
}

export function groupStops(stops = []) {
  const grouped = new Map();
  stops.forEach((stop) => {
    const flightId = Number(stop.flight_id);
    const current = grouped.get(flightId) || [];
    current.push(stop);
    grouped.set(flightId, current.sort((left, right) => Number(left.stop_order) - Number(right.stop_order)));
  });
  return grouped;
}

export async function replaceDbTransitStops(transaction, flightId, stops = []) {
  await new sql.Request(transaction).input('flight_id', sql.Int, Number(flightId)).query('DELETE FROM dbo.Flight_Transit_Stops WHERE flight_id = @flight_id');

  for (const stop of stops) {
    await new sql.Request(transaction)
      .input('flight_id', sql.Int, Number(flightId))
      .input('airport_code', sql.NVarChar(10), stop.airport_code)
      .input('airport_name', sql.NVarChar(160), stop.airport_name)
      .input('arrival_time', sql.DateTime2, stop.arrival_time)
      .input('departure_time', sql.DateTime2, stop.departure_time)
      .input('layover_minutes', sql.Int, stop.layover_minutes)
      .input('stop_order', sql.Int, stop.stop_order)
      .query(`
        INSERT INTO dbo.Flight_Transit_Stops (
          flight_id, airport_code, airport_name, arrival_time, departure_time, layover_minutes, stop_order
        )
        VALUES (
          @flight_id, @airport_code, @airport_name, @arrival_time, @departure_time, @layover_minutes, @stop_order
        )
      `);
  }
}

export function replaceMemoryTransitStops(flightId, stops = []) {
  const nextTransitId = Math.max(0, ...flightTransitStops.map((stop) => Number(stop.transit_id || 0))) + 1;
  const replacementStops = stops.map((stop, index) => ({
    transit_id: nextTransitId + index,
    flight_id: Number(flightId),
    ...stop
  }));
  setFlightTransitStops([...flightTransitStops.filter((stop) => Number(stop.flight_id) !== Number(flightId)), ...replacementStops]);
  return replacementStops;
}
