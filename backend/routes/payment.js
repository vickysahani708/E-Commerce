const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
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

const getRazorpayAuth = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const error = new Error("Razorpay credentials are not configured");
    error.statusCode = 503;
    throw error;
  }
  return {
    keyId,
    authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
  };
};

// Create a Razorpay order using prices read from MongoDB, never from the client.
router.post("/create-order", authenticate, async (req, res) => {
  try {
    const User = mongoose.model("User");
    const Products = mongoose.model("Products");
    const user = await User.findById(req.userId).select("cartData");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const cart = user.cartData || {};
    const cartEntries = Object.entries(cart)
      .map(([id, quantity]) => ({ id: Number(id), quantity: Number(quantity) }))
      .filter((item) => Number.isSafeInteger(item.id) && item.id > 0 && item.quantity > 0);

    if (!cartEntries.length) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }
    if (cartEntries.some((item) => !Number.isSafeInteger(item.quantity) || item.quantity > 99)) {
      return res.status(400).json({ success: false, message: "Invalid cart quantity" });
    }

    const productIds = cartEntries.map((item) => item.id);
    const products = await Products.find({ id: { $in: productIds }, available: true });
    const productMap = new Map(products.map((product) => [product.id, product]));

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are unavailable. Please refresh your cart.",
      });
    }

    const items = cartEntries.map(({ id, quantity }) => {
      const product = productMap.get(id);
      const unitPricePaise = Math.round(Number(product.new_price) * 100);
      if (!Number.isSafeInteger(unitPricePaise) || unitPricePaise <= 0) {
        throw new Error(`Invalid price configured for product ${id}`);
      }
      return {
        productId: product.id,
        name: product.name,
        image: product.image || "",
        quantity,
        unitPricePaise,
        lineTotalPaise: unitPricePaise * quantity,
      };
    });

    const amountPaise = items.reduce((sum, item) => sum + item.lineTotalPaise, 0);
    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
      return res.status(400).json({ success: false, message: "Invalid order amount" });
    }

    const { keyId, authorization } = getRazorpayAuth();
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `shop-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
        notes: { userId: String(req.userId) },
      }),
    });

    const razorpayData = await razorpayResponse.json();
    if (!razorpayResponse.ok) {
      console.error("Razorpay order creation failed:", razorpayData);
      return res.status(502).json({ success: false, message: "Unable to start payment. Please try again." });
    }

    const order = await Order.create({
      user: req.userId,
      items,
      amountPaise,
      currency: "INR",
      status: "pending",
      paymentStatus: "created",
      paymentProvider: "razorpay",
      razorpayOrderId: razorpayData.id,
    });

    return res.status(201).json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayData.id,
      amount: razorpayData.amount,
      currency: razorpayData.currency,
      keyId,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Could not create payment order",
    });
  }
});

// Verify the Razorpay signature before marking an order as paid.
router.post("/verify-payment", authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification details are required" });
    }

    const { keyId } = getRazorpayAuth();
    void keyId;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(String(razorpay_signature), "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.userId,
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.paymentStatus === "paid") {
      return res.json({ success: true, message: "Payment already verified", orderId: order._id });
    }
    if (order.paymentStatus !== "created") {
      return res.status(409).json({ success: false, message: "This order cannot be paid" });
    }

    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.paidAt = new Date();
    await order.save();

    const User = mongoose.model("User");
    const user = await User.findById(req.userId).select("cartData");
    if (user) {
      const emptyCart = {};
      for (const itemId of Object.keys(user.cartData || {})) emptyCart[itemId] = 0;
      await User.findByIdAndUpdate(req.userId, { cartData: emptyCart });
    }

    return res.json({ success: true, message: "Payment verified successfully", orderId: order._id });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Could not verify payment",
    });
  }
});

module.exports = router;
