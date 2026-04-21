# Reset SkyLink Database To Original Seed Data

The Clean/green style update did not change SQL Server data. It only changed frontend styling.

If you still want to restore the database to the original project seed state, run the existing SQL scripts again.

Warning: this resets the database tables and removes current bookings, passengers, payments, tickets, notifications, and any records you added manually.

## Steps In SQL Server Management Studio

1. Open SQL Server Management Studio.
2. Connect to your SQL Server.
3. Open this file and execute it:

```text
C:\Users\LENOVO\Documents\New project\database\schema.sql
```

4. Then open this file and execute it:

```text
C:\Users\LENOVO\Documents\New project\database\seed.sql
```

## What You Will Get Back

- Original airports
- Original airlines
- Original aircraft
- Original flights
- Original admin/customer seed users
- Original discount seed codes
- Original currency seed data

## Seed Login Accounts

```text
Admin:
admin@skylink.com
Admin@12345

Customer:
maya@example.com
Customer@12345
```

