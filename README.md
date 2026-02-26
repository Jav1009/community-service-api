# Community Service Booking API

A RESTful backend API for a municipal Community Service Booking Application, built with Node.js, Express, and MySQL.

## Overview

This API allows residents to browse available services and create bookings, and administrators to manage the services offered. Services include plumbing repairs, electrical inspections, waste collection, and home cleaning support.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (via `mysql2`)
- **Environment Config:** dotenv

## Project Structure

```
├── config/
│   └── db.js                  # MySQL connection pool
├── controllers/
│   ├── bookingController.js   # Booking business logic
│   └── serviceController.js   # Service business logic
├── middleware/
│   └── errorHandler.js        # Centralized error handling
├── routes/
│   ├── bookingRoutes.js        # Booking route definitions
│   └── serviceRoutes.js        # Service route definitions
├── .env                        # Environment variables (not committed)
├── .env.example                # Example environment config
├── package.json
└── server.js                   # App entry point
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL (v8+)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd community-service-booking-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=community_service_db
   PORT=3500
   ```

5. Set up the database:
   - Create the database in MySQL: `CREATE DATABASE community_service_db;`
   - Run the SQL `CREATE TABLE` statements found in Appendix B of the project documentation.
   - Insert a predefined user with `id = 1` into the `users` table (no auth required).
   - Seed the `booking_status` table with: `Scheduled`, `Completed`, `Cancelled`.

6. Start the server:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3500`.

## API Endpoints

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Retrieve all services |
| GET | `/api/services/:id` | Retrieve a service by ID |
| POST | `/api/services` | Create a new service |
| PUT | `/api/services/:id` | Update an existing service |
| DELETE | `/api/services/:id` | Delete a service |

#### POST `/api/services` — Request Body
```json
{
  "name": "Plumbing Repair",
  "description": "Fix leaking pipes and plumbing issues.",
  "price": 150.00,
  "estimated_duration": "2 hours",
  "is_available": true
}
```

---

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Retrieve all bookings |
| GET | `/api/bookings/:id` | Retrieve a booking by ID |
| POST | `/api/bookings` | Create a new booking (linked to user ID 1) |
| PUT | `/api/bookings/:id/status` | Update booking status |
| PUT | `/api/bookings/:id/cancel` | Cancel a scheduled booking |

#### POST `/api/bookings` — Request Body
```json
{
  "service_id": 1,
  "booking_date": "2026-03-15",
  "booking_time": "10:00:00",
  "notes": "Please bring extra tools."
}
```

#### PUT `/api/bookings/:id/status` — Request Body
```json
{
  "status_id": 2
}
```

---

## Error Handling

All errors are handled by centralized middleware and return a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "message": "Booking with ID 99 not found",
    "status": 404
  }
}
```

## Notes

- No authentication is required. A predefined user with `id = 1` is assumed for all bookings.
- All bookings are created with a default status of `Scheduled`.
- Only `Scheduled` bookings can be cancelled.