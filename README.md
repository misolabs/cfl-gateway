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

### Development

Run the server in watch mode:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

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
GET /api/data
```
Returns sample JSON data.

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

