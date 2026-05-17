import { getPool, sql } from '../config/db.js';
import { aircraft, flights, setFlights } from '../data/skylinkData.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { getFlightById, getFlightSeatsById, listFlightsByQuery } from '../services/flightDataService.js';
import { enrichFlight } from '../data/skylinkData.js';
import { ensureFlightCabinColumns, normalizeCabinCounts } from '../services/cabinSeatService.js';
import { getFlightAvailability, getFlightSeatMap } from '../services/aircraftSeatService.js';
import {
  ensureTransitSchema,
  normalizeTransitPayload,
  replaceDbTransitStops,
  replaceMemoryTransitStops
} from '../services/transitService.js';

function getMemoryAircraftCabins(aircraftId, fallbackTotal = 0) {
  const item = aircraft.find((entry) => Number(entry.aircraft_id) === Number(aircraftId));
  return normalizeCabinCounts(
    {
      firstSeats: item?.first_seats || 0,
      businessSeats: item?.business_seats || 0,
      premiumEconomySeats: item?.premium_economy_seats || 0,
      economySeats: item?.economy_seats ?? item?.total_seats ?? fallbackTotal
    },
    Number(item?.total_seats || fallbackTotal || 0)
  );
}

async function getDbAircraftCabins(pool, aircraftId) {
  const result = await pool
    .request()
    .input('aircraft_id', sql.Int, Number(aircraftId))
    .query(`
      SELECT total_seats, first_seats, business_seats, premium_economy_seats, economy_seats
      FROM dbo.Aircraft
      WHERE aircraft_id = @aircraft_id
    `);
  const item = result.recordset[0];
  if (!item) throw new AppError('Aircraft not found.', 404);
  return normalizeCabinCounts(item, item.total_seats);
}

export const listFlights = asyncHandler(async (req, res) => {
  res.json(await listFlightsByQuery(req.query));
});

export const searchFlights = asyncHandler(async (req, res) => {
  res.json(await listFlightsByQuery(req.query));
});

export const getFlightSeats = asyncHandler(async (req, res) => {
  res.json(await getFlightSeatsById(req.params.id));
});

export const getFlightClassAvailability = asyncHandler(async (req, res) => {
  res.json(await getFlightAvailability(req.params.id));
});

export const getFlightAircraftSeatMap = asyncHandler(async (req, res) => {
  res.json(await getFlightSeatMap(req.params.id));
});

export const createFlight = asyncHandler(async (req, res) => {
  const payload = {
    flightCode: req.body.flightCode,
    airlineId: Number(req.body.airlineId),
    aircraftId: Number(req.body.aircraftId),
    departureAirportId: Number(req.body.departureAirportId),
    arrivalAirportId: Number(req.body.arrivalAirportId),
    departureTime: req.body.departureTime,
    arrivalTime: req.body.arrivalTime,
    price: Number(req.body.price),
    availableSeats: Number(req.body.availableSeats || 0),
    firstSeats: 0,
    businessSeats: 0,
    premiumEconomySeats: 0,
    economySeats: 0,
    status: req.body.status || 'active',
    discountValue: Number(req.body.discountValue || 0),
    discountType: req.body.discountType || null,
    discountCode: req.body.discountCode || null
  };
  const transitPlan = normalizeTransitPayload({ ...req.body, ...payload });
  let transaction;

  try {
    const pool = await getPool();
    await ensureFlightCabinColumns(pool);
    await ensureTransitSchema(pool);
    const cabinCounts = await getDbAircraftCabins(pool, payload.aircraftId);
    payload.availableSeats = cabinCounts.totalSeats;
    payload.firstSeats = cabinCounts.firstSeats;
    payload.businessSeats = cabinCounts.businessSeats;
    payload.premiumEconomySeats = cabinCounts.premiumEconomySeats;
    payload.economySeats = cabinCounts.economySeats;
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const result = await new sql.Request(transaction)
      .input('flight_code', sql.NVarChar(20), payload.flightCode)
      .input('airline_id', sql.Int, payload.airlineId)
      .input('aircraft_id', sql.Int, payload.aircraftId)
      .input('departure_airport_id', sql.Int, payload.departureAirportId)
      .input('arrival_airport_id', sql.Int, payload.arrivalAirportId)
      .input('departure_time', sql.DateTime2, payload.departureTime)
      .input('arrival_time', sql.DateTime2, payload.arrivalTime)
      .input('price', sql.Decimal(10, 2), payload.price)
      .input('available_seats', sql.Int, payload.availableSeats)
      .input('first_seats', sql.Int, payload.firstSeats)
      .input('business_seats', sql.Int, payload.businessSeats)
      .input('premium_economy_seats', sql.Int, payload.premiumEconomySeats)
      .input('economy_seats', sql.Int, payload.economySeats)
      .input('status', sql.NVarChar(20), payload.status)
      .input('discount_value', sql.Decimal(10, 2), payload.discountValue || null)
      .input('discount_type', sql.NVarChar(20), payload.discountType)
      .input('discount_code', sql.NVarChar(40), payload.discountCode)
      .input('is_direct', sql.Bit, transitPlan.isDirect)
      .input('transit_count', sql.Int, transitPlan.transitCount)
      .input('total_duration', sql.Int, transitPlan.totalDuration)
      .query(`
        INSERT INTO dbo.Flights (
          flight_code, airline_id, aircraft_id, departure_airport_id, arrival_airport_id,
          departure_time, arrival_time, price, available_seats, status,
          first_seats, business_seats, premium_economy_seats, economy_seats,
          discount_value, discount_type, discount_code, is_direct, transit_count, total_duration
        )
        OUTPUT inserted.flight_id
        VALUES (
          @flight_code, @airline_id, @aircraft_id, @departure_airport_id, @arrival_airport_id,
          @departure_time, @arrival_time, @price, @available_seats, @status,
          @first_seats, @business_seats, @premium_economy_seats, @economy_seats,
          @discount_value, @discount_type, @discount_code, @is_direct, @transit_count, @total_duration
        )
      `);

    const flightId = result.recordset[0].flight_id;
    await replaceDbTransitStops(transaction, flightId, transitPlan.transitStops);
    await transaction.commit();
    transaction = null;
    const created = await getFlightById(flightId);
    return res.status(201).json(created);
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    if (error instanceof AppError) throw error;
    const cabinCounts = getMemoryAircraftCabins(payload.aircraftId, Number(req.body.availableSeats || 0));
    const next = {
      flight_id: Math.max(0, ...flights.map((item) => item.flight_id)) + 1,
      flight_code: payload.flightCode,
      airline_id: payload.airlineId,
      aircraft_id: payload.aircraftId,
      departure_airport_id: payload.departureAirportId,
      arrival_airport_id: payload.arrivalAirportId,
      departure_time: payload.departureTime,
      arrival_time: payload.arrivalTime,
      price: payload.price,
      available_seats: cabinCounts.totalSeats,
      first_seats: cabinCounts.firstSeats,
      business_seats: cabinCounts.businessSeats,
      premium_economy_seats: cabinCounts.premiumEconomySeats,
      economy_seats: cabinCounts.economySeats,
      status: payload.status,
      discount_value: payload.discountValue,
      discount_type: payload.discountType,
      discount_code: payload.discountCode,
      is_direct: transitPlan.isDirect,
      transit_count: transitPlan.transitCount,
      total_duration: transitPlan.totalDuration
    };
    setFlights([next, ...flights]);
    const transitStops = replaceMemoryTransitStops(next.flight_id, transitPlan.transitStops);
    return res.status(201).json({ ...enrichFlight(next), transit_stops: transitStops });
  }
});

export const updateFlight = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const transitPlan = normalizeTransitPayload(req.body);
  let transaction;

  try {
    const pool = await getPool();
    await ensureFlightCabinColumns(pool);
    await ensureTransitSchema(pool);
    const cabinCounts = await getDbAircraftCabins(pool, req.body.aircraftId);
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const result = await new sql.Request(transaction)
      .input('flight_id', sql.Int, id)
      .input('flight_code', sql.NVarChar(20), req.body.flightCode)
      .input('airline_id', sql.Int, Number(req.body.airlineId))
      .input('aircraft_id', sql.Int, Number(req.body.aircraftId))
      .input('departure_airport_id', sql.Int, Number(req.body.departureAirportId))
      .input('arrival_airport_id', sql.Int, Number(req.body.arrivalAirportId))
      .input('departure_time', sql.DateTime2, req.body.departureTime)
      .input('arrival_time', sql.DateTime2, req.body.arrivalTime)
      .input('price', sql.Decimal(10, 2), Number(req.body.price))
      .input('available_seats', sql.Int, cabinCounts.totalSeats)
      .input('first_seats', sql.Int, cabinCounts.firstSeats)
      .input('business_seats', sql.Int, cabinCounts.businessSeats)
      .input('premium_economy_seats', sql.Int, cabinCounts.premiumEconomySeats)
      .input('economy_seats', sql.Int, cabinCounts.economySeats)
      .input('status', sql.NVarChar(20), req.body.status || 'active')
      .input('discount_value', sql.Decimal(10, 2), Number(req.body.discountValue || 0) || null)
      .input('discount_type', sql.NVarChar(20), req.body.discountType || null)
      .input('discount_code', sql.NVarChar(40), req.body.discountCode || null)
      .input('is_direct', sql.Bit, transitPlan.isDirect)
      .input('transit_count', sql.Int, transitPlan.transitCount)
      .input('total_duration', sql.Int, transitPlan.totalDuration)
      .query(`
        UPDATE dbo.Flights
        SET
          flight_code = @flight_code,
          airline_id = @airline_id,
          aircraft_id = @aircraft_id,
          departure_airport_id = @departure_airport_id,
          arrival_airport_id = @arrival_airport_id,
          departure_time = @departure_time,
          arrival_time = @arrival_time,
          price = @price,
          available_seats = @available_seats,
          first_seats = @first_seats,
          business_seats = @business_seats,
          premium_economy_seats = @premium_economy_seats,
          economy_seats = @economy_seats,
          status = @status,
          discount_value = @discount_value,
          discount_type = @discount_type,
          discount_code = @discount_code,
          is_direct = @is_direct,
          transit_count = @transit_count,
          total_duration = @total_duration
        WHERE flight_id = @flight_id
      `);

    if (!result.rowsAffected[0]) throw new AppError('Flight not found.', 404);
    await replaceDbTransitStops(transaction, id, transitPlan.transitStops);
    await transaction.commit();
    transaction = null;
    return res.json(await getFlightById(id));
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    if (error instanceof AppError) throw error;
    const index = flights.findIndex((item) => item.flight_id === id);
    if (index === -1) throw new AppError('Flight not found.', 404);
    const cabinCounts = getMemoryAircraftCabins(req.body.aircraftId, Number(req.body.availableSeats || 0));
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
      available_seats: cabinCounts.totalSeats,
      first_seats: cabinCounts.firstSeats,
      business_seats: cabinCounts.businessSeats,
      premium_economy_seats: cabinCounts.premiumEconomySeats,
      economy_seats: cabinCounts.economySeats,
      status: req.body.status || flights[index].status,
      discount_value: req.body.discountValue || 0,
      discount_type: req.body.discountType || null,
      discount_code: req.body.discountCode || null,
      is_direct: transitPlan.isDirect,
      transit_count: transitPlan.transitCount,
      total_duration: transitPlan.totalDuration
    };
    const nextFlights = flights.slice();
    nextFlights[index] = updated;
    setFlights(nextFlights);
    const transitStops = replaceMemoryTransitStops(id, transitPlan.transitStops);
    return res.json({ ...enrichFlight(updated), transit_stops: transitStops });
  }
});

export const deleteFlight = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const pool = await getPool();
    const result = await pool.request().input('flight_id', sql.Int, id).query('DELETE FROM dbo.Flights WHERE flight_id = @flight_id');
    if (!result.rowsAffected[0]) throw new AppError('Flight not found.', 404);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) throw error;
    setFlights(flights.filter((item) => item.flight_id !== id));
    return res.status(204).send();
  }
});

export const updateFlightStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('flight_id', sql.Int, id)
      .input('status', sql.NVarChar(20), req.body.status)
      .query('UPDATE dbo.Flights SET status = @status WHERE flight_id = @flight_id');
    if (!result.rowsAffected[0]) throw new AppError('Flight not found.', 404);
    return res.json(await getFlightById(id));
  } catch (error) {
    if (error instanceof AppError) throw error;
    const nextFlights = flights.map((item) => (item.flight_id === id ? { ...item, status: req.body.status } : item));
    setFlights(nextFlights);
    const updated = nextFlights.find((item) => item.flight_id === id);
    if (!updated) throw new AppError('Flight not found.', 404);
    return res.json(enrichFlight(updated));
  }
});
