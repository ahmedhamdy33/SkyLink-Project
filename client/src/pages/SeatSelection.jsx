import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import SeatMap from '../components/SeatMap.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { calculatePassengerSubtotal } from '../utils/pricing.js';
import { clearSeatSelectionDraft, readSeatSelectionDraft } from '../utils/seatSelectionDraft.js';

export default function SeatSelection() {
  const navigate = useNavigate();
  const { formatMoney } = usePreferences();
  const [draft, setDraft] = useState(() => readSeatSelectionDraft());
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(() => {
    const nextDraft = readSeatSelectionDraft();
    return (nextDraft?.bookingPassengers || nextDraft?.passengers || [])
      .map((passenger) => passenger.seat_number || passenger.seatNumber)
      .filter(Boolean);
  });
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!draft?.flight?.flight_id) return;
    api.getFlightSeats(draft.flight.flight_id).then(setSeats).catch(() => setSeats([]));
  }, [draft]);

  const subtotal = useMemo(() => {
    if (!draft) return 0;
    return calculatePassengerSubtotal(draft.passengers, draft.flight.price, draft.tripType || 'oneWay');
  }, [draft]);

  const total = Math.max(0, subtotal - Number(discount?.amount || 0));

  function toggleSeat(number) {
    if (!draft) return;
    setSelectedSeats((current) =>
      current.includes(number) ? current.filter((seat) => seat !== number) : current.length < draft.passengers.length ? [...current, number] : current
    );
  }

  async function applyDiscount() {
    if (!draft) return;
    setError('');
    setNotice('');
    try {
      const applied = await api.applyDiscount({
        code: discountCode,
        amount: subtotal,
        flightId: draft.flight.flight_id
      });
      setDiscount(applied);
      setNotice(`Discount code ${applied.code} applied successfully.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmBooking() {
    if (!draft) return;
    setError('');

    if (selectedSeats.length !== draft.passengers.length) {
      setError('Please choose one seat for each passenger before confirming.');
      return;
    }

    const payload = {
      flightId: draft.flight.flight_id,
      userId: draft.userId,
      passengers: draft.passengers,
      seats: selectedSeats,
      discountCode: discount?.code || null,
      totalAmount: total,
      tripType: draft.tripType || 'oneWay'
    };

    try {
      const savedBooking = draft.bookingId
        ? await api.updateBooking(draft.bookingId, payload)
        : await api.createBooking(payload);

      clearSeatSelectionDraft();
      setDraft(null);
      navigate(draft.bookingId ? '/bookings' : `/payment/${savedBooking.booking_id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!draft) {
    return (
      <section className="content-section page-top seat-selection-page">
        <div className="page-banner">
          <div>
            <p className="eyebrow">Seat selection</p>
            <h1>No booking draft found</h1>
            <p className="section-copy">Start a booking first, fill in the passenger details, then SkyLink will bring you here to choose seats.</p>
          </div>
        </div>
        <p className="empty">
          Go back to the <Link to="/flights">Flights page</Link> and start a new booking.
        </p>
      </section>
    );
  }

  return (
    <section className="content-section page-top seat-selection-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">Seat selection</p>
          <h1>Choose seats for {draft.flight.flight_code}</h1>
          <p className="section-copy">
            {draft.flight.departure_code} to {draft.flight.arrival_code} | {draft.passengers.length} passenger{draft.passengers.length > 1 ? 's' : ''}
            {' | '}
            {draft.tripType === 'roundTrip' ? 'Round trip' : 'One way'}
          </p>
        </div>
        <div className="page-banner-card">
          <span>Cabin summary</span>
          <strong>{formatMoney(total)}</strong>
          <p>{discount ? 'Discount applied' : 'Final total before payment'}</p>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {notice && <p className="success">{notice}</p>}

      <div className="seat-selection-layout">
        <div className="chart-panel">
          <SeatMap seats={seats} selectedSeats={selectedSeats} onToggle={toggleSeat} />
        </div>

        <div className="seat-selection-sidebar">
          <article className="admin-form">
            <div>
              <p className="eyebrow">Passengers</p>
              <h2>Traveler details</h2>
            </div>
            <div className="seat-passenger-list">
              {draft.passengers.map((passenger, index) => (
                <div className="seat-passenger-item" key={`${passenger.passportNumber}-${index}`}>
                  <strong>{passenger.fullName}</strong>
                  <span>{passenger.classType}</span>
                  <p>{selectedSeats[index] ? `Seat ${selectedSeats[index]}` : 'Seat not selected yet'}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-form">
            <div>
              <p className="eyebrow">Discount</p>
              <h2>Apply code</h2>
            </div>
            <div className="apply-code-row">
              <input placeholder="Discount code" value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} />
              <button type="button" className="secondary" onClick={applyDiscount}>
                Apply
              </button>
            </div>
            <div className="price-strip">
              <span>Subtotal: {formatMoney(subtotal)}</span>
              <span>Discount: {formatMoney(discount?.amount || 0)}</span>
              <strong>Total: {formatMoney(total)}</strong>
            </div>
            <div className="row-actions">
              <button type="button" onClick={confirmBooking}>
                {draft.bookingId ? 'Save booking' : 'Confirm booking'}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  navigate(-1);
                }}
              >
                Back
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
