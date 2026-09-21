import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import type { HealthCheckResponse, TrainSchedule, TrainService } from './model.js';
import { MockTrainService } from './service-mock.js';

const fastify: FastifyInstance = Fastify({ logger: true });
const PORT: number = parseInt(process.env.PORT || '3000', 10);
const HOST: string = '0.0.0.0';

// Swap this for the real implementation once it is available.
const trainService: TrainService = new MockTrainService();

// Register CORS plugin
await fastify.register(cors, {
  origin: true,
});

// Health check endpoint
fastify.get<{ Reply: HealthCheckResponse }>('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Train schedule endpoint
fastify.get<{ Reply: TrainSchedule }>('/api/data', async () => {
  return trainService.getSchedule();
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
