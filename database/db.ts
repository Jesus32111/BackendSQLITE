import { createClient, Client } from '@libsql/client';

/**
 * Inicializa y devuelve la conexión segura a la base de datos Turso/libSQL.
 * @returns {Client} La instancia del cliente de la base de datos.
 */
export const initializeDatabase = (): Client => {
  // Las variables de entorno se cargan en server.ts
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("[DB ERROR] TURSO_DATABASE_URL o TURSO_AUTH_TOKEN no están definidos. Verifique el archivo .env");
    process.exit(1);
  }

  try {
    const db = createClient({
      url: url,
      authToken: authToken,
    });

    // Prueba de conexión (Inyección/Log de verificación)
    db.execute("SELECT 1").then(() => {
        console.log(`[DB] ✅ Conexión exitosa a Turso/libSQL.`);
    }).catch(error => {
        console.error("[DB ERROR] ❌ Falló la prueba de conexión a Turso. Verifique URL/Token:", error.message);
        // En un entorno real, esto debería ser un error fatal.
        // process.exit(1); // Comentado para permitir que el servidor Express se inicie si la red falla temporalmente.
    });

    return db;
  } catch (error) {
    console.error("[DB ERROR] No se pudo inicializar el cliente de Turso:", error);
    process.exit(1);
  }
};

// Exportar la instancia de la base de datos para ser utilizada en el servidor
export const db = initializeDatabase();
