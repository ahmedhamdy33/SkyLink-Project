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
      setSuccess('Discount code saved successfully.');
      setFlights(await api.getFlights());
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="content-section page-top admin-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">Discount studio</p>
          <h1>Add Discount</h1>
          <p className="section-copy">Create global discount codes or attach a code to one specific flight.</p>
        </div>
        <div className="page-banner-card">
          <span>Discount scope</span>
          <strong>{discountForm.scope === 'flight' ? 'Flight' : 'All'}</strong>
          <p>{discountForm.scope === 'flight' ? 'Specific flight only' : 'All flights'}</p>
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
            Type
            <select value={discountForm.type} onChange={(event) => setDiscountForm({ ...discountForm, type: event.target.value })}>
              <option value="percentage">percentage</option>
              <option value="fixed">fixed</option>
            </select>
          </label>
          <label>
            Applies to
            <select value={discountForm.scope} onChange={(event) => setDiscountForm({ ...discountForm, scope: event.target.value, flightId: '' })}>
              <option value="all">All flights</option>
              <option value="flight">Specific flight</option>
            </select>
          </label>
          {discountForm.scope === 'flight' && (
            <label>
              {t.flights}
              <select required value={discountForm.flightId} onChange={(event) => setDiscountForm({ ...discountForm, flightId: event.target.value })}>
                <option value="">Choose flight</option>
                {flights.map((flight) => (
                  <option key={flight.flight_id} value={flight.flight_id}>
                    {flight.flight_code} - {flight.departure_code} to {flight.arrival_code}
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
