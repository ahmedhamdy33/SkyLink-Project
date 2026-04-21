import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Sparkles, Stars } from 'lucide-react';
import { api } from '../api/client.js';
import BookingModal from '../components/BookingModal.jsx';
import FlightCard from '../components/FlightCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

const airportFallbackImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';

export default function Home() {
  const { user } = useAuth();
  const { t } = usePreferences();
  const [meta, setMeta] = useState({ airports: [] });
  const [recommendations, setRecommendations] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [search, setSearch] = useState({
    departureAirportId: '',
    arrivalAirportId: '',
    departureDate: '',
    returnDate: '',
    passengers: '1',
    classType: 'Economy',
    tripType: 'oneWay'
  });

  useEffect(() => {
    api.getReferenceData().then(setMeta).catch(() => null);
    api
      .getRecommendations(user ? { userId: user.user_id } : undefined)
      .then(setRecommendations)
      .catch(() => setRecommendations([]));
  }, [user]);

  const query = new URLSearchParams(search).toString();
  const heroStats = [
    { icon: Stars, value: `${meta.airports.length || 30}+`, label: 'Connected destinations' },
    { icon: Sparkles, value: `${recommendations.length || 6}`, label: 'AI smart suggestions' },
    { icon: Compass, value: '24/7', label: 'Live flight search' },
    { icon: ShieldCheck, value: 'Secure', label: 'Protected payment flow' }
  ];

  return (
    <>
      <section className="hero hero-home">
        <div className="hero-backdrop" aria-hidden="true">
          <span className="hero-shape shape-one" />
          <span className="hero-shape shape-two" />
          <span className="hero-shape shape-three" />
        </div>

        <div className="hero-grid">
          <div className="hero-content">
            <p className="eyebrow">SkyLink premium booking</p>
            <h1>The future of premium travel starts before takeoff.</h1>
            <p>
              Search routes, choose seats, unlock AI flight picks, and manage every booking from a cinematic airline
              platform built for a luxury digital travel experience.
            </p>
            <div className="hero-inline-pills">
              <span>Luxury cabin planning</span>
              <span>Live seat selection</span>
              <span>Instant booking management</span>
            </div>
            <div className="hero-actions">
              <Link className="button" to={`/flights?${query}`}>
                {t.searchFlights}
              </Link>
              <Link className="button secondary" to="/flights">
                Explore routes
              </Link>
            </div>
            <div className="premium-stats-grid">
              {heroStats.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label}>
                    <span className="stat-icon">
                      <Icon size={16} />
                    </span>
                    <strong>{item.value}</strong>
                    <p>{item.label}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="booking-console glass-panel">
            <div className="panel-intro">
              <p className="eyebrow">Instant search</p>
              <h2>Build your next itinerary</h2>
              <p>Choose the route, departure date, passenger count, and cabin class to open matching flights instantly.</p>
            </div>

            <div className="form-grid wide-grid">
              <label>
                Trip type
                <select value={search.tripType} onChange={(event) => setSearch({ ...search, tripType: event.target.value, returnDate: event.target.value === 'oneWay' ? '' : search.returnDate })}>
                  <option value="oneWay">One way</option>
                  <option value="roundTrip">Round trip</option>
                </select>
              </label>
              <label>
                {t.departure}
                <select value={search.departureAirportId} onChange={(event) => setSearch({ ...search, departureAirportId: event.target.value })}>
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
                <select value={search.arrivalAirportId} onChange={(event) => setSearch({ ...search, arrivalAirportId: event.target.value })}>
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
                <input type="date" value={search.departureDate} onChange={(event) => setSearch({ ...search, departureDate: event.target.value })} />
              </label>
              {search.tripType === 'roundTrip' && (
                <label>
                  Return date
                  <input type="date" value={search.returnDate} onChange={(event) => setSearch({ ...search, returnDate: event.target.value })} />
                </label>
              )}
              <label>
                {t.passengers}
                <input min="1" max="6" type="number" value={search.passengers} onChange={(event) => setSearch({ ...search, passengers: event.target.value })} />
              </label>
              <label>
                {t.class}
                <select value={search.classType} onChange={(event) => setSearch({ ...search, classType: event.target.value })}>
                  <option>Economy</option>
                  <option>Business</option>
                  <option>First</option>
                </select>
              </label>
            </div>

            <Link className="button wide" to={`/flights?${query}`}>
              {t.searchFlights}
            </Link>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Featured destinations</p>
            <h2>Move from inspiration to booking in one tap</h2>
            <p className="section-copy">Each destination card opens routes that land at that airport so users can jump directly into booking.</p>
          </div>
        </div>
        <div className="airport-grid">
          {meta.airports.map((airport) => (
            <Link className="airport-card" to={`/flights?arrivalAirportId=${airport.airport_id}`} key={airport.airport_id}>
              <img
                src={airport.image_url || airportFallbackImage}
                alt={`${airport.city} airport`}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = airportFallbackImage;
                }}
              />
              <div>
                <strong>{airport.airport_code}</strong>
                <h3>{airport.city}</h3>
                <span>{airport.country}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">AI suggestions</p>
            <h2>{user ? 'Recommended from your previous trips' : 'Recommended flights for you'}</h2>
            <p className="section-copy">SkyLink scores value, timing, and travel history to surface flights that feel hand-picked.</p>
          </div>
        </div>
        <div className="card-grid">
          {recommendations.map((flight) => (
            <div className="recommendation-card" key={flight.flight_id}>
              <FlightCard
                flight={flight}
                onBook={(nextFlight) => {
                  if (!user) window.location.href = '/login';
                  else setSelectedFlight(nextFlight);
                }}
              />
              <p className="recommendation-reason">
                AI reason: {flight.recommendation_reason}
                {flight.preferred_class ? ` | Suggested class: ${flight.preferred_class}` : ''}
              </p>
            </div>
          ))}
        </div>
        {!recommendations.length && <p className="empty">No recommendations yet. Book a trip and SkyLink will learn your preferences.</p>}
      </section>

      {selectedFlight && (
        <BookingModal
          flight={selectedFlight}
          initialPassengers={Number(search.passengers || 1)}
          initialClassType={search.classType}
          initialTripType={search.tripType}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </>
  );
}
