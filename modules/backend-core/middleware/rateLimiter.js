/**
 * Minimal in-memory, per-IP rate limiter.
 *
 * This protects against credential stuffing / brute force and general abuse
 * without adding a dependency. For multi-instance production deployments,
 * replace the Map with a shared store (Redis) or use express-rate-limit with
 * a shared adapter.
 */

const buckets = new Map();

const cleanup = () => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
};
const cleanupTimer = setInterval(cleanup, 60 * 1000);
if (typeof cleanupTimer.unref === "function") cleanupTimer.unref();

const createLimiter = ({ windowMs, max, keyPrefix }) => {
  return (req, res, next) => {
    const identifier = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    const retryAfter = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
    res.set("RateLimit-Limit", String(max));
    res.set("RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.set("RateLimit-Reset", String(retryAfter));

    if (bucket.count > max) {
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    return next();
  };
};

// Broad protection for the whole API.
export const apiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 300,
  keyPrefix: "api",
});

// Stricter protection for authentication endpoints.
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: "auth",
});

// Writes (POST/PUT/PATCH/DELETE) get a moderate cap.
export const writeLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  keyPrefix: "write",
});

export default createLimiter;
