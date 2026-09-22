import type { Train, TrainSchedule, TrainService } from './model.js';

const mobiliteitURL = "https://cdt.hafas.de/opendata/apiserver"

/** Subset of the HAFAS `Stop` object we rely on. */
interface HafasStop {
  name: string;
  extId?: string;
  mainMastExtId?: string;
  routeIdx?: number;
  cancelled?: boolean;
}

/** Subset of the HAFAS `Departure` object we rely on. */
interface HafasDeparture {
  stopExtId?: string;
  time: string;
  date: string;
  rtTime?: string;
  rtDate?: string;
  cancelled?: boolean;
  Stops?: { Stop?: HafasStop[] };
}

interface HafasDepartureBoard {
  Departure?: HafasDeparture[];
}

/** "HH:MM:SS" -> "HH:MM". */
function toDisplayTime(time: string): string {
  return time.slice(0, 5);
}

/** Delay in whole minutes between scheduled and real-time departure. */
function delayMinutes(departure: HafasDeparture): number {
  if (!departure.rtTime) return 0;
  const scheduled = new Date(`${departure.date}T${departure.time}`);
  const actual = new Date(`${departure.rtDate ?? departure.date}T${departure.rtTime}`);
  return Math.max(0, Math.round((actual.getTime() - scheduled.getTime()) / 60_000));
}

/** Index of the departure stop within the journey, or 0 if unknown. */
function departureRouteIdx(departure: HafasDeparture): number {
  const stops = departure.Stops?.Stop ?? [];
  return stops.find((stop) => stop.extId === departure.stopExtId)?.routeIdx ?? 0;
}

/**
 * Returns the stop matching `toId` that the journey reaches *after* the
 * departure stop, or `undefined` if the journey does not pass through it.
 */
function findDestinationStop(departure: HafasDeparture, toId: number): HafasStop | undefined {
  const target = toId.toString();
  const fromIdx = departureRouteIdx(departure);
  return (departure.Stops?.Stop ?? []).find(
    (stop) =>
      (stop.extId === target || stop.mainMastExtId === target) && (stop.routeIdx ?? 0) > fromIdx,
  );
}

function toTrain(departure: HafasDeparture, destinationStop: HafasStop): Train {
  return {
    time: toDisplayTime(departure.time),
    delay: delayMinutes(departure),
    cancelled: Boolean(departure.cancelled ?? destinationStop.cancelled ?? false),
  };
}

export class CflInfoService implements TrainService {
    private readonly accessId: string;

    /**
     * @param accessId mobiliteit.lu API access id; defaults to the
     *   `MOBILITEIT_ACCESS_ID` environment variable (see `.env.example`).
     */
    constructor(accessId: string | undefined = process.env.MOBILITEIT_ACCESS_ID) {
        if (!accessId) throw new Error('Missing mobiliteit.lu access id (MOBILITEIT_ACCESS_ID)');
        this.accessId = accessId;
    }

    async getSchedule(fromId: number, toId: number, maxConnections: number): Promise<TrainSchedule> {
        // Fetch trains departing from station fromId
        const url = new URL(`${mobiliteitURL}/departureBoard`);
        url.search = new URLSearchParams({
            accessId: this.accessId,
            format: 'json',
            id: fromId.toString(),
            passlist: '1',
            operators: 'CFL',
            lines: 'RB,RE',
        }).toString();
        const response = await fetch(url);

        if(!response.ok) throw new Error(response.statusText);

        const board = (await response.json()) as HafasDepartureBoard;

        // Keep only journeys that pass through the stop with extId=toId
        const matches = (board.Departure ?? [])
          .map((departure) => ({ departure, destinationStop: findDestinationStop(departure, toId) }))
          .filter(
            (match): match is { departure: HafasDeparture; destinationStop: HafasStop } =>
              match.destinationStop !== undefined,
          )
          .slice(0, maxConnections);

        return {
          destination: matches[0]?.destinationStop.name ?? toId.toString(),
          timestamp: new Date().toISOString(),
          trains: matches.map(({ departure, destinationStop }) => toTrain(departure, destinationStop)),
        };
    }
}