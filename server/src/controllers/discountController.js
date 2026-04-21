import { discounts, flights, setDiscounts, setFlights } from '../data/skylinkData.js';
import { AppError, asyncHandler } from '../utils/errors.js';

function calculateDiscount(discount, amount) {
  const value = Number(discount.value ?? discount.discount_value ?? 0);
  const type = discount.type ?? discount.discount_type;
  const discountAmount = type === 'percentage' ? Math.round((amount * value) / 100) : value;
  return Math.min(amount, Math.max(0, discountAmount));
}

export const applyDiscount = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const amount = Number(req.body.amount || 0);
  const flightId = req.body.flightId ? Number(req.body.flightId) : null;
  const globalDiscount = discounts.find((item) => item.active !== false && item.scope === 'all' && String(item.code).toUpperCase() === code);
  const scopedDiscount = discounts.find(
    (item) => item.active !== false && item.scope === 'flight' && String(item.code).toUpperCase() === code && (!flightId || Number(item.flight_id) === flightId)
  );
  const flight = flights.find((item) => item.discount_code && String(item.discount_code).toUpperCase() === code && (!flightId || Number(item.flight_id) === flightId));
  const discount = globalDiscount || scopedDiscount || flight;

  if (!discount) throw new AppError('Invalid discount code.', 404);

  const discountAmount = calculateDiscount(discount, amount);

  res.json({
    code,
    type: discount.type ?? discount.discount_type,
    value: discount.value ?? discount.discount_value,
    scope: discount.scope || 'flight',
    flightId: discount.flight_id || flight?.flight_id || null,
    amount: discountAmount
  });
});

export const createDiscount = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const type = req.body.type;
  const value = Number(req.body.value || 0);
  const scope = req.body.scope === 'flight' ? 'flight' : 'all';
  const flightId = req.body.flightId ? Number(req.body.flightId) : null;

  if (!code) throw new AppError('Discount code is required.', 400);
  if (!['fixed', 'percentage'].includes(type)) throw new AppError('Discount type must be fixed or percentage.', 400);
  if (value <= 0) throw new AppError('Discount value must be greater than zero.', 400);
  if (scope === 'flight' && !flightId) throw new AppError('Choose a flight for flight-specific discounts.', 400);
  if (discounts.some((item) => String(item.code).toUpperCase() === code)) throw new AppError('Discount code already exists.', 409);

  const nextDiscount = {
    discount_id: Math.max(0, ...discounts.map((item) => item.discount_id || 0)) + 1,
    code,
    value,
    type,
    scope,
    flight_id: scope === 'flight' ? flightId : null,
    active: true
  };

  setDiscounts([nextDiscount, ...discounts]);

  if (scope === 'flight') {
    setFlights(
      flights.map((flight) =>
        Number(flight.flight_id) === flightId
          ? { ...flight, discount_code: code, discount_value: value, discount_type: type }
          : flight
      )
    );
  }

  res.status(201).json(nextDiscount);
});
