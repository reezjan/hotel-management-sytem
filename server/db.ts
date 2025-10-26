import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure SSL for Neon compatibility
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech');
const client = postgres(process.env.DATABASE_URL, {
  ssl: isNeonDatabase ? 'require' : (process.env.NODE_ENV === 'production' ? 'require' : false),
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {},
});

export const db = drizzle(client, { schema });

// Graceful shutdown
process.on('beforeExit', () => {
  client.end({ timeout: 5 });
});
