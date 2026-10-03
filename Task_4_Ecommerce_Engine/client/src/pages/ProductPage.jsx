import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { formatPrice } from '../api/client.js';
import { ProductImage, ProductSkeletons } from '../components/StoreShell.jsx';
import { useStore } from '../context/StoreContext.jsx';

export default function ProductPage() {
  const { slug } = useParams();
  const { products, addToCart, loadingProducts, showNotice } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const product = products.find((item) => item.slug === slug);
  if (loadingProducts) return <main className="page-pad"><ProductSkeletons /></main>;
  if (!product) return <main className="not-found"><span className="eyebrow">A small detour</span><h1>This piece wandered.</h1><Link to="/" className="button button--forest"><ArrowLeft size={16} /> Return to the collection</Link></main>;
  const onAdd = async () => {
    setAdding(true);
    try { await addToCart(product, quantity); } catch (error) { showNotice(error.message, 'error'); }
    finally { setAdding(false); }
  };
  return <main className="product-detail page-pad"><div className="breadcrumb"><Link to="/">Shop</Link><span>/</span><span>{product.category}</span><span>/</span><span>{product.name}</span></div><div className="product-detail__layout"><div className="product-detail__photo"><ProductImage src={product.image} alt={product.name} /><span className="photo-index">SEREIN · 01 / 01</span></div><div className="product-detail__info"><span className="eyebrow">{product.category} · No. {String(product._id).slice(-2)}</span><h1>{product.name}</h1><p className="product-detail__price">{formatPrice(product.priceCents)}</p><p className="product-detail__description">{product.description}</p><div className="product-detail__rule" /><div className="product-stock"><span className="stock-dot" />{product.stock > 0 ? 'In the atelier, ready to send' : 'Currently unavailable'}</div><div className="purchase-row"><div className="stepper" aria-label="Quantity"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button><span>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus size={14} /></button></div><button type="button" className="button button--forest" onClick={onAdd} disabled={adding || product.stock < 1}>{adding ? 'Adding to bag' : 'Add to bag'} <ShoppingBag size={16} /></button></div><div className="detail-promises"><div><span>01</span><p>Free delivery over $250</p></div><div><span>02</span><p>Thoughtfully wrapped, always</p></div><div><span>03</span><p>Made to be repaired</p></div></div><details className="detail-accordion"><summary>Materials & care <ChevronDown size={16} /></summary><p>Selected full-grain leather, sourced from an audited family tannery. Keep away from prolonged moisture; nourish occasionally with a neutral leather balm.</p></details><details className="detail-accordion"><summary>Delivery & returns <ChevronDown size={16} /></summary><p>Complimentary tracked delivery on orders over $250. Returns accepted within 30 days in original condition.</p></details></div></div></main>;
}
