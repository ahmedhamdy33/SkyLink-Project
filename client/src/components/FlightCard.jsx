import { ArrowRight, Clock3, PlaneLanding, PlaneTakeoff, TicketPercent, Users } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext.jsx';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export default function FlightCard({ flight, onBook }) {
  const { t, formatMoney } = usePreferences();

  return (
    <article className="flight-card">
      <div className="flight-card-head">
        <div>
          <p className="eyebrow">{flight.airline_name}</p>
          <h3>{flight.flight_code}</h3>
          <p className="flight-subtitle">{flight.aircraft_model || 'Premium route'}</p>
        </div>
        <span className={`status ${flight.status}`}>{flight.status}</span>
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

      <dl className="flight-facts">
        <div>
          <dt>
            <Clock3 size={15} /> {t.departure}
          </dt>
          <dd>{formatDate(flight.departure_time)}</dd>
        </div>
        <div>
          <dt>
            <PlaneLanding size={15} /> {t.arrival}
          </dt>
          <dd>{formatDate(flight.arrival_time)}</dd>
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
