const express = require("express");
const {
  getInvestmentBoxes,
  getAllInvestmentBoxes,
  createInvestmentBox,
  updateInvestmentBox,
  deleteInvestmentBox,
} = require("../controllers/investmentBoxController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.get("/", getInvestmentBoxes);
router.get("/all", authenticate, authorize(ROLES.ADMIN), getAllInvestmentBoxes);
router.post("/", authenticate, authorize(ROLES.ADMIN), createInvestmentBox);
router.put("/:id", authenticate, authorize(ROLES.ADMIN), updateInvestmentBox);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN), deleteInvestmentBox);

module.exports = router;
