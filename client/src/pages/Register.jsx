import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', nationality: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual">
          <p className="eyebrow">Join SkyLink</p>
          <h1>Create a passenger profile that is ready for every next journey.</h1>
          <p>Open your account once and keep your bookings, cabins, payments, and recommendations connected in one place.</p>
          <div className="auth-highlights">
            <span>Premium route discovery</span>
            <span>Seat-level booking control</span>
            <span>AI-powered trip suggestions</span>
          </div>
        </div>
        <form className="auth-panel" onSubmit={submit}>
          <p className="eyebrow">SkyLink</p>
          <h1>{t.createAccount}</h1>
          {error && <p className="alert">{error}</p>}
          <label>
            {t.fullName}
            <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          </label>
          <label>
            {t.email}
            <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            {t.password}
            <input type="password" minLength="8" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          <label>
            {t.phone}
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </label>
          <label>
            {t.nationality}
            <input value={form.nationality} onChange={(event) => setForm({ ...form, nationality: event.target.value })} />
          </label>
          <button>{t.register}</button>
          <Link to="/login">{t.login}</Link>
        </form>
      </div>
    </section>
  );
}
