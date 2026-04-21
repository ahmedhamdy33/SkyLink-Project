IF DB_ID(N'SkyLink') IS NULL
BEGIN
    CREATE DATABASE SkyLink;
END;
GO

USE SkyLink;
GO

IF OBJECT_ID(N'dbo.Payments', N'U') IS NOT NULL DROP TABLE dbo.Payments;
IF OBJECT_ID(N'dbo.BookingPassengers', N'U') IS NOT NULL DROP TABLE dbo.BookingPassengers;
IF OBJECT_ID(N'dbo.Bookings', N'U') IS NOT NULL DROP TABLE dbo.Bookings;
IF OBJECT_ID(N'dbo.Seats', N'U') IS NOT NULL DROP TABLE dbo.Seats;
IF OBJECT_ID(N'dbo.Flights', N'U') IS NOT NULL DROP TABLE dbo.Flights;
IF OBJECT_ID(N'dbo.Aircraft', N'U') IS NOT NULL DROP TABLE dbo.Aircraft;
IF OBJECT_ID(N'dbo.Airlines', N'U') IS NOT NULL DROP TABLE dbo.Airlines;
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
    country_id INT NULL,
    country NVARCHAR(80) NULL,
    CONSTRAINT FK_Airlines_Countries FOREIGN KEY (country_id) REFERENCES dbo.Countries(country_id)
);
GO

CREATE TABLE dbo.Airports (
    airport_id INT IDENTITY(1,1) PRIMARY KEY,
    airport_code NVARCHAR(10) NOT NULL UNIQUE,
    airport_name NVARCHAR(160) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    country_id INT NULL,
    country NVARCHAR(100) NOT NULL,
    image_url NVARCHAR(500) NULL,
    CONSTRAINT FK_Airports_Countries FOREIGN KEY (country_id) REFERENCES dbo.Countries(country_id)
);
GO

CREATE TABLE dbo.Aircraft (
    aircraft_id INT IDENTITY(1,1) PRIMARY KEY,
    airline_id INT NOT NULL,
    model NVARCHAR(120) NOT NULL,
    total_seats INT NOT NULL,
    CONSTRAINT FK_Aircraft_Airlines FOREIGN KEY (airline_id) REFERENCES dbo.Airlines(airline_id),
    CONSTRAINT CK_Aircraft_TotalSeats CHECK (total_seats > 0)
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
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_Flights_Status DEFAULT N'active',
    discount_value DECIMAL(10,2) NULL,
    discount_type NVARCHAR(20) NULL,
    discount_code NVARCHAR(40) NULL,
    CONSTRAINT FK_Flights_Airlines FOREIGN KEY (airline_id) REFERENCES dbo.Airlines(airline_id),
    CONSTRAINT FK_Flights_Aircraft FOREIGN KEY (aircraft_id) REFERENCES dbo.Aircraft(aircraft_id),
    CONSTRAINT FK_Flights_DepartureAirport FOREIGN KEY (departure_airport_id) REFERENCES dbo.Airports(airport_id),
    CONSTRAINT FK_Flights_ArrivalAirport FOREIGN KEY (arrival_airport_id) REFERENCES dbo.Airports(airport_id),
    CONSTRAINT CK_Flights_DifferentAirports CHECK (departure_airport_id <> arrival_airport_id),
    CONSTRAINT CK_Flights_Time CHECK (arrival_time > departure_time),
    CONSTRAINT CK_Flights_Price CHECK (price >= 0),
    CONSTRAINT CK_Flights_AvailableSeats CHECK (available_seats >= 0),
    CONSTRAINT CK_Flights_Status CHECK (status IN (N'active', N'delayed', N'cancelled')),
    CONSTRAINT CK_Flights_DiscountType CHECK (discount_type IS NULL OR discount_type IN (N'fixed', N'percentage'))
);
GO

CREATE TABLE dbo.Seats (
    seat_id INT IDENTITY(1,1) PRIMARY KEY,
    aircraft_id INT NOT NULL,
    seat_number NVARCHAR(10) NOT NULL,
    class_type NVARCHAR(30) NOT NULL CONSTRAINT DF_Seats_Class DEFAULT N'Economy',
    CONSTRAINT FK_Seats_Aircraft FOREIGN KEY (aircraft_id) REFERENCES dbo.Aircraft(aircraft_id),
    CONSTRAINT UQ_Seats_AircraftSeat UNIQUE (aircraft_id, seat_number),
    CONSTRAINT CK_Seats_Class CHECK (class_type IN (N'Economy', N'Business', N'First'))
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
    created_at DATETIME2 NOT NULL CONSTRAINT DF_Bookings_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Bookings_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id),
    CONSTRAINT FK_Bookings_Flights FOREIGN KEY (flight_id) REFERENCES dbo.Flights(flight_id),
    CONSTRAINT CK_Bookings_Status CHECK (status IN (N'pending', N'confirmed', N'cancelled')),
    CONSTRAINT CK_Bookings_PaymentStatus CHECK (payment_status IN (N'pending', N'paid', N'failed', N'refunded')),
    CONSTRAINT CK_Bookings_Total CHECK (total_amount >= 0),
    CONSTRAINT CK_Bookings_Passengers CHECK (passenger_count > 0)
);
GO

CREATE TABLE dbo.BookingPassengers (
    passenger_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    full_name NVARCHAR(120) NOT NULL,
    passport_number NVARCHAR(60) NOT NULL,
    class_type NVARCHAR(30) NOT NULL,
    seat_number NVARCHAR(10) NULL,
    CONSTRAINT FK_BookingPassengers_Bookings FOREIGN KEY (booking_id) REFERENCES dbo.Bookings(booking_id),
    CONSTRAINT CK_BookingPassengers_Class CHECK (class_type IN (N'Economy', N'Business', N'First')),
    CONSTRAINT UQ_BookingPassengers_BookingPassport UNIQUE (booking_id, passport_number)
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
