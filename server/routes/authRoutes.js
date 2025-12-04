const express = require("express");
const { body } = require("express-validator");
const { register, login, getProfile } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password")
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters long.")
      .matches(/[a-z]/)
      .withMessage("Password must include a lowercase letter.")
      .matches(/[A-Z]/)
      .withMessage("Password must include an uppercase letter.")
      .matches(/\d/)
      .withMessage("Password must include a number.")
      .matches(/[^A-Za-z0-9]/)
      .withMessage("Password must include a special character."),
  ],
  register
);

router.post(
  "/login",
  authLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  login
);

router.get("/me", authenticate, getProfile);

module.exports = router;
