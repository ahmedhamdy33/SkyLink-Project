import { getPool } from '../config/db.js';
import { aircraft, airlines, airports, currencies, notifications } from '../data/skylinkData.js';

export async function getReferenceData(_req, res) {
  try {
    const pool = await getPool();
    const [airportsResult, airlinesResult, aircraftResult, currenciesResult, notificationsResult] = await Promise.all([
      pool.request().query(`SELECT airport_id, airport_code, airport_name, city, country, image_url FROM dbo.vAirportDirectory ORDER BY city, airport_code`),
      pool.request().query(`SELECT airline_id, airline_name, country FROM dbo.vAirlineDirectory ORDER BY airline_name`),
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
        ORDER BY aircraft_type, model
      `),
      pool.request().query(`SELECT currency_code, currency_name, symbol, rate_to_usd FROM dbo.Currencies ORDER BY currency_code`),
      pool.request().query(`SELECT notification_id AS id, title, body FROM dbo.Notifications ORDER BY notification_id DESC`)
    ]);

    return res.json({
      airports: airportsResult.recordset,
      airlines: airlinesResult.recordset,
      aircraft: aircraftResult.recordset,
      currencies: currenciesResult.recordset,
      notifications: notificationsResult.recordset
    });
  } catch {
    return res.json({
      airports,
      airlines,
      aircraft,
      currencies,
      notifications
    });
  }
}

export async function getNotifications(_req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(`SELECT notification_id AS id, title, body, created_at FROM dbo.Notifications ORDER BY created_at DESC, notification_id DESC`);
    return res.json(result.recordset);
  } catch {
    return res.json(notifications);
  }
}
