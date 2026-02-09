const rateLimit = require("express-rate-limit");

const buildLimiter = (options = {}) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please slow down and try again." },
    ...options,
  });

const generalLimiter = buildLimiter({ windowMs: 15 * 60 * 1000, max: 5000 });

const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many auth attempts. Try again in 15 minutes." },
});

const wishlistLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: { message: "You are adding wishlist items too quickly. Please wait a minute before trying again." },
  keyGenerator: (req) => (req.user ? req.user.id : req.ip),
});

module.exports = {
  generalLimiter,
  authLimiter,
  wishlistLimiter,
};
