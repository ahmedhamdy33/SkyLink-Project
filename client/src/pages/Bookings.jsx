import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CreditCard, Plane, Ticket, Users } from 'lucide-react';
import { api } from '../api/client.js';
import BookingModal from '../components/BookingModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { calculateCancellationFee } from '../utils/pricing.js';

export default function Bookings() {
  const { user } = useAuth();
  const { t, formatMoney } = usePreferences();
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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
    const booking = bookings.find((item) => Number(item.booking_id) === Number(id));
    const estimate = booking ? calculateCancellationFee(booking.total_amount, booking.departure_time) : null;
    const message = estimate
      ? `${t.cancelBookingConfirm}\n\nCancellation fee: ${formatMoney(estimate.fee)} (${Math.round(estimate.rate * 100)}%).`
      : t.cancelBookingConfirm;
    if (!window.confirm(message)) return;
    try {
      setNotice('');
      const cancelledBooking = await api.cancelBooking(id);
      const cancellationFee = Number(cancelledBooking?.cancellation_fee ?? estimate?.fee ?? 0);
      const refundAmount = Number(cancelledBooking?.refund_amount ?? 0);
      setNotice(`Booking cancelled. Cancellation fee: ${formatMoney(cancellationFee)}. Refund: ${formatMoney(refundAmount)}.`);
      await load();
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
          <p className="eyebrow">{t.bookingVault}</p>
          <h1>{t.myBookings}</h1>
          <p className="section-copy">{t.bookingsCopy}</p>
        </div>
        <div className="page-banner-stats">
          <article>
            <span>{t.allBookings}</span>
            <strong>{bookings.length}</strong>
          </article>
          <article>
            <span>{t.active}</span>
            <strong>{activeCount}</strong>
          </article>
          <article>
            <span>{t.paid}</span>
            <strong>{paidCount}</strong>
          </article>
        </div>
      </div>
      {error && <p className="alert">{error}</p>}
      {notice && <p className="success">{notice}</p>}
      {bookings.map((booking) => (
        <article className="booking-item" key={booking.booking_id}>
          <div className="booking-primary">
            <div className="flight-card-head">
              <div>
                <p className="eyebrow">{booking.flight_code}</p>
                <h2>
                  {booking.departure_code} {t.routeTo} {booking.arrival_code}
                </h2>
                <p className="flight-subtitle">{booking.airline_name || t.skyLinkPartner}</p>
              </div>
              <p className={`status ${booking.status}`}>{t.statusLabels[booking.status] || booking.status}</p>
            </div>
            <p className="section-copy">{t.bookingNumber.replace('{id}', booking.booking_id)}</p>
          </div>
          <dl>
            <div>
              <dt>
                <Plane size={15} /> {t.airline}
              </dt>
              <dd>{booking.airline_name || t.skyLinkPartner}</dd>
            </div>
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
              <dd>{t.statusLabels[booking.payment_status] || booking.payment_status}</dd>
            </div>
            <div>
              <dt>
                <CalendarClock size={15} /> {t.departureTime}
              </dt>
              <dd>{new Date(booking.departure_time).toLocaleString()}</dd>
            </div>
            {booking.status === 'cancelled' && (
              <div>
                <dt>{t.cancellationFee || 'Cancellation fee'}</dt>
                <dd>{formatMoney(booking.cancellation_fee || 0)}</dd>
              </div>
            )}
          </dl>
          <div className="row-actions">
            <button className="secondary" disabled={booking.status === 'cancelled'} onClick={() => setEditingBooking(booking)}>
              {t.edit}
            </button>
            {booking.payment_status !== 'paid' && (
              <Link className="button" to={`/payment/${booking.booking_id}`}>
                {t.pay}
              </Link>
            )}
            <button className="ghost" disabled={booking.status === 'cancelled'} onClick={() => cancel(booking.booking_id)}>
              {t.cancel}
            </button>
          </div>
        </article>
      ))}
      {!bookings.length && <p className="empty">{t.noBookingsYet}</p>}
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
