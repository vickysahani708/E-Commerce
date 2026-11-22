# Razorpay payment setup

The backend uses Razorpay's Orders REST API with Node's built-in `fetch`; no Razorpay npm SDK is required.

## 1. Configure environment variables

Add these values to the backend environment (for local development, your untracked `backend/.env` file):

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Get test credentials from the Razorpay Dashboard in Test Mode. Never commit real keys, add them to frontend environment variables, or share the key secret in chat/screenshots.

## 2. Restart the backend

Restart the Node server after changing environment variables. The backend must already have valid `MONGO_URI` and `JWT_SECRET` values.

## 3. Checkout API

Both endpoints require the existing `auth-token` request header.

- `POST /api/payments/create-order`: reads the signed-in user's cart and product prices from MongoDB, creates a Razorpay order, and stores a pending order in MongoDB.
- `POST /api/payments/verify-payment`: verifies Razorpay's HMAC SHA-256 signature, marks the order paid/confirmed, and clears the user's server-side cart.

The client must not send or decide the payable amount. The server calculates it from the current database product prices.

## 4. Test safely

Use Razorpay Test Mode credentials and Razorpay's test payment methods. Do not switch to Live Mode until the app has been tested and the production deployment has the correct secret environment variables.

## Notes

This implementation handles the checkout callback and signature verification. A production launch should also add a verified Razorpay webhook, payment/order reconciliation, rate limiting, and inventory reservation/decrement logic.
