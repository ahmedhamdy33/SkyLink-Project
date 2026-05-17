# SkyLink Database ERD and Mapping

SkyLink stores users, airlines, airports, aircraft, flights, seats, bookings, passengers, payments, currencies, and notifications in SQL Server.

## Main Relationships

- `Users` create many `Bookings`.
- `Countries` contain many `Airports` and many `Airlines`.
- `Airlines` own many `Aircraft` and `Flights`.
- `Aircraft` define available `Seats`.
- `Flights` connect one departure `Airport` to one arrival `Airport`.
- `Bookings` belong to one `User` and one `Flight`.
- `BookingPassengers` belong to one `Booking`.
- `Payments` belong to one `Booking`.

## Normalization Notes

- Country names are stored once in `Countries`.
- `Airports.country_id` and `Airlines.country_id` keep the relationship to `Countries`.
- Display-friendly country names are exposed through `vAirportDirectory` and `vAirlineDirectory`.

## Views and Database Programming

- `vAirportDirectory` joins `Airports` to `Countries`.
- `vAirlineDirectory` joins `Airlines` to `Countries`.
- `vFlightSchedule` joins `Flights`, airports, airlines, and aircraft into a reusable flight listing.
- `vBookingDetails` joins bookings to users and flight schedule data for reports.

## API Mapping

- `/api/auth` maps to `Users`.
- `/api/meta/reference-data` maps to `vAirportDirectory`, `vAirlineDirectory`, `Aircraft`, `Currencies`, and `Notifications`.
- `/api/flights` maps to `vFlightSchedule`.
- `/api/bookings` maps to `Bookings` and `BookingPassengers`.
- `/api/payments` maps to `Payments`.
- `/api/users/analytics` aggregates `Users`, `Bookings`, and passenger classes.
