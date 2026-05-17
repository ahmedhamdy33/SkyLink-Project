export function generateSeatMap(totalSeats = 24, bookedSeats = []) {
  const seats = [];
  const rows = Math.ceil(totalSeats / 4);

  for (let row = 1; row <= rows; row += 1) {
    for (const letter of ['A', 'B', 'C', 'D']) {
      if (seats.length < totalSeats) {
        const seatNumber = `${row}${letter}`;
        seats.push({
          seat_id: seats.length + 1,
          seat_number: seatNumber,
          class_type: 'Economy',
          status: bookedSeats.includes(seatNumber) ? 'booked' : 'available'
        });
      }
    }
  }

  return seats;
}
