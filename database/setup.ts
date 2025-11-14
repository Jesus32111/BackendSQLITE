import { db } from './db';

/**
 * Asegura que todas las tablas necesarias existan en la base de datos.
 */
export async function setupDatabase() {
  try {
    const usersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'usuario',
        referral_code TEXT UNIQUE NOT NULL,
        referred_by TEXT,
        balance REAL NOT NULL DEFAULT 0.00,
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL
      );
    `;
    await db.execute(usersTable);
    console.log('[DB SETUP] ✅ Tabla "users" verificada/creada.');
  } catch (error) {
    console.error('[DB SETUP ERROR] Falló la configuración de la base de datos:', error);
    process.exit(1);
  }
}
