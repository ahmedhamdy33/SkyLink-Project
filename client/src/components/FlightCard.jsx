import { ArrowRight, CalendarDays, Clock3, PlaneLanding, PlaneTakeoff, TicketPercent, Users } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext.jsx';

function formatDate(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatTime(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatDayLabel(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

function formatDuration(startValue, endValue, t) {
  const diff = new Date(endValue).getTime() - new Date(startValue).getTime();
  const totalMinutes = Math.max(Math.round(diff / 60000), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}${t.hoursShort || 'h'} ${minutes}${t.minutesShort || 'm'}`;
}

function formatMinutes(totalMinutes, t) {
  const minutesValue = Math.max(0, Number(totalMinutes || 0));
  const hours = Math.floor(minutesValue / 60);
  const minutes = minutesValue % 60;
  return `${hours}${t.hoursShort || 'h'} ${minutes}${t.minutesShort || 'm'}`;
}

function getTransitLabel(flight) {
  const stops = flight.transit_stops || [];
  if (flight.is_direct || !stops.length) return 'Direct Flight';
  const stopNames = stops.map((stop) => stop.airport_code || stop.airport_name).filter(Boolean).join(', ');
  return `${stops.length} ${stops.length === 1 ? 'Stop' : 'Stops'}${stopNames ? ` - ${stopNames}` : ''}`;
}

function TransitTimeline({ flight }) {
  const { t, language } = usePreferences();
  const stops = flight.transit_stops || [];
  if (!stops.length) return null;

  const points = [
    { code: flight.departure_code, city: flight.departure_city, time: flight.departure_time, type: 'depart' },
    ...stops.map((stop) => ({
      code: stop.airport_code,
      city: stop.airport_name,
      arrivalTime: stop.arrival_time,
      departureTime: stop.departure_time,
      layover: stop.layover_minutes,
      type: 'stop'
    })),
    { code: flight.arrival_code, city: flight.arrival_city, time: flight.arrival_time, type: 'arrive' }
  ];

  return (
    <div className="flight-timeline">
      {points.map((point, index) => (
        <div className={`flight-timeline-point ${point.type}`} key={`${point.code}-${index}`}>
          <span className="timeline-dot" />
          <div>
            <strong>{point.code}</strong>
            <span>{point.city}</span>
            {point.type === 'stop' ? (
              <small>
                {formatTime(point.arrivalTime, language)} - {formatTime(point.departureTime, language)} | Layover {formatMinutes(point.layover, t)}
              </small>
            ) : (
              <small>{formatTime(point.time, language)}</small>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FlightCard({ flight, onBook, variant = 'default' }) {
  const { t, formatMoney, language } = usePreferences();
  const isSearchVariant = variant === 'search';
  const transitLabel = getTransitLabel(flight);
  const transitBadgeClass = flight.is_direct || Number(flight.transit_count || 0) === 0 ? 'direct' : 'transit';

  if (isSearchVariant) {
    return (
      <article className="flight-card flight-card-search">
        <div className="flight-search-main">
          <div className="flight-search-brand">
            <p className="eyebrow">{t.operatedBy} {flight.airline_name || t.skyLinkPartner}</p>
            <div className="flight-search-code-row">
              <strong>{flight.flight_code}</strong>
              <span>{flight.aircraft_model || t.standardCabin}</span>
            </div>
            <span className={`transit-badge ${transitBadgeClass}`}>{transitLabel}</span>
          </div>

          <div className="flight-search-route">
            <div className="flight-stop">
              <span className="flight-stop-time">{formatTime(flight.departure_time, language)}</span>
              <strong>{flight.departure_code}</strong>
              <span>{flight.departure_city}</span>
            </div>

            <div className="flight-journey">
              <span className="flight-journey-duration">{formatDuration(flight.departure_time, flight.arrival_time, t)}</span>
              <div className="flight-journey-line">
                <span className="flight-journey-dot" />
                <span className="flight-journey-plane">
                  <ArrowRight size={16} />
                </span>
                <span className="flight-journey-dot" />
              </div>
              <span className="flight-journey-note">{formatDayLabel(flight.departure_time, language)}</span>
            </div>

            <div className="flight-stop flight-stop-arrival">
              <span className="flight-stop-time">{formatTime(flight.arrival_time, language)}</span>
              <strong>{flight.arrival_code}</strong>
              <span>{flight.arrival_city}</span>
            </div>
          </div>

          <div className="flight-search-facts">
            <div className="flight-pill">
              <PlaneTakeoff size={15} />
              <span>{flight.transit_count ? `${flight.transit_count} ${flight.transit_count === 1 ? 'stop' : 'stops'}` : 'Direct'}</span>
            </div>
            <div className="flight-pill">
              <CalendarDays size={15} />
              <span>{formatDate(flight.departure_time, language)}</span>
            </div>
            <div className="flight-pill">
              <Users size={15} />
              <span>{flight.available_seats} {t.seats}</span>
            </div>
            <div className="flight-pill">
              {flight.discount_value ? <TicketPercent size={15} /> : <PlaneTakeoff size={15} />}
              <span>{flight.discount_value ? `${flight.discount_value}% ${t.offer}` : t.readyToBook}</span>
            </div>
          </div>
          <TransitTimeline flight={flight} />
        </div>

        <aside className="flight-search-side">
          <span className={`status ${flight.status}`}>{t.statusLabels[flight.status] || flight.status}</span>
          <div className="flight-price-stack">
            <span>{t.price}</span>
            <strong>{formatMoney(flight.price)}</strong>
          </div>
          <button className="book-glow" disabled={flight.status === 'cancelled'} onClick={() => onBook(flight)}>
            {t.bookNow}
          </button>
        </aside>
      </article>
    );
  }

  return (
    <article className="flight-card">
      <div className="flight-card-head">
        <div>
          <p className="eyebrow">{t.operatedBy} {flight.airline_name || t.skyLinkPartner}</p>
          <h3>{flight.flight_code}</h3>
          <p className="flight-subtitle">{flight.aircraft_model || t.premiumRoute}</p>
          <span className={`transit-badge ${transitBadgeClass}`}>{transitLabel}</span>
        </div>
        <span className={`status ${flight.status}`}>{t.statusLabels[flight.status] || flight.status}</span>
      </div>

      <div className="route-line premium-route-line">
        <div>
          <strong>{flight.departure_code}</strong>
          <span>{flight.departure_city}</span>
        </div>
        <span className="route-divider">
          <ArrowRight size={16} />
        </span>
        <div>
          <strong>{flight.arrival_code}</strong>
          <span>{flight.arrival_city}</span>
        </div>
      </div>

      <TransitTimeline flight={flight} />

      <dl className="flight-facts">
        <div>
          <dt>
            <Clock3 size={15} /> {t.departure}
          </dt>
          <dd>{formatDate(flight.departure_time, language)}</dd>
        </div>
        <div>
          <dt>
            <PlaneLanding size={15} /> {t.arrival}
          </dt>
          <dd>{formatDate(flight.arrival_time, language)}</dd>
        </div>
        <div>
          <dt>
            <Users size={15} /> {t.availableSeats}
          </dt>
          <dd>{flight.available_seats}</dd>
        </div>
        <div>
          <dt>
            {flight.discount_value ? <TicketPercent size={15} /> : <PlaneTakeoff size={15} />} {t.price}
          </dt>
          <dd>{formatMoney(flight.price)}</dd>
        </div>
      </dl>

      <button className="book-glow" disabled={flight.status === 'cancelled'} onClick={() => onBook(flight)}>
        {t.bookNow}
      </button>
    </article>
  );
}
