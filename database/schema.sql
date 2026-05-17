IF DB_ID(N'SkyLink') IS NULL
BEGIN
    CREATE DATABASE SkyLink;
END;
GO

USE SkyLink;
GO

IF OBJECT_ID(N'dbo.vBookingDetails', N'V') IS NOT NULL DROP VIEW dbo.vBookingDetails;
IF OBJECT_ID(N'dbo.vFlightSchedule', N'V') IS NOT NULL DROP VIEW dbo.vFlightSchedule;
IF OBJECT_ID(N'dbo.vAirlineDirectory', N'V') IS NOT NULL DROP VIEW dbo.vAirlineDirectory;
IF OBJECT_ID(N'dbo.vAirportDirectory', N'V') IS NOT NULL DROP VIEW dbo.vAirportDirectory;
IF OBJECT_ID(N'dbo.sp_GetUserBookingHistory', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetUserBookingHistory;
IF OBJECT_ID(N'dbo.trg_BookingPassengers_NoDuplicateSeatPerFlight', N'TR') IS NOT NULL DROP TRIGGER dbo.trg_BookingPassengers_NoDuplicateSeatPerFlight;
GO

IF OBJECT_ID(N'dbo.Payments', N'U') IS NOT NULL DROP TABLE dbo.Payments;
IF OBJECT_ID(N'dbo.FlightSeatBookings', N'U') IS NOT NULL DROP TABLE dbo.FlightSeatBookings;
IF OBJECT_ID(N'dbo.BookingPassengers', N'U') IS NOT NULL DROP TABLE dbo.BookingPassengers;
IF OBJECT_ID(N'dbo.Bookings', N'U') IS NOT NULL DROP TABLE dbo.Bookings;
IF OBJECT_ID(N'dbo.Seats', N'U') IS NOT NULL DROP TABLE dbo.Seats;
IF OBJECT_ID(N'dbo.Flight_Transit_Stops', N'U') IS NOT NULL DROP TABLE dbo.Flight_Transit_Stops;
IF OBJECT_ID(N'dbo.Flights', N'U') IS NOT NULL DROP TABLE dbo.Flights;
IF OBJECT_ID(N'dbo.Aircraft', N'U') IS NOT NULL DROP TABLE dbo.Aircraft;
IF OBJECT_ID(N'dbo.Airlines', N'U') IS NOT NULL DROP TABLE dbo.Airlines;
IF OBJECT_ID(N'dbo.FlightSearchHistory', N'U') IS NOT NULL DROP TABLE dbo.FlightSearchHistory;
IF OBJECT_ID(N'dbo.Airports', N'U') IS NOT NULL DROP TABLE dbo.Airports;
IF OBJECT_ID(N'dbo.Discounts', N'U') IS NOT NULL DROP TABLE dbo.Discounts;
IF OBJECT_ID(N'dbo.Notifications', N'U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID(N'dbo.Currencies', N'U') IS NOT NULL DROP TABLE dbo.Currencies;
IF OBJECT_ID(N'dbo.Countries', N'U') IS NOT NULL DROP TABLE dbo.Countries;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Countries (
    country_id INT IDENTITY(1,1) PRIMARY KEY,
    country_name NVARCHAR(100) NOT NULL UNIQUE,
    country_code NVARCHAR(10) NOT NULL UNIQUE
);
GO

CREATE TABLE dbo.Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(120) NOT NULL,
    email NVARCHAR(180) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    phone NVARCHAR(40) NULL,
    nationality NVARCHAR(80) NULL,
    role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT N'customer',
    email_verification_token_hash NVARCHAR(255) NULL,
    email_verification_sent_at DATETIME2 NULL,
    email_verified_at DATETIME2 NULL,
    password_reset_token_hash NVARCHAR(255) NULL,
    password_reset_sent_at DATETIME2 NULL,
    password_reset_expires_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Users_Role CHECK (role IN (N'admin', N'customer'))
);
GO

CREATE TABLE dbo.Currencies (
    currency_code NVARCHAR(10) PRIMARY KEY,
    currency_name NVARCHAR(80) NOT NULL,
    symbol NVARCHAR(10) NOT NULL,
    rate_to_usd DECIMAL(12,4) NOT NULL,
    CONSTRAINT CK_Currencies_Rate CHECK (rate_to_usd > 0)
);
GO

CREATE TABLE dbo.Airlines (
    airline_id INT IDENTITY(1,1) PRIMARY KEY,
    airline_name NVARCHAR(120) NOT NULL UNIQUE,
    country_id INT NOT NULL,
    CONSTRAINT FK_Airlines_Countries FOREIGN KEY (country_id) REFERENCES dbo.Countries(country_id)
);
GO

CREATE TABLE dbo.Airports (
    airport_id INT IDENTITY(1,1) PRIMARY KEY,
    airport_code NVARCHAR(10) NOT NULL UNIQUE,
    airport_name NVARCHAR(160) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    country_id INT NOT NULL,
    image_url NVARCHAR(500) NULL,
    CONSTRAINT FK_Airports_Countries FOREIGN KEY (country_id) REFERENCES dbo.Countries(country_id)
);
GO

CREATE TABLE dbo.Aircraft (
    aircraft_id INT IDENTITY(1,1) PRIMARY KEY,
    airline_id INT NOT NULL,
    model NVARCHAR(120) NOT NULL,
    aircraft_type NVARCHAR(30) NOT NULL,
    total_seats INT NOT NULL,
    first_seats INT NOT NULL CONSTRAINT DF_Aircraft_FirstSeats DEFAULT 0,
    business_seats INT NOT NULL CONSTRAINT DF_Aircraft_BusinessSeats DEFAULT 0,
    premium_economy_seats INT NOT NULL CONSTRAINT DF_Aircraft_PremiumEconomySeats DEFAULT 0,
    economy_seats INT NOT NULL CONSTRAINT DF_Aircraft_EconomySeats DEFAULT 0,
    CONSTRAINT FK_Aircraft_Airlines FOREIGN KEY (airline_id) REFERENCES dbo.Airlines(airline_id),
    CONSTRAINT CK_Aircraft_Type CHECK (aircraft_type IN (N'Narrow-Body', N'Wide-Body', N'Regional')),
    CONSTRAINT CK_Aircraft_TotalSeats CHECK (total_seats > 0),
    CONSTRAINT CK_Aircraft_CabinSeats CHECK (
        first_seats >= 0
        AND business_seats >= 0
        AND premium_economy_seats >= 0
        AND economy_seats >= 0
        AND first_seats + business_seats + premium_economy_seats + economy_seats = total_seats
    )
);
GO

CREATE TABLE dbo.Flights (
    flight_id INT IDENTITY(1,1) PRIMARY KEY,
    flight_code NVARCHAR(20) NOT NULL UNIQUE,
    airline_id INT NOT NULL,
    aircraft_id INT NOT NULL,
    departure_airport_id INT NOT NULL,
    arrival_airport_id INT NOT NULL,
    departure_time DATETIME2 NOT NULL,
    arrival_time DATETIME2 NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_seats INT NOT NULL,
    first_seats INT NOT NULL CONSTRAINT DF_Flights_FirstSeats DEFAULT 0,
    business_seats INT NOT NULL CONSTRAINT DF_Flights_BusinessSeats DEFAULT 0,
    premium_economy_seats INT NOT NULL CONSTRAINT DF_Flights_PremiumEconomySeats DEFAULT 0,
    economy_seats INT NOT NULL CONSTRAINT DF_Flights_EconomySeats DEFAULT 0,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_Flights_Status DEFAULT N'active',
    discount_value DECIMAL(10,2) NULL,
    discount_type NVARCHAR(20) NULL,
    discount_code NVARCHAR(40) NULL,
    is_direct BIT NOT NULL CONSTRAINT DF_Flights_IsDirect DEFAULT 1,
    transit_count INT NOT NULL CONSTRAINT DF_Flights_TransitCount DEFAULT 0,
    total_duration INT NOT NULL CONSTRAINT DF_Flights_TotalDuration DEFAULT 0,
    CONSTRAINT FK_Flights_Airlines FOREIGN KEY (airline_id) REFERENCES dbo.Airlines(airline_id),
    CONSTRAINT FK_Flights_Aircraft FOREIGN KEY (aircraft_id) REFERENCES dbo.Aircraft(aircraft_id),
    CONSTRAINT FK_Flights_DepartureAirport FOREIGN KEY (departure_airport_id) REFERENCES dbo.Airports(airport_id),
    CONSTRAINT FK_Flights_ArrivalAirport FOREIGN KEY (arrival_airport_id) REFERENCES dbo.Airports(airport_id),
    CONSTRAINT CK_Flights_DifferentAirports CHECK (departure_airport_id <> arrival_airport_id),
    CONSTRAINT CK_Flights_Time CHECK (arrival_time > departure_time),
    CONSTRAINT CK_Flights_Price CHECK (price >= 0),
    CONSTRAINT CK_Flights_AvailableSeats CHECK (available_seats >= 0),
    CONSTRAINT CK_Flights_CabinSeats CHECK (first_seats >= 0 AND business_seats >= 0 AND premium_economy_seats >= 0 AND economy_seats >= 0),
    CONSTRAINT CK_Flights_TransitCount CHECK (transit_count >= 0),
    CONSTRAINT CK_Flights_TotalDuration CHECK (total_duration >= 0),
    CONSTRAINT CK_Flights_DirectTransit CHECK (
        (is_direct = 1 AND transit_count = 0)
        OR (is_direct = 0 AND transit_count > 0)
    ),
    CONSTRAINT CK_Flights_Status CHECK (status IN (N'active', N'delayed', N'cancelled')),
    CONSTRAINT CK_Flights_DiscountType CHECK (discount_type IS NULL OR discount_type IN (N'fixed', N'percentage'))
);
GO

CREATE TABLE dbo.Flight_Transit_Stops (
    transit_id INT IDENTITY(1,1) PRIMARY KEY,
    flight_id INT NOT NULL,
    airport_code NVARCHAR(10) NOT NULL,
    airport_name NVARCHAR(160) NOT NULL,
    arrival_time DATETIME2 NOT NULL,
    departure_time DATETIME2 NOT NULL,
    layover_minutes INT NOT NULL,
    stop_order INT NOT NULL,
    CONSTRAINT FK_FlightTransitStops_Flights FOREIGN KEY (flight_id) REFERENCES dbo.Flights(flight_id) ON DELETE CASCADE,
    CONSTRAINT UQ_FlightTransitStops_Order UNIQUE (flight_id, stop_order),
    CONSTRAINT CK_FlightTransitStops_Time CHECK (departure_time > arrival_time),
    CONSTRAINT CK_FlightTransitStops_Layover CHECK (layover_minutes BETWEEN 45 AND 720),
    CONSTRAINT CK_FlightTransitStops_Order CHECK (stop_order > 0)
);
GO

CREATE TABLE dbo.Seats (
    seat_id INT IDENTITY(1,1) PRIMARY KEY,
    aircraft_id INT NOT NULL,
    seat_number NVARCHAR(10) NOT NULL,
    class_type NVARCHAR(30) NOT NULL CONSTRAINT DF_Seats_Class DEFAULT N'Economy',
    row_number INT NOT NULL,
    seat_letter NVARCHAR(2) NOT NULL,
    deck_number INT NULL,
    is_window BIT NOT NULL CONSTRAINT DF_Seats_IsWindow DEFAULT 0,
    is_aisle BIT NOT NULL CONSTRAINT DF_Seats_IsAisle DEFAULT 0,
    CONSTRAINT FK_Seats_Aircraft FOREIGN KEY (aircraft_id) REFERENCES dbo.Aircraft(aircraft_id),
    CONSTRAINT UQ_Seats_AircraftSeat UNIQUE (aircraft_id, seat_number),
    CONSTRAINT CK_Seats_Class CHECK (class_type IN (N'Economy', N'Premium Economy', N'Business', N'First')),
    CONSTRAINT CK_Seats_Position CHECK (row_number > 0 AND (deck_number IS NULL OR deck_number IN (1, 2)))
);
GO

CREATE TABLE dbo.Bookings (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_Bookings_Status DEFAULT N'confirmed',
    payment_status NVARCHAR(20) NOT NULL CONSTRAINT DF_Bookings_PaymentStatus DEFAULT N'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    passenger_count INT NOT NULL,
    cancelled_at DATETIME2 NULL,
    cancellation_fee DECIMAL(10,2) NOT NULL CONSTRAINT DF_Bookings_CancellationFee DEFAULT 0,
    cancellation_rate DECIMAL(5,4) NOT NULL CONSTRAINT DF_Bookings_CancellationRate DEFAULT 0,
    refund_amount DECIMAL(10,2) NOT NULL CONSTRAINT DF_Bookings_RefundAmount DEFAULT 0,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_Bookings_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Bookings_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id),
    CONSTRAINT FK_Bookings_Flights FOREIGN KEY (flight_id) REFERENCES dbo.Flights(flight_id),
    CONSTRAINT CK_Bookings_Status CHECK (status IN (N'pending', N'confirmed', N'cancelled')),
    CONSTRAINT CK_Bookings_PaymentStatus CHECK (payment_status IN (N'pending', N'paid', N'failed', N'refunded')),
    CONSTRAINT CK_Bookings_Total CHECK (total_amount >= 0),
    CONSTRAINT CK_Bookings_CancellationFee CHECK (cancellation_fee >= 0),
    CONSTRAINT CK_Bookings_CancellationRate CHECK (cancellation_rate BETWEEN 0 AND 1),
    CONSTRAINT CK_Bookings_RefundAmount CHECK (refund_amount >= 0),
    CONSTRAINT CK_Bookings_Passengers CHECK (passenger_count > 0)
);
GO

CREATE TABLE dbo.BookingPassengers (
    passenger_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    full_name NVARCHAR(120) NOT NULL,
    passport_number NVARCHAR(60) NOT NULL,
    class_type NVARCHAR(30) NOT NULL,
    seat_id INT NULL,
    seat_number NVARCHAR(10) NULL,
    CONSTRAINT FK_BookingPassengers_Bookings FOREIGN KEY (booking_id) REFERENCES dbo.Bookings(booking_id),
    CONSTRAINT FK_BookingPassengers_Seats FOREIGN KEY (seat_id) REFERENCES dbo.Seats(seat_id),
    CONSTRAINT CK_BookingPassengers_Class CHECK (class_type IN (N'Economy', N'Premium Economy', N'Business', N'First')),
    CONSTRAINT CK_BookingPassengers_Passport CHECK (LEN(passport_number) = 9 AND passport_number NOT LIKE N'%[^A-Za-z0-9]%'),
    CONSTRAINT UQ_BookingPassengers_BookingPassport UNIQUE (booking_id, passport_number)
);
GO

CREATE TABLE dbo.FlightSeatBookings (
    flight_seat_booking_id INT IDENTITY(1,1) PRIMARY KEY,
    flight_id INT NOT NULL,
    booking_id INT NOT NULL,
    passenger_id INT NOT NULL,
    seat_id INT NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_FlightSeatBookings_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_FlightSeatBookings_Flights FOREIGN KEY (flight_id) REFERENCES dbo.Flights(flight_id),
    CONSTRAINT FK_FlightSeatBookings_Bookings FOREIGN KEY (booking_id) REFERENCES dbo.Bookings(booking_id),
    CONSTRAINT FK_FlightSeatBookings_Passengers FOREIGN KEY (passenger_id) REFERENCES dbo.BookingPassengers(passenger_id),
    CONSTRAINT FK_FlightSeatBookings_Seats FOREIGN KEY (seat_id) REFERENCES dbo.Seats(seat_id),
    CONSTRAINT UQ_FlightSeatBookings_FlightSeat UNIQUE (flight_id, seat_id),
    CONSTRAINT UQ_FlightSeatBookings_Passenger UNIQUE (passenger_id)
);
GO

CREATE TABLE dbo.Payments (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method NVARCHAR(40) NOT NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_Payments_Status DEFAULT N'paid',
    transaction_id NVARCHAR(80) NOT NULL,
    currency_code NVARCHAR(10) NOT NULL CONSTRAINT DF_Payments_Currency DEFAULT N'USD',
    created_at DATETIME2 NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Payments_Bookings FOREIGN KEY (booking_id) REFERENCES dbo.Bookings(booking_id),
    CONSTRAINT FK_Payments_Currencies FOREIGN KEY (currency_code) REFERENCES dbo.Currencies(currency_code),
    CONSTRAINT UQ_Payments_Booking UNIQUE (booking_id),
    CONSTRAINT UQ_Payments_Transaction UNIQUE (transaction_id),
    CONSTRAINT CK_Payments_Amount CHECK (amount >= 0),
    CONSTRAINT CK_Payments_Method CHECK (method IN (N'Cash', N'Visa', N'Credit Card', N'Wallet')),
    CONSTRAINT CK_Payments_Status CHECK (status IN (N'pending', N'paid', N'failed', N'refunded'))
);
GO

CREATE TABLE dbo.Discounts (
    discount_id INT IDENTITY(1,1) PRIMARY KEY,
    discount_code NVARCHAR(40) NOT NULL UNIQUE,
    discount_value DECIMAL(10,2) NOT NULL,
    discount_type NVARCHAR(20) NOT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_Discounts_IsActive DEFAULT 1,
    starts_at DATETIME2 NULL,
    ends_at DATETIME2 NULL,
    CONSTRAINT CK_Discounts_Type CHECK (discount_type IN (N'fixed', N'percentage')),
    CONSTRAINT CK_Discounts_Value CHECK (discount_value >= 0),
    CONSTRAINT CK_Discounts_Dates CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at)
);
GO

CREATE TABLE dbo.Notifications (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(160) NOT NULL,
    body NVARCHAR(800) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.FlightSearchHistory (
    search_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    departure_airport_id INT NULL,
    arrival_airport_id INT NULL,
    departure_date DATE NULL,
    return_date DATE NULL,
    passengers INT NOT NULL CONSTRAINT DF_FlightSearchHistory_Passengers DEFAULT 1,
    class_type NVARCHAR(30) NOT NULL CONSTRAINT DF_FlightSearchHistory_Class DEFAULT N'Economy',
    trip_type NVARCHAR(20) NOT NULL CONSTRAINT DF_FlightSearchHistory_Trip DEFAULT N'oneWay',
    result_count INT NOT NULL CONSTRAINT DF_FlightSearchHistory_ResultCount DEFAULT 0,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_FlightSearchHistory_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_FlightSearchHistory_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id),
    CONSTRAINT FK_FlightSearchHistory_DepartureAirport FOREIGN KEY (departure_airport_id) REFERENCES dbo.Airports(airport_id),
    CONSTRAINT FK_FlightSearchHistory_ArrivalAirport FOREIGN KEY (arrival_airport_id) REFERENCES dbo.Airports(airport_id),
    CONSTRAINT CK_FlightSearchHistory_Passengers CHECK (passengers BETWEEN 1 AND 9),
    CONSTRAINT CK_FlightSearchHistory_Class CHECK (class_type IN (N'Economy', N'Premium Economy', N'Business', N'First')),
    CONSTRAINT CK_FlightSearchHistory_Trip CHECK (trip_type IN (N'oneWay', N'roundTrip')),
    CONSTRAINT CK_FlightSearchHistory_ResultCount CHECK (result_count >= 0)
);
GO

CREATE VIEW dbo.vAirportDirectory
AS
SELECT
    a.airport_id,
    a.airport_code,
    a.airport_name,
    a.city,
    a.country_id,
    c.country_name AS country,
    c.country_code,
    a.image_url
FROM dbo.Airports a
INNER JOIN dbo.Countries c ON c.country_id = a.country_id;
GO

CREATE VIEW dbo.vAirlineDirectory
AS
SELECT
    al.airline_id,
    al.airline_name,
    al.country_id,
    c.country_name AS country,
    c.country_code
FROM dbo.Airlines al
INNER JOIN dbo.Countries c ON c.country_id = al.country_id;
GO

CREATE VIEW dbo.vFlightSchedule
AS
SELECT
    f.flight_id,
    f.flight_code,
    f.airline_id,
    f.aircraft_id,
    f.departure_airport_id,
    f.arrival_airport_id,
    f.departure_time,
    f.arrival_time,
    f.price,
    f.available_seats,
    f.first_seats,
    f.business_seats,
    f.premium_economy_seats,
    f.economy_seats,
    f.status,
    f.discount_value,
    f.discount_type,
    f.discount_code,
    f.is_direct,
    f.transit_count,
    f.total_duration,
    dep.airport_code AS departure_code,
    dep.city AS departure_city,
    dep.airport_name AS departure_airport_name,
    dep.country AS departure_country,
    arr.airport_code AS arrival_code,
    arr.city AS arrival_city,
    arr.airport_name AS arrival_airport_name,
    arr.country AS arrival_country,
    al.airline_name,
    al.country AS airline_country,
    ac.model AS aircraft_model,
    ac.aircraft_type,
    ac.total_seats,
    ac.first_seats AS aircraft_first_seats,
    ac.business_seats AS aircraft_business_seats,
    ac.premium_economy_seats AS aircraft_premium_economy_seats,
    ac.economy_seats AS aircraft_economy_seats
FROM dbo.Flights f
INNER JOIN dbo.vAirportDirectory dep ON dep.airport_id = f.departure_airport_id
INNER JOIN dbo.vAirportDirectory arr ON arr.airport_id = f.arrival_airport_id
INNER JOIN dbo.vAirlineDirectory al ON al.airline_id = f.airline_id
INNER JOIN dbo.Aircraft ac ON ac.aircraft_id = f.aircraft_id;
GO

CREATE VIEW dbo.vBookingDetails
AS
SELECT
    b.booking_id,
    b.user_id,
    u.full_name AS user_full_name,
    u.email AS user_email,
    b.flight_id,
    fs.flight_code,
    fs.airline_name,
    fs.aircraft_model,
    fs.aircraft_type,
    fs.departure_code,
    fs.departure_city,
    fs.departure_time,
    fs.arrival_code,
    fs.arrival_city,
    fs.arrival_time,
    b.status,
    b.payment_status,
    b.total_amount,
    b.passenger_count,
    b.cancelled_at,
    b.cancellation_fee,
    b.cancellation_rate,
    b.refund_amount,
    b.created_at
FROM dbo.Bookings b
INNER JOIN dbo.Users u ON u.user_id = b.user_id
INNER JOIN dbo.vFlightSchedule fs ON fs.flight_id = b.flight_id;
GO
