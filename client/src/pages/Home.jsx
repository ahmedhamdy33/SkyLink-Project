import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, CalendarDays, Compass, Plane, ShieldCheck, Sparkles, Stars, Users } from 'lucide-react';
import { api } from '../api/client.js';
import BookingModal from '../components/BookingModal.jsx';
import FlightCard from '../components/FlightCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

const airportFallbackImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';
const heroClockNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default function Home() {
  const { user } = useAuth();
  const { t } = usePreferences();
  const [meta, setMeta] = useState({ airports: [] });
  const [recommendations, setRecommendations] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [now, setNow] = useState(() => new Date());
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 100);

    return () => window.clearInterval(timer);
  }, []);

  const query = new URLSearchParams(search).toString();
  const passengerLabel = `${search.passengers} ${t.travellers}, ${t.classTypes[search.classType] || search.classType}`;
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  const hourAngle = hours * 30;
  const minuteAngle = minutes * 6;
  const secondAngle = seconds * 6;
  const heroStats = [
    { icon: Stars, value: `${meta.airports.length || 30}+`, label: t.connectedDestinations },
    { icon: Sparkles, value: `${recommendations.length || 6}`, label: t.aiSmartSuggestions },
    { icon: Compass, value: '24/7', label: t.liveFlightSearch },
    { icon: ShieldCheck, value: t.success, label: t.securePaymentFlow }
  ];

  return (
    <>
      <section className="hero hero-home skyscanner-hero">
        <div className="hero-motion-layer" aria-hidden="true">
          <span className="hero-beam hero-beam-one" />
          <span className="hero-beam hero-beam-two" />
          <div
            className="hero-clock hero-clock-one"
            aria-label={`Current time ${now.toLocaleTimeString()}`}
            style={{
              '--clock-hour-angle': `${hourAngle}deg`,
              '--clock-minute-angle': `${minuteAngle}deg`,
              '--clock-second-angle': `${secondAngle}deg`
            }}
          >
            <span className="hero-clock-face" />
            <span className="hero-clock-ring hero-clock-ring-outer" />
            <span className="hero-clock-ring hero-clock-ring-inner" />
            <span className="hero-clock-tick hero-clock-tick-12" />
            <span className="hero-clock-tick hero-clock-tick-3" />
            <span className="hero-clock-tick hero-clock-tick-6" />
            <span className="hero-clock-tick hero-clock-tick-9" />
            {heroClockNumbers.map((number) => (
              <span
                key={number}
                className="hero-clock-number"
                style={{ '--clock-number-angle': `${(number % 12) * 30}deg` }}
              >
                {number}
              </span>
            ))}
            <span className="hero-clock-hand hero-clock-hand-hour" />
            <span className="hero-clock-hand hero-clock-hand-minute" />
            <span className="hero-clock-hand hero-clock-hand-second" />
            <span className="hero-clock-center" />
            <span className="hero-clock-glow" />
          </div>
          <span className="hero-orbit hero-orbit-two" />
          <span className="hero-spark hero-spark-one" />
          <span className="hero-spark hero-spark-two" />
        </div>
        <div className="hero-grid hero-grid-search">
          <div className="hero-content home-search-content">
            <div className="hero-product-tabs" aria-label={t.flights}>
              <span className="hero-product-tab active">
                <Plane size={16} />
                {t.flights}
              </span>
            </div>

            <p className="eyebrow">{t.compareFlightsEyebrow}</p>
            <h1>{t.homeTitle}</h1>
            <p className="hero-lead">{t.homeLead}</p>

            <div className="booking-console booking-console-skyscanner glass-panel">
              <div className="search-control-bar">
                <label className="search-inline-select">
                  <span>{t.tripType}</span>
                  <select
                    value={search.tripType}
                    onChange={(event) =>
                      setSearch({
                        ...search,
                        tripType: event.target.value,
                        returnDate: event.target.value === 'oneWay' ? '' : search.returnDate
                      })
                    }
                  >
                    <option value="oneWay">{t.oneWay}</option>
                    <option value="roundTrip">{t.returnTrip}</option>
                  </select>
                </label>
                <div className="search-summary-chip">
                  <Users size={16} />
                  <span>{passengerLabel}</span>
                </div>
              </div>

              <div className="search-strip">
                <label className="search-panel">
                  <span className="search-panel-label">{t.from}</span>
                  <select value={search.departureAirportId} onChange={(event) => setSearch({ ...search, departureAirportId: event.target.value })}>
                    <option value="">{t.cityOrAirport}</option>
                    {meta.airports.map((airport) => (
                      <option key={airport.airport_id} value={airport.airport_id}>
                        {airport.city} ({airport.airport_code})
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className="swap-trigger"
                  aria-label={t.swapAirports || 'Swap airports'}
                  onClick={() =>
                    setSearch((current) => ({
                      ...current,
                      departureAirportId: current.arrivalAirportId,
                      arrivalAirportId: current.departureAirportId
                    }))
                  }
                >
                  <ArrowRightLeft size={18} />
                </button>

                <label className="search-panel">
                  <span className="search-panel-label">{t.to}</span>
                  <select value={search.arrivalAirportId} onChange={(event) => setSearch({ ...search, arrivalAirportId: event.target.value })}>
                    <option value="">{t.countryCityAirport}</option>
                    {meta.airports.map((airport) => (
                      <option key={airport.airport_id} value={airport.airport_id}>
                        {airport.city} ({airport.airport_code})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="search-panel">
                  <span className="search-panel-label">{t.depart}</span>
                  <div className="search-panel-input">
                    <CalendarDays size={16} />
                    <input type="date" value={search.departureDate} onChange={(event) => setSearch({ ...search, departureDate: event.target.value })} />
                  </div>
                </label>

                <label className={`search-panel ${search.tripType === 'oneWay' ? 'disabled' : ''}`}>
                  <span className="search-panel-label">{t.returnDate}</span>
                  <div className="search-panel-input">
                    <CalendarDays size={16} />
                    <input
                      type="date"
                      value={search.returnDate}
                      disabled={search.tripType === 'oneWay'}
                      onChange={(event) => setSearch({ ...search, returnDate: event.target.value })}
                    />
                  </div>
                </label>

                <div className="search-panel travellers-panel">
                  <span className="search-panel-label">{t.travellersCabin}</span>
                  <div className="traveller-controls">
                    <input
                      min="1"
                      max="6"
                      type="number"
                      value={search.passengers}
                      onChange={(event) => setSearch({ ...search, passengers: event.target.value })}
                    />
                    <select value={search.classType} onChange={(event) => setSearch({ ...search, classType: event.target.value })}>
                      <option value="Economy">{t.classTypes.Economy}</option>
                      <option value="Business">{t.classTypes.Business}</option>
                      <option value="First">{t.classTypes.First}</option>
                    </select>
                  </div>
                </div>

                <Link className="button search-button" to={`/flights?${query}`}>
                  {t.search}
                </Link>
              </div>

              <div className="search-footnote-row">
                <span>{t.popularNow}</span>
                <Link to="/assistant">{t.useAssistantCompare}</Link>
                <Link to="/flights">{t.browseAllFlights}</Link>
              </div>
            </div>

            <div className="premium-stats-grid premium-stats-grid-compact">
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
        </div>
      </section>

      <section className="content-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t.featuredDestinations}</p>
            <h2>{t.popularAirports}</h2>
            <p className="section-copy">{t.destinationCopy}</p>
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
            <p className="eyebrow">{t.aiSuggestions}</p>
            <h2>{user ? t.recommendedTrips : t.recommendedForYou}</h2>
            <p className="section-copy">{t.recommendationsCopy}</p>
          </div>
        </div>
        <div className="card-grid flights-results-grid home-recommendations-list">
          {recommendations.map((flight) => (
            <div className="recommendation-card" key={flight.flight_id}>
              <FlightCard
                flight={flight}
                variant="search"
                onBook={(nextFlight) => {
                  if (!user) window.location.href = '/login';
                  else setSelectedFlight(nextFlight);
                }}
              />
              <p className="recommendation-reason">
                {t.aiReason}: {flight.recommendation_reason}
                {flight.preferred_class ? ` | ${t.suggestedClass}: ${t.classTypes[flight.preferred_class] || flight.preferred_class}` : ''}
              </p>
            </div>
          ))}
        </div>
        {!recommendations.length && <p className="empty">{t.noRecommendations}</p>}
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
