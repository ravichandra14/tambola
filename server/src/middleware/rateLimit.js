const buckets = new Map();

const createRateLimiter = ({ windowMs = 60_000, max = 30 } = {}) => (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = buckets.get(key);

  if (!current || current.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return next();
  }

  current.count += 1;
  if (current.count > max) {
    res.set('Retry-After', Math.ceil((current.expiresAt - now) / 1000).toString());
    return res.status(429).json({ success: false, message: 'Too many requests; please try again shortly' });
  }
  return next();
};

module.exports = { createRateLimiter };
