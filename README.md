# SkyLink

SkyLink is a full-stack airline booking system built with React, Node.js, Express, and Microsoft SQL Server.

## Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express REST APIs
- Database: Microsoft SQL Server via the `mssql` package

## Setup

1. Create the SQL Server database by running `database/schema.sql`.
2. Add initial reference data by running `database/seed.sql`.
3. Copy `server/.env.example` to `server/.env` and fill in your SQL Server credentials.
4. Install dependencies:

```bash
npm install
```

5. Run the full stack:

```bash
npm run dev
```

The React app runs on `http://localhost:5173` and the API runs on `http://localhost:5000` by default.

## Default Seed Accounts

- Admin: `admin@skylink.com` / `Admin@12345`
- Customer: `maya@example.com` / `Customer@12345`

The seed passwords use bcrypt hashes and should be changed for real deployments.
