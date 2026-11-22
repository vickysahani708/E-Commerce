import React, { useEffect, useState } from "react";
import "./ReviewSection.css";

const API_URL = import.meta.env.VITE_API_URL;

function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/${productId}`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not load reviews.");
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setReviewCount(data.reviewCount || 0);
    } catch (err) {
      setError(err.message || "Could not load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const submitReview = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const token = localStorage.getItem("auth-token");
    if (!token) {
      setError("Please log in before submitting a review.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/reviews/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not save review.");
      setComment("");
      setMessage(data.message || "Review saved.");
      await loadReviews();
    } catch (err) {
      setError(err.message || "Could not save review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reviews-section">
      <div className="reviews-heading">
        <div>
          <h2>Customer Reviews</h2>
          <p>Honest feedback from customers</p>
        </div>
        <div className="reviews-summary">
          <strong>{reviewCount ? averageRating.toFixed(1) : "—"} ★</strong>
          <span>{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
        </div>
      </div>

      <form className="review-form" onSubmit={submitReview}>
        <h3>Write a review</h3>
        <label htmlFor="review-rating">Your rating</label>
        <div className="review-stars" id="review-rating" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={star <= rating ? "review-star selected" : "review-star"}
              onClick={() => setRating(star)}
              aria-label={`${star} star`}
              aria-pressed={rating === star}
            >★</button>
          ))}
        </div>
        <label htmlFor="review-comment">Your review</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share what you liked or what could be better..."
          maxLength={1000}
          rows={4}
          required
        />
        <div className="review-form-footer">
          <span>{comment.length}/1000</span>
          <button type="submit" disabled={submitting || !comment.trim()}>
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </div>
        {message && <p className="review-success" role="status">{message}</p>}
        {error && <p className="review-error" role="alert">{error}</p>}
      </form>

      <div className="review-list">
        {loading ? <p>Loading reviews...</p> : reviews.length === 0 ? (
          <p className="review-empty">No reviews yet. Be the first to review this product.</p>
        ) : reviews.map((review) => (
          <article className="review-card" key={review._id}>
            <div className="review-card-top">
              <strong>{review.userName}</strong>
              <span className="review-card-stars" aria-label={`${review.rating} out of 5 stars`}>
                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
              </span>
            </div>
            <p>{review.comment}</p>
            <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</time>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ReviewSection;
