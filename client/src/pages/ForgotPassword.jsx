import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useState } from 'react';
import { usePreferences } from '../context/PreferencesContext.jsx';

const copy = {
  en: {
    eyebrow: 'Account recovery',
    title: 'Reset your password',
    intro: 'Enter your email and we will send a secure reset link if the account exists.',
    email: 'Email',
    send: 'Send reset link',
    sent: 'If this email belongs to a SkyLink account, a password reset link has been sent.',
    emailSkipped: 'Email delivery is not configured yet.',
    back: 'Back to login'
  },
  ar: {
    eyebrow: 'استرجاع الحساب',
    title: 'إعادة تعيين كلمة المرور',
    intro: 'اكتب بريدك الإلكتروني وسنرسل رابطا آمنا لتغيير كلمة المرور إذا كان الحساب موجودا.',
    email: 'البريد الإلكتروني',
    send: 'إرسال رابط التغيير',
    sent: 'إذا كان هذا البريد مرتبطا بحساب SkyLink، فسيتم إرسال رابط تغيير كلمة المرور.',
    emailSkipped: 'إرسال البريد غير مفعّل حاليا.',
    back: 'العودة لتسجيل الدخول'
  }
};

export default function ForgotPassword() {
  const { language } = usePreferences();
  const text = copy[language] || copy.en;
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const result = await api.forgotPassword(email);
      const deliveryNote = ['skipped', 'failed'].includes(result.emailDeliveryStatus) ? ` ${text.emailSkipped}` : '';
      setNotice(`${result.message || text.sent}${deliveryNote}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual">
          <p className="eyebrow">{text.eyebrow}</p>
          <h1>{text.title}</h1>
          <p>{text.intro}</p>
        </div>
        <form className="auth-panel" onSubmit={submit}>
          <p className="eyebrow">SkyLink</p>
          <h1>{text.title}</h1>
          {error && <p className="alert">{error}</p>}
          {notice && <p className="success">{notice}</p>}
          <label>
            {text.email}
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <button disabled={submitting}>{text.send}</button>
          <Link to="/login">{text.back}</Link>
        </form>
      </div>
    </section>
  );
}
