# Admin Analytics Dashboard setup

The admin panel uses the existing customer login endpoint, then checks access against a server-side email allowlist. No role can be assigned from the browser.

## Render backend environment variable

Add `ADMIN_EMAILS` to the backend service environment in Render. Set it to the exact email address(es) of existing registered accounts allowed to administer the store. For multiple admins, use comma-separated addresses:

```env
ADMIN_EMAILS=owner@example.com,ops@example.com
```

Do not put this variable in the frontend or commit real addresses/secrets to the repository. If it is empty, nobody can access the admin dashboard or product-management endpoints.

## Admin frontend

Set `VITE_API_URL` to the deployed backend base URL (without a trailing slash), then build/deploy the `admin` app. Sign in using an existing account whose email is listed in `ADMIN_EMAILS`.

## Analytics definitions

- Revenue and average order value include only orders with `paymentStatus: paid`.
- Order totals and status breakdown include all orders created in the selected date range.
- Top products are ranked by paid item revenue.
- New customers are accounts created in the selected date range.

The dashboard offers 7, 30 and 90-day views. Admin analytics, product creation, image upload and product removal are checked server-side against the allowlist.
