import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { calculatePassengerSubtotal, getTripMultiplier } from '../utils/pricing.js';
import { saveSeatSelectionDraft } from '../utils/seatSelectionDraft.js';

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
  const [error, setError] = useState('');

  const tripType = booking?.trip_type || booking?.tripType || initialTripType || 'oneWay';
  const subtotal = useMemo(() => calculatePassengerSubtotal(passengers, flight.price, tripType), [flight.price, passengers, tripType]);

  function setPassenger(index, key, value) {
    setPassengers((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  function continueToSeats(event) {
    event.preventDefault();
    setError('');

    if (!passengers.every((passenger) => passenger.fullName.trim() && passenger.passportNumber.trim())) {
      setError('Please complete all passenger details before continuing.');
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
              {flight.departure_code} to {flight.arrival_code}
            </p>
          </div>
          <button type="button" className="ghost" onClick={onClose}>
            Close
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
                    (_, index) => current[index] || { fullName: '', passportNumber: '', classType: initialClassType || 'Economy', seatNumber: '' }
                  )
                );
              }}
            />
          </label>
          <div className="mini-summary-card">
            <span>Estimated total</span>
            <strong>{formatMoney(subtotal)}</strong>
            <p>
              {flight.flight_code} | {flight.departure_code} to {flight.arrival_code} | {tripType === 'roundTrip' ? 'Round trip' : 'One way'}
            </p>
          </div>
        </div>

        <div className="passenger-list">
          {passengers.map((passenger, index) => (
            <div className="passenger-row" key={index}>
              <label>
                Full name
                <input required value={passenger.fullName} onChange={(event) => setPassenger(index, 'fullName', event.target.value)} />
              </label>
              <label>
                Passport
                <input required value={passenger.passportNumber} onChange={(event) => setPassenger(index, 'passportNumber', event.target.value)} />
              </label>
              <label>
                {t.class}
                <select value={passenger.classType} onChange={(event) => setPassenger(index, 'classType', event.target.value)}>
                  <option>Economy</option>
                  <option>Business</option>
                  <option>First</option>
                </select>
              </label>
            </div>
          ))}
        </div>

        <div className="price-strip">
          <span>Passengers: {passengers.length}</span>
          <span>Base fare: {formatMoney(flight.price)}</span>
          <span>Trip: x{getTripMultiplier(tripType)}</span>
          <strong>Estimated subtotal: {formatMoney(subtotal)}</strong>
        </div>

        <button>{booking ? 'Continue to seats' : 'Choose seats'}</button>
      </form>
    </div>
  );
}
