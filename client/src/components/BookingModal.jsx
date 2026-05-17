import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { calculatePassengerSubtotal, getTripMultiplier } from '../utils/pricing.js';
import { saveSeatSelectionDraft } from '../utils/seatSelectionDraft.js';

const CLASS_ORDER = ['First', 'Business', 'Premium Economy', 'Economy'];
const PASSPORT_PATTERN = /^[A-Z0-9]{9}$/;

function normalizePassport(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 9);
}

export default function BookingModal({ flight, booking = null, onClose, initialPassengers = 1, initialClassType = 'Economy', initialTripType = 'oneWay' }) {
  const { user } = useAuth();
  const { t, formatMoney } = usePreferences();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState(() =>
    booking?.passengers?.length
      ? booking.passengers.map((passenger) => ({
          fullName: passenger.full_name || passenger.fullName || '',
          passportNumber: passenger.passport_number || passenger.passportNumber || '',
          classType: passenger.class_type || passenger.classType || initialClassType || 'Economy',
          seatNumber: passenger.seat_number || passenger.seatNumber || ''
        }))
      : Array.from({ length: Math.max(1, Number(initialPassengers) || 1) }, (_, index) => ({
          fullName: index === 0 ? user?.full_name || '' : '',
          passportNumber: '',
          classType: initialClassType || 'Economy',
          seatNumber: ''
        }))
  );
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState('');

  const tripType = booking?.trip_type || booking?.tripType || initialTripType || 'oneWay';
  const bookingClassCounts = useMemo(
    () =>
      (booking?.passengers || []).reduce((counts, passenger) => {
        const classType = passenger.class_type || passenger.classType || 'Economy';
        counts[classType] = (counts[classType] || 0) + 1;
        return counts;
      }, {}),
    [booking]
  );
  const classes = useMemo(() => {
    const rawClasses =
      availability?.classes ||
      CLASS_ORDER.map((classType) => ({
        class_type: classType,
        total_seats: classType === 'Economy' ? Number(flight.available_seats || flight.total_seats || 0) : 0,
        available_seats: classType === 'Economy' ? Number(flight.available_seats || flight.total_seats || 0) : 0,
        is_available: classType === 'Economy'
      }));

    return rawClasses.map((item) => {
      const heldSeats = bookingClassCounts[item.class_type] || 0;
      return heldSeats
        ? {
            ...item,
            available_seats: Number(item.available_seats || 0) + heldSeats,
            is_available: Number(item.total_seats || 0) > 0
          }
        : item;
    });
  }, [availability, bookingClassCounts, flight.available_seats, flight.total_seats]);
  const firstAvailableClass = classes.find((item) => item.is_available)?.class_type || 'Economy';
  const subtotal = useMemo(() => calculatePassengerSubtotal(passengers, flight.price, tripType), [flight.price, passengers, tripType]);

  useEffect(() => {
    if (!flight?.flight_id) return;
    api.getFlightAvailability(flight.flight_id).then(setAvailability).catch(() => setAvailability(null));
  }, [flight?.flight_id]);

  useEffect(() => {
    if (!availability) return;
    setPassengers((current) =>
      current.map((passenger) => {
        const classInfo = classes.find((item) => item.class_type === passenger.classType);
        return classInfo?.is_available ? passenger : { ...passenger, classType: firstAvailableClass };
      })
    );
  }, [availability, classes, firstAvailableClass]);

  function setPassenger(index, key, value) {
    setPassengers((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  function continueToSeats(event) {
    event.preventDefault();
    setError('');

    if (!passengers.every((passenger) => passenger.fullName.trim() && passenger.passportNumber.trim())) {
      setError(t.passengerDetailsError);
      return;
    }

    if (!passengers.every((passenger) => PASSPORT_PATTERN.test(passenger.passportNumber))) {
      setError(t.passportLengthError || 'Passport number must be exactly 9 letters or numbers.');
      return;
    }

    if (!passengers.every((passenger) => classes.find((item) => item.class_type === passenger.classType)?.is_available)) {
      setError('Choose an available cabin class for every passenger.');
      return;
    }

    const draft = {
      flight,
      bookingId: booking?.booking_id || null,
      passengers,
      userId: user.user_id,
      tripType
    };

    saveSeatSelectionDraft(draft);
    onClose();
    navigate('/seat-selection');
  }

  return (
    <div className="modal-backdrop">
      <form className="booking-modal" onSubmit={continueToSeats}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">SkyLink</p>
            <h2>{booking ? t.edit : flight.flight_code}</h2>
            <p>
              {flight.departure_code} {t.routeTo} {flight.arrival_code}
            </p>
          </div>
          <button type="button" className="ghost" onClick={onClose}>
            {t.close}
          </button>
        </div>

        {error && <p className="alert">{error}</p>}

        <div className="modal-highlight-row">
          <label>
            {t.passengers}
            <input
              type="number"
              min="1"
              max="6"
              value={passengers.length}
              onChange={(event) => {
                const count = Number(event.target.value);
                setPassengers((current) =>
                  Array.from(
                    { length: count },
                    (_, index) => current[index] || { fullName: '', passportNumber: '', classType: firstAvailableClass, seatNumber: '' }
                  )
                );
              }}
            />
          </label>
          <div className="mini-summary-card">
            <span>{t.estimatedTotal}</span>
            <strong>{formatMoney(subtotal)}</strong>
            <p>
              {flight.flight_code} | {flight.departure_code} {t.routeTo} {flight.arrival_code} | {tripType === 'roundTrip' ? t.roundTrip : t.oneWay}
            </p>
          </div>
        </div>

        <div className="class-availability-strip">
          <strong>Aircraft: {availability?.aircraft?.model || flight.aircraft_model || flight.model}</strong>
          <span>Type: {availability?.aircraft?.aircraft_type || flight.aircraft_type || 'Aircraft'}</span>
          <div>
            {classes.map((item) => (
              <span className={item.is_available ? 'class-pill available' : 'class-pill disabled'} key={item.class_type}>
                {t.classTypes[item.class_type] || item.class_type}: {item.total_seats <= 0 ? 'Not available on this aircraft' : item.available_seats > 0 ? `${item.available_seats} available` : 'Fully booked'}
              </span>
            ))}
          </div>
        </div>

        <div className="passenger-list">
          {passengers.map((passenger, index) => (
            <div className="passenger-row" key={index}>
              <label>
                {t.fullName}
                <input required value={passenger.fullName} onChange={(event) => setPassenger(index, 'fullName', event.target.value)} />
              </label>
              <label>
                {t.passport}
                <input
                  required
                  minLength="9"
                  maxLength="9"
                  pattern="[A-Za-z0-9]{9}"
                  title={t.passportLengthError || 'Passport number must be exactly 9 letters or numbers.'}
                  value={passenger.passportNumber}
                  onChange={(event) => setPassenger(index, 'passportNumber', normalizePassport(event.target.value))}
                />
              </label>
              <label>
                {t.class}
                <select value={passenger.classType} onChange={(event) => setPassenger(index, 'classType', event.target.value)}>
                  {classes.map((item) => (
                    <option disabled={!item.is_available} key={item.class_type} value={item.class_type}>
                      {t.classTypes[item.class_type] || item.class_type}
                      {!item.is_available ? ` - ${item.total_seats <= 0 ? 'Not available' : 'Fully booked'}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>

        <div className="price-strip">
          <span>{t.passengers}: {passengers.length}</span>
          <span>{t.baseFare}: {formatMoney(flight.price)}</span>
          <span>{t.trip}: x{getTripMultiplier(tripType)}</span>
          <strong>{t.estimatedSubtotal}: {formatMoney(subtotal)}</strong>
        </div>

        <button>{booking ? t.continueToSeats : t.chooseSeats}</button>
      </form>
    </div>
  );
}
