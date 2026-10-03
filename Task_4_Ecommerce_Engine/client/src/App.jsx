import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { StoreChrome } from './components/StoreShell.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import AccountPage from './pages/AccountPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import './App.css';

function NotFoundPage() {
  return <main className="not-found"><span className="eyebrow">A small detour</span><h1>This page wandered.</h1><Link to="/" className="button button--forest">Return to the collection</Link></main>;
}

function StoreRoutes() {
  const location = useLocation();
  return <StoreChrome><AnimatePresence mode="wait" initial={false}><motion.div className="route-view" key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22, ease: 'easeOut' }}><Routes location={location}>
    <Route path="/" element={<ShopPage />} />
    <Route path="/pieces/:slug" element={<ProductPage />} />
    <Route path="/account" element={<AccountPage />} />
    <Route path="/bag" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/confirmation" element={<ConfirmationPage />} />
    <Route path="/orders" element={<OrdersPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></motion.div></AnimatePresence></StoreChrome>;
}

export default function App() {
  return <StoreProvider><BrowserRouter><StoreRoutes /></BrowserRouter></StoreProvider>;
}
