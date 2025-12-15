const express = require("express");
const {
  createInvestment,
  getInvestments,
  getInvestment,
  updateInvestment,
  addPayment,
  getMyInvestments,
  deleteInvestment,
  requestIncrease,
  reviewIncreaseRequest,
} = require("../controllers/investmentController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.post("/", authenticate, authorize(ROLES.USER), createInvestment);
router.get("/my", authenticate, authorize(ROLES.USER), getMyInvestments);
router.post("/:id/increase-request", authenticate, authorize(ROLES.USER), requestIncrease);
router.post("/:id/increase-request/review", authenticate, authorize(ROLES.ADMIN), reviewIncreaseRequest);
router.get("/", authenticate, authorize(ROLES.ADMIN), getInvestments);
router.get("/:id", authenticate, authorize(ROLES.ADMIN), getInvestment);
router.put("/:id", authenticate, authorize(ROLES.ADMIN), updateInvestment);
router.post("/:id/payments", authenticate, authorize(ROLES.ADMIN, ROLES.USER), addPayment);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN), deleteInvestment);

module.exports = router;
