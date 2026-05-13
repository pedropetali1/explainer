import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not configured");
    }
    _sql = postgres(process.env.DATABASE_URL, {
      max: 5,
      ssl: "require",
      prepare: false,
    });
  }
  return _sql;
}
