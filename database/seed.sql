USE SkyLink;
GO

INSERT INTO dbo.Countries (country_name, country_code)
VALUES
(N'Egypt', N'EG'),
(N'United Arab Emirates', N'AE'),
(N'United Kingdom', N'GB'),
(N'United States', N'US'),
(N'France', N'FR'),
(N'Turkey', N'TR'),
(N'Qatar', N'QA'),
(N'Saudi Arabia', N'SA'),
(N'Netherlands', N'NL'),
(N'Germany', N'DE'),
(N'Spain', N'ES'),
(N'Italy', N'IT'),
(N'Greece', N'GR'),
(N'Lebanon', N'LB'),
(N'Jordan', N'JO'),
(N'Kuwait', N'KW'),
(N'Bahrain', N'BH'),
(N'Oman', N'OM'),
(N'Japan', N'JP'),
(N'Australia', N'AU');
GO

INSERT INTO dbo.Currencies (currency_code, currency_name, symbol, rate_to_usd)
VALUES
(N'USD', N'US Dollar', N'$', 1.0000),
(N'EGP', N'Egyptian Pound', N'EGP', 48.5000),
(N'EUR', N'Euro', N'EUR', 0.9200),
(N'GBP', N'British Pound', N'GBP', 0.7900),
(N'AED', N'UAE Dirham', N'AED', 3.6725),
(N'SAR', N'Saudi Riyal', N'SAR', 3.7500);
GO

INSERT INTO dbo.Users (full_name, email, password_hash, phone, nationality, role)
VALUES
(N'SkyLink Admin', N'admin@skylink.com', N'$2a$10$//Q9NcbfdCiT3830LCnT9ezAPZy.BzQto7jJXvwnfBKKtKqHBCJ4m', N'+20 100 000 0000', N'Egyptian', N'admin'),
(N'Maya Hassan', N'maya@example.com', N'$2a$10$aMD5r2wWIBBNpjg0PqfLrO3273Ls.xCsboOexh.sOchKZ9JYp.cuy', N'+20 111 000 0000', N'Egyptian', N'customer');
GO

INSERT INTO dbo.Airlines (airline_name, country_id, country)
VALUES
(N'SkyLink Air', (SELECT country_id FROM dbo.Countries WHERE country_code = N'EG'), N'Egypt'),
(N'Nile Wings', (SELECT country_id FROM dbo.Countries WHERE country_code = N'EG'), N'Egypt'),
(N'Global Jet', (SELECT country_id FROM dbo.Countries WHERE country_code = N'US'), N'United States'),
(N'Mediterranean Air', (SELECT country_id FROM dbo.Countries WHERE country_code = N'TR'), N'Turkey'),
(N'Gulf Horizon', (SELECT country_id FROM dbo.Countries WHERE country_code = N'AE'), N'United Arab Emirates');
GO

INSERT INTO dbo.Airports (airport_code, airport_name, city, country_id, country, image_url)
VALUES
(N'CAI', N'Cairo International Airport', N'Cairo', (SELECT country_id FROM dbo.Countries WHERE country_code=N'EG'), N'Egypt', N'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=900&q=80'),
(N'HBE', N'Borg El Arab Airport', N'Alexandria', (SELECT country_id FROM dbo.Countries WHERE country_code=N'EG'), N'Egypt', N'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80'),
(N'DXB', N'Dubai International Airport', N'Dubai', (SELECT country_id FROM dbo.Countries WHERE country_code=N'AE'), N'United Arab Emirates', N'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'),
(N'AUH', N'Zayed International Airport', N'Abu Dhabi', (SELECT country_id FROM dbo.Countries WHERE country_code=N'AE'), N'United Arab Emirates', N'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=900&q=80'),
(N'LHR', N'Heathrow Airport', N'London', (SELECT country_id FROM dbo.Countries WHERE country_code=N'GB'), N'United Kingdom', N'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80'),
(N'JFK', N'John F. Kennedy International Airport', N'New York', (SELECT country_id FROM dbo.Countries WHERE country_code=N'US'), N'United States', N'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=900&q=80'),
(N'LAX', N'Los Angeles International Airport', N'Los Angeles', (SELECT country_id FROM dbo.Countries WHERE country_code=N'US'), N'United States', N'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'),
(N'CDG', N'Charles de Gaulle Airport', N'Paris', (SELECT country_id FROM dbo.Countries WHERE country_code=N'FR'), N'France', N'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80'),
(N'ORY', N'Paris Orly Airport', N'Paris', (SELECT country_id FROM dbo.Countries WHERE country_code=N'FR'), N'France', N'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80'),
(N'IST', N'Istanbul Airport', N'Istanbul', (SELECT country_id FROM dbo.Countries WHERE country_code=N'TR'), N'Turkey', N'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80'),
(N'SAW', N'Sabiha Gokcen International Airport', N'Istanbul', (SELECT country_id FROM dbo.Countries WHERE country_code=N'TR'), N'Turkey', N'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80'),
(N'DOH', N'Hamad International Airport', N'Doha', (SELECT country_id FROM dbo.Countries WHERE country_code=N'QA'), N'Qatar', N'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=900&q=80'),
(N'JED', N'King Abdulaziz International Airport', N'Jeddah', (SELECT country_id FROM dbo.Countries WHERE country_code=N'SA'), N'Saudi Arabia', N'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=900&q=80'),
(N'RUH', N'King Khalid International Airport', N'Riyadh', (SELECT country_id FROM dbo.Countries WHERE country_code=N'SA'), N'Saudi Arabia', N'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80'),
(N'AMS', N'Amsterdam Schiphol Airport', N'Amsterdam', (SELECT country_id FROM dbo.Countries WHERE country_code=N'NL'), N'Netherlands', N'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=900&q=80'),
(N'FRA', N'Frankfurt Airport', N'Frankfurt', (SELECT country_id FROM dbo.Countries WHERE country_code=N'DE'), N'Germany', N'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80'),
(N'MUC', N'Munich Airport', N'Munich', (SELECT country_id FROM dbo.Countries WHERE country_code=N'DE'), N'Germany', N'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80'),
(N'MAD', N'Adolfo Suarez Madrid-Barajas Airport', N'Madrid', (SELECT country_id FROM dbo.Countries WHERE country_code=N'ES'), N'Spain', N'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80'),
(N'BCN', N'Barcelona-El Prat Airport', N'Barcelona', (SELECT country_id FROM dbo.Countries WHERE country_code=N'ES'), N'Spain', N'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80'),
(N'FCO', N'Leonardo da Vinci-Fiumicino Airport', N'Rome', (SELECT country_id FROM dbo.Countries WHERE country_code=N'IT'), N'Italy', N'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=900&q=80'),
(N'MXP', N'Milan Malpensa Airport', N'Milan', (SELECT country_id FROM dbo.Countries WHERE country_code=N'IT'), N'Italy', N'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&w=900&q=80'),
(N'ATH', N'Athens International Airport', N'Athens', (SELECT country_id FROM dbo.Countries WHERE country_code=N'GR'), N'Greece', N'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=900&q=80'),
(N'BEY', N'Beirut Rafic Hariri International Airport', N'Beirut', (SELECT country_id FROM dbo.Countries WHERE country_code=N'LB'), N'Lebanon', N'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=900&q=80'),
(N'AMM', N'Queen Alia International Airport', N'Amman', (SELECT country_id FROM dbo.Countries WHERE country_code=N'JO'), N'Jordan', N'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=900&q=80'),
(N'KWI', N'Kuwait International Airport', N'Kuwait City', (SELECT country_id FROM dbo.Countries WHERE country_code=N'KW'), N'Kuwait', N'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'),
(N'BAH', N'Bahrain International Airport', N'Manama', (SELECT country_id FROM dbo.Countries WHERE country_code=N'BH'), N'Bahrain', N'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'),
(N'MCT', N'Muscat International Airport', N'Muscat', (SELECT country_id FROM dbo.Countries WHERE country_code=N'OM'), N'Oman', N'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80'),
(N'HND', N'Tokyo Haneda Airport', N'Tokyo', (SELECT country_id FROM dbo.Countries WHERE country_code=N'JP'), N'Japan', N'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80'),
(N'NRT', N'Narita International Airport', N'Tokyo', (SELECT country_id FROM dbo.Countries WHERE country_code=N'JP'), N'Japan', N'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80'),
(N'SYD', N'Sydney Kingsford Smith Airport', N'Sydney', (SELECT country_id FROM dbo.Countries WHERE country_code=N'AU'), N'Australia', N'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80');
GO

INSERT INTO dbo.Aircraft (airline_id, model, total_seats)
VALUES
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), N'Airbus A320', 24),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), N'Boeing 787', 30),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), N'Airbus A321neo', 28),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), N'Boeing 777', 36),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), N'Airbus A330', 32),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), N'Boeing 737 MAX', 26);
GO

INSERT INTO dbo.Discounts (discount_code, discount_value, discount_type)
VALUES
(N'SKY12', 12, N'percentage'),
(N'LONDON50', 50, N'fixed'),
(N'WELCOME10', 10, N'percentage'),
(N'MAD25', 25, N'fixed');
GO

INSERT INTO dbo.Flights (
    flight_code, airline_id, aircraft_id, departure_airport_id, arrival_airport_id,
    departure_time, arrival_time, price, available_seats, status,
    discount_value, discount_type, discount_code
)
VALUES
(N'SL101', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A320'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'CAI'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'DXB'), '2026-05-01T09:00:00', '2026-05-01T12:20:00', 240, 24, N'active', 12, N'percentage', N'SKY12'),
(N'SL102', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 787'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'CAI'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'LHR'), '2026-05-02T02:15:00', '2026-05-02T07:45:00', 520, 30, N'active', 50, N'fixed', N'LONDON50'),
(N'NW103', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'HBE'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'JED'), '2026-05-03T12:00:00', '2026-05-03T14:10:00', 230, 28, N'active', 0, NULL, NULL),
(N'GJ104', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'DXB'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'RUH'), '2026-05-04T16:45:00', '2026-05-04T18:35:00', 210, 36, N'active', 0, NULL, NULL),
(N'GH105', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 737 MAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'AUH'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'CDG'), '2026-05-05T08:10:00', '2026-05-05T14:15:00', 480, 26, N'active', 0, NULL, NULL),
(N'NW106', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'LHR'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'AMS'), '2026-05-06T09:20:00', '2026-05-06T10:45:00', 145, 28, N'active', 5, N'percentage', N'WELCOME10'),
(N'GJ107', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'FRA'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MAD'), '2026-05-07T11:35:00', '2026-05-07T14:05:00', 190, 36, N'active', 0, NULL, NULL),
(N'MA108', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A330'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'FCO'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'ATH'), '2026-05-08T06:50:00', '2026-05-08T09:00:00', 175, 32, N'delayed', 0, NULL, NULL),
(N'NW109', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'CAI'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BEY'), '2026-05-09T13:25:00', '2026-05-09T15:05:00', 165, 28, N'active', 0, NULL, NULL),
(N'GJ110', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'AMM'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'IST'), '2026-05-10T18:15:00', '2026-05-10T20:25:00', 220, 36, N'active', 0, NULL, NULL),
(N'SL111', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A320'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'KWI'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BAH'), '2026-05-11T05:40:00', '2026-05-11T06:35:00', 105, 24, N'active', 0, NULL, NULL),
(N'NW112', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MCT'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'DXB'), '2026-05-12T15:00:00', '2026-05-12T16:10:00', 155, 28, N'active', 0, NULL, NULL),
(N'GJ113', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'HND'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'SYD'), '2026-05-13T22:30:00', '2026-05-14T09:55:00', 890, 36, N'active', 0, NULL, NULL),
(N'MA114', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A330'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'NRT'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'AUH'), '2026-05-14T01:20:00', '2026-05-14T10:40:00', 760, 32, N'active', 0, NULL, NULL),
(N'GH115', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 737 MAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'DOH'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'AUH'), '2026-05-15T09:00:00', '2026-05-15T10:05:00', 135, 26, N'active', 0, NULL, NULL),
(N'SL116', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 787'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MAD'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'LHR'), '2026-05-16T19:50:00', '2026-05-16T22:15:00', 260, 30, N'active', 25, N'fixed', N'MAD25'),
(N'NW117', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BCN'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'FCO'), '2026-05-17T12:10:00', '2026-05-17T14:05:00', 185, 28, N'active', 0, NULL, NULL),
(N'GJ118', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MUC'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'ORY'), '2026-05-18T08:40:00', '2026-05-18T10:15:00', 165, 36, N'active', 0, NULL, NULL),
(N'MA119', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A330'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'SAW'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'ATH'), '2026-05-19T17:20:00', '2026-05-19T18:45:00', 140, 32, N'active', 0, NULL, NULL),
(N'GH120', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 737 MAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'RUH'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'DXB'), '2026-05-20T06:30:00', '2026-05-20T08:15:00', 175, 26, N'active', 0, NULL, NULL),
(N'SL121', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A320'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'HBE'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'AMM'), '2026-05-21T10:00:00', '2026-05-21T12:00:00', 190, 24, N'active', 0, NULL, NULL),
(N'NW122', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'JED'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'CAI'), '2026-05-22T21:10:00', '2026-05-22T23:25:00', 215, 28, N'active', 0, NULL, NULL),
(N'GJ123', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'SYD'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'HND'), '2026-05-23T03:20:00', '2026-05-23T13:45:00', 910, 36, N'active', 0, NULL, NULL),
(N'MA124', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A330'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BEY'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'FCO'), '2026-05-24T11:10:00', '2026-05-24T14:20:00', 275, 32, N'active', 0, NULL, NULL),
(N'GH125', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 737 MAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MCT'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'DOH'), '2026-05-25T16:45:00', '2026-05-25T18:05:00', 155, 26, N'active', 0, NULL, NULL),
(N'SL126', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 787'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'CAI'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'NRT'), '2026-05-26T23:55:00', '2026-05-27T13:40:00', 980, 30, N'active', 0, NULL, NULL),
(N'NW127', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'AMS'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BCN'), '2026-05-27T07:30:00', '2026-05-27T09:50:00', 170, 28, N'active', 0, NULL, NULL),
(N'GJ128', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'LAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'JFK'), '2026-05-28T15:25:00', '2026-05-28T21:35:00', 430, 36, N'active', 0, NULL, NULL),
(N'MA129', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A330'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'IST'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MXP'), '2026-05-29T13:15:00', '2026-05-29T15:55:00', 225, 32, N'active', 0, NULL, NULL),
(N'GH130', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 737 MAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BAH'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'KWI'), '2026-05-30T04:50:00', '2026-05-30T05:55:00', 110, 26, N'active', 0, NULL, NULL);
GO

WITH Numbers AS (
    SELECT TOP (400)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects
)
INSERT INTO dbo.Seats (aircraft_id, seat_number, class_type)
SELECT
    ac.aircraft_id,
    CONCAT(((n.n - 1) / 4) + 1, CHAR(65 + ((n.n - 1) % 4))) AS seat_number,
    CASE
        WHEN ((n.n - 1) / 4) + 1 <= 2 THEN N'First'
        WHEN ((n.n - 1) / 4) + 1 <= 5 THEN N'Business'
        ELSE N'Economy'
    END AS class_type
FROM dbo.Aircraft ac
INNER JOIN Numbers n ON n.n <= ac.total_seats;
GO

INSERT INTO dbo.Notifications (title, body)
VALUES
(N'Welcome to SkyLink', N'Check your flight status before travelling.'),
(N'Flexible booking', N'You can manage or cancel pending bookings from your account.'),
(N'New destinations', N'SkyLink now includes 20 countries, 30 airports, and 30 seeded flights.');
GO
