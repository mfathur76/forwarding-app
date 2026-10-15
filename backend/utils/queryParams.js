function parseSearch(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseLimit(value, fallback = 20, max = 100) {
  const parsed = Number(value ?? fallback);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function parseOffset(value, fallback = 0) {
  const parsed = Number(value ?? fallback);

  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

module.exports = {
  parseSearch,
  parseLimit,
  parseOffset,
};
