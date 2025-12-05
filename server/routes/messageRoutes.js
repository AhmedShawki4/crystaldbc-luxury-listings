const express = require("express");
const {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
} = require("../controllers/messageController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.post("/", createMessage);
router.get("/", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), getMessages);
router.patch("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), updateMessageStatus);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN), deleteMessage);

module.exports = router;
