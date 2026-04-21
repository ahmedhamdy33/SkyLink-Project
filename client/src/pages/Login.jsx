import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual">
          <p className="eyebrow">SkyLink lounge access</p>
          <h1>Step back into your premium booking experience.</h1>
          <p>Review upcoming flights, manage bookings, and continue every trip from a secure passenger workspace.</p>
          <div className="auth-highlights">
            <span>Live itinerary updates</span>
            <span>Fast checkout routing</span>
            <span>Smart flight recommendations</span>
          </div>
        </div>
        <form className="auth-panel" onSubmit={submit}>
          <p className="eyebrow">SkyLink</p>
          <h1>{t.welcomeBack}</h1>
          {error && <p className="alert">{error}</p>}
          <label>
            {t.email}
            <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            {t.password}
            <input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          <button>{t.login}</button>
          <Link to="/register">{t.createAccount}</Link>
        </form>
      </div>
    </section>
  );
}
