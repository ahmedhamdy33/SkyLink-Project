import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CelebrationPanel from '../components/CelebrationPanel.jsx';
import { api } from '../api/client.js';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function VerifyEmail() {
  const { t } = usePreferences();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ status: 'pending', message: t.confirmingAccount });
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setState({ status: 'error', message: t.missingToken });
      return;
    }

    if (hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;

    api
      .verifyEmail(token)
      .then((data) => {
        setState({
          status: 'success',
          message: data?.message || t.emailConfirmed
        });
      })
      .catch((error) => {
        setState({
          status: 'error',
          message: error.message || t.invalidToken
        });
      });
  }, [searchParams]);

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual">
          <p className="eyebrow">{t.verifyEmailEyebrow}</p>
          <h1>{t.verifyEmailTitle}</h1>
          <p>{t.verifyEmailCopy}</p>
        </div>

        <div className="auth-panel">
          <p className="eyebrow">SkyLink</p>
          <h1>{t.verifyEmail}</h1>

          {state.status === 'pending' ? <p className="empty">{state.message}</p> : null}

          {state.status === 'success' ? (
            <CelebrationPanel
              compact
              title={t.emailConfirmedTitle}
              description={state.message}
            />
          ) : null}

          {state.status === 'error' ? <p className="alert">{state.message}</p> : null}

          <div className="auth-verify-actions">
            <Link className="button" to="/login">
              {t.goToLogin}
            </Link>
            <Link className="button ghost" to="/register">
              {t.backToSignup}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
