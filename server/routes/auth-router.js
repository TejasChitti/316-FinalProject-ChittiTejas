const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user-model");
const { auth } = require("../auth/index");

// Register
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("userName").trim().notEmpty(),
    body("password").isLength({ min: 8 }),
    body("avatarImage").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, userName, password, avatarImage } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Create new user
      const user = new User({
        email,
        userName,
        password,
        avatarImage,
      });

      await user.save();

      res.status(201).json({
        message: "User created successfully",
        userId: user._id,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName,
          avatarImage: user.avatarImage,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        userName: req.user.userName,
        avatarImage: req.user.avatarImage,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update account
router.put(
  "/update",
  auth,
  [
    body("userName").optional().trim().notEmpty(),
    body("password").optional().isLength({ min: 8 }),
    body("avatarImage").optional().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userName, password, avatarImage } = req.body;
      const user = req.user;

      if (userName) user.userName = userName;
      if (avatarImage) user.avatarImage = avatarImage;
      if (password) user.password = password; // Will be hashed by pre-save hook

      await user.save();

      res.json({
        message: "Account updated successfully",
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName,
          avatarImage: user.avatarImage,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
