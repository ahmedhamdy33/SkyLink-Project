USE SkyLink;
GO

-- Lecture 5/6/7: basic SELECT, WHERE, ORDER BY.
SELECT flight_code, departure_code, arrival_code, price, available_seats
FROM dbo.vFlightSchedule
WHERE status = N'active'
ORDER BY price ASC;
GO

-- Lecture 7: JOINs through a view that already maps multiple relations.
SELECT TOP (10)
    flight_code,
    airline_name,
    departure_city,
    arrival_city,
    departure_time
FROM dbo.vFlightSchedule
ORDER BY departure_time;
GO

-- Lecture 8: aggregate functions, GROUP BY, and HAVING.
SELECT
    airline_name,
    COUNT(*) AS flight_count,
    AVG(price) AS average_price,
    MIN(price) AS cheapest_price,
    MAX(price) AS highest_price
FROM dbo.vFlightSchedule
GROUP BY airline_name
HAVING COUNT(*) >= 2
ORDER BY flight_count DESC, average_price ASC;
GO

-- Lecture 8: LIKE pattern matching.
SELECT airport_code, airport_name, city, country
FROM dbo.vAirportDirectory
WHERE city LIKE N'%air%'
   OR airport_name LIKE N'%International%'
ORDER BY country, city;
GO

-- Lecture 8: UNION combines compatible result sets and removes duplicates.
SELECT country FROM dbo.vAirportDirectory
UNION
SELECT country FROM dbo.vAirlineDirectory
ORDER BY country;
GO

-- Lecture 9: query a view like a normal table.
SELECT flight_code, route_label = CONCAT(departure_code, N' -> ', arrival_code), price
FROM dbo.vFlightSchedule
WHERE departure_country = N'Egypt';
GO

-- Lecture 9/analytics: bookings summarized with joins and aggregates.
SELECT
    flight_code,
    COUNT(booking_id) AS booking_count,
    SUM(total_amount) AS revenue
FROM dbo.vBookingDetails
WHERE payment_status = N'paid'
GROUP BY flight_code
ORDER BY revenue DESC;
GO

-- Query a view with a parameter-like filter.
SELECT
    booking_id,
    user_id,
    flight_code,
    airline_name,
    departure_code,
    arrival_code,
    status,
    payment_status,
    total_amount,
    created_at
FROM dbo.vBookingDetails
WHERE user_id = 1
ORDER BY created_at DESC;
GO
