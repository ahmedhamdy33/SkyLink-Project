import { KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

const accountCopy = {
  en: {
    eyebrow: 'Passenger account',
    title: 'Account details',
    intro: 'Manage your profile, email address, and password from one secure place.',
    profile: 'Profile information',
    username: 'Username',
    email: 'Email',
    phone: 'Phone',
    nationality: 'Nationality',
    emailStatus: 'Email status',
    verified: 'Verified',
    needsVerification: 'Needs verification',
    saveProfile: 'Save profile',
    password: 'Password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    changePassword: 'Change password',
    maskedPassword: 'Password is hidden for your security.',
    profileSaved: 'Account updated successfully.',
    passwordSaved: 'Password updated successfully.',
    emailSent: 'A confirmation email was sent.',
    emailSkipped: 'Email delivery is not configured yet.'
  },
  ar: {
    eyebrow: 'حساب المسافر',
    title: 'بيانات الحساب',
    intro: 'إدارة الاسم والبريد الإلكتروني وكلمة المرور من مكان آمن واحد.',
    profile: 'معلومات الحساب',
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    nationality: 'الجنسية',
    emailStatus: 'حالة البريد',
    verified: 'مؤكد',
    needsVerification: 'يحتاج تأكيد',
    saveProfile: 'حفظ البيانات',
    password: 'كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    changePassword: 'تغيير كلمة المرور',
    maskedPassword: 'كلمة المرور مخفية لحماية حسابك.',
    profileSaved: 'تم تحديث الحساب بنجاح.',
    passwordSaved: 'تم تحديث كلمة المرور بنجاح.',
    emailSent: 'تم إرسال رسالة تأكيد.',
    emailSkipped: 'إرسال البريد غير مفعّل حاليا.'
  }
};

export default function Account() {
  const { token, updateAuth } = useAuth();
  const { language } = usePreferences();
  const copy = accountCopy[language] || accountCopy.en;
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '', nationality: '', isEmailVerified: false });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api
      .getMyAccount()
      .then((data) => {
        const user = data.user;
        setProfile({
          fullName: user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
          nationality: user.nationality || '',
          isEmailVerified: user.is_email_verified
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  function describeDelivery(status) {
    if (status === 'sent') return ` ${copy.emailSent}`;
    if (status === 'skipped' || status === 'failed') return ` ${copy.emailSkipped}`;
    return '';
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      const result = await api.updateMyAccount({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        nationality: profile.nationality
      });
      setProfile({
        fullName: result.user.full_name || '',
        email: result.user.email || '',
        phone: result.user.phone || '',
        nationality: result.user.nationality || '',
        isEmailVerified: result.user.is_email_verified
      });
      updateAuth({ token: result.token || token, user: result.user });
      setNotice(`${copy.profileSaved}${describeDelivery(result.emailDeliveryStatus)}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      const result = await api.changeMyPassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setNotice(`${copy.passwordSaved}${describeDelivery(result.emailDeliveryStatus)}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="content-section page-top account-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="section-copy">{copy.intro}</p>
        </div>
        <div className="page-banner-card">
          <span>{copy.emailStatus}</span>
          <strong>{profile.isEmailVerified ? copy.verified : copy.needsVerification}</strong>
          <p>{profile.email}</p>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {notice && <p className="success">{notice}</p>}

      <div className="account-grid">
        <form className="admin-form account-card" onSubmit={saveProfile}>
          <div className="account-card-head">
            <UserRound size={20} />
            <div>
              <p className="eyebrow">{copy.profile}</p>
              <h2>{copy.username}</h2>
            </div>
          </div>
          <label>
            {copy.username}
            <input required value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} />
          </label>
          <label>
            {copy.email}
            <input required type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
          </label>
          <div className="form-grid">
            <label>
              {copy.phone}
              <input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
            </label>
            <label>
              {copy.nationality}
              <input value={profile.nationality} onChange={(event) => setProfile({ ...profile, nationality: event.target.value })} />
            </label>
          </div>
          <button>
            <Mail size={16} />
            {copy.saveProfile}
          </button>
        </form>

        <form className="admin-form account-card" onSubmit={changePassword}>
          <div className="account-card-head">
            <KeyRound size={20} />
            <div>
              <p className="eyebrow">{copy.password}</p>
              <h2>••••••••</h2>
            </div>
          </div>
          <p className="section-copy">{copy.maskedPassword}</p>
          <label>
            {copy.currentPassword}
            <input
              required
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
            />
          </label>
          <label>
            {copy.newPassword}
            <input
              required
              minLength="8"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
            />
          </label>
          <button>
            <ShieldCheck size={16} />
            {copy.changePassword}
          </button>
        </form>
      </div>
    </section>
  );
}
