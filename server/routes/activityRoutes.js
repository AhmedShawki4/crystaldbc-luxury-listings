const express = require("express");
const { getActivityLogs } = require("../controllers/activityLogController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.get("/", authenticate, authorize(ROLES.ADMIN), getActivityLogs);

module.exports = router;
