# Run SkyLink Database From Scratch

Run these files in SQL Server Management Studio in this order:

1. `schema.sql`
2. `seed.sql`

Full paths:

```text
C:\Users\LENOVO\Documents\New project\database\schema.sql
C:\Users\LENOVO\Documents\New project\database\seed.sql
```

Warning: `schema.sql` drops and recreates the SkyLink tables, so current bookings and test records will be removed.

## Seed Contents

- 20 countries
- 30 airports
- 30 flights
- 5 airlines
- 6 aircraft
- seats generated for each aircraft
- admin and customer seed accounts
- currencies
- discounts
- notifications

## Test Accounts

```text
Admin:
admin@skylink.com
Admin@12345

Customer:
maya@example.com
Customer@12345
```
