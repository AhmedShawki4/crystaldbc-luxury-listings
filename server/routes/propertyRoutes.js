const express = require("express");
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), createProperty);
router.put("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), updateProperty);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), deleteProperty);

module.exports = router;
