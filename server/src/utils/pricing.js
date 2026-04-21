const classMultipliers = {
  Economy: 1,
  Business: 1.5,
  First: 2
};

const tripMultipliers = {
  oneWay: 1,
  roundTrip: 2
};

export function calculatePassengerSubtotal(passengers, basePrice, tripType = 'oneWay') {
  const tripMultiplier = tripMultipliers[tripType] || 1;
  return (passengers || []).reduce((total, passenger) => {
    const classType = passenger.classType || passenger.class_type || 'Economy';
    return total + Number(basePrice || 0) * (classMultipliers[classType] || 1) * tripMultiplier;
  }, 0);
}

export function calculateDiscountAmount(discount, amount) {
  if (!discount) return 0;
  const value = Number(discount.value ?? discount.discount_value ?? 0);
  const type = discount.type ?? discount.discount_type;
  const discountAmount = type === 'percentage' ? Math.round((amount * value) / 100) : value;
  return Math.min(amount, Math.max(0, discountAmount));
}
