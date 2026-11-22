import React, { useEffect, useState } from "react";
import "./Orders.css";

const formatDate = (value) => new Date(value).toLocaleString("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatMoney = (paise) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
}).format((paise || 0) / 100);

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
          headers: { "auth-token": token },
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load orders.");
        }
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <main className="orders-page"><h1>My Orders</h1><p>Loading your orders...</p></main>;

  return (
    <main className="orders-page">
      <h1>My Orders</h1>
      <p className="orders-subtitle">View your purchases and track their status.</p>

      {error && <p className="orders-message orders-error" role="alert">{error}</p>}

      {!error && orders.length === 0 && (
        <div className="orders-empty">
          <h2>No orders yet</h2>
          <p>Your placed orders will appear here.</p>
        </div>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order._id}>
            <div className="order-card-header">
              <div>
                <h2>Order #{order._id.slice(-8).toUpperCase()}</h2>
                <p>{formatDate(order.createdAt)}</p>
              </div>
              <div className="order-statuses">
                <span className={`order-pill order-${order.status}`}>{order.status}</span>
                <span className={`order-pill payment-${order.paymentStatus}`}>{order.paymentStatus}</span>
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div className="order-item" key={`${item.productId}-${index}`}>
                  <img src={item.image} alt={item.name} />
                  <div className="order-item-info">
                    <h3>{item.name}</h3>
                    <p>Qty: {item.quantity} × {formatMoney(item.unitPricePaise)}</p>
                  </div>
                  <strong>{formatMoney(item.lineTotalPaise)}</strong>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <span>Total paid / due</span>
              <strong>{formatMoney(order.amountPaise)}</strong>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Orders;
