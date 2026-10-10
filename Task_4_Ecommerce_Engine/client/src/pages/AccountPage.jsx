import { useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductImage } from '../components/StoreShell.jsx';
import { useStore } from '../context/StoreContext.jsx';

export default function AccountPage() {
  const { signIn, user, showNotice } = useStore();
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const useDemoAccount = async () => {
    setBusy(true);
    setError('');
    try {
      await signIn({ email: 'demo@serein.maison', password: 'SereinDemo!2026' });
      showNotice('Welcome back to Serein.');
      navigate('/');
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  const passwordRules = [
    ['10 or more characters', password.length >= 10],
    ['An uppercase letter', /[A-Z]/.test(password)],
    ['A lowercase letter', /[a-z]/.test(password)],
    ['A number', /\d/.test(password)],
    ['A symbol', /[^A-Za-z0-9]/.test(password)]
  ];

  return <main className="account-page"><div className="account-visual"><ProductImage src="/images/bags-01.jpg" alt="Leather carryall resting in a quiet interior" /><span className="account-visual__caption">Objects to keep.<br /><em>Made to move with you.</em></span></div><div className="account-form-wrap"><span className="eyebrow">Your Serein account</span><h1>{registering ? 'A place of your own.' : 'Come back to yourself.'}</h1><p className="account-intro">{registering ? 'Keep your orders, your pieces, and your details together.' : 'Sign in to see your orders and the pieces you have found.'}</p><form className="form-stack" onSubmit={submit} noValidate>
    {registering && <label className="field-label">Full name<input name="name" autoComplete="name" placeholder="Your name" required minLength="2" /></label>}
    <label className="field-label">Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
    <label className="field-label">Password<span className="password-input"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering ? 'Create a strong password' : 'Your password'} required minLength={registering ? 10 : 1} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
    {registering && <ul className="password-rules" aria-label="Password requirements" aria-live="polite">{passwordRules.map(([label, passed]) => <li className={passed ? 'is-met' : ''} key={label}><Check size={14} aria-hidden="true" />{label}</li>)}</ul>}
    {error && <div className="form-error" role="alert">{error}</div>}
    <button className="button button--forest button--wide" type="submit" disabled={busy}>{busy ? 'One moment…' : registering ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button>
    <button className="button button--demo button--wide" type="button" onClick={useDemoAccount} disabled={busy}>Use demo account</button>
  </form><p className="account-switch">{registering ? 'Already have an account?' : 'New to Serein?'} <button type="button" onClick={() => { setRegistering(!registering); setError(''); setPassword(''); }}>{registering ? 'Sign in' : 'Create an account'}</button></p><span className="privacy-note"><Heart size={13} /> Your details stay yours. Always.</span></div></main>;
}
