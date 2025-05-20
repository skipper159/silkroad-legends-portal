const sql = require("mssql");

// Common database options
const commonOptions = {
  encrypt: false,
  trustServerCertificate: true,
};

// Configuration for the primary web application database
const webConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: commonOptions,
};

// Configuration for the game database_Account
const gameConfig = {
  user: process.env.DB_GAME_USER || process.env.DB_USER,
  password: process.env.DB_GAME_PASSWORD || process.env.DB_PASSWORD,
  server: process.env.DB_GAME_SERVER || process.env.DB_SERVER,
  database: process.env.DB_GAME_DATABASE,
  options: commonOptions,
};

// Configuration for the game database_LOG
const logConfig = {
  user: process.env.DB_LOG_USER || process.env.DB_USER,
  password: process.env.DB_LOG_PASSWORD || process.env.DB_PASSWORD,
  server: process.env.DB_LOG_SERVER || process.env.DB_SERVER,
  database: process.env.DB_LOG_DATABASE,
  options: commonOptions,
};

// Configuration for the game database_Character
const charConfig = {
  user: process.env.DB_CHAR_USER || process.env.DB_USER,
  password: process.env.DB_CHAR_PASSWORD || process.env.DB_PASSWORD,
  server: process.env.DB_CHAR_SERVER || process.env.DB_SERVER,
  database: process.env.DB_CHAR_DATABASE,
  options: commonOptions,
};

// Create pools for the different databases
const webPool = new sql.ConnectionPool(webConfig);
const gamePool = new sql.ConnectionPool(gameConfig);
const logPool = new sql.ConnectionPool(logConfig);
const charPool = new sql.ConnectionPool(charConfig);

// Initialize connections
const webPoolConnect = webPool.connect();
const gamePoolConnect = gamePool.connect();
const logPoolConnect = logPool.connect();
const charPoolConnect = charPool.connect();

// Helper function for error handling with database connections
const getConnection = async (pool, poolConnect, dbName) => {
  try {
    await poolConnect;
    return pool;
  } catch (err) {
    console.error(`Error connecting to ${dbName} database:`, err);
    throw err;
  }
};

module.exports = {
  sql,
  // Original pool for backward compatibility
  pool: webPool,
  poolConnect: webPoolConnect,
  
  // Named pools for specific access
  webPool,
  gamePool,
  logPool,
  charPool,
  
  // Asynchrone Funktionen für den Zugriff auf Verbindungen
  getWebDb: () => getConnection(webPool, webPoolConnect, "web"),
  getGameDb: () => getConnection(gamePool, gamePoolConnect, "game"),
  getLogDb: () => getConnection(logPool, logPoolConnect, "log"),
  getCharDb: () => getConnection(charPool, charPoolConnect, "char"),
};
