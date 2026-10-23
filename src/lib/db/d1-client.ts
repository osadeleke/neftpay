import fs from "fs";
import path from "path";

export interface D1Result<T = any> {
  results: T[];
  success: boolean;
  meta?: {
    changes?: number;
    last_row_id?: number;
    duration?: number;
  };
}

export interface D1PreparedStatement {
  bind(...params: any[]): D1PreparedStatement;
  all<T = any>(): Promise<D1Result<T>>;
  first<T = any>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result<null>>;
}

export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(sql: string): Promise<D1Result<null>>;
}

/**
 * Cloudflare D1 REST API Client
 * Used when running on Vercel or external Node environments with Cloudflare credentials
 */
class CloudflareD1HttpClient implements D1Database {
  private accountId: string;
  private databaseId: string;
  private apiToken: string;
  private endpoint: string;

  constructor(accountId: string, databaseId: string, apiToken: string) {
    this.accountId = accountId;
    this.databaseId = databaseId;
    this.apiToken = apiToken;
    this.endpoint = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
  }

  private async executeQuery(sql: string, params: any[] = []): Promise<any> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudflare D1 HTTP error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(`Cloudflare D1 query error: ${JSON.stringify(data.errors || data)}`);
    }

    return data.result?.[0] || { results: [], success: true };
  }

  prepare(sql: string): D1PreparedStatement {
    let boundParams: any[] = [];
    const client = this;

    const statement: D1PreparedStatement = {
      bind(...params: any[]) {
        boundParams = params;
        return statement;
      },
      async all<T = any>(): Promise<D1Result<T>> {
        const queryRes = await client.executeQuery(sql, boundParams);
        return {
          results: (queryRes.results || []) as T[],
          success: true,
          meta: queryRes.meta,
        };
      },
      async first<T = any>(colName?: string): Promise<T | null> {
        const queryRes = await client.executeQuery(sql, boundParams);
        const firstRow = queryRes.results?.[0];
        if (!firstRow) return null;
        if (colName) return firstRow[colName] ?? null;
        return firstRow as T;
      },
      async run(): Promise<D1Result<null>> {
        const queryRes = await client.executeQuery(sql, boundParams);
        return {
          results: [],
          success: true,
          meta: queryRes.meta,
        };
      },
    };

    return statement;
  }

  async batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = [];
    for (const stmt of statements) {
      const res = await stmt.all<T>();
      results.push(res);
    }
    return results;
  }

  async exec(sql: string): Promise<D1Result<null>> {
    const queries = sql
      .split(";")
      .map((q) => q.trim())
      .filter(Boolean);

    for (const q of queries) {
      await this.executeQuery(q);
    }

    return { results: [], success: true };
  }
}

/**
 * Local SQLite Client (using Node.js built-in node:sqlite DatabaseSync)
 * Provides zero-configuration development out of the box with exact Cloudflare D1 parity.
 */
class LocalSqliteD1Client implements D1Database {
  private db: any;
  private initialized = false;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeRequire = (globalThis as any).require || eval("require");
      const { DatabaseSync } = nodeRequire("node:sqlite");
      
      const dbDir = path.join(process.cwd(), ".data");
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const dbPath = path.join(dbDir, "neftpay.sqlite");
      this.db = new DatabaseSync(dbPath);
      this.db.exec("PRAGMA journal_mode = WAL;");
      this.db.exec("PRAGMA foreign_keys = ON;");
      this.ensureSchema();
    } catch (err) {
      console.error("Failed to initialize local SQLite database:", err);
      throw err;
    }
  }

  private ensureSchema() {
    if (this.initialized) return;
    try {
      const schemaPath = path.join(process.cwd(), "schema.sql");
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, "utf-8");
        this.db.exec(sql);
      }
      // Safe migrations for newly added columns if table already existed
      try {
        this.db.exec("ALTER TABLE Merchants ADD COLUMN password_hash TEXT;");
      } catch {}
      try {
        this.db.exec("ALTER TABLE Merchants ADD COLUMN address TEXT;");
      } catch {}
      try {
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS VerificationCodes (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {}
      this.initialized = true;
    } catch (err) {
      console.warn("Schema initialization notice:", err);
    }
  }

  prepare(sql: string): D1PreparedStatement {
    this.ensureSchema();
    let boundParams: any[] = [];
    const db = this.db;

    const statement: D1PreparedStatement = {
      bind(...params: any[]) {
        boundParams = params.map((p) => (p === undefined ? null : p));
        return statement;
      },
      async all<T = any>(): Promise<D1Result<T>> {
        const stmt = db.prepare(sql);
        const rows = stmt.all(...boundParams);
        const plainRows = (rows || []).map((r: any) => ({ ...r }));
        return {
          results: plainRows as T[],
          success: true,
          meta: { changes: 0 },
        };
      },
      async first<T = any>(colName?: string): Promise<T | null> {
        const stmt = db.prepare(sql);
        const row = stmt.get(...boundParams);
        if (!row) return null;
        if (colName) return (row as any)[colName] ?? null;
        return { ...row } as T;
      },
      async run(): Promise<D1Result<null>> {
        const stmt = db.prepare(sql);
        const info = stmt.run(...boundParams);
        return {
          results: [],
          success: true,
          meta: {
            changes: info.changes,
            last_row_id: Number(info.lastInsertRowid),
          },
        };
      },
    };

    return statement;
  }

  async batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = [];
    for (const stmt of statements) {
      const res = await stmt.all<T>();
      results.push(res);
    }
    return results;
  }

  async exec(sql: string): Promise<D1Result<null>> {
    this.ensureSchema();
    this.db.exec(sql);
    return { results: [], success: true };
  }
}

let cachedD1Instance: D1Database | null = null;

/**
 * Returns the active D1 database client.
 * Automatically chooses:
 * 1. Cloudflare D1 REST HTTP API if CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN exist.
 * 2. Native Cloudflare Worker binding if process.env.DB exists.
 * 3. Local node:sqlite persistent instance for seamless local dev & preview.
 */
export function getD1Database(): D1Database {
  if (cachedD1Instance) {
    return cachedD1Instance;
  }

  // Check for Cloudflare Worker binding
  if ((process.env as any).DB && typeof (process.env as any).DB.prepare === "function") {
    cachedD1Instance = (process.env as any).DB as D1Database;
    return cachedD1Instance;
  }

  // Check for Cloudflare D1 HTTP API credentials
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    cachedD1Instance = new CloudflareD1HttpClient(accountId, databaseId, apiToken);
    return cachedD1Instance;
  }

  // Local fallback with exact D1 interface
  cachedD1Instance = new LocalSqliteD1Client();
  return cachedD1Instance;
}
