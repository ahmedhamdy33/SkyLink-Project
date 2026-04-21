import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();

const required = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_DATABASE'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.warn(`Missing database environment variables: ${missing.join(', ')}`);
}

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'SkyLink',
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === 'true',
    trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERTIFICATE ?? 'true').toLowerCase() !== 'false'
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

export function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log('Connected to SQL Server');
        return pool;
      })
      .catch((error) => {
        poolPromise = null;
        console.error('SQL Server connection failed:', error.message);
        throw error;
      });
  }

  return poolPromise;
}

export { sql };
