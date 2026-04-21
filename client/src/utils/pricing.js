export const classMultipliers = {
  Economy: 1,
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
