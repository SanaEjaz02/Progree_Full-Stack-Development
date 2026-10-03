import { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, formatPrice } from '../api/client.js';
import { useStore } from '../context/StoreContext.jsx';

function PaymentForm({ address }) {
  const stripe = useStripe();
  const elements = useElements();
  const { confirmOrder, showNotice, cart } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const shippingComplete = ['name', 'line1', 'city', 'postalCode', 'country'].every((field) => address[field].trim().length > 0);

  const submit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    const result = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (result.error) {
      setError(result.error.message ?? 'The payment could not be completed. No charge was made.');
      setBusy(false);
      return;
    }
    try {
      const { order } = await confirmOrder(result.paymentIntent.id, address);
      navigate('/confirmation', { state: { order } });
    } catch (requestError) {
      setError(requestError.message);
      showNotice(requestError.message, 'error');
      setBusy(false);
    }
  };

  return <form className="payment-form" onSubmit={submit}><PaymentElement options={{ layout: 'tabs' }} />{error && <div className="form-error" role="alert">{error}</div>}{!shippingComplete && <p className="shipping-required" role="status">Complete the delivery details above to continue.</p>}<button className="button button--forest button--wide" type="submit" disabled={!stripe || busy || !shippingComplete}>{busy ? 'Confirming payment…' : `Pay ${formatPrice(cart.subtotalCents)}`} <LockKeyhole size={15} /></button><p className="payment-note"><LockKeyhole size={12} /> Securely processed in Stripe test mode. No real money moves.</p></form>;
}

export default function CheckoutPage() {
  const { user, token, cart, showNotice, sessionLoading } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ name: user?.name ?? '', line1: '', city: '', postalCode: '', country: 'United States' });
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const paymentRequest = useRef(null);
  const cartSignature = cart.items.map(({ product, quantity }) => `${product._id}:${quantity}`).join('|');

  useEffect(() => {
    let active = true;
    if (!token || cart.items.length === 0) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setError('');
    if (paymentRequest.current?.signature !== cartSignature) {
      paymentRequest.current = {
        signature: cartSignature,
        promise: Promise.all([
          apiRequest('/checkout/config'),
          apiRequest('/checkout/payment-intent', { token, method: 'POST' })
        ])
      };
    }

    paymentRequest.current.promise.then(([config, intent]) => {
      if (!config.publishableKey) throw new Error('Stripe sandbox keys are not configured yet.');
      if (active) {
        setStripePromise(loadStripe(config.publishableKey));
        setClientSecret(intent.clientSecret);
      }
    }).catch((requestError) => {
      if (active) {
        setError(requestError.message);
        showNotice(requestError.message, 'error');
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, cartSignature]);

  if (sessionLoading) return <main className="page-pad"><div className="payment-loading"><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line skeleton-line--short" /></div></main>;
  if (!user) return <main className="protected-state"><span className="eyebrow">Almost there</span><h1>Sign in to checkout.</h1><p>Your bag is saved. Sign in so we can keep your delivery and order details together.</p><button className="button button--forest" onClick={() => navigate('/account')}>Go to account <ArrowRight size={16} /></button></main>;
  if (cart.items.length === 0) return <main className="empty-bag"><span className="eyebrow">Nothing to check out</span><h2>Your bag is waiting.</h2><Link className="button button--forest" to="/#all-pieces">Explore the collection <ArrowRight size={16} /></Link></main>;

  const updateAddress = (event) => setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
  return <main className="checkout-page page-pad"><div className="checkout-heading"><div><span className="eyebrow">Secure checkout · 02 / 02</span><h1>Make it yours.</h1></div><Link className="underlined-link" to="/bag"><ArrowLeft size={15} /> Back to bag</Link></div><div className="checkout-layout"><section className="checkout-form"><div className="checkout-step"><span className="checkout-step__number">01</span><div><h2>Delivery details</h2><p>Where should we send your pieces?</p></div></div><div className="checkout-fields"><label className="field-label">Full name<input name="name" value={address.name} onChange={updateAddress} autoComplete="name" required /></label><label className="field-label checkout-field--wide">Address<input name="line1" value={address.line1} onChange={updateAddress} autoComplete="street-address" placeholder="Street and number" required /></label><label className="field-label">City<input name="city" value={address.city} onChange={updateAddress} required /></label><label className="field-label">Postal code<input name="postalCode" value={address.postalCode} onChange={updateAddress} autoComplete="postal-code" required /></label><label className="field-label">Country<input name="country" value={address.country} onChange={updateAddress} autoComplete="country-name" required /></label></div><div className="checkout-step checkout-step--payment"><span className="checkout-step__number">02</span><div><h2>Payment</h2><p>Your details are encrypted and handled by Stripe.</p></div></div>{loading ? <div className="payment-loading"><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line skeleton-line--short" /></div> : error ? <div className="form-error" role="alert">{error}</div> : stripePromise && clientSecret ? <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#263d32', borderRadius: '0px', fontFamily: 'DM Sans, sans-serif' } } }}><PaymentForm address={address} /></Elements> : null}</section><aside className="checkout-summary"><span className="eyebrow">In your bag</span>{cart.items.map(({ product, quantity }) => <div className="checkout-item" key={product._id}><span className="checkout-item__image"><img src={product.image} alt="" /></span><span><strong>{product.name}</strong><small>Qty {quantity}</small></span><b>{formatPrice(product.priceCents * quantity)}</b></div>)}<div className="summary-total"><span>Total</span><strong>{formatPrice(cart.subtotalCents)}</strong></div><p className="checkout-summary__note">Complimentary tracked delivery is included for this order.</p></aside></div></main>;
}
