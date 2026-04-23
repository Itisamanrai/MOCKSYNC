const express = require("express");
const { signup, login } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", verifyToken, (req, res) => {
    return res.status(200).json({
        message: "Authorized user",
        user: req.user,
    });
});


module.exports = router;
