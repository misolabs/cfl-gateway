import type { Train, TrainSchedule, TrainService } from './model.js';

const DESTINATIONS = ['Esch/Alzette', 'Luxembourg'] as const;
const DEPARTURE_TIMES = ['07:00', '07:15', '07:30'] as const;
const MAX_DELAY_MINUTES = 15;
/** 5:1 ratio of running to cancelled trains, i.e. 1 in 6 is cancelled. */
const CANCELLED_PROBABILITY = 1 / 6;

/** Random integer in [min, max], both inclusive. */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDestination(): string {
  return DESTINATIONS[randomInt(0, DESTINATIONS.length - 1)]!;
}

function buildTrains(): Train[] {
  return DEPARTURE_TIMES.map((time) => ({
    time,
    delay: randomInt(0, MAX_DELAY_MINUTES),
    cancelled: Math.random() < CANCELLED_PROBABILITY,
  }));
}

/**
 * {@link TrainService} implementation returning randomly generated data.
 *
 * See `briefings/mock.md` for the generation rules.
 */
export class MockTrainService implements TrainService {
  async getSchedule(): Promise<TrainSchedule> {
    return {
      destination: randomDestination(),
      timestamp: new Date().toISOString(),
      trains: buildTrains(),
    };
  }
}

