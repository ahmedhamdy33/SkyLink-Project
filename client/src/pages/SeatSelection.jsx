import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import SeatMap from '../components/SeatMap.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { calculatePassengerSubtotal } from '../utils/pricing.js';
import { clearSeatSelectionDraft, readSeatSelectionDraft } from '../utils/seatSelectionDraft.js';

export default function SeatSelection() {
  const navigate = useNavigate();
  const { formatMoney, t } = usePreferences();
  const [draft, setDraft] = useState(() => readSeatSelectionDraft());
  const [seats, setSeats] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(() => {
    const nextDraft = readSeatSelectionDraft();
    const draftPassengers = nextDraft?.bookingPassengers || nextDraft?.passengers || [];
    return draftPassengers.map((passenger) => passenger.seat_number || passenger.seatNumber || '');
  });
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!draft?.flight?.flight_id) return;
    Promise.all([
      api.getFlightSeatMap(draft.flight.flight_id).catch(() => api.getFlightSeats(draft.flight.flight_id)),
      api.getFlightAvailability(draft.flight.flight_id).catch(() => null)
    ])
      .then(([seatMap, classAvailability]) => {
        setSeats(seatMap || []);
        setAvailability(classAvailability);
      })
      .catch(() => {
        setSeats([]);
        setAvailability(null);
      });
  }, [draft]);

  const subtotal = useMemo(() => {
    if (!draft) return 0;
    return calculatePassengerSubtotal(draft.passengers, draft.flight.price, draft.tripType || 'oneWay');
  }, [draft]);

  const total = Math.max(0, subtotal - Number(discount?.amount || 0));
  const heldSeatNumbers = useMemo(
    () =>
      draft?.bookingId
        ? (draft.passengers || [])
            .map((passenger) => passenger.seat_number || passenger.seatNumber)
            .filter(Boolean)
        : [],
    [draft]
  );
  const activeClass = draft?.passengers?.[activePassengerIndex]?.classType || 'Economy';

  function toggleSeat(number) {
    if (!draft) return;
    const seat = seats.find((item) => item.seat_number === number);
    const heldByThisBooking = heldSeatNumbers.includes(number);
    if (!seat || ((seat.is_booked || seat.status === 'booked') && !heldByThisBooking)) return;
    setError('');

    const existingIndex = selectedSeats.indexOf(number);
    if (existingIndex >= 0) {
      setActivePassengerIndex(existingIndex);
      setSelectedSeats((current) => current.map((seatNumber, index) => (index === existingIndex ? '' : seatNumber)));
      return;
    }

    setSelectedSeats((current) => {
      const nextPassenger = draft.passengers[activePassengerIndex];
      if (nextPassenger?.classType && seat?.class_type && nextPassenger.classType !== seat.class_type) {
        setError(`${nextPassenger.fullName} needs a ${t.classTypes[nextPassenger.classType] || nextPassenger.classType} seat.`);
        return current;
      }

      const nextSeats = Array.from({ length: draft.passengers.length }, (_, index) => current[index] || '');
      nextSeats[activePassengerIndex] = number;
      const nextEmptyIndex = nextSeats.findIndex((seatNumber) => !seatNumber);
      if (nextEmptyIndex >= 0) setActivePassengerIndex(nextEmptyIndex);
      return nextSeats;
    });
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
      setNotice(t.discountApplied.replace('{code}', applied.code));
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmBooking() {
    if (!draft) return;
    setError('');

    if (selectedSeats.filter(Boolean).length !== draft.passengers.length) {
      setError(t.seatSelectionError);
      return;
    }

    const seatIds = selectedSeats.map((seatNumber) => seats.find((seat) => seat.seat_number === seatNumber)?.seat_id).filter(Boolean);
    if (seatIds.length !== draft.passengers.length) {
      setError(t.seatSelectionError);
      return;
    }

    const payload = {
      flightId: draft.flight.flight_id,
      userId: draft.userId,
      passengers: draft.passengers,
      seats: selectedSeats,
      seatIds,
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
      navigate(draft.bookingId ? '/bookings' : `/payment/${savedBooking.booking_id}`, {
        state: draft.bookingId
          ? null
          : {
              celebrateBooking: true,
              flightCode: draft.flight.flight_code
            }
      });
    } catch (err) {
      setError(err.message);
    }
  }

  if (!draft) {
    return (
      <section className="content-section page-top seat-selection-page">
        <div className="page-banner">
          <div>
            <p className="eyebrow">{t.seatSelection}</p>
            <h1>{t.noDraftTitle}</h1>
            <p className="section-copy">{t.noDraftCopy}</p>
          </div>
        </div>
        <p className="empty">
          <Link to="/flights">{t.backToFlightsDraft}</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="content-section page-top seat-selection-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">{t.seatSelection}</p>
          <h1>{t.chooseSeatsFor.replace('{flightCode}', draft.flight.flight_code)}</h1>
          <p className="section-copy">
            {draft.flight.departure_code} {t.routeTo} {draft.flight.arrival_code} | {draft.passengers.length} {t.passengersLabel}
            {' | '}
            {draft.tripType === 'roundTrip' ? t.roundTrip : t.oneWay}
          </p>
          <p className="section-copy">
            Aircraft: {availability?.aircraft?.model || draft.flight.aircraft_model || draft.flight.model} | Type:{' '}
            {availability?.aircraft?.aircraft_type || draft.flight.aircraft_type || 'Aircraft'}
          </p>
        </div>
        <div className="page-banner-card">
          <span>{t.cabinSummary}</span>
          <strong>{formatMoney(total)}</strong>
          <p>{discount ? t.discountAppliedShort : t.finalTotalBeforePayment}</p>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {notice && <p className="success">{notice}</p>}

      <section className="seat-top-actions admin-form">
        <div>
          <p className="eyebrow">{t.discount}</p>
          <h2>{t.bookNow}</h2>
        </div>
        <div className="apply-code-row">
          <input placeholder={t.discountCode} value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} />
          <button type="button" className="secondary" onClick={applyDiscount}>
            {t.apply}
          </button>
        </div>
        <div className="price-strip">
          <span>{t.subtotal}: {formatMoney(subtotal)}</span>
          <span>{t.discount}: {formatMoney(discount?.amount || 0)}</span>
          <strong>{t.total}: {formatMoney(total)}</strong>
        </div>
        <div className="row-actions">
          <button type="button" onClick={confirmBooking}>
            {draft.bookingId ? t.saveBooking : t.bookNow}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              navigate(-1);
            }}
          >
            {t.back}
          </button>
        </div>
      </section>

      <div className="seat-selection-layout">
        <div className="chart-panel">
          {availability?.classes && (
            <div className="class-availability-strip compact">
              {availability.classes.map((item) => (
                <span className={item.is_available ? 'class-pill available' : 'class-pill disabled'} key={item.class_type}>
                  {t.classTypes[item.class_type] || item.class_type}: {item.total_seats <= 0 ? 'Not available' : item.available_seats > 0 ? `${item.available_seats} available` : 'Fully booked'}
                </span>
              ))}
            </div>
          )}
          <SeatMap
            seats={seats}
            selectedSeats={selectedSeats}
            heldSeatNumbers={heldSeatNumbers}
            activeClass={activeClass}
            onToggle={toggleSeat}
          />
        </div>

        <div className="seat-selection-sidebar">
          <article className="admin-form">
            <div>
              <p className="eyebrow">{t.passengers}</p>
              <h2>{t.travelerDetails}</h2>
            </div>
            <div className="seat-passenger-list">
              {draft.passengers.map((passenger, index) => (
                <button
                  type="button"
                  className={`seat-passenger-item ${activePassengerIndex === index ? 'active' : ''}`}
                  key={`${passenger.passportNumber}-${index}`}
                  onClick={() => setActivePassengerIndex(index)}
                >
                  <strong>{passenger.fullName}</strong>
                  <span>{t.classTypes[passenger.classType] || passenger.classType}</span>
                  <p>{selectedSeats[index] ? `${t.seat} ${selectedSeats[index]}` : t.seatNotSelected}</p>
                </button>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
