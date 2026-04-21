# SkyLink Database ERD and Mapping

SkyLink stores users, airlines, airports, aircraft, flights, seats, bookings, passengers, payments, currencies, and notifications in SQL Server.

## Main Relationships

- `Users` create many `Bookings`.
- `Airlines` own many `Aircraft` and `Flights`.
- `Aircraft` define available `Seats`.
- `Flights` connect one departure `Airport` to one arrival `Airport`.
- `Bookings` belong to one `User` and one `Flight`.
- `BookingPassengers` belong to one `Booking`.
- `Payments` belong to one `Booking`.

## API Mapping

- `/api/auth` maps to `Users`.
- `/api/meta/reference-data` maps to `Airports`, `Airlines`, `Aircraft`, `Currencies`, and `Notifications`.
- `/api/flights` maps to `Flights` plus airport, airline, and aircraft lookup data.
- `/api/bookings` maps to `Bookings` and `BookingPassengers`.
- `/api/payments` maps to `Payments`.
- `/api/users/analytics` aggregates `Users`, `Bookings`, and passenger classes.
