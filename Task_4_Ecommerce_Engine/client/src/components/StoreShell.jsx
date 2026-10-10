import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Menu, Plus, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { formatPrice, imageFallback } from '../api/client.js';
import { useStore } from '../context/StoreContext.jsx';

export function ProductImage({ src, alt, className = '' }) {
  return <img className={className} src={src || imageFallback} alt={alt} loading="lazy" onError={(event) => { event.currentTarget.src = imageFallback; }} />;
}

export function ProductCard({ product, index = 0 }) {
  const { addToCart, showNotice } = useStore();
  const [adding, setAdding] = useState(false);
  const add = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAdding(true);
    try { await addToCart(product); }
    catch (error) { showNotice(error.message, 'error'); }
    finally { setAdding(false); }
  };
  return (
    <motion.article className="product-card" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -35px 0px' }} transition={{ delay: index % 4 * 0.06, duration: 0.34 }}>
      <div className="product-card__image-wrap">
        <Link to={`/pieces/${product.slug}`} className="product-card__image-link" aria-label={`View ${product.name}`}>
          <ProductImage src={product.image} alt={product.name} className="product-card__image" />
        </Link>
        {product.featured && <span className="product-card__tag">Maison favourite</span>}
        <button className="quick-add" type="button" onClick={add} disabled={adding || product.stock < 1} aria-label={`Add ${product.name} to bag`}><span>{adding ? 'Adding' : 'Quick add'}</span><Plus size={15} /></button>
      </div>
      <div className="product-card__details"><div><span className="eyebrow">{product.category}</span><h3><Link to={`/pieces/${product.slug}`}>{product.name}</Link></h3></div><p>{formatPrice(product.priceCents)}</p></div>
    </motion.article>
  );
}

export function ProductGrid({ products }) {
  return <div className="product-grid">{products.map((product, index) => <ProductCard key={product._id} product={product} index={index} />)}</div>;
}

export function ProductSkeletons() {
  return <div className="product-grid" aria-label="Loading collection">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-product" key={index}><div className="skeleton-product__image" /><div className="skeleton-line" /><div className="skeleton-line skeleton-line--short" /></div>)}</div>;
}

function SignOutDialog({ onCancel, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    const buttons = dialog.querySelectorAll('button');
    buttons[0]?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel();
        return;
      }
      if (event.key !== 'Tab' || buttons.length === 0) return;
      if (event.shiftKey && document.activeElement === buttons[0]) {
        event.preventDefault();
        buttons[buttons.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
        event.preventDefault();
        buttons[0].focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onCancel]);

  return <div className="modal-backdrop"><section className="signout-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="signout-title" aria-describedby="signout-description"><span className="eyebrow">Serein Maison</span><h2 id="signout-title">Sign out?</h2><p id="signout-description">Sign out of Serein Maison? Your bag stays saved.</p><div className="signout-dialog__actions"><button className="button button--quiet" type="button" onClick={onCancel}>Cancel</button><button className="button button--forest" type="button" onClick={onConfirm}>Sign out</button></div></section></div>;
}

function Header() {
  const { user, signOut, cart, showNotice } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const navigate = useNavigate();
  const closeMenu = () => setMenuOpen(false);
  const finishSignOut = async () => {
    await signOut();
    setConfirmSignOut(false);
    showNotice("You've signed out. Your bag is saved.");
    navigate('/');
  };
  return (
    <>
      <div className="announcement"><span>Complimentary delivery on orders over $250</span><ArrowRight size={13} /></div>
      <header className="site-header">
        <button className="icon-button mobile-menu" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={`header-nav ${menuOpen ? 'header-nav--open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" onClick={closeMenu}>Shop</NavLink><a href="/#atelier" onClick={closeMenu}>Our atelier</a><a href="/#journal" onClick={closeMenu}>Journal</a>{user && <button className="mobile-signout" type="button" onClick={() => { closeMenu(); setConfirmSignOut(true); }}>Sign out</button>}
        </nav>
        <Link to="/" className="wordmark" aria-label="Serein Maison home"><span className="wordmark__mark">S</span><span>SEREIN <i>MAISON</i></span></Link>
        <div className="header-actions">
          <button className="header-account" type="button" onClick={() => navigate(user ? '/orders' : '/account')} aria-label={user ? 'Your account' : 'Sign in'}><UserRound size={18} /><span>{user ? user.name.split(' ')[0] : 'Account'}</span></button>
          {user && <button className="text-action" type="button" onClick={() => setConfirmSignOut(true)}>Sign out</button>}
          <Link className="bag-link" to="/bag" aria-label={`Shopping bag, ${cart.itemCount} items`}><ShoppingBag size={18} /><span>Bag</span><b>{cart.itemCount}</b></Link>
        </div>
      </header>
      {confirmSignOut && <SignOutDialog onCancel={() => setConfirmSignOut(false)} onConfirm={finishSignOut} />}
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top"><Link to="/" className="wordmark wordmark--footer"><span className="wordmark__mark">S</span><span>SEREIN <i>MAISON</i></span></Link><p>Objects to keep.<br />Made to move with you.</p><div className="footer-links"><a href="mailto:care@sereinmaison.example">Client care</a><a href="/#atelier">Our materials</a><Link to="/orders">Orders & returns</Link></div></div>
      <div className="footer-bottom"><span>© 2026 Serein Maison</span><span>Thoughtfully made, for the long way.</span><span>New York · Copenhagen</span></div>
    </footer>
  );
}

function Toasts() {
  const { notices, showNotice } = useStore();
  useEffect(() => {
    const onError = (event) => showNotice(event.detail || 'Something did not work. Please try again.', 'error');
    window.addEventListener('store-error', onError);
    return () => window.removeEventListener('store-error', onError);
  }, []);
  return <div className="toast-stack" aria-live="polite" aria-relevant="additions"><AnimatePresence>{notices.map((notice) => <motion.div className={`toast toast--${notice.tone}`} key={notice.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }}><span className="toast__icon"><Check size={15} /></span>{notice.message}</motion.div>)}</AnimatePresence></div>;
}

export function StoreChrome({ children }) {
  return <><Header />{children}<Footer /><Toasts /></>;
}
