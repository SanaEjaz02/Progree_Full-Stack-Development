import { useState } from 'react';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../api/client.js';
import { ProductImage } from '../components/StoreShell.jsx';
import { useStore } from '../context/StoreContext.jsx';

export default function CartPage() {
  const { cart, changeQuantity, removeFromCart, showNotice } = useStore();
  const navigate = useNavigate();
  const [busyItem, setBusyItem] = useState('');
  const update = async (productId, quantity) => {
    setBusyItem(productId);
    try { await changeQuantity(productId, quantity); } catch (error) { showNotice(error.message, 'error'); }
    finally { setBusyItem(''); }
  };
  const remove = async (productId) => {
    setBusyItem(productId);
    try { await removeFromCart(productId); } catch (error) { showNotice(error.message, 'error'); }
    finally { setBusyItem(''); }
  };
  return <main className="bag-page page-pad">
    <div className="bag-heading"><div><span className="eyebrow">A little consideration</span><h1>Your bag <sup>{cart.itemCount}</sup></h1></div><Link className="underlined-link" to="/#all-pieces"><ArrowLeft size={15} /> Continue browsing</Link></div>
    {cart.items.length === 0 ? <div className="empty-bag"><span className="empty-bag__seal"><ShoppingBag size={27} /></span><span className="eyebrow">Nothing carried, yet</span><h2>Good things take their time.</h2><p>Your bag is waiting for a piece that feels like you.</p><Link className="button button--forest" to="/#all-pieces">Explore the collection <ArrowRight size={16} /></Link></div> : <div className="bag-layout">
      <div className="bag-items">{cart.items.map(({ product, quantity }) => <article className="bag-item" key={product._id}>
        <Link to={`/pieces/${product.slug}`} className="bag-item__image"><ProductImage src={product.image} alt={product.name} /></Link>
        <div className="bag-item__info"><span className="eyebrow">{product.category}</span><h2><Link to={`/pieces/${product.slug}`}>{product.name}</Link></h2><span>{formatPrice(product.priceCents)}</span>
          <div className="bag-item__controls"><div className="stepper stepper--small">
            <button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={quantity <= 1 || busyItem === product._id} onClick={() => update(product._id, quantity - 1)}><Minus size={13} /></button><span>{quantity}</span>
            <button type="button" aria-label={`Increase ${product.name} quantity`} disabled={quantity >= product.stock || busyItem === product._id} onClick={() => update(product._id, quantity + 1)}><Plus size={13} /></button>
          </div><button type="button" className="remove-link" onClick={() => remove(product._id)} disabled={busyItem === product._id}>Remove</button></div>
        </div><strong className="bag-item__total">{formatPrice(product.priceCents * quantity)}</strong>
      </article>)}</div>
      <aside className="bag-summary"><span className="eyebrow">Your summary</span><div className="summary-line"><span>Subtotal</span><strong>{formatPrice(cart.subtotalCents)}</strong></div><div className="summary-line summary-line--muted"><span>Delivery</span><span>Calculated at checkout</span></div><div className="summary-total"><span>Total</span><strong>{formatPrice(cart.subtotalCents)}</strong></div><button className="button button--forest button--wide" type="button" onClick={() => navigate('/checkout')}>Continue to checkout <ArrowRight size={16} /></button><p>Shipping and applicable taxes calculated at the next step.</p><div className="bag-secure"><span className="secure-dot" />Secure checkout · protected payment</div></aside>
    </div>}
  </main>;
}
