const express = require("express");
const router = express.Router();

// Health check route
router.get("/", (req, res) => {
    res.send("MockSync backend is running");
});

const authRoutes = require("./authRoutes");
router.use("/auth", authRoutes);

const aiRoutes = require("./aiRoutes");
router.use("/ai", aiRoutes);

module.exports = router;
