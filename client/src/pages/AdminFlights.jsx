import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import AdminNav from '../components/AdminNav.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function AdminFlights() {
  const { t, formatMoney } = usePreferences();
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setFlights(await api.getFlights());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteFlight(id) {
    if (!window.confirm(t.deleteFlightConfirm)) return;
    try {
      await api.deleteFlight(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function setStatus(id, status) {
    try {
      await api.updateFlightStatus(id, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="content-section page-top admin-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">{t.flightInventory}</p>
          <h1>{t.flights}</h1>
          <p className="section-copy">{t.adminFlightsCopy}</p>
        </div>
        <div className="page-banner-card">
          <span>{t.totalFlights}</span>
          <strong>{flights.length}</strong>
          <p>{t.routesInventory}</p>
        </div>
      </div>

      <AdminNav />

      {error && <p className="alert">{error}</p>}

      <section className="admin-table">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t.manageSchedule}</p>
            <h2>{t.flights}</h2>
          </div>
          <Link className="button" to="/admin/add-flight">
            {t.addFlight}
          </Link>
        </div>
        {flights.map((flight) => (
          <article className="table-row" key={flight.flight_id}>
            <strong>{flight.flight_code}</strong>
            <span>{flight.departure_code} {t.routeTo} {flight.arrival_code}</span>
            <span>{formatMoney(flight.price)}</span>
            <span className={`status ${flight.status}`}>{t.statusLabels[flight.status] || flight.status}</span>
            <div className="row-actions">
              <Link className="button" to={`/admin/flights/${flight.flight_id}/edit`}>
                {t.edit}
              </Link>
              <button className="secondary" onClick={() => setStatus(flight.flight_id, 'cancelled')}>
                {t.cancel}
              </button>
              <button className="ghost" onClick={() => deleteFlight(flight.flight_id)}>
                {t.delete}
              </button>
            </div>
          </article>
        ))}
        {!flights.length && <p className="empty">{t.noFlightsFound}</p>}
      </section>
    </section>
  );
}
