import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __pgSql: Sql | undefined;
}

export function getSql(): Sql {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not configured");
  }
  if (!globalThis.__pgSql) {
    globalThis.__pgSql = postgres(process.env.DATABASE_URL, {
      max: 3,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      connect_timeout: 10,
      ssl: "require",
      prepare: false,
    });
  }
  return globalThis.__pgSql;
}
