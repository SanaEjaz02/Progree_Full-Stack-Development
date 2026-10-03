import { useState } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductImage } from '../components/StoreShell.jsx';
import { useStore } from '../context/StoreContext.jsx';

export default function AccountPage() {
  const { signIn, user, showNotice } = useStore();
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  if (user) return <main className="account-page account-page--signed"><span className="eyebrow">Welcome back</span><h1>Good to see you, {user.name.split(' ')[0]}.</h1><Link className="button button--forest" to="/orders">View your orders <ArrowRight size={16} /></Link></main>;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await signIn(registering ? { name: values.name, email: values.email, password: values.password } : { email: values.email, password: values.password }, registering);
      showNotice(registering ? 'Your Serein account is ready.' : 'Welcome back to Serein.');
      navigate('/');
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  return <main className="account-page"><div className="account-visual"><ProductImage src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85" alt="Leather carryall resting in a quiet interior" /><span className="account-visual__caption">Objects to keep.<br /><em>Made to move with you.</em></span></div><div className="account-form-wrap"><span className="eyebrow">Your Serein account</span><h1>{registering ? 'A place of your own.' : 'Come back to yourself.'}</h1><p className="account-intro">{registering ? 'Keep your orders, your pieces, and your details together.' : 'Sign in to see your orders and the pieces you have found.'}</p><form className="form-stack" onSubmit={submit} noValidate>
    {registering && <label className="field-label">Full name<input name="name" autoComplete="name" placeholder="Your name" required minLength="2" /></label>}
    <label className="field-label">Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
    <label className="field-label">Password<input name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering ? 'At least 10 characters' : 'Your password'} required minLength={registering ? 10 : 1} /></label>
    {registering && <span className="field-hint">Use 10+ characters, including upper and lowercase letters, a number, and a symbol.</span>}
    {error && <div className="form-error" role="alert">{error}</div>}
    <button className="button button--forest button--wide" type="submit" disabled={busy}>{busy ? 'One moment…' : registering ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button>
  </form><p className="account-switch">{registering ? 'Already have an account?' : 'New to Serein?'} <button type="button" onClick={() => { setRegistering(!registering); setError(''); }}>{registering ? 'Sign in' : 'Create an account'}</button></p><span className="privacy-note"><Heart size={13} /> Your details stay yours. Always.</span></div></main>;
}
