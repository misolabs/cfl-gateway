import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import type { HealthCheckResponse, TrainSchedule, TrainService } from './model.js';

/** Default stations and connection count (see `briefings/mobiliteitAPI.md`). */
export const DEFAULT_FROM_ID = 300031019; // Luxembourg, Gare Centrale
export const DEFAULT_TO_ID = 300439001; // Esch-sur-Alzette, Gare
export const DEFAULT_MAX_CONNECTIONS = 3;

interface ScheduleQuery {
  from?: number;
  to?: number;
  max?: number;
}

/** Builds the Fastify instance with all routes registered. */
export async function buildServer(
  trainService: TrainService,
  options: { logger?: boolean } = {},
): Promise<FastifyInstance> {
  const fastify: FastifyInstance = Fastify({ logger: options.logger ?? true });

  await fastify.register(cors, { origin: true });

  // Health check endpoint
  fastify.get<{ Reply: HealthCheckResponse }>('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Train schedule endpoint
  fastify.get<{ Querystring: ScheduleQuery; Reply: TrainSchedule }>('/api/data', async (request) => {
    const {
      from = DEFAULT_FROM_ID,
      to = DEFAULT_TO_ID,
      max = DEFAULT_MAX_CONNECTIONS,
    } = request.query;
    return trainService.getSchedule(Number(from), Number(to), Number(max));
  });

  return fastify;
}

