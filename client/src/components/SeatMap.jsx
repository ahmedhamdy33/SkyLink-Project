export default function SeatMap({ seats, selectedSeats, onToggle }) {
  return (
    <div className="seat-map-shell">
      <div className="seat-map-head">
        <div>
          <p className="eyebrow">Seat map</p>
          <h3>Choose your cabin seats</h3>
        </div>
        <div className="seat-legend">
          <span><i className="seat-dot available" /> Available</span>
          <span><i className="seat-dot selected" /> Selected</span>
          <span><i className="seat-dot booked" /> Booked</span>
        </div>
      </div>
      <div className="seat-map" aria-label="Seat map">
        {seats.map((seat) => {
          const selected = selectedSeats.includes(seat.seat_number);
          const booked = seat.status === 'booked';
          return (
            <button
              type="button"
              className={`seat ${selected ? 'selected' : ''} ${booked ? 'booked' : ''}`}
              key={seat.seat_id || seat.seat_number}
              disabled={booked}
              onClick={() => onToggle(seat.seat_number)}
            >
              {seat.seat_number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
