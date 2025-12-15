const express = require("express");
const {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequests,
  updateRentalRequest,
  deleteRentalRequest,
} = require("../controllers/rentalController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.post("/requests", authenticate, authorize(ROLES.USER), createRentalRequest);
router.get("/my", authenticate, authorize(ROLES.USER), getMyRentalRequests);
router.get("/requests", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.PROPERTY_HANDLER), getRentalRequests);
router.put("/requests/:id", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.PROPERTY_HANDLER), updateRentalRequest);
router.delete(
  "/requests/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.PROPERTY_HANDLER),
  deleteRentalRequest
);

module.exports = router;
