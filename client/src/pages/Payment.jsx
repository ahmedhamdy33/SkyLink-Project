import { CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import CelebrationPanel from '../components/CelebrationPanel.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

const sandboxCopy = {
  en: {
    badge: 'Test mode',
    title: 'Sandbox payment API',
    note: 'These cards only hit the test gateway. No real money is moved and real card numbers are blocked.',
    expiryHint: 'Use any future date, for example 12/34.',
    unavailable: 'Sandbox cards are unavailable right now. You can still use 4242 4242 4242 4242.',
    processing: 'Processing...'
  },
  ar: {
    badge: 'وضع الاختبار',
    title: 'واجهة دفع تجريبية',
    note: 'هذه البطاقات تعمل مع بوابة الاختبار فقط. لا يتم خصم أي أموال حقيقية، وأرقام البطاقات الحقيقية مرفوضة.',
    expiryHint: 'استخدم أي تاريخ مستقبلي، مثلا 12/34.',
    unavailable: 'بطاقات الاختبار غير متاحة الآن. يمكنك استخدام 4242 4242 4242 4242.',
    processing: 'جاري التنفيذ...'
  }
};

export default function Payment() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = usePreferences();
  const [form, setForm] = useState({ cardholder: '', cardNumber: '', expiry: '', cvv: '' });
  const [sandboxConfig, setSandboxConfig] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const celebrateBooking = Boolean(location.state?.celebrateBooking);
  const bookingFlightCode = location.state?.flightCode;
  const copy = sandboxCopy[language] || sandboxCopy.en;

  useEffect(() => {
    let ignore = false;

    api
      .getPaymentSandboxConfig()
      .then((data) => {
        if (!ignore) setSandboxConfig(data);
      })
      .catch(() => {
        if (!ignore) setSandboxConfig({ cards: [] });
      });

    return () => {
      ignore = true;
    };
  }, []);

  function handleCardNumberChange(value) {
    const digits = String(value || '')
      .replace(/\D/g, '')
      .slice(0, 16);

    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  function handleExpiryChange(value) {
    const digits = String(value || '')
      .replace(/\D/g, '')
      .slice(0, 4);

    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function useTestCard(card) {
    setForm({
      cardholder: 'SkyLink Test',
      cardNumber: card.displayNumber,
      expiry: card.expiry,
      cvv: card.cvv
    });
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.confirmCardPayment(bookingId, form);
      setSuccess(t.paymentConfirmed);
      setTimeout(() => navigate('/bookings'), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="payment-page">
      <div className="auth-shell payment-shell">
        <div className="auth-visual">
          <p className="eyebrow">{t.securePayment}</p>
          <h1>{t.paymentTitle}</h1>
          <p>{t.paymentCopy.replace('{id}', bookingId)}</p>
          <div className="auth-highlights">
            <span>{t.encryptedCard}</span>
            <span>{t.instantPayment}</span>
            <span>{t.automaticBooking}</span>
          </div>
        </div>
        <form className="payment-panel" onSubmit={submit}>
          <p className="eyebrow">SkyLink</p>
          <h1>{t.payment}</h1>
          <p>{t.completePayment.replace('{id}', bookingId)}</p>
          {celebrateBooking && (
            <CelebrationPanel
              compact
              title={t.bookingLocked}
              description={bookingFlightCode ? t.bookingLockedFlight.replace('{flightCode}', bookingFlightCode) : t.bookingLockedGeneric}
            />
          )}
          {error && <p className="alert">{error}</p>}
          {success && <p className="success">{success}</p>}
          <div className="sandbox-payment-box">
            <div>
              <span className="sandbox-badge">{copy.badge}</span>
              <h2>{copy.title}</h2>
              <p>{copy.note}</p>
              <small>{copy.expiryHint}</small>
            </div>
            <div className="sandbox-card-list">
              {sandboxConfig?.cards?.length ? (
                sandboxConfig.cards.map((card) => (
                  <button
                    className="sandbox-card-button"
                    key={card.displayNumber}
                    type="button"
                    onClick={() => useTestCard(card)}
                  >
                    <CreditCard size={16} />
                    <span>
                      <strong>{card.label}</strong>
                      <small>{card.displayNumber}</small>
                    </span>
                  </button>
                ))
              ) : (
                <p>{copy.unavailable}</p>
              )}
            </div>
          </div>
          <label>
            {t.cardholderName}
            <input required value={form.cardholder} onChange={(event) => setForm({ ...form, cardholder: event.target.value })} />
          </label>
          <label>
            {t.cardNumber}
            <input
              required
              inputMode="numeric"
              maxLength="19"
              placeholder="1234 5678 9012 3456"
              value={form.cardNumber}
              onChange={(event) => setForm({ ...form, cardNumber: handleCardNumberChange(event.target.value) })}
            />
          </label>
          <div className="form-grid">
            <label>
              {t.expiryDate}
              <input
                required
                inputMode="numeric"
                maxLength="5"
                placeholder="MM/YY"
                pattern="^(0[1-9]|1[0-2])\/\d{2}$"
                value={form.expiry}
                onChange={(event) => setForm({ ...form, expiry: handleExpiryChange(event.target.value) })}
              />
            </label>
            <label>
              CVV
              <input required inputMode="numeric" maxLength="4" value={form.cvv} onChange={(event) => setForm({ ...form, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) })} />
            </label>
          </div>
          <button disabled={submitting}>{submitting ? copy.processing : t.payNow}</button>
          <Link to="/bookings">{t.backToBookings}</Link>
        </form>
      </div>
    </section>
  );
}
