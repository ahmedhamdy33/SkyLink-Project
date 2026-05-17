import { useState } from 'react';
import { Link } from 'react-router-dom';
import CelebrationPanel from '../components/CelebrationPanel.jsx';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const { t } = usePreferences();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', nationality: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setInfo('');
    setPending(true);
    try {
      const result = await register(form);
      setRegisteredEmail(form.email);
      setSuccess(result.message || t.registrationWelcome.replace('{name}', form.firstName));
      if (result.emailDeliveryStatus !== 'sent') {
        setInfo(result.emailDeliveryReason || t.emailDeliveryMissing);
      }
      setPending(false);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  async function resendVerification() {
    setError('');
    setInfo('');
    setResending(true);

    try {
      const result = await api.resendVerificationEmail(registeredEmail || form.email);
      setInfo(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual">
          <p className="eyebrow">{t.authRegisterEyebrow}</p>
          <h1>{t.authRegisterTitle}</h1>
          <p>{t.authRegisterCopy}</p>
          <div className="auth-highlights">
            <span>{t.authRegisterHighlight1}</span>
            <span>{t.authRegisterHighlight2}</span>
            <span>{t.authRegisterHighlight3}</span>
          </div>
        </div>
        <form className="auth-panel" onSubmit={submit}>
          <p className="eyebrow">SkyLink</p>
          <h1>{t.createAccount}</h1>
          {error && <p className="alert">{error}</p>}
          {info && <p className="empty">{info}</p>}
          {success && (
            <CelebrationPanel
              compact
              title={t.checkYourEmail}
              description={t.confirmEmailCopy}
            />
          )}
          <div className="form-grid">
            <label>
              {t.firstName}
              <input required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
            </label>
            <label>
              {t.lastName}
              <input required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
            </label>
          </div>
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
          <button disabled={pending}>{pending ? t.creatingAccount : t.register}</button>
          {success ? (
            <button type="button" className="ghost" disabled={resending} onClick={resendVerification}>
              {resending ? t.resendingEmail : t.resendConfirmation}
            </button>
          ) : null}
          <Link to="/login">{t.login}</Link>
        </form>
      </div>
    </section>
  );
}
