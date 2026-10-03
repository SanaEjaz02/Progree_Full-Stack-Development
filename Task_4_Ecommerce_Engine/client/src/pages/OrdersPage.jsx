import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../api/client.js';
import { useStore } from '../context/StoreContext.jsx';

export default function OrdersPage() {
  const { user, loadOrders } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    loadOrders().then((result) => { if (active) setOrders(result); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);
  const navigate = useNavigate();
  if (!user) return <main className="protected-state"><span className="eyebrow">A little further in</span><h1>Your story, saved.</h1><p>Sign in to see your orders and keep your Serein details close.</p><button className="button button--forest" onClick={() => navigate('/account')}>Sign in to continue <ArrowRight size={16} /></button></main>;
  return <main className="orders-page page-pad"><span className="eyebrow">Your Serein account</span><h1>Orders & moments.</h1>{loading ? <div className="payment-loading"><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line skeleton-line--short" /></div> : orders.length === 0 ? <div className="empty-orders"><span className="eyebrow">Your first chapter</span><h2>No orders yet.</h2><p>When a piece finds its way to you, the details will live here.</p><Link to="/#all-pieces" className="underlined-link">Meet the collection <ArrowRight size={15} /></Link></div> : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-card__head"><div><span className="eyebrow">Order #{String(order._id).slice(-8).toUpperCase()}</span><h2>{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</h2></div><span className="order-status">{order.status}</span></div><div className="order-card__items">{order.items.map((item) => <div key={item.product}><span>{item.name} <small>× {item.quantity}</small></span><b>{formatPrice(item.unitPriceCents * item.quantity)}</b></div>)}</div><div className="summary-total"><span>Total</span><strong>{formatPrice(order.subtotalCents)}</strong></div></article>)}</div>}</main>;
}
