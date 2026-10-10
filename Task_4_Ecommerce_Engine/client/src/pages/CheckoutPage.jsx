import { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, formatPrice } from '../api/client.js';
import CountryCombobox, { isCountryName } from '../components/CountryCombobox.jsx';
import { useStore } from '../context/StoreContext.jsx';

function PaymentForm({ address, missingFields }) {
  const stripe = useStripe();
  const elements = useElements();
  const { confirmOrder, showNotice, cart } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const shippingComplete = missingFields.length === 0;

  const submit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !shippingComplete) return;
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

  return <form className="payment-form" onSubmit={submit}>
    <PaymentElement options={{ layout: 'accordion', paymentMethodOrder: ['card'], wallets: { link: 'never', applePay: 'never', googlePay: 'never' } }} />
    {error && <div className="form-error" role="alert">{error}</div>}
    {!shippingComplete && <p className="shipping-required" role="status">Still needed: {missingFields.join(', ')}.</p>}
    <button className="button button--forest button--wide" type="submit" disabled={!stripe || busy || !shippingComplete}>{busy ? 'Confirming payment…' : `Pay ${formatPrice(cart.subtotalCents)}`} <LockKeyhole size={15} /></button>
    <p className="payment-note"><LockKeyhole size={12} /> Securely processed in Stripe test mode. No real money moves.</p>
  </form>;
}

export default function CheckoutPage() {
  const { user, token, cart, showNotice, sessionLoading } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ name: user?.name ?? '', line1: '', city: '', postalCode: '', country: 'United States' });
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [showDemoNotice, setShowDemoNotice] = useState(true);
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

  const fieldErrors = {
    name: address.name.trim().length >= 2 ? '' : 'Enter your full name.',
    line1: address.line1.trim().length >= 3 ? '' : 'Enter your street address.',
    city: address.city.trim().length >= 2 ? '' : 'Enter your city or town.',
    postalCode: address.postalCode.trim().length >= 2 ? '' : 'Enter your postal code.',
    country: isCountryName(address.country) ? '' : 'Choose a country from the suggestions.'
  };
  const fieldLabels = { name: 'your full name', line1: 'your street address', city: 'your city or town', postalCode: 'your postal code', country: 'a country from the list' };
  const missingFields = Object.keys(fieldErrors).filter((field) => fieldErrors[field]).map((field) => fieldLabels[field]);
  const updateAddress = (event) => {
    setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  };
  const fieldClass = (field, wide = false) => `field-label${wide ? ' checkout-field--wide' : ''}${touched[field] && fieldErrors[field] ? ' is-invalid' : ''}`;
  const blurField = (field) => setTouched((current) => ({ ...current, [field]: true }));
  const copyCardNumber = async () => {
    try {
      await navigator.clipboard.writeText('4242 4242 4242 4242');
      showNotice('Test card number copied.');
    } catch {
      showNotice('Select and copy the test card number: 4242 4242 4242 4242', 'error');
    }
  };

  return <main className="checkout-page page-pad">
    <div className="checkout-heading"><div><span className="eyebrow">Secure checkout · 02 / 02</span><h1>Make it yours.</h1></div><Link className="underlined-link" to="/bag"><ArrowLeft size={15} /> Back to bag</Link></div>
    {showDemoNotice && <aside className="demo-notice" aria-label="Demo payment instructions"><div><strong>Demo mode</strong><p>Stripe test mode, no real money moves. Use card <b>4242 4242 4242 4242</b>, any future expiry, any CVC, any postal code.</p><button type="button" className="copy-card" onClick={copyCardNumber}><Check size={14} /> Copy card number</button></div><button className="icon-button" type="button" aria-label="Dismiss demo mode notice" onClick={() => setShowDemoNotice(false)}><X size={17} /></button></aside>}
    <div className="checkout-layout"><section className="checkout-form">
      <div className="checkout-step"><span className="checkout-step__number">01</span><div><h2>Delivery details</h2><p>Where should we send your pieces?</p></div></div>
      <div className="checkout-fields">
        <label className={fieldClass('name')}>Full name<input name="name" value={address.name} onChange={updateAddress} onBlur={() => blurField('name')} autoComplete="name" aria-invalid={Boolean(touched.name && fieldErrors.name)} required />{touched.name && fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}</label>
        <label className={fieldClass('line1', true)}>Street address<input name="line1" value={address.line1} onChange={updateAddress} onBlur={() => blurField('line1')} autoComplete="street-address" placeholder="Street and number" aria-invalid={Boolean(touched.line1 && fieldErrors.line1)} required />{touched.line1 && fieldErrors.line1 && <span className="field-error">{fieldErrors.line1}</span>}</label>
        <label className={fieldClass('city')}>City<input name="city" value={address.city} onChange={updateAddress} onBlur={() => blurField('city')} autoComplete="address-level2" aria-invalid={Boolean(touched.city && fieldErrors.city)} required />{touched.city && fieldErrors.city && <span className="field-error">{fieldErrors.city}</span>}</label>
        <label className={fieldClass('postalCode')}>Postal code<input name="postalCode" value={address.postalCode} onChange={updateAddress} onBlur={() => blurField('postalCode')} autoComplete="postal-code" aria-invalid={Boolean(touched.postalCode && fieldErrors.postalCode)} required />{touched.postalCode && fieldErrors.postalCode && <span className="field-error">{fieldErrors.postalCode}</span>}</label>
        <label className={fieldClass('country')}>Country<CountryCombobox value={address.country} onChange={updateAddress} invalid={Boolean(touched.country && fieldErrors.country)} />{touched.country && fieldErrors.country && <span className="field-error">{fieldErrors.country}</span>}</label>
      </div>
      <div className="checkout-step checkout-step--payment"><span className="checkout-step__number">02</span><div><h2>Payment</h2><p>Your details are encrypted and handled by Stripe.</p></div></div>
      {loading ? <div className="payment-loading"><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line skeleton-line--short" /></div> : error ? <div className="form-error" role="alert">{error}</div> : stripePromise && clientSecret ? <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#263d32', borderRadius: '0px', fontFamily: 'DM Sans, sans-serif' } } }}><PaymentForm address={address} missingFields={missingFields} /></Elements> : null}
    </section><aside className="checkout-summary"><span className="eyebrow">Your selection</span>{cart.items.map(({ product, quantity }) => <div className="checkout-item" key={product._id}><div className="checkout-item__image"><img src={product.image} alt="" /></div><div><strong>{product.name}</strong><small>Qty {quantity}</small></div><b>{formatPrice(product.priceCents * quantity)}</b></div>)}<div className="summary-total"><span>Total</span><strong>{formatPrice(cart.subtotalCents)}</strong></div><p className="checkout-summary__note">Complimentary delivery is included. Duties may apply at delivery.</p></aside></div>
  </main>;
}
