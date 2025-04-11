const sql = require("mssql");

// Gemeinsame Datenbankoptionen
const commonOptions = {
  encrypt: false,
  trustServerCertificate: true,
};

// Konfiguration für die primäre Webanwendungsdatenbank
const webConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: commonOptions,
};

// Konfiguration für die Gamedatenbank_Account
const gameConfig = {
  user: process.env.DB_GAME_USER || process.env.DB_USER,
  password: process.env.DB_GAME_PASSWORD || process.env.DB_PASSWORD,
  server: process.env.DB_GAME_SERVER || process.env.DB_SERVER,
  database: process.env.DB_GAME_DATABASE,
  options: commonOptions,
};

// Konfiguration für die Gamedatenbank_LOG
const logConfig = {
  user: process.env.DB_LOG_USER || process.env.DB_USER,
  password: process.env.DB_LOG_PASSWORD || process.env.DB_PASSWORD,
  server: process.env.DB_LOG_SERVER || process.env.DB_SERVER,
  database: process.env.DB_LOG_DATABASE,
  options: commonOptions,
};

// Konfiguration für die Gamedatenbank_Character
const charConfig = {
  user: process.env.DB_CHAR_USER || process.env.DB_USER,
  password: process.env.DB_CHAR_PASSWORD || process.env.DB_PASSWORD,
  server: process.env.DB_CHAR_SERVER || process.env.DB_SERVER,
  database: process.env.DB_CHAR_DATABASE,
  options: commonOptions,
};

// Pools für die verschiedenen Datenbanken erstellen
const webPool = new sql.ConnectionPool(webConfig);
const gamePool = new sql.ConnectionPool(gameConfig);
const logPool = new sql.ConnectionPool(logConfig);
const charPool = new sql.ConnectionPool(charConfig);

// Verbindungen initialisieren
const webPoolConnect = webPool.connect();
const gamePoolConnect = gamePool.connect();
const logPoolConnect = logPool.connect();
const charPoolConnect = charPool.connect();

// Hilfsfunktion für Fehlerbehandlung bei Datenbankverbindungen
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
  // Original-Pool für Abwärtskompatibilität
  pool: webPool,
  poolConnect: webPoolConnect,
  
  // Benannte Pools für spezifischen Zugriff
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
