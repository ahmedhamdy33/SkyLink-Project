import { usePreferences } from '../context/PreferencesContext.jsx';

const CABIN_ORDER = ['First', 'Business', 'Premium Economy', 'Economy'];

function groupSeatsByCabin(seats = []) {
  const grouped = CABIN_ORDER.map((classType) => ({
    classType,
    seats: seats.filter((seat) => (seat.class_type || 'Economy') === classType)
  })).filter((section) => section.seats.length > 0);

  const knownCabins = new Set(CABIN_ORDER);
  const otherSeats = seats.filter((seat) => !knownCabins.has(seat.class_type || 'Economy'));
  if (otherSeats.length) {
    grouped.push({ classType: 'Economy', seats: otherSeats });
  }

  return grouped;
}

export default function SeatMap({ seats, selectedSeats, heldSeatNumbers = [], onToggle, activeClass }) {
  const { t } = usePreferences();
  const cabinSections = groupSeatsByCabin(seats);

  return (
    <div className="seat-map-shell">
      <div className="seat-map-head">
        <div>
          <p className="eyebrow">{t.seatMap}</p>
          <h3>{t.chooseCabinSeats}</h3>
        </div>
        <div className="seat-legend">
          <span><i className="seat-dot available" /> {t.available}</span>
          <span><i className="seat-dot selected" /> {t.selected}</span>
          <span><i className="seat-dot booked" /> {t.booked}</span>
        </div>
      </div>
      <div className="seat-map" aria-label={t.seatMap}>
        {cabinSections.map((section) => (
          <section className={`seat-cabin-section cabin-${section.classType.toLowerCase()}`} key={section.classType}>
            <div className="seat-cabin-head">
              <strong>{t.classTypes[section.classType] || section.classType}</strong>
              <span>{section.seats.length} {t.seats}</span>
            </div>
            <div className="seat-cabin-seats">
              {section.seats.map((seat) => {
                const selected = selectedSeats.includes(seat.seat_number);
                const heldByThisBooking = heldSeatNumbers.includes(seat.seat_number);
                const booked = (seat.status === 'booked' || seat.is_booked) && !heldByThisBooking;
                const wrongClass = activeClass && seat.class_type !== activeClass && !selected;
                return (
                  <button
                    type="button"
                    className={`seat ${selected ? 'selected' : ''} ${booked ? 'booked' : ''} ${heldByThisBooking && !selected ? 'held' : ''} ${wrongClass ? 'disabled' : ''} ${seat.class_type ? `seat-${seat.class_type.toLowerCase().replace(/\s+/g, '-')}` : ''}`}
                    key={seat.seat_id || seat.seat_number}
                    disabled={booked || wrongClass}
                    title={seat.class_type ? `${t.classTypes[seat.class_type] || seat.class_type} ${seat.seat_number}` : seat.seat_number}
                    onClick={() => onToggle(seat.seat_number)}
                  >
                    {seat.seat_number}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
