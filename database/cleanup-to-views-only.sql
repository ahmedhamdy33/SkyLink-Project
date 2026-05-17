USE SkyLink;
GO

IF OBJECT_ID(N'dbo.sp_GetUserBookingHistory', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetUserBookingHistory;
GO

IF OBJECT_ID(N'dbo.trg_BookingPassengers_NoDuplicateSeatPerFlight', N'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_BookingPassengers_NoDuplicateSeatPerFlight;
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Flights_RouteDate'
      AND object_id = OBJECT_ID(N'dbo.Flights')
)
    DROP INDEX IX_Flights_RouteDate ON dbo.Flights;
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Bookings_UserCreatedAt'
      AND object_id = OBJECT_ID(N'dbo.Bookings')
)
    DROP INDEX IX_Bookings_UserCreatedAt ON dbo.Bookings;
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_BookingPassengers_Booking'
      AND object_id = OBJECT_ID(N'dbo.BookingPassengers')
)
    DROP INDEX IX_BookingPassengers_Booking ON dbo.BookingPassengers;
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Seats_AircraftClass'
      AND object_id = OBJECT_ID(N'dbo.Seats')
)
    DROP INDEX IX_Seats_AircraftClass ON dbo.Seats;
GO
