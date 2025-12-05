const express = require("express");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.get("/", getProjects);
router.post("/", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), createProject);
router.put("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), updateProject);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE), deleteProject);

module.exports = router;
