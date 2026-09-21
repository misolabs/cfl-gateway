# Mock Data Endpoint

Defines the response format for the mock endpoint (`GET /api/data`), which serves
train schedule information.

## Response Format

```jsonc
{
  "destination": string,   // station name
  "timestamp": string,     // ISO 8601 date-time
  "trains": [
    {
      "time": string,      // departure time for display, e.g. "07:00"
      "delay": number,     // delay in minutes, e.g. 5
      "cancelled": boolean // true if the train is cancelled
    }
  ]
}
```

## Generation Rules

| Field | Rule |
| --- | --- |
| `destination` | Randomly one of `"Esch/Alzette"` or `"Luxembourg"` |
| `timestamp` | Current date and time, ISO 8601 format |
| `trains` | Exactly 3 entries |
| `trains[].time` | Fixed values, in order: `"07:00"`, `"07:15"`, `"07:30"` |
| `trains[].delay` | Random integer between 0 and 15 (inclusive) |
| `trains[].cancelled` | Random, 5:1 ratio of `false` to `true` (1 in 6 is `true`) |

## Example Response

```json
{
  "destination": "Luxembourg",
  "timestamp": "2026-09-21T07:04:12.345Z",
  "trains": [
    { "time": "07:00", "delay": 0, "cancelled": false },
    { "time": "07:15", "delay": 7, "cancelled": false },
    { "time": "07:30", "delay": 3, "cancelled": true }
  ]
}
```
