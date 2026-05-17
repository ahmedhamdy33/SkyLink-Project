import { AppError } from '../utils/errors.js';

const TEST_CARDS = [
  {
    brand: 'Visa',
    number: '4242424242424242',
    displayNumber: '4242 4242 4242 4242',
    label: 'Visa approval',
    outcome: 'paid'
  },
  {
    brand: 'Mastercard',
    number: '5555555555554444',
    displayNumber: '5555 5555 5555 4444',
    label: 'Mastercard approval',
    outcome: 'paid'
  },
  {
    brand: 'Visa',
    number: '4000000000009995',
    displayNumber: '4000 0000 0000 9995',
    label: 'Insufficient funds',
    outcome: 'failed',
    message: 'Sandbox payment declined: insufficient funds.'
  },
  {
    brand: 'Visa',
    number: '4000000000000002',
    displayNumber: '4000 0000 0000 0002',
    label: 'Card declined',
    outcome: 'failed',
    message: 'Sandbox payment declined by the test gateway.'
  }
];

function normalizeCardNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

function validateExpiry(expiry) {
  const match = String(expiry || '').match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) {
    throw new AppError('Expiry date must use MM/YY format.', 400);
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const expiryDate = new Date(year, month, 1);
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (expiryDate <= currentMonth) {
    throw new AppError('Use a future expiry date for sandbox payment.', 400);
  }
}

function validateCardInput(card) {
  if (!card?.cardholder || !card?.cardNumber || !card?.expiry || !card?.cvv) {
    throw new AppError('Card details are required.', 400);
  }

  validateExpiry(card.expiry);

  if (!/^\d{3,4}$/.test(String(card.cvv))) {
    throw new AppError('CVV must be 3 or 4 digits.', 400);
  }
}

function createSandboxTransactionId() {
  return `SBX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function getSandboxPaymentOptions() {
  return {
    provider: 'SkyLink Sandbox Pay',
    mode: 'test',
    moneyMovement: false,
    cards: TEST_CARDS.map(({ displayNumber, label, outcome, brand }) => ({
      brand,
      displayNumber,
      label,
      outcome,
      expiry: '12/34',
      cvv: brand === 'Visa' ? '123' : '456'
    }))
  };
}

export function confirmSandboxPayment({ amount, currency = 'USD', card }) {
  validateCardInput(card);

  const cardNumber = normalizeCardNumber(card.cardNumber);
  const testCard = TEST_CARDS.find((item) => item.number === cardNumber);

  if (!testCard) {
    throw new AppError('Use a sandbox test card. No real cards are accepted in test mode.', 402);
  }

  if (testCard.outcome !== 'paid') {
    throw new AppError(testCard.message || 'Sandbox payment declined.', 402);
  }

  return {
    provider: 'SkyLink Sandbox Pay',
    mode: 'test',
    status: 'paid',
    transactionId: createSandboxTransactionId(),
    amount: Number(amount || 0),
    currency,
    brand: testCard.brand,
    cardLast4: cardNumber.slice(-4)
  };
}
