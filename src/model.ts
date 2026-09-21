/** A single train departure. */
export interface Train {
  /** Departure time for display, e.g. "07:00". */
  time: string;
  /** Delay in minutes. */
  delay: number;
  cancelled: boolean;
}

/** Train schedule information for a destination. */
export interface TrainSchedule {
  destination: string;
  /** ISO 8601 date-time. */
  timestamp: string;
  trains: Train[];
}

/**
 * Source of train schedule information.
 *
 * Implemented by {@link MockTrainService} for development; a real
 * implementation backed by the upstream CFL API can be added later.
 */
export interface TrainService {
  getSchedule(): Promise<TrainSchedule>;
}

/** Response of the health check endpoint. */
export interface HealthCheckResponse {
  status: string;
  /** ISO 8601 date-time. */
  timestamp: string;
}

