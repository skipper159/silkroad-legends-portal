const cache = require('../utils/cache');

const METRIC_KEYS = {
  PLAYERS_ONLINE: 'players_online_count',
};

/**
 * Set players online count in cache
 * @param {number} count
 * @param {number} ttlSeconds
 */
function setPlayersOnline(count, ttlSeconds = 120) {
  try {
    cache.set(METRIC_KEYS.PLAYERS_ONLINE, Number(count), ttlSeconds);
    return true;
  } catch (error) {
    console.error('Failed to set players online metric', error);
    return false;
  }
}

/**
 * Get players online count from cache
 */
function getPlayersOnline() {
  const v = cache.get(METRIC_KEYS.PLAYERS_ONLINE);
  return typeof v === 'number' ? v : null;
}

module.exports = { setPlayersOnline, getPlayersOnline, METRIC_KEYS };
