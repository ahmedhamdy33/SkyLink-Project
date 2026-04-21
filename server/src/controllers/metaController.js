import { aircraft, airlines, airports, currencies, notifications } from '../data/skylinkData.js';

export function getReferenceData(_req, res) {
  res.json({
    airports,
    airlines,
    aircraft,
    currencies,
    notifications
  });
}
