-- =====================================================================
-- Database Context Setup
-- =====================================================================
USE SkyLink;
GO

-- =====================================================================
-- Create Custom Database Roles
-- Defines specific security roles to adhere to the principle of least privilege
-- =====================================================================

-- Create a role for users or services that only need to read data (e.g., reporting tools, guest users)
IF DATABASE_PRINCIPAL_ID(N'SkyLinkReadOnly') IS NULL
    CREATE ROLE SkyLinkReadOnly;
GO

-- Create a role for the main application backend that needs to read and write transactional data
IF DATABASE_PRINCIPAL_ID(N'SkyLinkAppWriter') IS NULL
    CREATE ROLE SkyLinkAppWriter;
GO

-- =====================================================================
-- Grant Permissions: SkyLinkReadOnly
-- Provides view-only access to safe, aggregated data structures
-- =====================================================================
GRANT SELECT ON dbo.vAirportDirectory TO SkyLinkReadOnly;
GRANT SELECT ON dbo.vAirlineDirectory TO SkyLinkReadOnly;
GRANT SELECT ON dbo.vFlightSchedule TO SkyLinkReadOnly;
GRANT SELECT ON dbo.vBookingDetails TO SkyLinkReadOnly;

GO

-- =====================================================================
-- Grant Permissions: SkyLinkAppWriter
-- Provides full CRUD (Create, Read, Update, Delete) access to operational 
-- tables and read-only access to reference tables and views.
-- =====================================================================

-- Full access to transactional tables required for the booking process
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Users TO SkyLinkAppWriter;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Bookings TO SkyLinkAppWriter;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.BookingPassengers TO SkyLinkAppWriter;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Payments TO SkyLinkAppWriter;

-- Full access to flight management (useful if the app includes an admin dashboard)
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Flights TO SkyLinkAppWriter;

-- Read-only access to static reference tables (Countries, Currencies should be managed directly by DBAs or specific admin roles)
GRANT SELECT ON dbo.Countries TO SkyLinkAppWriter;
GRANT SELECT ON dbo.Currencies TO SkyLinkAppWriter;

-- Read access to predefined views
GRANT SELECT ON dbo.vAirportDirectory TO SkyLinkAppWriter;
GRANT SELECT ON dbo.vAirlineDirectory TO SkyLinkAppWriter;
GRANT SELECT ON dbo.vFlightSchedule TO SkyLinkAppWriter;
GRANT SELECT ON dbo.vBookingDetails TO SkyLinkAppWriter;

GO

-- =====================================================================
-- Usage Examples
-- Instructions on how to assign actual database users to these roles
-- =====================================================================
-- Example after creating database users:
-- ALTER ROLE SkyLinkReadOnly ADD MEMBER student_reader;
-- ALTER ROLE SkyLinkAppWriter ADD MEMBER skylink_api_user;
