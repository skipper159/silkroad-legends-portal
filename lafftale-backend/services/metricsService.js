const cache = require('../utils/cache');

const METRIC_KEYS = {
  PLAYERS_ONLINE: 'players_online_count',
};

/**
 * Set players online count in cache
 * @param {number} count
 * @param {number} ttlSeconds
 */
async function setPlayersOnline(count, ttlSeconds = 120) {
  try {
    await cache.set(METRIC_KEYS.PLAYERS_ONLINE, Number(count), ttlSeconds);
    return true;
  } catch (error) {
    console.error('Failed to set players online metric', error);
    return false;
  }
}

/**
 * Get players online count from cache
 */
async function getPlayersOnline() {
  try {
    const v = await cache.get(METRIC_KEYS.PLAYERS_ONLINE);
    return typeof v === 'number' ? v : null;
  } catch (error) {
    console.error('Failed to get players online metric', error);
    return null;
  }
}

module.exports = { setPlayersOnline, getPlayersOnline, METRIC_KEYS };
