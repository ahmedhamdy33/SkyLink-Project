const classMultipliers = {
  Economy: 1,
  'Premium Economy': 1.25,
  Business: 1.5,
  First: 2
};

const tripMultipliers = {
  oneWay: 1,
  roundTrip: 2
};

export function getClassMultiplier(classType) {
  return classMultipliers[classType] || 1;
}

export function getTripMultiplier(tripType) {
  return tripMultipliers[tripType] || 1;
}

export function calculatePassengerSubtotal(passengers, basePrice, tripType = 'oneWay') {
  const tripMultiplier = getTripMultiplier(tripType);
  return (passengers || []).reduce((total, passenger) => {
    const classType = passenger.classType || passenger.class_type || 'Economy';
    return total + Number(basePrice || 0) * getClassMultiplier(classType) * tripMultiplier;
  }, 0);
}

export function calculateDiscountAmount(discount, amount) {
  if (!discount) return 0;
  const value = Number(discount.value ?? discount.discount_value ?? 0);
  const type = discount.type ?? discount.discount_type;
  const discountAmount = type === 'percentage' ? Math.round((amount * value) / 100) : value;
  return Math.min(amount, Math.max(0, discountAmount));
}

export function getCancellationPenaltyRate(departureTime, now = new Date()) {
  const departure = new Date(departureTime);
  const current = new Date(now);
  const hoursUntilDeparture = (departure.getTime() - current.getTime()) / (1000 * 60 * 60);

  if (!Number.isFinite(hoursUntilDeparture)) return 0.35;
  if (hoursUntilDeparture <= 0) return 1;
  if (hoursUntilDeparture < 24) return 0.35;
  if (hoursUntilDeparture < 72) return 0.2;
  return 0.1;
}

export function calculateCancellationFee(amount, departureTime, now = new Date()) {
  const total = Math.max(0, Number(amount || 0));
  const rate = getCancellationPenaltyRate(departureTime, now);
  const hoursUntilDeparture = (new Date(departureTime).getTime() - new Date(now).getTime()) / (1000 * 60 * 60);
  return {
    rate,
    fee: Math.min(total, Math.round(total * rate * 100) / 100),
    hoursUntilDeparture: Number.isFinite(hoursUntilDeparture) ? Math.max(0, hoursUntilDeparture) : 0
  };
}
