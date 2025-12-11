const express = require("express");
const { getSummary } = require("../controllers/analyticsController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.get(
  "/summary",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.PROPERTY_HANDLER),
  getSummary
);

module.exports = router;
