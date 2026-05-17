import { getPool, sql } from '../config/db.js';
import { aircraft as memoryAircraft } from '../data/skylinkData.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { generateAircraftSeatMap, getAircraftById, getAircraftSeats, listAircraftGrouped } from '../services/aircraftSeatService.js';

function normalizeAircraftPayload(body = {}) {
  const firstSeats = Math.max(0, Number(body.firstSeats ?? body.first_seats ?? 0) || 0);
  const businessSeats = Math.max(0, Number(body.businessSeats ?? body.business_seats ?? 0) || 0);
  const premiumEconomySeats = Math.max(0, Number(body.premiumEconomySeats ?? body.premium_economy_seats ?? 0) || 0);
  const economySeats = Math.max(0, Number(body.economySeats ?? body.economy_seats ?? 0) || 0);
  const totalSeats = Math.max(0, Number(body.totalSeats ?? body.total_seats ?? firstSeats + businessSeats + premiumEconomySeats + economySeats) || 0);

  if (!body.airlineId && !body.airline_id) throw new AppError('Choose an airline for this aircraft.', 400);
  if (!String(body.model || '').trim()) throw new AppError('Aircraft model is required.', 400);
  if (!['Narrow-Body', 'Wide-Body', 'Regional'].includes(body.aircraftType || body.aircraft_type)) {
    throw new AppError('Choose a valid aircraft type.', 400);
  }
  if (firstSeats + businessSeats + premiumEconomySeats + economySeats !== totalSeats) {
    throw new AppError('Class seat counts must add up to total seats.', 400);
  }
  if (totalSeats <= 0) throw new AppError('Total seats must be greater than zero.', 400);

  return {
    airlineId: Number(body.airlineId ?? body.airline_id),
    model: String(body.model).trim(),
    aircraftType: body.aircraftType || body.aircraft_type,
    totalSeats,
    firstSeats,
    businessSeats,
    premiumEconomySeats,
    economySeats
  };
}

async function replaceAircraftSeats(transaction, aircraft) {
  await new sql.Request(transaction)
    .input('aircraft_id', sql.Int, aircraft.aircraft_id)
    .query('DELETE FROM dbo.Seats WHERE aircraft_id = @aircraft_id');

  const seats = generateAircraftSeatMap({
    aircraft_id: aircraft.aircraft_id,
    model: aircraft.model,
    aircraft_type: aircraft.aircraft_type,
    total_seats: aircraft.total_seats,
    first_seats: aircraft.first_seats,
    business_seats: aircraft.business_seats,
    premium_economy_seats: aircraft.premium_economy_seats,
    economy_seats: aircraft.economy_seats
  });

  for (const seat of seats) {
    await new sql.Request(transaction)
      .input('aircraft_id', sql.Int, aircraft.aircraft_id)
      .input('seat_number', sql.NVarChar(10), seat.seat_number)
      .input('class_type', sql.NVarChar(30), seat.class_type)
      .input('row_number', sql.Int, seat.row_number)
      .input('seat_letter', sql.NVarChar(2), seat.seat_letter)
      .input('deck_number', sql.Int, seat.deck_number)
      .input('is_window', sql.Bit, Boolean(seat.is_window))
      .input('is_aisle', sql.Bit, Boolean(seat.is_aisle))
      .query(`
        INSERT INTO dbo.Seats (aircraft_id, seat_number, class_type, row_number, seat_letter, deck_number, is_window, is_aisle)
        VALUES (@aircraft_id, @seat_number, @class_type, @row_number, @seat_letter, @deck_number, @is_window, @is_aisle)
      `);
  }
}

export const listAircraft = asyncHandler(async (_req, res) => {
  res.json(await listAircraftGrouped());
});

export const getAircraftDetails = asyncHandler(async (req, res) => {
  const item = await getAircraftById(req.params.id);
  if (!item) throw new AppError('Aircraft not found.', 404);
  res.json(item);
});

export const getAircraftSeatMap = asyncHandler(async (req, res) => {
  res.json(await getAircraftSeats(req.params.id));
});

export const createAircraft = asyncHandler(async (req, res) => {
  const payload = normalizeAircraftPayload(req.body);
  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const result = await new sql.Request(transaction)
      .input('airline_id', sql.Int, payload.airlineId)
      .input('model', sql.NVarChar(120), payload.model)
      .input('aircraft_type', sql.NVarChar(30), payload.aircraftType)
      .input('total_seats', sql.Int, payload.totalSeats)
      .input('first_seats', sql.Int, payload.firstSeats)
      .input('business_seats', sql.Int, payload.businessSeats)
      .input('premium_economy_seats', sql.Int, payload.premiumEconomySeats)
      .input('economy_seats', sql.Int, payload.economySeats)
      .query(`
        INSERT INTO dbo.Aircraft (
          airline_id, model, aircraft_type, total_seats,
          first_seats, business_seats, premium_economy_seats, economy_seats
        )
        OUTPUT inserted.*
        VALUES (
          @airline_id, @model, @aircraft_type, @total_seats,
          @first_seats, @business_seats, @premium_economy_seats, @economy_seats
        )
      `);

    const aircraft = result.recordset[0];
    await replaceAircraftSeats(transaction, aircraft);
    await transaction.commit();
    return res.status(201).json(aircraft);
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    if (error instanceof AppError) throw error;
    throw error;
  }
});

export const updateAircraft = asyncHandler(async (req, res) => {
  const payload = normalizeAircraftPayload(req.body);
  const aircraftId = Number(req.params.id);
  let transaction;

  try {
    const pool = await getPool();
    const bookedResult = await pool
      .request()
      .input('aircraft_id', sql.Int, aircraftId)
      .query(`
        SELECT COUNT(*) AS booked_count
        FROM dbo.FlightSeatBookings fsb
        INNER JOIN dbo.Seats s ON s.seat_id = fsb.seat_id
        WHERE s.aircraft_id = @aircraft_id
      `);

    if (Number(bookedResult.recordset[0]?.booked_count || 0) > 0) {
      throw new AppError('This aircraft has booked seats, so its seat map cannot be regenerated safely.', 400);
    }

    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const result = await new sql.Request(transaction)
      .input('aircraft_id', sql.Int, aircraftId)
      .input('airline_id', sql.Int, payload.airlineId)
      .input('model', sql.NVarChar(120), payload.model)
      .input('aircraft_type', sql.NVarChar(30), payload.aircraftType)
      .input('total_seats', sql.Int, payload.totalSeats)
      .input('first_seats', sql.Int, payload.firstSeats)
      .input('business_seats', sql.Int, payload.businessSeats)
      .input('premium_economy_seats', sql.Int, payload.premiumEconomySeats)
      .input('economy_seats', sql.Int, payload.economySeats)
      .query(`
        UPDATE dbo.Aircraft
        SET
          airline_id = @airline_id,
          model = @model,
          aircraft_type = @aircraft_type,
          total_seats = @total_seats,
          first_seats = @first_seats,
          business_seats = @business_seats,
          premium_economy_seats = @premium_economy_seats,
          economy_seats = @economy_seats
        OUTPUT inserted.*
        WHERE aircraft_id = @aircraft_id
      `);

    const aircraft = result.recordset[0];
    if (!aircraft) throw new AppError('Aircraft not found.', 404);
    await replaceAircraftSeats(transaction, aircraft);
    await transaction.commit();
    return res.json(aircraft);
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    if (error instanceof AppError) throw error;
    throw error;
  }
});

export const deleteAircraft = asyncHandler(async (req, res) => {
  const aircraftId = Number(req.params.id);

  try {
    const pool = await getPool();
    const assignedResult = await pool
      .request()
      .input('aircraft_id', sql.Int, aircraftId)
      .query('SELECT COUNT(*) AS assigned_count FROM dbo.Flights WHERE aircraft_id = @aircraft_id');

    if (Number(assignedResult.recordset[0]?.assigned_count || 0) > 0) {
      throw new AppError('This aircraft is assigned to existing flights and cannot be deleted.', 400);
    }

    await pool.request().input('aircraft_id', sql.Int, aircraftId).query('DELETE FROM dbo.Seats WHERE aircraft_id = @aircraft_id');
    const result = await pool.request().input('aircraft_id', sql.Int, aircraftId).query('DELETE FROM dbo.Aircraft WHERE aircraft_id = @aircraft_id');
    if (!result.rowsAffected[0]) throw new AppError('Aircraft not found.', 404);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) throw error;
    const exists = memoryAircraft.some((item) => Number(item.aircraft_id) === aircraftId);
    if (!exists) throw new AppError('Aircraft not found.', 404);
    return res.status(204).send();
  }
});
