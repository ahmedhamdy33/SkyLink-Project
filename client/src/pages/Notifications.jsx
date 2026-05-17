import { Bell, CheckCircle2, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Notifications() {
  const { t } = usePreferences();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getNotifications()
      .then(setNotifications)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="content-section page-top notifications-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">{t.notificationCenter || 'SkyLink updates'}</p>
          <h1>{t.notifications || 'Notifications'}</h1>
          <p className="section-copy">
            {t.notificationsCopy || 'Track booking updates, travel notices, and product changes from one place.'}
          </p>
        </div>
        <div className="page-banner-card">
          <span>{t.unread || 'Updates'}</span>
          <strong>{notifications.length}</strong>
          <p>{t.latestFirst || 'Latest first'}</p>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      <div className="notifications-list">
        {notifications.map((notification, index) => (
          <article className="notification-item" key={notification.id || notification.notification_id || index}>
            <span className="notification-icon">
              {index === 0 ? <Bell size={18} /> : index % 2 ? <Info size={18} /> : <CheckCircle2 size={18} />}
            </span>
            <div>
              <div className="notification-head">
                <h2>{notification.title}</h2>
                {notification.created_at && <time>{new Date(notification.created_at).toLocaleString()}</time>}
              </div>
              <p>{notification.body}</p>
            </div>
          </article>
        ))}
      </div>

      {!notifications.length && !error && <p className="empty">{t.noNotifications || 'No notifications yet.'}</p>}
    </section>
  );
}
