import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { t } = usePreferences();
  const [form, setForm] = useState({ cardholder: '', cardNumber: '', expiry: '', cvv: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.confirmCardPayment(bookingId, form);
      setSuccess('Payment confirmed successfully.');
      setTimeout(() => navigate('/bookings'), 800);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="payment-page">
      <div className="auth-shell payment-shell">
        <div className="auth-visual">
          <p className="eyebrow">Secure payment</p>
          <h1>Finish your booking in the SkyLink payment lounge.</h1>
          <p>Enter your card details to confirm booking #{bookingId} and return to your itinerary with updated payment status.</p>
          <div className="auth-highlights">
            <span>Encrypted card details</span>
            <span>Instant payment confirmation</span>
            <span>Automatic booking update</span>
          </div>
        </div>
        <form className="payment-panel" onSubmit={submit}>
          <p className="eyebrow">SkyLink</p>
          <h1>{t.payment}</h1>
          <p>Complete secure card payment for booking #{bookingId}.</p>
          {error && <p className="alert">{error}</p>}
          {success && <p className="success">{success}</p>}
          <label>
            Cardholder name
            <input required value={form.cardholder} onChange={(event) => setForm({ ...form, cardholder: event.target.value })} />
          </label>
          <label>
            Card number
            <input required maxLength="19" value={form.cardNumber} onChange={(event) => setForm({ ...form, cardNumber: event.target.value })} />
          </label>
          <div className="form-grid">
            <label>
              Expiry
              <input required placeholder="MM/YY" value={form.expiry} onChange={(event) => setForm({ ...form, expiry: event.target.value })} />
            </label>
            <label>
              CVV
              <input required maxLength="4" value={form.cvv} onChange={(event) => setForm({ ...form, cvv: event.target.value })} />
            </label>
          </div>
          <button>Pay now</button>
          <Link to="/bookings">Back to bookings</Link>
        </form>
      </div>
    </section>
  );
}
