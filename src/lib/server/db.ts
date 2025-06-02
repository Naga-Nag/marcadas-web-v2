import { formatTime, getEstado } from '$lib/utils';
import sql from 'mssql';


const sqlConfig = {
  user: Bun.env.DB_UID!,
  password: Bun.env.DB_PW!,
  database: Bun.env.DB!,
  server: Bun.env.DB_IP!,
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 3000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  stream: true,  // Enable streaming
};


export let connection: sql.ConnectionPool = await sql.connect(sqlConfig);;


/**
 * Checks the database connection by attempting to connect and then immediately disconnect.
 * @returns {Promise<boolean>} A promise that resolves to true if the connection is successful, or false if it fails.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  const timeout = new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000));

  try {
    await Promise.race([connection?.connect(), timeout]);
    return true;
  } catch (error) {
    console.error('Error checking database connection:', error);
    return false;
  } finally {
    if (connection?.connected) {
      connection.close();
    }
  }
}

export function processRow(row: any) {
  row.Marcada = formatTime(row.Marcada);
  row.Estado = getEstado(row);
  row.MR = row.MR ? row.MR : '';
  row.CUIL = row.CUIL ? row.CUIL : '';
  row.Jornada = row.Jornada ? row.Jornada : '';
  return row;
}





