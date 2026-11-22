const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ success: false, message: "Access denied" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.user?.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    req.userId = payload.user.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// A customer can only retrieve their own orders.
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch customer orders error:", error);
    return res.status(500).json({ success: false, message: "Could not fetch your orders" });
  }
});

module.exports = router;
