import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { TrainSchedule, TrainService } from '../src/model.js';
import { buildServer } from '../src/server.js';

const SCHEDULE: TrainSchedule = {
  destination: 'Esch-sur-Alzette, Gare',
  timestamp: '2026-09-21T15:30:00.000Z',
  trains: [{ time: '15:33', delay: 0, cancelled: false }],
};

class StubTrainService implements TrainService {
  calls: Array<[number, number, number]> = [];

  async getSchedule(fromId: number, toId: number, maxConnections: number): Promise<TrainSchedule> {
    this.calls.push([fromId, toId, maxConnections]);
    return SCHEDULE;
  }
}

describe('HTTP API', () => {
  test('GET /health returns ok', async () => {
    const app = await buildServer(new StubTrainService(), { logger: false });
    const response = await app.inject({ method: 'GET', url: '/health' });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().status, 'ok');
    await app.close();
  });

  test('GET /api/data returns the schedule with default stations', async () => {
    const service = new StubTrainService();
    const app = await buildServer(service, { logger: false });
    const response = await app.inject({ method: 'GET', url: '/api/data' });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), SCHEDULE);
    assert.deepEqual(service.calls, [[300031019, 300439001, 3]]);
    await app.close();
  });

  test('GET /api/data forwards query parameters', async () => {
    const service = new StubTrainService();
    const app = await buildServer(service, { logger: false });
    const response = await app.inject({
      method: 'GET',
      url: '/api/data?from=300439001&to=300031019&max=5',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(service.calls, [[300439001, 300031019, 5]]);
    await app.close();
  });

  test('sends CORS headers', async () => {
    const app = await buildServer(new StubTrainService(), { logger: false });
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://example.com' },
    });

    assert.equal(response.headers['access-control-allow-origin'], 'http://example.com');
    await app.close();
  });

  test('unknown route returns 404', async () => {
    const app = await buildServer(new StubTrainService(), { logger: false });
    const response = await app.inject({ method: 'GET', url: '/nope' });

    assert.equal(response.statusCode, 404);
    await app.close();
  });
});

