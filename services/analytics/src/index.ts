import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { AnalyticsServiceHandlers } from './service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = join(__dirname, '../../../proto/analytics.proto');
const PORT = process.env.GRPC_PORT || '50056';

// Load proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const analyticsProto = grpc.loadPackageDefinition(packageDefinition).analytics as any;

// Create and start server
function main() {
  const server = new grpc.Server();

  server.addService(analyticsProto.AnalyticsService.service, AnalyticsServiceHandlers);

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Failed to bind server:', err);
        return;
      }
      console.log(`Analytics Service listening on port ${port}`);
    }
  );
}

main();
