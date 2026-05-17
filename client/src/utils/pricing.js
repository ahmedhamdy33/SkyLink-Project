export const classMultipliers = {
  Economy: 1,
  'Premium Economy': 1.25,
  Business: 1.5,
  First: 2
};

export const tripMultipliers = {
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
    return total + Number(basePrice || 0) * getClassMultiplier(passenger.classType || passenger.class_type) * tripMultiplier;
  }, 0);
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
  return {
    rate,
    fee: Math.min(total, Math.round(total * rate * 100) / 100)
  };
}
