import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const money = (paise) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format((paise || 0) / 100);

export default function Dashboard({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState("30");

  const range = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - Number(days) + 1);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [days]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`, {
      headers: { "auth-token": token },
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load analytics");
        return result;
      })
      .then((result) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, range]);

  const maxRevenue = Math.max(1, ...(data?.dailySales || []).map((item) => item.revenuePaise));
  const maxStatus = Math.max(1, ...(data?.statusBreakdown || []).map((item) => item.count));

  return (
    <section className="analytics">
      <div className="analytics-heading">
        <div><p className="eyebrow">BUSINESS OVERVIEW</p><h1>Analytics dashboard</h1><p>Track revenue, orders and product performance.</p></div>
        <select value={days} onChange={(event) => setDays(event.target.value)} aria-label="Date range">
          <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option>
        </select>
      </div>
      {loading && <p className="analytics-message">Loading business metrics…</p>}
      {error && <p className="analytics-error">{error}. Check admin access and API configuration.</p>}
      {!loading && data && <>
        <div className="metric-grid">
          <article className="metric-card"><span>Total revenue</span><strong>{money(data.summary.totalRevenuePaise)}</strong><small>Successful payments only</small></article>
          <article className="metric-card"><span>Paid orders</span><strong>{data.summary.paidOrders}</strong><small>Orders with verified payment</small></article>
          <article className="metric-card"><span>Total orders</span><strong>{data.summary.totalOrders}</strong><small>All payment states</small></article>
          <article className="metric-card"><span>New customers</span><strong>{data.summary.newCustomers}</strong><small>Accounts created in range</small></article>
        </div>
        <div className="analytics-panels">
          <article className="analytics-panel sales-panel"><div className="panel-heading"><div><h2>Revenue trend</h2><p>Daily paid revenue</p></div><strong>{money(data.summary.totalRevenuePaise)}</strong></div>
            {data.dailySales.length ? <div className="sales-chart">{data.dailySales.map((item) => <div className="sales-column" key={item._id} title={`${item._id}: ${money(item.revenuePaise)}`}><div className="sales-bar" style={{ height: `${Math.max(4, item.revenuePaise / maxRevenue * 100)}%` }} /><span>{new Date(item._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>)}</div> : <p className="empty-state">No paid sales in this period yet.</p>}
          </article>
          <article className="analytics-panel"><h2>Top products</h2><p>Ranked by paid revenue</p>
            {data.topProducts.length ? data.topProducts.map((item, index) => <div className="top-product" key={item._id}><span className="rank">{index + 1}</span><div className="top-product-name"><strong>{item.name}</strong><small>{item.unitsSold} units sold</small></div><b>{money(item.revenuePaise)}</b></div>) : <p className="empty-state">No product sales to report.</p>}
          </article>
        </div>
        <div className="analytics-panels lower-panels">
          <article className="analytics-panel"><h2>Order status</h2><p>All orders in selected period</p>
            {data.statusBreakdown.length ? data.statusBreakdown.map((item) => <div className="status-row" key={item._id}><span>{item._id}</span><div className="status-track"><i style={{ width: `${item.count / maxStatus * 100}%` }} /></div><b>{item.count}</b></div>) : <p className="empty-state">No orders in this period.</p>}
          </article>
          <article className="analytics-panel"><h2>Operational snapshot</h2><div className="snapshot-row"><span>Pending / processing</span><strong>{data.summary.pendingOrders}</strong></div><div className="snapshot-row"><span>Average paid order value</span><strong>{money(data.summary.averageOrderPaise)}</strong></div><div className="snapshot-row"><span>Selected period</span><strong>Last {days} days</strong></div></article>
        </div>
      </>}
    </section>
  );
}
