# Transit / Connecting Flights API

## Create Transit Flight

`POST /api/admin/flights`

```json
{
  "flightCode": "SL900",
  "airlineId": 1,
  "aircraftId": 3,
  "departureAirportId": 1,
  "arrivalAirportId": 2,
  "departureTime": "2026-08-01T08:00:00",
  "arrivalTime": "2026-08-01T15:30:00",
  "price": 430,
  "status": "active",
  "is_direct": false,
  "transit_stops": [
    {
      "airport_code": "DXB",
      "airport_name": "Dubai International Airport",
      "arrival_time": "2026-08-01T10:30:00",
      "departure_time": "2026-08-01T12:00:00",
      "layover_minutes": 90,
      "stop_order": 1
    }
  ]
}
```

Example response:

```json
{
  "flight_id": 31,
  "flight_code": "SL900",
  "is_direct": false,
  "transit_count": 1,
  "total_duration": 450,
  "transit_summary": "1 Stop - DXB",
  "transit_stops": [
    {
      "airport_code": "DXB",
      "airport_name": "Dubai International Airport",
      "layover_minutes": 90,
      "stop_order": 1
    }
  ]
}
```

## Create Direct Flight

`POST /api/admin/flights`

```json
{
  "flightCode": "SL901",
  "airlineId": 1,
  "aircraftId": 3,
  "departureAirportId": 1,
  "arrivalAirportId": 2,
  "departureTime": "2026-08-02T08:00:00",
  "arrivalTime": "2026-08-02T12:00:00",
  "price": 350,
  "status": "active",
  "is_direct": true,
  "transit_stops": []
}
```

## Filters

`GET /api/flights?directOnly=true`

Returns direct flights only.

`GET /api/flights?maxStops=1&maxLayoverTime=240`

Returns direct and one-stop flights where total layover time is at most 240 minutes.

## Validation

Transit layovers must be between 45 and 720 minutes. Direct flights always store `is_direct = true`, `transit_count = 0`, and no transit stop records.
