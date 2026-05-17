import { getPool, sql } from '../config/db.js';
import { bookingPassengers, bookings, discounts, enrichFlight, flights, setBookingPassengers, setBookings, users } from '../data/skylinkData.js';
import { sendBookingCreatedEmail } from '../services/emailService.js';
import { validateSeatSelection } from '../services/aircraftSeatService.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { calculateCancellationFee, calculateDiscountAmount, calculatePassengerSubtotal } from '../utils/pricing.js';

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

let cancellationColumnsEnsured = false;

async function ensureCancellationColumns(poolOrTransaction) {
  if (cancellationColumnsEnsured) return;

  await new sql.Request(poolOrTransaction).query(`
    IF COL_LENGTH(N'dbo.Bookings', N'cancelled_at') IS NULL
      ALTER TABLE dbo.Bookings ADD cancelled_at DATETIME2 NULL;

    IF COL_LENGTH(N'dbo.Bookings', N'cancellation_fee') IS NULL
      ALTER TABLE dbo.Bookings ADD cancellation_fee DECIMAL(10,2) NOT NULL CONSTRAINT DF_Bookings_CancellationFee DEFAULT 0;

    IF COL_LENGTH(N'dbo.Bookings', N'cancellation_rate') IS NULL
      ALTER TABLE dbo.Bookings ADD cancellation_rate DECIMAL(5,4) NOT NULL CONSTRAINT DF_Bookings_CancellationRate DEFAULT 0;

    IF COL_LENGTH(N'dbo.Bookings', N'refund_amount') IS NULL
      ALTER TABLE dbo.Bookings ADD refund_amount DECIMAL(10,2) NOT NULL CONSTRAINT DF_Bookings_RefundAmount DEFAULT 0;
  `);

  cancellationColumnsEnsured = true;
}

function getCancellationAmounts(booking) {
  const total = Number(booking.total_amount || 0);
  const { fee, rate, hoursUntilDeparture } = calculateCancellationFee(total, booking.departure_time);
  const refundAmount = booking.payment_status === 'paid' ? Math.max(0, total - fee) : 0;

  return {
    cancellation_fee: fee,
    cancellation_rate: rate,
    refund_amount: refundAmount,
    payment_due: booking.payment_status === 'paid' ? 0 : fee,
    hours_until_departure: hoursUntilDeparture
  };
}

function enrichMemoryBooking(booking) {
  const flight = flights.find((item) => item.flight_id === Number(booking.flight_id));
  return {
    ...booking,
    ...(flight ? enrichFlight(flight) : {}),
    passengers: bookingPassengers.filter((item) => item.booking_id === booking.booking_id)
  };
}

function getAuthenticatedUserId(req) {
  return Number(req.user?.id || req.user?.user_id || 0);
}

function getBookingUserId(req) {
  const authUserId = getAuthenticatedUserId(req);
  const requestedUserId = Number(req.body.userId || req.body.user_id || 0);
  return req.user?.role === 'admin' && requestedUserId ? requestedUserId : authUserId || requestedUserId;
}

function assertCanAccessUserBookings(req, userId) {
  const authUserId = getAuthenticatedUserId(req);
  if (req.user?.role !== 'admin' && authUserId && Number(userId) !== authUserId) {
    throw new AppError('You can only access your own bookings.', 403);
  }
}

function findMemoryUser(req, userId) {
  return (
    users.find((item) => Number(item.user_id) === Number(userId)) || {
      email: req.user?.email,
      full_name: req.user?.fullName
    }
  );
}

function mergeBookings(dbBookings, memoryBookings) {
  const merged = new Map();
  [...dbBookings, ...memoryBookings].forEach((booking) => {
    merged.set(Number(booking.booking_id), booking);
  });

  return [...merged.values()].sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0));
}

function normalizePassportNumber(value) {
  return String(value || '')
    .trim()
    .toUpperCase();
}

function normalizePassengersInput(passengers) {
  return passengers.map((passenger) => {
    const passportNumber = normalizePassportNumber(passenger.passportNumber || passenger.passport_number);
    if (!/^[A-Z0-9]{9}$/.test(passportNumber)) {
      throw new AppError('Passport number must be exactly 9 letters or numbers.', 400);
    }

    return {
      ...passenger,
      passportNumber,
      passport_number: passportNumber
    };
  });
}

async function safelySendBookingEmail(payload) {
  try {
    return await sendBookingCreatedEmail(payload);
  } catch {
    return { status: 'failed' };
  }
}

async function getDbUserContact(pool, userId) {
  const result = await pool
    .request()
    .input('user_id', sql.Int, Number(userId))
    .query('SELECT email, full_name FROM dbo.Users WHERE user_id = @user_id');
  return result.recordset[0] || null;
}

async function getDbFlight(poolOrTransaction, flightId) {
  const request = new sql.Request(poolOrTransaction);
  const result = await request
    .input('flight_id', sql.Int, Number(flightId))
    .query(`
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
        f.status,
        f.discount_value,
        f.discount_type,
        f.discount_code,
        dep.airport_code AS departure_code,
        dep.city AS departure_city,
        arr.airport_code AS arrival_code,
        arr.city AS arrival_city,
        al.airline_name,
        ac.model AS aircraft_model,
        ac.total_seats
      FROM dbo.Flights f
      INNER JOIN dbo.Airports dep ON dep.airport_id = f.departure_airport_id
      INNER JOIN dbo.Airports arr ON arr.airport_id = f.arrival_airport_id
      INNER JOIN dbo.Airlines al ON al.airline_id = f.airline_id
      INNER JOIN dbo.Aircraft ac ON ac.aircraft_id = f.aircraft_id
      WHERE f.flight_id = @flight_id
    `);

  return result.recordset[0] || null;
}

async function loadDbBookingsByUser(pool, userId) {
  await ensureCancellationColumns(pool);

  const bookingResult = await pool
    .request()
    .input('user_id', sql.Int, Number(userId))
    .query(`
      SELECT
        b.booking_id,
        b.user_id,
        b.flight_id,
        fs.flight_code,
        fs.airline_name,
        fs.aircraft_model,
        fs.departure_code,
        fs.departure_city,
        fs.departure_time,
        fs.arrival_code,
        fs.arrival_city,
        fs.arrival_time,
        b.status,
        b.payment_status,
        b.total_amount,
        b.passenger_count,
        b.created_at,
        b.cancelled_at,
        b.cancellation_fee,
        b.cancellation_rate,
        b.refund_amount
      FROM dbo.Bookings b
      INNER JOIN dbo.vFlightSchedule fs ON fs.flight_id = b.flight_id
      WHERE b.user_id = @user_id
      ORDER BY b.created_at DESC
    `);

  const items = bookingResult.recordset;
  if (!items.length) return [];

  const passengerResult = await pool.request().query(`
    SELECT passenger_id, booking_id, full_name, passport_number, class_type, seat_id, seat_number
    FROM dbo.BookingPassengers
  `);

  return items.map((booking) => ({
    ...booking,
    passengers: passengerResult.recordset.filter((passenger) => Number(passenger.booking_id) === Number(booking.booking_id))
  }));
}

async function getDbBookingById(pool, bookingId) {
  await ensureCancellationColumns(pool);

  const result = await pool
    .request()
    .input('booking_id', sql.Int, Number(bookingId))
    .query(`
      SELECT
        b.booking_id,
        b.user_id,
        b.flight_id,
        b.status,
        b.payment_status,
        b.total_amount,
        b.passenger_count,
        b.created_at,
        b.cancelled_at,
        b.cancellation_fee,
        b.cancellation_rate,
        b.refund_amount,
        f.flight_code,
        f.departure_time,
        f.arrival_time,
        dep.airport_code AS departure_code,
        dep.city AS departure_city,
        arr.airport_code AS arrival_code,
        arr.city AS arrival_city,
        al.airline_name,
        ac.model AS aircraft_model
      FROM dbo.Bookings b
      INNER JOIN dbo.Flights f ON f.flight_id = b.flight_id
      INNER JOIN dbo.Airports dep ON dep.airport_id = f.departure_airport_id
      INNER JOIN dbo.Airports arr ON arr.airport_id = f.arrival_airport_id
      INNER JOIN dbo.Airlines al ON al.airline_id = f.airline_id
      INNER JOIN dbo.Aircraft ac ON ac.aircraft_id = f.aircraft_id
      WHERE b.booking_id = @booking_id
    `);

  const booking = result.recordset[0];
  if (!booking) return null;

  const passengerResult = await pool
    .request()
    .input('booking_id', sql.Int, Number(bookingId))
    .query(`
      SELECT passenger_id, booking_id, full_name, passport_number, class_type, seat_id, seat_number
      FROM dbo.BookingPassengers
      WHERE booking_id = @booking_id
      ORDER BY passenger_id
    `);

  return {
    ...booking,
    passengers: passengerResult.recordset
  };
}

export const createBooking = asyncHandler(async (req, res) => {
  const passengersInput = normalizePassengersInput(req.body.passengers || []);
  const tripType = req.body.tripType === 'roundTrip' ? 'roundTrip' : 'oneWay';
  const bookingUserId = getBookingUserId(req);
  let transaction;

  if (!bookingUserId) {
    throw new AppError('Booking user is required.', 400);
  }

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const flight = await getDbFlight(transaction, req.body.flightId);
    if (!flight) {
      await transaction.rollback();
      throw new AppError('Flight not found.', 404);
    }

    const totalAmount = calculateBookingTotal(flight, passengersInput, tripType, req.body.discountCode);
    const bookingResult = await new sql.Request(transaction)
      .input('user_id', sql.Int, bookingUserId)
      .input('flight_id', sql.Int, Number(req.body.flightId))
      .input('status', sql.NVarChar(20), 'confirmed')
      .input('payment_status', sql.NVarChar(20), 'pending')
      .input('total_amount', sql.Decimal(10, 2), totalAmount)
      .input('passenger_count', sql.Int, passengersInput.length || 1)
      .query(`
        INSERT INTO dbo.Bookings (user_id, flight_id, status, payment_status, total_amount, passenger_count)
        OUTPUT inserted.booking_id
        VALUES (@user_id, @flight_id, @status, @payment_status, @total_amount, @passenger_count)
      `);

    const bookingId = bookingResult.recordset[0].booking_id;

    for (let index = 0; index < passengersInput.length; index += 1) {
      const passenger = passengersInput[index];
      const requestedSeat = req.body.seatIds?.[index] || req.body.seats?.[index];
      const selectedSeat = await validateSeatSelection(new sql.Request(transaction), {
        flightId: req.body.flightId,
        seatId: typeof requestedSeat === 'number' ? requestedSeat : requestedSeat?.seat_id,
        seatNumber: typeof requestedSeat === 'string' ? requestedSeat : requestedSeat?.seat_number,
        classType: passenger.classType || passenger.class_type
      });

      if (!selectedSeat) {
        await transaction.rollback();
        throw new AppError('Selected seat is unavailable for this flight and cabin class.', 400);
      }

      const passengerResult = await new sql.Request(transaction)
        .input('booking_id', sql.Int, bookingId)
        .input('full_name', sql.NVarChar(120), passenger.fullName)
        .input('passport_number', sql.NVarChar(60), passenger.passportNumber)
        .input('class_type', sql.NVarChar(30), passenger.classType || passenger.class_type || 'Economy')
        .input('seat_id', sql.Int, selectedSeat.seat_id)
        .input('seat_number', sql.NVarChar(10), selectedSeat.seat_number)
        .query(`
          INSERT INTO dbo.BookingPassengers (booking_id, full_name, passport_number, class_type, seat_id, seat_number)
          OUTPUT inserted.passenger_id
          VALUES (@booking_id, @full_name, @passport_number, @class_type, @seat_id, @seat_number)
        `);

      await new sql.Request(transaction)
        .input('flight_id', sql.Int, Number(req.body.flightId))
        .input('booking_id', sql.Int, bookingId)
        .input('passenger_id', sql.Int, passengerResult.recordset[0].passenger_id)
        .input('seat_id', sql.Int, selectedSeat.seat_id)
        .query(`
          INSERT INTO dbo.FlightSeatBookings (flight_id, booking_id, passenger_id, seat_id)
          VALUES (@flight_id, @booking_id, @passenger_id, @seat_id)
        `);
    }

    await transaction.commit();
    const savedBooking = await getDbBookingById(pool, bookingId);
    const user = await getDbUserContact(pool, bookingUserId);
    if (user?.email) {
      await safelySendBookingEmail({
        email: user.email,
        fullName: user.full_name,
        booking: savedBooking
      });
    }

    return res.status(201).json(savedBooking);
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    if (error instanceof AppError) throw error;
    const flight = flights.find((item) => item.flight_id === Number(req.body.flightId));
    if (!flight) throw new AppError('Flight not found.', 404);
    const totalAmount = calculateBookingTotal(flight, passengersInput, tripType, req.body.discountCode);
    const booking = {
      booking_id: Math.max(0, ...bookings.map((item) => item.booking_id)) + 1,
      user_id: bookingUserId,
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
    const user = findMemoryUser(req, bookingUserId);
    if (user?.email) {
      await safelySendBookingEmail({
        email: user.email,
        fullName: user.full_name || user.fullName,
        booking: enrichMemoryBooking(booking)
      });
    }
    return res.status(201).json(enrichMemoryBooking(booking));
  }
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const targetUserId = req.user?.role === 'admin' ? Number(req.params.userId) : getAuthenticatedUserId(req) || Number(req.params.userId);
  assertCanAccessUserBookings(req, targetUserId);

  const memoryBookings = bookings.filter((item) => Number(item.user_id) === Number(targetUserId)).map(enrichMemoryBooking);

  try {
    const pool = await getPool();
    const dbBookings = await loadDbBookingsByUser(pool, targetUserId);
    return res.json(mergeBookings(dbBookings, memoryBookings));
  } catch {
    return res.json(memoryBookings);
  }
});

export const updateBooking = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const tripType = req.body.tripType === 'roundTrip' ? 'roundTrip' : req.body.trip_type || 'oneWay';
  const passengersInput = Array.isArray(req.body.passengers) ? normalizePassengersInput(req.body.passengers) : null;
  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const existingResult = await new sql.Request(transaction)
      .input('booking_id', sql.Int, id)
      .query('SELECT booking_id, flight_id, total_amount, passenger_count, payment_status, status FROM dbo.Bookings WHERE booking_id = @booking_id');
    const existing = existingResult.recordset[0];
    if (!existing) {
      await transaction.rollback();
      throw new AppError('Booking not found.', 404);
    }

    const flight = await getDbFlight(transaction, req.body.flightId || existing.flight_id);
    if (!flight) {
      await transaction.rollback();
      throw new AppError('Flight not found.', 404);
    }

    const passengerCount = passengersInput?.length || req.body.passenger_count || existing.passenger_count;
    const totalAmount = passengersInput
      ? calculateBookingTotal(flight, passengersInput, tripType, req.body.discountCode)
      : req.body.totalAmount ?? req.body.total_amount ?? existing.total_amount;

    await new sql.Request(transaction)
      .input('booking_id', sql.Int, id)
      .input('flight_id', sql.Int, Number(req.body.flightId ?? existing.flight_id))
      .input('total_amount', sql.Decimal(10, 2), Number(totalAmount))
      .input('passenger_count', sql.Int, Number(passengerCount))
      .input('payment_status', sql.NVarChar(20), req.body.payment_status ?? existing.payment_status)
      .input('status', sql.NVarChar(20), req.body.status ?? existing.status)
      .query(`
        UPDATE dbo.Bookings
        SET
          flight_id = @flight_id,
          total_amount = @total_amount,
          passenger_count = @passenger_count,
          payment_status = @payment_status,
          status = @status
        WHERE booking_id = @booking_id
      `);

    if (passengersInput) {
      const selectedSeats = [];

      for (let index = 0; index < passengersInput.length; index += 1) {
        const passenger = passengersInput[index];
        const requestedSeat = req.body.seatIds?.[index] || req.body.seats?.[index] || passenger.seat_id || passenger.seat_number;
        const selectedSeat = await validateSeatSelection(new sql.Request(transaction), {
          flightId: req.body.flightId ?? existing.flight_id,
          seatId: typeof requestedSeat === 'number' ? requestedSeat : requestedSeat?.seat_id,
          seatNumber: typeof requestedSeat === 'string' ? requestedSeat : requestedSeat?.seat_number,
          classType: passenger.classType || passenger.class_type || 'Economy',
          currentBookingId: id
        });

        if (!selectedSeat) {
          await transaction.rollback();
          throw new AppError('Selected seat is unavailable for this flight and cabin class.', 400);
        }

        selectedSeats.push(selectedSeat);
      }

      await new sql.Request(transaction).input('booking_id', sql.Int, id).query('DELETE FROM dbo.FlightSeatBookings WHERE booking_id = @booking_id');
      await new sql.Request(transaction).input('booking_id', sql.Int, id).query('DELETE FROM dbo.BookingPassengers WHERE booking_id = @booking_id');

      for (let index = 0; index < passengersInput.length; index += 1) {
        const passenger = passengersInput[index];
        const selectedSeat = selectedSeats[index];
        const passengerResult = await new sql.Request(transaction)
          .input('booking_id', sql.Int, id)
          .input('full_name', sql.NVarChar(120), passenger.fullName || passenger.full_name)
          .input('passport_number', sql.NVarChar(60), passenger.passportNumber || passenger.passport_number)
          .input('class_type', sql.NVarChar(30), passenger.classType || passenger.class_type || 'Economy')
          .input('seat_id', sql.Int, selectedSeat.seat_id)
          .input('seat_number', sql.NVarChar(10), selectedSeat.seat_number)
          .query(`
            INSERT INTO dbo.BookingPassengers (booking_id, full_name, passport_number, class_type, seat_id, seat_number)
            OUTPUT inserted.passenger_id
            VALUES (@booking_id, @full_name, @passport_number, @class_type, @seat_id, @seat_number)
          `);

        await new sql.Request(transaction)
          .input('flight_id', sql.Int, Number(req.body.flightId ?? existing.flight_id))
          .input('booking_id', sql.Int, id)
          .input('passenger_id', sql.Int, passengerResult.recordset[0].passenger_id)
          .input('seat_id', sql.Int, selectedSeat.seat_id)
          .query(`
            INSERT INTO dbo.FlightSeatBookings (flight_id, booking_id, passenger_id, seat_id)
            VALUES (@flight_id, @booking_id, @passenger_id, @seat_id)
          `);
      }
    }

    await transaction.commit();
    return res.json(await getDbBookingById(pool, id));
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    if (error instanceof AppError) throw error;
    const existing = bookings.find((item) => item.booking_id === id);
    if (!existing) throw new AppError('Booking not found.', 404);
    const flight = flights.find((item) => item.flight_id === Number(req.body.flightId || existing.flight_id));
    if (!flight) throw new AppError('Flight not found.', 404);

    const passengerCount = passengersInput?.length || req.body.passenger_count || existing.passenger_count;
    const totalAmount = passengersInput
      ? calculateBookingTotal(flight, passengersInput, tripType, req.body.discountCode)
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

    if (passengersInput) {
      const remainingPassengers = bookingPassengers.filter((item) => item.booking_id !== id);
      const nextPassengerId = Math.max(0, ...bookingPassengers.map((item) => item.passenger_id)) + 1;
      const replacementPassengers = passengersInput.map((passenger, index) => ({
        passenger_id: nextPassengerId + index,
        booking_id: id,
        full_name: passenger.fullName || passenger.full_name,
        passport_number: passenger.passportNumber || passenger.passport_number,
        class_type: passenger.classType || passenger.class_type || 'Economy',
        seat_number: req.body.seats?.[index] || passenger.seat_number || null
      }));
      setBookingPassengers([...remainingPassengers, ...replacementPassengers]);
    }

    return res.json(enrichMemoryBooking(updated));
  }
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  let transaction;

  try {
    const pool = await getPool();
    await ensureCancellationColumns(pool);
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const bookingResult = await new sql.Request(transaction)
      .input('booking_id', sql.Int, id)
      .query(`
        SELECT
          b.booking_id,
          b.total_amount,
          b.payment_status,
          b.status,
          f.departure_time
        FROM dbo.Bookings b
        INNER JOIN dbo.Flights f ON f.flight_id = b.flight_id
        WHERE b.booking_id = @booking_id
      `);

    const booking = bookingResult.recordset[0];
    if (!booking) {
      await transaction.rollback();
      throw new AppError('Booking not found.', 404);
    }

    const cancellation = getCancellationAmounts(booking);

    await new sql.Request(transaction).input('booking_id', sql.Int, id).query('DELETE FROM dbo.FlightSeatBookings WHERE booking_id = @booking_id');
    await new sql.Request(transaction)
      .input('booking_id', sql.Int, id)
      .input('cancellation_fee', sql.Decimal(10, 2), cancellation.cancellation_fee)
      .input('cancellation_rate', sql.Decimal(5, 4), cancellation.cancellation_rate)
      .input('refund_amount', sql.Decimal(10, 2), cancellation.refund_amount)
      .input('payment_status', sql.NVarChar(20), booking.payment_status === 'paid' ? 'refunded' : booking.payment_status)
      .query(`
        UPDATE dbo.Bookings
        SET
          status = N'cancelled',
          cancelled_at = SYSUTCDATETIME(),
          cancellation_fee = @cancellation_fee,
          cancellation_rate = @cancellation_rate,
          refund_amount = @refund_amount,
          payment_status = @payment_status
        WHERE booking_id = @booking_id
      `);

    await transaction.commit();
    return res.json(await getDbBookingById(pool, id));
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {}
    }
    if (error instanceof AppError) throw error;
    const existing = bookings.find((item) => item.booking_id === id);
    if (!existing) throw new AppError('Booking not found.', 404);
    const flight = flights.find((item) => Number(item.flight_id) === Number(existing.flight_id));
    const cancellation = getCancellationAmounts({ ...existing, departure_time: flight?.departure_time });
    const nextBookings = bookings.map((item) =>
      item.booking_id === id
        ? {
            ...item,
            status: 'cancelled',
            payment_status: item.payment_status === 'paid' ? 'refunded' : item.payment_status,
            cancelled_at: new Date().toISOString(),
            cancellation_fee: cancellation.cancellation_fee,
            cancellation_rate: cancellation.cancellation_rate,
            refund_amount: cancellation.refund_amount
          }
        : item
    );
    setBookings(nextBookings);
    return res.json(enrichMemoryBooking(nextBookings.find((item) => item.booking_id === id)));
  }
});
