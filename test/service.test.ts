import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CflInfoService } from '../src/service.js';

const LUX_ID = 300031019;
const ESCH_ID = 300439001;

/** Departure board of Luxembourg, Gare Centrale captured on 2026-09-21. */
const fixture = JSON.parse(
  await readFile(new URL('../briefings/departuresLux.json', import.meta.url), 'utf8'),
);

const realFetch = globalThis.fetch;
let lastUrl: URL | undefined;

function mockFetch(body: unknown, init: { ok?: boolean; statusText?: string } = {}): void {
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
    lastUrl = new URL(input.toString());
    return {
      ok: init.ok ?? true,
      statusText: init.statusText ?? 'OK',
      json: async () => body,
    } as Response;
  }) as typeof fetch;
}

describe('CflInfoService.getSchedule', () => {
  beforeEach(() => {
    lastUrl = undefined;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  test('requests the departure board of the origin station', async () => {
    mockFetch(fixture);
    await new CflInfoService('test-access-id').getSchedule(LUX_ID, ESCH_ID, 3);

    assert.ok(lastUrl);
    assert.equal(lastUrl.pathname, '/opendata/apiserver/departureBoard');
    assert.equal(lastUrl.searchParams.get('accessId'), 'test-access-id');
    assert.equal(lastUrl.searchParams.get('id'), String(LUX_ID));
    assert.equal(lastUrl.searchParams.get('passlist'), '1');
    assert.equal(lastUrl.searchParams.get('operators'), 'CFL');
  });

  test('keeps only journeys passing through the destination stop', async () => {
    mockFetch(fixture);
    const schedule = await new CflInfoService('test-access-id').getSchedule(LUX_ID, ESCH_ID, 10);

    assert.equal(schedule.destination, 'Esch-sur-Alzette, Gare');
    // The fixture contains 16 departures, 4 of which pass through Esch.
    assert.equal(schedule.trains.length, 4);
    assert.deepEqual(
      schedule.trains.map((train) => train.time),
      ['15:33', '15:50', '16:03', '16:20'],
    );
    assert.ok(!Number.isNaN(Date.parse(schedule.timestamp)));
  });

  test('limits the result to maxConnections', async () => {
    mockFetch(fixture);
    const schedule = await new CflInfoService('test-access-id').getSchedule(LUX_ID, ESCH_ID, 2);

    assert.equal(schedule.trains.length, 2);
  });

  test('ignores journeys that only stop at the destination before the origin', async () => {
    mockFetch({
      Departure: [
        {
          stopExtId: String(LUX_ID),
          time: '08:00:00',
          date: '2026-09-21',
          Stops: {
            Stop: [
              { name: 'Esch-sur-Alzette, Gare', extId: String(ESCH_ID), routeIdx: 0 },
              { name: 'Luxembourg, Gare Centrale', extId: String(LUX_ID), routeIdx: 1 },
            ],
          },
        },
      ],
    });
    const schedule = await new CflInfoService('test-access-id').getSchedule(LUX_ID, ESCH_ID, 3);

    assert.deepEqual(schedule.trains, []);
  });

  test('reports delay and cancellation', async () => {
    mockFetch({
      Departure: [
        {
          stopExtId: String(LUX_ID),
          time: '08:00:00',
          date: '2026-09-21',
          rtTime: '08:07:00',
          rtDate: '2026-09-21',
          cancelled: true,
          Stops: {
            Stop: [
              { name: 'Luxembourg, Gare Centrale', extId: String(LUX_ID), routeIdx: 0 },
              { name: 'Esch-sur-Alzette, Gare', extId: String(ESCH_ID), routeIdx: 5 },
            ],
          },
        },
      ],
    });
    const schedule = await new CflInfoService('test-access-id').getSchedule(LUX_ID, ESCH_ID, 3);

    assert.deepEqual(schedule.trains, [{ time: '08:00', delay: 7, cancelled: true }]);
  });

  test('throws when the upstream API fails', async () => {
    mockFetch({}, { ok: false, statusText: 'Forbidden' });

    await assert.rejects(
      () => new CflInfoService('test-access-id').getSchedule(LUX_ID, ESCH_ID, 3),
      /Forbidden/,
    );
  });

  test('requires an access id', () => {
    const configured = process.env.MOBILITEIT_ACCESS_ID;
    delete process.env.MOBILITEIT_ACCESS_ID;
    try {
      assert.throws(() => new CflInfoService(), /MOBILITEIT_ACCESS_ID/);
    } finally {
      if (configured !== undefined) process.env.MOBILITEIT_ACCESS_ID = configured;
    }
  });
});

