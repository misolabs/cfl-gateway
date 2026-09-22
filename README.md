# CFL Gateway API

A Node.js API server built with Fastify, ready for deployment on Fly.io.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and paste your mobiliteit.lu access id:

```bash
cp .env.example .env
```

```
MOBILITEIT_ACCESS_ID=paste-your-access-id-here
```

Without an access id the server falls back to the mock train service.

### Development

Run the server in watch mode (loads `.env` if present):

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Tests

```bash
npm test        # unit + API tests (node:test via tsx)
npm run typecheck
```

### Production

```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Mock Data
```
GET /api/data?from=300031019&to=300439001&max=3
```
Returns the next departures from station `from` that pass through station `to`,
limited to `max` connections. Defaults: Luxembourg Gare Centrale →
Esch-sur-Alzette, 3 connections.

## Deployment to Fly.io

### Prerequisites
1. Install Fly CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Create a Fly.io account and authenticate:
   ```bash
   flyctl auth login
   ```

### Deploy

1. Initialize the Fly app (first time only):
   ```bash
   flyctl launch --name cflgateway
   ```
   When prompted, use the provided `fly.toml` configuration.

2. Deploy:
   ```bash
   flyctl deploy
   ```

3. View logs:
   ```bash
   flyctl logs
   ```

4. Access your app:
   ```bash
   flyctl open
   ```

### Environment Variables

Set environment variables on Fly.io:

```bash
flyctl secrets set PORT=3000
flyctl secrets set MOBILITEIT_ACCESS_ID=your-access-id
```

### Scaling

Scale to multiple regions or instances:

```bash
flyctl scale count 2
```

## Docker

Build locally:

```bash
docker build -t cflgateway .
docker run -p 3000:3000 cflgateway
```

## License

ISC
