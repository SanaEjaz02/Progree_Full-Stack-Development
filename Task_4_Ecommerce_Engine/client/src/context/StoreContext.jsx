import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';

const StoreContext = createContext(null);
const GUEST_CART_KEY = 'serein-guest-cart';
const TOKEN_KEY = 'serein-session';
const USER_KEY = 'serein-user';

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function cartCount(items) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function presentGuestCart(items) {
  return {
    items,
    subtotalCents: items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0),
    itemCount: cartCount(items)
  };
}

export function StoreProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => readJson(USER_KEY, null));
  const [sessionLoading, setSessionLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => presentGuestCart(readJson(GUEST_CART_KEY, [])));
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [notices, setNotices] = useState([]);

  const showNotice = (message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotices((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setNotices((current) => current.filter((notice) => notice.id !== id)), 3600);
  };

  const loadRemoteCart = async (authToken = token) => {
    const payload = await apiRequest('/cart', { token: authToken });
    setCart(payload.cart);
    return payload.cart;
  };

  useEffect(() => {
    let active = true;
    apiRequest('/products')
      .then(({ products: result }) => { if (active) setProducts(result); })
      .catch(() => { if (active) showNotice('The collection could not load. Please refresh in a moment.', 'error'); })
      .finally(() => { if (active) setLoadingProducts(false); });

    if (token) {
      Promise.all([
        apiRequest('/auth/me', { token }),
        loadRemoteCart(token)
      ]).then(([session]) => {
        if (active) {
          setUser(session.user);
          localStorage.setItem(USER_KEY, JSON.stringify(session.user));
        }
      }).catch(() => {
        if (active) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      }).finally(() => {
        if (active) setSessionLoading(false);
      });
    } else {
      setSessionLoading(false);
    }

    return () => { active = false; };
  }, []);

  const setSession = async (session) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);

    const guestItems = readJson(GUEST_CART_KEY, []);
    for (const item of guestItems) {
      await apiRequest(`/cart/${item.product._id}`, {
        token: session.token,
        method: 'POST',
        body: JSON.stringify({ quantity: item.quantity })
      });
    }
    localStorage.removeItem(GUEST_CART_KEY);
    await loadRemoteCart(session.token);
    return session.user;
  };

  const signIn = async (credentials, registering = false) => {
    const endpoint = registering ? '/auth/register' : '/auth/login';
    const session = await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(credentials) });
    await setSession(session);
    return session.user;
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    const guestItems = readJson(GUEST_CART_KEY, []);
    setCart(presentGuestCart(guestItems));
  };

  const saveGuestCart = (items) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    const subtotalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
    setCart({ items, subtotalCents, itemCount: cartCount(items) });
  };

  const addToCart = async (product, quantity = 1) => {
    if (token) {
      const payload = await apiRequest(`/cart/${product._id}`, {
        token, method: 'POST', body: JSON.stringify({ quantity })
      });
      setCart(payload.cart);
    } else {
      const items = [...cart.items];
      const existing = items.find((item) => item.product._id === product._id);
      if (existing) existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      else items.push({ product, quantity });
      saveGuestCart(items);
    }
    showNotice(`${product.name} added to your bag.`);
  };

  const changeQuantity = async (productId, quantity) => {
    if (token) {
      const payload = await apiRequest(`/cart/${productId}`, {
        token, method: 'PATCH', body: JSON.stringify({ quantity })
      });
      setCart(payload.cart);
      return;
    }
    saveGuestCart(cart.items.map((item) => item.product._id === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = async (productId) => {
    if (token) {
      const payload = await apiRequest(`/cart/${productId}`, { token, method: 'DELETE' });
      setCart(payload.cart);
      return;
    }
    saveGuestCart(cart.items.filter((item) => item.product._id !== productId));
  };

  const createPaymentIntent = () => apiRequest('/checkout/payment-intent', { token, method: 'POST' });
  const confirmOrder = async (paymentIntentId, shippingAddress) => {
    const result = await apiRequest('/checkout/confirm', {
      token,
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, shippingAddress })
    });
    setCart({ items: [], subtotalCents: 0, itemCount: 0 });
    localStorage.removeItem(GUEST_CART_KEY);
    return result;
  };
  const loadOrders = async () => (await apiRequest('/orders', { token })).orders;

  return (
    <StoreContext.Provider value={{
      user, token, products, cart, loadingProducts, notices, showNotice,
      sessionLoading,
      signIn, signOut, addToCart, changeQuantity, removeFromCart, loadRemoteCart,
      createPaymentIntent, confirmOrder, loadOrders
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider.');
  return value;
}