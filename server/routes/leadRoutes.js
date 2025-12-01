const express = require("express");
const {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.post("/", createLead);
router.get("/", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), getLeads);
router.put("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), updateLead);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), deleteLead);

module.exports = router;
