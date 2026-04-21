import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import BookingModal from '../components/BookingModal.jsx';
import FlightCard from '../components/FlightCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Flights() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { t } = usePreferences();
  const [flights, setFlights] = useState([]);
  const [meta, setMeta] = useState({ airports: [] });
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    departureAirportId: params.get('departureAirportId') || '',
    arrivalAirportId: params.get('arrivalAirportId') || '',
    departureDate: params.get('departureDate') || '',
    returnDate: params.get('returnDate') || '',
    passengers: params.get('passengers') || '1',
    classType: params.get('classType') || 'Economy',
    tripType: params.get('tripType') || 'oneWay'
  });
  const [error, setError] = useState('');

  async function load() {
    try {
      const [referenceData, nextFlights] = await Promise.all([api.getReferenceData(), api.getFlights(filters)]);
      setMeta(referenceData);
      setFlights(nextFlights);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => flights, [flights]);

  return (
    <section className="content-section page-top">
      <div className="page-banner">
        <div>
          <p className="eyebrow">SkyLink flight lounge</p>
          <h1>{t.flights}</h1>
          <p className="section-copy">Filter the live schedule, compare premium routes, and book directly from the smart flight grid.</p>
        </div>
        <div className="page-banner-card">
          <span>Live results</span>
          <strong>{filtered.length}</strong>
          <p>Flights ready to book</p>
        </div>
      </div>

      <form
        className="toolbar glass-panel"
        onSubmit={(event) => {
          event.preventDefault();
          load();
        }}
      >
        <select value={filters.tripType} onChange={(event) => setFilters({ ...filters, tripType: event.target.value, returnDate: event.target.value === 'oneWay' ? '' : filters.returnDate })}>
          <option value="oneWay">One way</option>
          <option value="roundTrip">Round trip</option>
        </select>
        <select value={filters.departureAirportId} onChange={(event) => setFilters({ ...filters, departureAirportId: event.target.value })}>
          <option value="">{t.departure}</option>
          {meta.airports.map((airport) => (
            <option key={airport.airport_id} value={airport.airport_id}>
              {airport.airport_code} - {airport.city}
            </option>
          ))}
        </select>
        <select value={filters.arrivalAirportId} onChange={(event) => setFilters({ ...filters, arrivalAirportId: event.target.value })}>
          <option value="">{t.arrival}</option>
          {meta.airports.map((airport) => (
            <option key={airport.airport_id} value={airport.airport_id}>
              {airport.airport_code} - {airport.city}
            </option>
          ))}
        </select>
        <input min="1" max="6" type="number" value={filters.passengers} onChange={(event) => setFilters({ ...filters, passengers: event.target.value })} />
        <select value={filters.classType} onChange={(event) => setFilters({ ...filters, classType: event.target.value })}>
          <option>Economy</option>
          <option>Business</option>
          <option>First</option>
        </select>
        {filters.tripType === 'roundTrip' && (
          <input type="date" value={filters.returnDate} onChange={(event) => setFilters({ ...filters, returnDate: event.target.value })} />
        )}
        <button>{t.searchFlights}</button>
      </form>

      {error && <p className="alert">{error}</p>}
      <div className="card-grid">
        {filtered.map((flight) => (
          <FlightCard
            key={flight.flight_id}
            flight={flight}
            onBook={(nextFlight) => {
              if (!user) window.location.href = '/login';
              else setSelected(nextFlight);
            }}
          />
        ))}
      </div>
      {!filtered.length && <p className="empty">No flights found.</p>}
      {selected && (
        <BookingModal
          flight={selected}
          initialPassengers={Number(filters.passengers || 1)}
          initialClassType={filters.classType}
          initialTripType={filters.tripType}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
