const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
