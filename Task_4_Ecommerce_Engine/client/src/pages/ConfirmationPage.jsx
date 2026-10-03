import { ArrowRight, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { formatPrice } from '../api/client.js';

export default function ConfirmationPage() {
  const { state } = useLocation();
  const order = state?.order;
  return <main className="confirmation-page page-pad"><div className="confirmation-mark"><Check size={31} /></div><span className="eyebrow">A considered choice</span><h1>On its way<br /><em>to you.</em></h1><p className="confirmation-lede">Thank you. Your order has been placed and our atelier will begin preparing it with care.</p>{order && <div className="confirmation-card"><div className="confirmation-card__heading"><span>Order details</span><strong>#{String(order._id).slice(-8).toUpperCase()}</strong></div>{order.items?.map((item) => <div className="confirmation-item" key={item.product}><span>{item.name} <small>× {item.quantity}</small></span><b>{formatPrice(item.unitPriceCents * item.quantity)}</b></div>)}<div className="summary-total"><span>Total</span><strong>{formatPrice(order.subtotalCents)}</strong></div></div>}<div className="confirmation-actions"><Link className="button button--forest" to="/orders">View your orders <ArrowRight size={16} /></Link><Link className="underlined-link" to="/">Return to the collection <ArrowRight size={15} /></Link></div></main>;
}
