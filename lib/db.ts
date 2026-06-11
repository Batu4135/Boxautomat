import "server-only";

import postgres from "postgres";

import { getDatabaseUrl } from "@/lib/env";

const globalForDatabase = globalThis as typeof globalThis & {
  postgresClient?: postgres.Sql;
};

export function getSql() {
  if (!globalForDatabase.postgresClient) {
    globalForDatabase.postgresClient = postgres(getDatabaseUrl(), {
      prepare: false
    });
  }

  return globalForDatabase.postgresClient;
}
