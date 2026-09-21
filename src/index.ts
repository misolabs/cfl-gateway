import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';

const fastify: FastifyInstance = Fastify({ logger: true });
const PORT: number = parseInt(process.env.PORT || '3000', 10);
const HOST: string = '0.0.0.0';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

interface DataItem {
  id: number;
  name: string;
  value: number;
}

interface MockDataResponse {
  success: boolean;
  data: {
    message: string;
    timestamp: string;
    version: string;
    items: DataItem[];
  };
}

// Register CORS plugin
await fastify.register(cors, {
  origin: true,
});

// Health check endpoint
fastify.get<{ Reply: HealthCheckResponse }>(
  '/health',
  async (request: FastifyRequest, reply: FastifyReply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
);

// Mock endpoint
fastify.get<{ Reply: MockDataResponse }>(
  '/api/data',
  async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      success: true,
      data: {
        message: 'Hello from CFL Gateway',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        items: [
          { id: 1, name: 'Item 1', value: 100 },
          { id: 2, name: 'Item 2', value: 200 },
          { id: 3, name: 'Item 3', value: 300 }
        ]
      }
    };
  }
);

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

