const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Password validation: minimum 6 characters, at least 1 letter and 1 number
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least 1 letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least 1 number" };
  }
  return { valid: true };
};

const signup = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        message: "Invalid request body. Send JSON with name, email, password.",
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.error });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Signup successful",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        message: "Invalid request body. Send JSON with email and password.",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

module.exports = { signup, login };