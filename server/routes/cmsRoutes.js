const express = require("express");
const { getAllSections, getSection, updateSection } = require("../controllers/cmsController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.get("/", getAllSections);
router.get("/:key", getSection);
router.put(
  "/:key",
  authenticate,
  authorize(ROLES.ADMIN),
  updateSection
);

module.exports = router;
