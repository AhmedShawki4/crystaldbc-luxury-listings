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
router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.PROPERTY_HANDLER),
  createProperty
);
router.put(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.PROPERTY_HANDLER),
  updateProperty
);
router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.PROPERTY_HANDLER),
  deleteProperty
);

module.exports = router;
