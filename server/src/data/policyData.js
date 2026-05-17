export const bookingPolicies = {
  cancellation: {
    key: 'cancellation',
    title: 'Cancellation policy',
    summary: 'Tickets can be cancelled before departure, but fees depend on how close the flight is and whether payment was completed.',
    bullets: [
      'More than 72 hours before departure: 10% cancellation fee.',
      'Between 24 and 72 hours before departure: 20% cancellation fee.',
      'Less than 24 hours before departure: 35% cancellation fee.',
      'After departure, the booking can only be closed with a 100% cancellation penalty.',
      'Cancelled flights are eligible for a full refund or free rebooking.'
    ]
  },
  baggage: {
    key: 'baggage',
    title: 'Baggage policy',
    summary: 'Carry-on and checked baggage allowances depend on cabin class, while oversized bags may incur additional charges.',
    bullets: [
      'Economy: 1 carry-on item up to 7 kg and 1 checked bag up to 23 kg.',
      'Business: 2 carry-on items up to 10 kg each and 2 checked bags up to 32 kg each.',
      'First: 2 carry-on items up to 10 kg each and 3 checked bags up to 32 kg each.',
      'Oversized or extra baggage is subject to airport handling fees.'
    ]
  },
  refund: {
    key: 'refund',
    title: 'Refund policy',
    summary: 'Refund timing depends on the original payment status and the reason for the change.',
    bullets: [
      'Approved refunds for card payments are typically processed within 7 to 10 business days.',
      'If a flight is cancelled by the airline, the customer can request a full refund.',
      'Partial refunds may apply when cancellation penalties are deducted.',
      'Used segments are not refundable unless required by law or operational disruption.'
    ]
  },
  reschedule: {
    key: 'reschedule',
    title: 'Reschedule policy',
    summary: 'Travel dates can be changed before departure, subject to seat availability and any fare difference.',
    bullets: [
      'Changes made more than 48 hours before departure only pay the fare difference when applicable.',
      'Changes inside 48 hours may include a fixed service fee plus any fare difference.',
      'Rescheduled itineraries must stay within available cabin inventory.',
      'Flights cancelled by the airline can be rebooked once at no extra service charge.'
    ]
  }
};

export function listBookingPolicies() {
  return Object.values(bookingPolicies);
}

export function getBookingPolicyByType(type = 'all') {
  const normalizedType = String(type || 'all').trim().toLowerCase();

  if (normalizedType === 'all') {
    return {
      policyType: 'all',
      title: 'SkyLink booking policies',
      policies: listBookingPolicies()
    };
  }

  const policy = bookingPolicies[normalizedType];

  if (!policy) {
    return {
      policyType: normalizedType,
      title: 'SkyLink booking policies',
      policies: listBookingPolicies()
    };
  }

  return {
    policyType: normalizedType,
    title: policy.title,
    policies: [policy]
  };
}
