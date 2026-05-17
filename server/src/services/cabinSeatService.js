const CLASS_ORDER = ['First', 'Business', 'Premium Economy', 'Economy'];
const LETTERS = ['A', 'B', 'C', 'D'];

function smartCabinSplit(totalSeats) {
  const total = Math.max(0, Number(totalSeats || 0) || 0);
  if (total < LETTERS.length * 3) {
    return {
      firstSeats: 0,
      businessSeats: 0,
      premiumEconomySeats: 0,
      economySeats: total,
      totalSeats: total
    };
  }

  const fullRows = Math.floor(total / LETTERS.length);
  const firstRows = total >= 24 ? Math.max(1, Math.round(total * 0.08 / LETTERS.length)) : 1;
  const businessRows = total >= 24 ? Math.max(2, Math.round(total * 0.18 / LETTERS.length)) : 1;
  const premiumRows = total >= 180 ? Math.max(1, Math.round(total * 0.08 / LETTERS.length)) : 0;
  const reservedRows = Math.min(fullRows - 1, firstRows + businessRows + premiumRows);
  const firstSeatRows = Math.min(firstRows, reservedRows);
  const businessSeatRows = Math.min(businessRows, Math.max(0, reservedRows - firstSeatRows));
  const premiumSeatRows = Math.max(0, reservedRows - firstSeatRows - businessSeatRows);
  const firstSeats = firstSeatRows * LETTERS.length;
  const businessSeats = businessSeatRows * LETTERS.length;
  const premiumEconomySeats = premiumSeatRows * LETTERS.length;
  const economySeats = Math.max(0, total - firstSeats - businessSeats - premiumEconomySeats);

  return {
    firstSeats,
    businessSeats,
    premiumEconomySeats,
    economySeats,
    totalSeats: total
  };
}

export function normalizeCabinCounts(input = {}, fallbackTotal = 0) {
  const first = Math.max(0, Number(input.firstSeats ?? input.first_seats ?? 0) || 0);
  const business = Math.max(0, Number(input.businessSeats ?? input.business_seats ?? 0) || 0);
  const premiumEconomy = Math.max(0, Number(input.premiumEconomySeats ?? input.premium_economy_seats ?? 0) || 0);
  const economyInput = input.economySeats ?? input.economy_seats;
  const fallback = Math.max(0, Number(fallbackTotal || 0) || 0);
  const hasCabinInput = [
    'firstSeats',
    'first_seats',
    'businessSeats',
    'business_seats',
    'premiumEconomySeats',
    'premium_economy_seats',
    'economySeats',
    'economy_seats'
  ].some(
    (key) => input[key] !== undefined && input[key] !== null && input[key] !== ''
  );
  const explicitEconomy = Math.max(0, Number(economyInput ?? 0) || 0);

  if (fallback > 0 && (!hasCabinInput || first + business + premiumEconomy + explicitEconomy === 0)) {
    return smartCabinSplit(fallback);
  }

  const economyFallback = Math.max(0, Number(fallbackTotal || 0) - first - business - premiumEconomy);
  const economy = Math.max(0, Number(economyInput ?? economyFallback) || 0);
  const normalizedEconomy = economy;
  const total = first + business + premiumEconomy + normalizedEconomy;

  return {
    firstSeats: first,
    businessSeats: business,
    premiumEconomySeats: premiumEconomy,
    economySeats: normalizedEconomy,
    totalSeats: total
  };
}

export function generateCabinSeatRows(cabinCounts = {}, bookedSeats = []) {
  const normalized = normalizeCabinCounts(cabinCounts);
  const booked = new Set(bookedSeats);
  const rows = [];
  let seatIndex = 0;

  const byClass = {
    First: normalized.firstSeats,
    Business: normalized.businessSeats,
    'Premium Economy': normalized.premiumEconomySeats,
    Economy: normalized.economySeats
  };

  for (const classType of CLASS_ORDER) {
    for (let index = 0; index < byClass[classType]; index += 1) {
      const row = Math.floor(seatIndex / LETTERS.length) + 1;
      const letter = LETTERS[seatIndex % LETTERS.length];
      const seatNumber = `${row}${letter}`;

      rows.push({
        seat_id: seatIndex + 1,
        seat_number: seatNumber,
        class_type: classType,
        status: booked.has(seatNumber) ? 'booked' : 'available'
      });
      seatIndex += 1;
    }
  }

  return rows;
}

export async function ensureFlightCabinColumns(pool) {
  await pool.request().batch(`
    IF COL_LENGTH('dbo.Flights', 'first_seats') IS NULL
      ALTER TABLE dbo.Flights ADD first_seats INT NOT NULL CONSTRAINT DF_Flights_FirstSeats DEFAULT 0;

    IF COL_LENGTH('dbo.Flights', 'business_seats') IS NULL
      ALTER TABLE dbo.Flights ADD business_seats INT NOT NULL CONSTRAINT DF_Flights_BusinessSeats DEFAULT 0;

    IF COL_LENGTH('dbo.Flights', 'premium_economy_seats') IS NULL
      ALTER TABLE dbo.Flights ADD premium_economy_seats INT NOT NULL CONSTRAINT DF_Flights_PremiumEconomySeats DEFAULT 0;

    IF COL_LENGTH('dbo.Flights', 'economy_seats') IS NULL
      ALTER TABLE dbo.Flights ADD economy_seats INT NULL;

    UPDATE dbo.Flights
    SET economy_seats = available_seats
    WHERE economy_seats IS NULL;

    IF COL_LENGTH('dbo.Flights', 'economy_seats') IS NOT NULL
      ALTER TABLE dbo.Flights ALTER COLUMN economy_seats INT NOT NULL;
  `);
}
