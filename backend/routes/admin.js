const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Order = require("../models/Order");

const router = express.Router();

const authenticateAdmin = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ success: false, message: "Authentication required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Invalid token" });

    const User = mongoose.model("User");
    const user = await User.findById(userId).select("email").lean();
    const admins = (process.env.ADMIN_EMAILS || "")
      .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);

    if (!user || !admins.includes(String(user.email).toLowerCase())) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.adminId = userId;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    console.error("Admin authentication error:", error);
    return res.status(500).json({ success: false, message: "Could not authorize admin" });
  }
};

router.get("/analytics", authenticateAdmin, async (req, res) => {
  try {
    const now = new Date();
    const to = req.query.to ? new Date(req.query.to) : now;
    const from = req.query.from ? new Date(req.query.from) : new Date(now.getTime() - 29 * 86400000);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    const dateMatch = { createdAt: { $gte: from, $lte: to } };
    const paidMatch = { ...dateMatch, paymentStatus: "paid" };
    const User = mongoose.model("User");

    const [orderStats, paidStats, dailySales, topProducts, statusBreakdown, customers] = await Promise.all([
      Order.aggregate([
        { $match: dateMatch },
        { $group: { _id: null, totalOrders: { $sum: 1 }, pendingOrders: { $sum: { $cond: [{ $in: ["$status", ["pending", "processing"]] }, 1, 0] } } } },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        { $group: { _id: null, revenuePaise: { $sum: "$amountPaise" }, paidOrders: { $sum: 1 }, averageOrderPaise: { $avg: "$amountPaise" } } },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenuePaise: { $sum: "$amountPaise" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", name: { $first: "$items.name" }, unitsSold: { $sum: "$items.quantity" }, revenuePaise: { $sum: "$items.lineTotalPaise" } } },
        { $sort: { revenuePaise: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: dateMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.countDocuments({ date: { $gte: from, $lte: to } }),
    ]);

    const orders = orderStats[0] || { totalOrders: 0, pendingOrders: 0 };
    const sales = paidStats[0] || { revenuePaise: 0, paidOrders: 0, averageOrderPaise: 0 };

    return res.json({
      success: true,
      range: { from: from.toISOString(), to: to.toISOString() },
      summary: {
        totalRevenuePaise: sales.revenuePaise,
        paidOrders: sales.paidOrders,
        totalOrders: orders.totalOrders,
        pendingOrders: orders.pendingOrders,
        averageOrderPaise: Math.round(sales.averageOrderPaise || 0),
        newCustomers: customers,
      },
      dailySales,
      topProducts,
      statusBreakdown,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return res.status(500).json({ success: false, message: "Could not load analytics" });
  }
});

module.exports = router;
