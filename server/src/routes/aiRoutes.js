const express = require("express");

const router = express.Router();

const { getAiFeedback } = require("../controllers/aiController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/feedback", verifyToken, getAiFeedback);

module.exports = router;