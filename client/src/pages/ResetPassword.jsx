import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client.js';
import { usePreferences } from '../context/PreferencesContext.jsx';

const copy = {
  en: {
    eyebrow: 'Secure reset',
    title: 'Choose a new password',
    intro: 'Use the reset link from your email to set a new SkyLink password.',
    password: 'New password',
    confirmPassword: 'Confirm password',
    submit: 'Update password',
    mismatch: 'Passwords do not match.',
    missingToken: 'This reset link is missing its token.',
    success: 'Password reset successfully. You can log in now.',
    login: 'Go to login'
  },
  ar: {
    eyebrow: 'تغيير آمن',
    title: 'اختر كلمة مرور جديدة',
    intro: 'استخدم رابط الاسترجاع من بريدك لتعيين كلمة مرور جديدة لحساب SkyLink.',
    password: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    submit: 'تحديث كلمة المرور',
    mismatch: 'كلمتا المرور غير متطابقتين.',
    missingToken: 'رابط التغيير لا يحتوي على الرمز المطلوب.',
    success: 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
    login: 'الذهاب لتسجيل الدخول'
  }
};

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { language } = usePreferences();
  const text = copy[language] || copy.en;
  const token = params.get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState(token ? '' : text.missingToken);
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (form.password !== form.confirmPassword) {
      setError(text.mismatch);
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.resetPassword({ token, password: form.password });
      setNotice(result.message || text.success);
      setTimeout(() => navigate('/login'), 1200);
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
            {text.password}
            <input
              required
              minLength="8"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              disabled={!token}
            />
          </label>
          <label>
            {text.confirmPassword}
            <input
              required
              minLength="8"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              disabled={!token}
            />
          </label>
          <button disabled={!token || submitting}>{text.submit}</button>
          <Link to="/login">{text.login}</Link>
        </form>
      </div>
    </section>
  );
}
