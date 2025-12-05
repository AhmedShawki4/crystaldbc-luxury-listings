const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { ROLES } = require("../utils/constants");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: ROLES.USER,
    });

    res.status(201).json({
      user: sanitizeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error", error.message);
    res.status(500).json({ message: "Failed to register" });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      user: sanitizeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error", error.message);
    res.status(500).json({ message: "Failed to login" });
  }
};

exports.getProfile = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};
