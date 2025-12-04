const express = require("express");
const {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
} = require("../controllers/wishlistController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { wishlistLimiter } = require("../middleware/rateLimiter");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.use(authenticate, authorize(ROLES.USER, ROLES.ADMIN, ROLES.EMPLOYEE));

router.get("/", getWishlist);
router.post("/", wishlistLimiter, addWishlistItem);
router.delete("/:id", removeWishlistItem);

module.exports = router;
