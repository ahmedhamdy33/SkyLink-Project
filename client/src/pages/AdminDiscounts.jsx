import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import AdminNav from '../components/AdminNav.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

const blankDiscount = {
  code: '',
  type: 'percentage',
  value: '',
  scope: 'all',
  flightId: ''
};

export default function AdminDiscounts() {
  const { t } = usePreferences();
  const [flights, setFlights] = useState([]);
  const [discountForm, setDiscountForm] = useState(blankDiscount);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getFlights().then(setFlights).catch((err) => setError(err.message));
  }, []);

  async function saveDiscount(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.createDiscount({
        code: discountForm.code,
        type: discountForm.type,
        value: Number(discountForm.value),
        scope: discountForm.scope,
        flightId: discountForm.scope === 'flight' ? Number(discountForm.flightId) : null
      });
      setDiscountForm(blankDiscount);
      setSuccess(t.discountSaved);
      setFlights(await api.getFlights());
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="content-section page-top admin-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">{t.discountStudio}</p>
          <h1>{t.discount}</h1>
          <p className="section-copy">{t.discountCopy}</p>
        </div>
        <div className="page-banner-card">
          <span>{t.discountScope}</span>
          <strong>{discountForm.scope === 'flight' ? t.flightSingular : t.all}</strong>
          <p>{discountForm.scope === 'flight' ? t.specificFlightOnly : t.allFlights}</p>
        </div>
      </div>

      <AdminNav />

      {error && <p className="alert">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form className="admin-form" onSubmit={saveDiscount}>
        <div className="form-grid wide-grid">
          <label>
            {t.discountCode}
            <input required value={discountForm.code} onChange={(event) => setDiscountForm({ ...discountForm, code: event.target.value })} />
          </label>
          <label>
            {t.discount}
            <input required min="1" type="number" value={discountForm.value} onChange={(event) => setDiscountForm({ ...discountForm, value: event.target.value })} />
          </label>
          <label>
            {t.type}
            <select value={discountForm.type} onChange={(event) => setDiscountForm({ ...discountForm, type: event.target.value })}>
              <option value="percentage">{t.percentage}</option>
              <option value="fixed">{t.fixed}</option>
            </select>
          </label>
          <label>
            {t.appliesTo}
            <select value={discountForm.scope} onChange={(event) => setDiscountForm({ ...discountForm, scope: event.target.value, flightId: '' })}>
              <option value="all">{t.allFlights}</option>
              <option value="flight">{t.specificFlight}</option>
            </select>
          </label>
          {discountForm.scope === 'flight' && (
            <label>
              {t.flights}
              <select required value={discountForm.flightId} onChange={(event) => setDiscountForm({ ...discountForm, flightId: event.target.value })}>
                <option value="">{t.chooseFlight}</option>
                {flights.map((flight) => (
                  <option key={flight.flight_id} value={flight.flight_id}>
                    {flight.flight_code} - {flight.departure_code} {t.routeTo} {flight.arrival_code}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="row-actions">
          <button>{t.save}</button>
        </div>
      </form>
    </section>
  );
}
