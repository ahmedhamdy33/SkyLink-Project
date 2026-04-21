import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import AdminNav from '../components/AdminNav.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

const blankFlight = {
  flightCode: '',
  airlineId: '',
  aircraftId: '',
  departureAirportId: '',
  arrivalAirportId: '',
  departureTime: '',
  arrivalTime: '',
  price: '',
  availableSeats: '',
  status: 'active',
  discountValue: 0,
  discountType: '',
  discountCode: ''
};

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function mapFlightToForm(flight) {
  return {
    flightCode: flight.flight_code,
    airlineId: flight.airline_id,
    aircraftId: flight.aircraft_id,
    departureAirportId: flight.departure_airport_id,
    arrivalAirportId: flight.arrival_airport_id,
    departureTime: toDateTimeLocal(flight.departure_time),
    arrivalTime: toDateTimeLocal(flight.arrival_time),
    price: flight.price,
    availableSeats: flight.available_seats,
    status: flight.status,
    discountValue: flight.discount_value || 0,
    discountType: flight.discount_type || '',
    discountCode: flight.discount_code || ''
  };
}

export default function AdminFlightForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = usePreferences();
  const editingId = id ? Number(id) : null;
  const [meta, setMeta] = useState({ airports: [], airlines: [], aircraft: [] });
  const [form, setForm] = useState(blankFlight);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const aircraftForAirline = useMemo(
    () => meta.aircraft.filter((item) => !form.airlineId || item.airline_id === Number(form.airlineId)),
    [meta.aircraft, form.airlineId]
  );

  useEffect(() => {
    async function load() {
      try {
        const [referenceData, flights] = await Promise.all([api.getReferenceData(), api.getFlights()]);
        setMeta(referenceData);
        if (editingId) {
          const flight = flights.find((item) => Number(item.flight_id) === editingId);
          if (!flight) throw new Error('Flight not found.');
          setForm(mapFlightToForm(flight));
        } else {
          setForm(blankFlight);
        }
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [editingId]);

  async function saveFlight(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      ...form,
      airlineId: Number(form.airlineId),
      aircraftId: Number(form.aircraftId),
      departureAirportId: Number(form.departureAirportId),
      arrivalAirportId: Number(form.arrivalAirportId),
      price: Number(form.price),
      availableSeats: Number(form.availableSeats),
      discountValue: Number(form.discountValue || 0),
      discountType: form.discountType || null,
      discountCode: form.discountCode || null
    };

    try {
      if (editingId) {
        await api.updateFlight(editingId, payload);
        setSuccess('Flight updated successfully.');
      } else {
        await api.createFlight(payload);
        setForm(blankFlight);
        setSuccess('Flight added successfully.');
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="content-section page-top admin-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">Fleet management</p>
          <h1>{editingId ? t.editFlight : t.addFlight}</h1>
          <p className="section-copy">Create a new SkyLink flight or update an existing route from a dedicated form page.</p>
        </div>
        <div className="page-banner-card">
          <span>Mode</span>
          <strong>{editingId ? 'Edit' : 'Add'}</strong>
          <p>{editingId ? `Flight #${editingId}` : 'New schedule'}</p>
        </div>
      </div>

      <AdminNav />

      {error && <p className="alert">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form className="admin-form" onSubmit={saveFlight}>
        <div className="form-grid wide-grid">
          <label>
            {t.flightCode}
            <input required value={form.flightCode} onChange={(event) => setForm({ ...form, flightCode: event.target.value })} />
          </label>
          <label>
            {t.airline}
            <select required value={form.airlineId} onChange={(event) => setForm({ ...form, airlineId: event.target.value, aircraftId: '' })}>
              <option value="">{t.airline}</option>
              {meta.airlines.map((airline) => (
                <option key={airline.airline_id} value={airline.airline_id}>
                  {airline.airline_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.aircraft}
            <select required value={form.aircraftId} onChange={(event) => setForm({ ...form, aircraftId: event.target.value })}>
              <option value="">{t.aircraft}</option>
              {aircraftForAirline.map((aircraft) => (
                <option key={aircraft.aircraft_id} value={aircraft.aircraft_id}>
                  {aircraft.model} ({aircraft.total_seats})
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.departure}
            <select required value={form.departureAirportId} onChange={(event) => setForm({ ...form, departureAirportId: event.target.value })}>
              <option value="">{t.chooseAirport}</option>
              {meta.airports.map((airport) => (
                <option key={airport.airport_id} value={airport.airport_id}>
                  {airport.airport_code} - {airport.city}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.arrival}
            <select required value={form.arrivalAirportId} onChange={(event) => setForm({ ...form, arrivalAirportId: event.target.value })}>
              <option value="">{t.chooseAirport}</option>
              {meta.airports.map((airport) => (
                <option key={airport.airport_id} value={airport.airport_id}>
                  {airport.airport_code} - {airport.city}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.departureTime}
            <input required type="datetime-local" value={form.departureTime} onChange={(event) => setForm({ ...form, departureTime: event.target.value })} />
          </label>
          <label>
            {t.arrivalTime}
            <input required type="datetime-local" value={form.arrivalTime} onChange={(event) => setForm({ ...form, arrivalTime: event.target.value })} />
          </label>
          <label>
            {t.price}
            <input required min="0" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          </label>
          <label>
            {t.availableSeats}
            <input required min="0" type="number" value={form.availableSeats} onChange={(event) => setForm({ ...form, availableSeats: event.target.value })} />
          </label>
          <label>
            {t.status}
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option>active</option>
              <option>cancelled</option>
              <option>delayed</option>
            </select>
          </label>
          <label>
            {t.discount}
            <input min="0" type="number" value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: event.target.value })} />
          </label>
          <label>
            {t.discount}
            <select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value })}>
              <option value="">none</option>
              <option value="fixed">fixed</option>
              <option value="percentage">percentage</option>
            </select>
          </label>
          <label>
            {t.discountCode}
            <input value={form.discountCode} onChange={(event) => setForm({ ...form, discountCode: event.target.value })} />
          </label>
        </div>
        <div className="row-actions">
          <button>{t.save}</button>
          {editingId && (
            <Link className="button secondary" to="/admin/flights">
              Back to flights
            </Link>
          )}
          {editingId && (
            <button type="button" className="ghost" onClick={() => navigate('/admin/add-flight')}>
              Add new flight
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
