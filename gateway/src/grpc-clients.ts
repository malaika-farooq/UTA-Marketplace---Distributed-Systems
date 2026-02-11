import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// gRPC service addresses from environment
const AUTH_ADDR = process.env.AUTH_GRPC_ADDR || 'auth:50051';
const LISTING_ADDR = process.env.LISTING_GRPC_ADDR || 'listing:50052';
const SEARCH_ADDR = process.env.SEARCH_GRPC_ADDR || 'search:50053';
const USER_ADDR = process.env.USER_GRPC_ADDR || 'user:50054';
const MESSAGING_ADDR = process.env.MESSAGING_GRPC_ADDR || 'messaging:50055';
const ANALYTICS_ADDR = process.env.ANALYTICS_GRPC_ADDR || 'analytics:50056';

function loadProto(protoFile: string) {
  const PROTO_PATH = join(__dirname, '../../proto', protoFile);
  return protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
}

// Load all proto definitions
const authPackageDef = loadProto('auth.proto');
const listingPackageDef = loadProto('listing.proto');
const searchPackageDef = loadProto('search.proto');
const userPackageDef = loadProto('user.proto');
const messagingPackageDef = loadProto('messaging.proto');
const analyticsPackageDef = loadProto('analytics.proto');

// Create gRPC clients
export const authClient = new (grpc.loadPackageDefinition(authPackageDef).auth as any).AuthService(
  AUTH_ADDR,
  grpc.credentials.createInsecure()
);

export const listingClient = new (grpc.loadPackageDefinition(listingPackageDef).listing as any).ListingService(
  LISTING_ADDR,
  grpc.credentials.createInsecure()
);

export const searchClient = new (grpc.loadPackageDefinition(searchPackageDef).search as any).SearchService(
  SEARCH_ADDR,
  grpc.credentials.createInsecure()
);

export const userClient = new (grpc.loadPackageDefinition(userPackageDef).user as any).UserService(
  USER_ADDR,
  grpc.credentials.createInsecure()
);

export const messagingClient = new (grpc.loadPackageDefinition(messagingPackageDef).messaging as any).MessagingService(
  MESSAGING_ADDR,
  grpc.credentials.createInsecure()
);

export const analyticsClient = new (grpc.loadPackageDefinition(analyticsPackageDef).analytics as any).AnalyticsService(
  ANALYTICS_ADDR,
  grpc.credentials.createInsecure()
);

console.log('gRPC clients initialized:');
console.log('  Auth:', AUTH_ADDR);
console.log('  Listing:', LISTING_ADDR);
console.log('  Search:', SEARCH_ADDR);
console.log('  User:', USER_ADDR);
console.log('  Messaging:', MESSAGING_ADDR);
console.log('  Analytics:', ANALYTICS_ADDR);
