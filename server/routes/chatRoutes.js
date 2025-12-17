const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatController");

// POST /api/chat - Send a message to the AI assistant
router.post("/", chat);

module.exports = router;
