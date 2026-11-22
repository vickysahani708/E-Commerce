const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const router = express.Router();
const reviewSchema = new mongoose.Schema({
  productId: { type: Number, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });
reviewSchema.index({ productId: 1, user: 1 }, { unique: true });
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

const requireUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ success: false, message: "Please log in to write a review." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload.user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Your session has expired. Please log in again." });
  }
};

// Public product reviews and aggregate rating.
router.get("/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }
    const [reviews, summary] = await Promise.all([
      Review.find({ productId }).sort({ createdAt: -1 }).select("userName rating comment createdAt"),
      Review.aggregate([
        { $match: { productId } },
        { $group: { _id: null, averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      success: true,
      reviews,
      averageRating: summary[0]?.averageRating || 0,
      reviewCount: summary[0]?.reviewCount || 0,
    });
  } catch (error) {
    console.error("Load reviews error:", error);
    res.status(500).json({ success: false, message: "Unable to load reviews." });
  }
});

// One review per customer per product. Submitting again updates that review.
router.post("/:productId", requireUser, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";

    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Choose a rating from 1 to 5 stars." });
    }
    if (!comment || comment.length > 1000) {
      return res.status(400).json({ success: false, message: "Review must be between 1 and 1000 characters." });
    }

    const [product, user] = await Promise.all([
      mongoose.model("Products").findOne({ id: productId }).select("id"),
      mongoose.model("User").findById(req.user.id).select("name"),
    ]);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    if (!user) return res.status(401).json({ success: false, message: "User account not found." });

    const review = await Review.findOneAndUpdate(
      { productId, user: user._id },
      { $set: { rating, comment, userName: user.name } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select("userName rating comment createdAt");

    res.json({ success: true, message: "Your review has been saved.", review });
  } catch (error) {
    console.error("Save review error:", error);
    res.status(500).json({ success: false, message: "Unable to save your review." });
  }
});

module.exports = router;
