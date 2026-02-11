import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { MessagingServiceHandlers } from './service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = join(__dirname, '../../../proto/messaging.proto');
const PORT = process.env.GRPC_PORT || '50055';

// Load proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const messagingProto = grpc.loadPackageDefinition(packageDefinition).messaging as any;

// Create and start server
function main() {
  const server = new grpc.Server();

  server.addService(messagingProto.MessagingService.service, MessagingServiceHandlers);

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Failed to bind server:', err);
        return;
      }
      console.log(`Messaging Service listening on port ${port}`);
    }
  );
}

main();
