import type { TrainService } from './model.js';
import { MockTrainService } from './service-mock.js';
import { CflInfoService } from './service.js';
import { buildServer } from './server.js';

const PORT: number = parseInt(process.env.PORT || '3000', 10);
const HOST: string = '0.0.0.0';

/**
 * Uses the real CFL service when an access id is configured
 * (`MOBILITEIT_ACCESS_ID`), otherwise falls back to mock data.
 */
const accessId = process.env.MOBILITEIT_ACCESS_ID;
const trainService: TrainService = accessId
  ? new CflInfoService(accessId)
  : new MockTrainService();

const fastify = await buildServer(trainService);

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
