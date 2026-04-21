import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CreditCard, Ticket, Users } from 'lucide-react';
import { api } from '../api/client.js';
import BookingModal from '../components/BookingModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Bookings() {
  const { user } = useAuth();
  const { t, formatMoney } = usePreferences();
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setBookings(await api.getUserBookings(user.user_id));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [user.user_id]);

  async function cancel(id) {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.cancelBooking(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const activeCount = bookings.filter((booking) => booking.status !== 'cancelled').length;
  const paidCount = bookings.filter((booking) => booking.payment_status === 'paid').length;

  return (
    <section className="content-section page-top booking-list">
      <div className="page-banner">
        <div>
          <p className="eyebrow">SkyLink booking vault</p>
          <h1>{t.myBookings}</h1>
          <p className="section-copy">Track every booked route, finish payment, or update passenger details from one premium dashboard.</p>
        </div>
        <div className="page-banner-stats">
          <article>
            <span>All bookings</span>
            <strong>{bookings.length}</strong>
          </article>
          <article>
            <span>Active</span>
            <strong>{activeCount}</strong>
          </article>
          <article>
            <span>Paid</span>
            <strong>{paidCount}</strong>
          </article>
        </div>
      </div>
      {error && <p className="alert">{error}</p>}
      {bookings.map((booking) => (
        <article className="booking-item" key={booking.booking_id}>
          <div className="booking-primary">
            <div className="flight-card-head">
              <div>
                <p className="eyebrow">{booking.flight_code}</p>
                <h2>
                  {booking.departure_code} to {booking.arrival_code}
                </h2>
              </div>
              <p className={`status ${booking.status}`}>{booking.status}</p>
            </div>
            <p className="section-copy">Booking #{booking.booking_id}</p>
          </div>
          <dl>
            <div>
              <dt>
                <Users size={15} /> {t.passengers}
              </dt>
              <dd>{booking.passenger_count}</dd>
            </div>
            <div>
              <dt>
                <Ticket size={15} /> {t.price}
              </dt>
              <dd>{formatMoney(booking.total_amount)}</dd>
            </div>
            <div>
              <dt>
                <CreditCard size={15} /> {t.payment}
              </dt>
              <dd>{booking.payment_status}</dd>
            </div>
            <div>
              <dt>
                <CalendarClock size={15} /> {t.departureTime}
              </dt>
              <dd>{new Date(booking.departure_time).toLocaleString()}</dd>
            </div>
          </dl>
          <div className="row-actions">
            <button className="secondary" disabled={booking.status === 'cancelled'} onClick={() => setEditingBooking(booking)}>
              {t.edit}
            </button>
            {booking.payment_status !== 'paid' && (
              <Link className="button" to={`/payment/${booking.booking_id}`}>
                Pay
              </Link>
            )}
            <button className="ghost" disabled={booking.status === 'cancelled'} onClick={() => cancel(booking.booking_id)}>
              {t.cancel}
            </button>
          </div>
        </article>
      ))}
      {!bookings.length && <p className="empty">No bookings yet.</p>}
      {editingBooking && (
        <BookingModal
          flight={editingBooking}
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaved={() => {
            setEditingBooking(null);
            load();
          }}
        />
      )}
    </section>
  );
}
