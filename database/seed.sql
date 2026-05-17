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

INSERT INTO dbo.Airlines (airline_name, country_id)
VALUES
(N'SkyLink Air', (SELECT country_id FROM dbo.Countries WHERE country_code = N'EG')),
(N'Nile Wings', (SELECT country_id FROM dbo.Countries WHERE country_code = N'EG')),
(N'Global Jet', (SELECT country_id FROM dbo.Countries WHERE country_code = N'US')),
(N'Mediterranean Air', (SELECT country_id FROM dbo.Countries WHERE country_code = N'TR')),
(N'Gulf Horizon', (SELECT country_id FROM dbo.Countries WHERE country_code = N'AE'));
GO

INSERT INTO dbo.Airports (airport_code, airport_name, city, country_id, image_url)
VALUES
(N'CAI', N'Cairo International Airport', N'Cairo', (SELECT country_id FROM dbo.Countries WHERE country_code=N'EG'), N'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=900&q=80'),
(N'HBE', N'Borg El Arab Airport', N'Alexandria', (SELECT country_id FROM dbo.Countries WHERE country_code=N'EG'), N'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80'),
(N'DXB', N'Dubai International Airport', N'Dubai', (SELECT country_id FROM dbo.Countries WHERE country_code=N'AE'), N'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'),
(N'AUH', N'Zayed International Airport', N'Abu Dhabi', (SELECT country_id FROM dbo.Countries WHERE country_code=N'AE'), N'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=900&q=80'),
(N'LHR', N'Heathrow Airport', N'London', (SELECT country_id FROM dbo.Countries WHERE country_code=N'GB'), N'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80'),
(N'JFK', N'John F. Kennedy International Airport', N'New York', (SELECT country_id FROM dbo.Countries WHERE country_code=N'US'), N'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=900&q=80'),
(N'LAX', N'Los Angeles International Airport', N'Los Angeles', (SELECT country_id FROM dbo.Countries WHERE country_code=N'US'), N'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'),
(N'CDG', N'Charles de Gaulle Airport', N'Paris', (SELECT country_id FROM dbo.Countries WHERE country_code=N'FR'), N'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80'),
(N'ORY', N'Paris Orly Airport', N'Paris', (SELECT country_id FROM dbo.Countries WHERE country_code=N'FR'), N'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80'),
(N'IST', N'Istanbul Airport', N'Istanbul', (SELECT country_id FROM dbo.Countries WHERE country_code=N'TR'), N'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80'),
(N'SAW', N'Sabiha Gokcen International Airport', N'Istanbul', (SELECT country_id FROM dbo.Countries WHERE country_code=N'TR'), N'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80'),
(N'DOH', N'Hamad International Airport', N'Doha', (SELECT country_id FROM dbo.Countries WHERE country_code=N'QA'), N'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=900&q=80'),
(N'JED', N'King Abdulaziz International Airport', N'Jeddah', (SELECT country_id FROM dbo.Countries WHERE country_code=N'SA'), N'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=900&q=80'),
(N'RUH', N'King Khalid International Airport', N'Riyadh', (SELECT country_id FROM dbo.Countries WHERE country_code=N'SA'), N'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80'),
(N'AMS', N'Amsterdam Schiphol Airport', N'Amsterdam', (SELECT country_id FROM dbo.Countries WHERE country_code=N'NL'), N'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=900&q=80'),
(N'FRA', N'Frankfurt Airport', N'Frankfurt', (SELECT country_id FROM dbo.Countries WHERE country_code=N'DE'), N'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80'),
(N'MUC', N'Munich Airport', N'Munich', (SELECT country_id FROM dbo.Countries WHERE country_code=N'DE'), N'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80'),
(N'MAD', N'Adolfo Suarez Madrid-Barajas Airport', N'Madrid', (SELECT country_id FROM dbo.Countries WHERE country_code=N'ES'), N'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80'),
(N'BCN', N'Barcelona-El Prat Airport', N'Barcelona', (SELECT country_id FROM dbo.Countries WHERE country_code=N'ES'), N'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80'),
(N'FCO', N'Leonardo da Vinci-Fiumicino Airport', N'Rome', (SELECT country_id FROM dbo.Countries WHERE country_code=N'IT'), N'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=900&q=80'),
(N'MXP', N'Milan Malpensa Airport', N'Milan', (SELECT country_id FROM dbo.Countries WHERE country_code=N'IT'), N'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&w=900&q=80'),
(N'ATH', N'Athens International Airport', N'Athens', (SELECT country_id FROM dbo.Countries WHERE country_code=N'GR'), N'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=900&q=80'),
(N'BEY', N'Beirut Rafic Hariri International Airport', N'Beirut', (SELECT country_id FROM dbo.Countries WHERE country_code=N'LB'), N'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=900&q=80'),
(N'AMM', N'Queen Alia International Airport', N'Amman', (SELECT country_id FROM dbo.Countries WHERE country_code=N'JO'), N'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=900&q=80'),
(N'KWI', N'Kuwait International Airport', N'Kuwait City', (SELECT country_id FROM dbo.Countries WHERE country_code=N'KW'), N'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'),
(N'BAH', N'Bahrain International Airport', N'Manama', (SELECT country_id FROM dbo.Countries WHERE country_code=N'BH'), N'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'),
(N'MCT', N'Muscat International Airport', N'Muscat', (SELECT country_id FROM dbo.Countries WHERE country_code=N'OM'), N'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80'),
(N'HND', N'Tokyo Haneda Airport', N'Tokyo', (SELECT country_id FROM dbo.Countries WHERE country_code=N'JP'), N'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80'),
(N'NRT', N'Narita International Airport', N'Tokyo', (SELECT country_id FROM dbo.Countries WHERE country_code=N'JP'), N'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80'),
(N'SYD', N'Sydney Kingsford Smith Airport', N'Sydney', (SELECT country_id FROM dbo.Countries WHERE country_code=N'AU'), N'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80');
GO

INSERT INTO dbo.Aircraft (
    airline_id, model, aircraft_type, total_seats,
    first_seats, business_seats, premium_economy_seats, economy_seats
)
VALUES
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), N'Airbus A319', N'Narrow-Body', 132, 0, 12, 0, 120),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), N'Airbus A320', N'Narrow-Body', 162, 0, 12, 0, 150),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), N'Airbus A321', N'Narrow-Body', 200, 0, 20, 0, 180),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), N'Airbus A321neo', N'Narrow-Body', 206, 0, 20, 0, 186),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), N'Airbus A320neo', N'Narrow-Body', 174, 0, 12, 0, 162),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), N'Boeing 737-800', N'Narrow-Body', 160, 0, 16, 0, 144),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), N'Boeing 737 MAX', N'Narrow-Body', 178, 0, 16, 0, 162),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), N'Airbus A220', N'Narrow-Body', 130, 0, 10, 0, 120),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), N'Airbus A350-900', N'Wide-Body', 320, 0, 48, 32, 240),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), N'Airbus A350-1000', N'Wide-Body', 360, 0, 54, 36, 270),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), N'Boeing 787-8 Dreamliner', N'Wide-Body', 268, 0, 28, 20, 220),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), N'Boeing 787-9 Dreamliner', N'Wide-Body', 278, 0, 30, 28, 220),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), N'Boeing 787-10 Dreamliner', N'Wide-Body', 318, 0, 38, 30, 250),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), N'Boeing 777', N'Wide-Body', 334, 8, 42, 24, 260),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), N'Boeing 777X', N'Wide-Body', 396, 8, 56, 32, 300),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), N'Airbus A380', N'Wide-Body', 546, 14, 76, 56, 400),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), N'Airbus A330', N'Wide-Body', 300, 0, 36, 24, 240),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), N'Airbus A330neo', N'Wide-Body', 316, 0, 40, 28, 248),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), N'Embraer E170', N'Regional', 78, 0, 6, 0, 72),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), N'Embraer E190', N'Regional', 96, 0, 8, 0, 88),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), N'Embraer E195', N'Regional', 120, 0, 10, 0, 110),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), N'ATR 42', N'Regional', 48, 0, 0, 0, 48),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), N'ATR 72', N'Regional', 70, 0, 0, 0, 70),
((SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), N'Bombardier CRJ Series', N'Regional', 76, 0, 6, 0, 70);
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
(N'SL102', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 787-9 Dreamliner'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'CAI'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'LHR'), '2026-05-02T02:15:00', '2026-05-02T07:45:00', 520, 30, N'active', 50, N'fixed', N'LONDON50'),
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
(N'SL116', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 787-9 Dreamliner'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MAD'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'LHR'), '2026-05-16T19:50:00', '2026-05-16T22:15:00', 260, 30, N'active', 25, N'fixed', N'MAD25'),
(N'NW117', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BCN'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'FCO'), '2026-05-17T12:10:00', '2026-05-17T14:05:00', 185, 28, N'active', 0, NULL, NULL),
(N'GJ118', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MUC'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'ORY'), '2026-05-18T08:40:00', '2026-05-18T10:15:00', 165, 36, N'active', 0, NULL, NULL),
(N'MA119', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A330'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'SAW'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'ATH'), '2026-05-19T17:20:00', '2026-05-19T18:45:00', 140, 32, N'active', 0, NULL, NULL),
(N'GH120', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 737 MAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'RUH'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'DXB'), '2026-05-20T06:30:00', '2026-05-20T08:15:00', 175, 26, N'active', 0, NULL, NULL),
(N'SL121', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A320'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'HBE'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'AMM'), '2026-05-21T10:00:00', '2026-05-21T12:00:00', 190, 24, N'active', 0, NULL, NULL),
(N'NW122', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'JED'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'CAI'), '2026-05-22T21:10:00', '2026-05-22T23:25:00', 215, 28, N'active', 0, NULL, NULL),
(N'GJ123', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'SYD'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'HND'), '2026-05-23T03:20:00', '2026-05-23T13:45:00', 910, 36, N'active', 0, NULL, NULL),
(N'MA124', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A330'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BEY'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'FCO'), '2026-05-24T11:10:00', '2026-05-24T14:20:00', 275, 32, N'active', 0, NULL, NULL),
(N'GH125', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 737 MAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MCT'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'DOH'), '2026-05-25T16:45:00', '2026-05-25T18:05:00', 155, 26, N'active', 0, NULL, NULL),
(N'SL126', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'SkyLink Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 787-9 Dreamliner'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'CAI'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'NRT'), '2026-05-26T23:55:00', '2026-05-27T13:40:00', 980, 30, N'active', 0, NULL, NULL),
(N'NW127', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Nile Wings'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A321neo'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'AMS'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BCN'), '2026-05-27T07:30:00', '2026-05-27T09:50:00', 170, 28, N'active', 0, NULL, NULL),
(N'GJ128', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Global Jet'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 777'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'LAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'JFK'), '2026-05-28T15:25:00', '2026-05-28T21:35:00', 430, 36, N'active', 0, NULL, NULL),
(N'MA129', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Mediterranean Air'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Airbus A330'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'IST'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'MXP'), '2026-05-29T13:15:00', '2026-05-29T15:55:00', 225, 32, N'active', 0, NULL, NULL),
(N'GH130', (SELECT airline_id FROM dbo.Airlines WHERE airline_name=N'Gulf Horizon'), (SELECT aircraft_id FROM dbo.Aircraft WHERE model=N'Boeing 737 MAX'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'BAH'), (SELECT airport_id FROM dbo.Airports WHERE airport_code=N'KWI'), '2026-05-30T04:50:00', '2026-05-30T05:55:00', 110, 26, N'active', 0, NULL, NULL);
GO

UPDATE f
SET
    available_seats = ac.total_seats,
    first_seats = ac.first_seats,
    business_seats = ac.business_seats,
    premium_economy_seats = ac.premium_economy_seats,
    economy_seats = ac.economy_seats,
    total_duration = DATEDIFF(MINUTE, f.departure_time, f.arrival_time)
FROM dbo.Flights f
INNER JOIN dbo.Aircraft ac ON ac.aircraft_id = f.aircraft_id;
GO

UPDATE dbo.Flights
SET is_direct = 0,
    transit_count = 1,
    total_duration = DATEDIFF(MINUTE, departure_time, arrival_time)
WHERE flight_code IN (N'SL102', N'SL126');
GO

INSERT INTO dbo.Flight_Transit_Stops (
    flight_id,
    airport_code,
    airport_name,
    arrival_time,
    departure_time,
    layover_minutes,
    stop_order
)
VALUES
(
    (SELECT flight_id FROM dbo.Flights WHERE flight_code = N'SL102'),
    N'DXB',
    N'Dubai International Airport',
    '2026-05-02T05:05:00',
    '2026-05-02T06:25:00',
    80,
    1
),
(
    (SELECT flight_id FROM dbo.Flights WHERE flight_code = N'SL126'),
    N'DXB',
    N'Dubai International Airport',
    '2026-05-27T04:15:00',
    '2026-05-27T06:15:00',
    120,
    1
);
GO

WITH Numbers AS (
    SELECT TOP (600)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects
),
AircraftLayout AS (
    SELECT
        ac.*,
        CASE
            WHEN ac.model = N'Airbus A380' THEN 10
            WHEN ac.aircraft_type = N'Wide-Body' THEN 9
            WHEN ac.aircraft_type = N'Regional' THEN 4
            ELSE 6
        END AS seats_per_row
    FROM dbo.Aircraft ac
)
INSERT INTO dbo.Seats (
    aircraft_id, seat_number, class_type, row_number, seat_letter,
    deck_number, is_window, is_aisle
)
SELECT
    ac.aircraft_id,
    CONCAT(((n.n - 1) / ac.seats_per_row) + 1, letters.seat_letter) AS seat_number,
    CASE
        WHEN n.n <= ac.first_seats THEN N'First'
        WHEN n.n <= ac.first_seats + ac.business_seats THEN N'Business'
        WHEN n.n <= ac.first_seats + ac.business_seats + ac.premium_economy_seats THEN N'Premium Economy'
        ELSE N'Economy'
    END AS class_type,
    ((n.n - 1) / ac.seats_per_row) + 1 AS row_number,
    letters.seat_letter,
    CASE WHEN ac.model = N'Airbus A380' THEN CASE WHEN n.n > 400 THEN 2 ELSE 1 END ELSE NULL END AS deck_number,
    CASE WHEN positions.seat_position IN (1, ac.seats_per_row) THEN 1 ELSE 0 END AS is_window,
    CASE
        WHEN ac.seats_per_row = 4 AND positions.seat_position IN (2, 3) THEN 1
        WHEN ac.seats_per_row = 6 AND positions.seat_position IN (3, 4) THEN 1
        WHEN ac.seats_per_row = 9 AND positions.seat_position IN (3, 4, 6, 7) THEN 1
        WHEN ac.seats_per_row = 10 AND positions.seat_position IN (3, 4, 7, 8) THEN 1
        ELSE 0
    END AS is_aisle
FROM AircraftLayout ac
INNER JOIN Numbers n ON n.n <= ac.total_seats
CROSS APPLY (
    SELECT ((n.n - 1) % ac.seats_per_row) + 1 AS seat_position
) positions
CROSS APPLY (
    SELECT CASE positions.seat_position
        WHEN 1 THEN N'A'
        WHEN 2 THEN N'B'
        WHEN 3 THEN N'C'
        WHEN 4 THEN N'D'
        WHEN 5 THEN N'E'
        WHEN 6 THEN N'F'
        WHEN 7 THEN N'G'
        WHEN 8 THEN N'H'
        WHEN 9 THEN N'J'
        ELSE N'K'
    END AS seat_letter
) letters
GO

INSERT INTO dbo.Notifications (title, body)
VALUES
(N'Welcome to SkyLink', N'Check your flight status before travelling.'),
(N'Flexible booking', N'You can manage or cancel pending bookings from your account.'),
(N'New destinations', N'SkyLink now includes 20 countries, 30 airports, and 30 seeded flights.'),
(N'AI recommendations are live', N'SkyLink learns from your searches and bookings to suggest more relevant flights.');
GO

INSERT INTO dbo.FlightSearchHistory (
    user_id,
    departure_airport_id,
    arrival_airport_id,
    departure_date,
    passengers,
    class_type,
    trip_type,
    result_count
)
VALUES
(2, 1, 2, CAST(DATEADD(DAY, 14, SYSUTCDATETIME()) AS DATE), 1, N'Economy', N'oneWay', 4),
(2, 1, 9, CAST(DATEADD(DAY, 30, SYSUTCDATETIME()) AS DATE), 2, N'Business', N'roundTrip', 3);
GO
