const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { handleImageUpload } = require("../controllers/uploadController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.post(
  "/image",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  upload.single("image"),
  handleImageUpload
);

module.exports = router;
