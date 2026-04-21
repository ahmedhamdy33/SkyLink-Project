import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import AdminNav from '../components/AdminNav.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function AdminDashboard() {
  const { t, formatMoney } = usePreferences();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAnalytics().then(setAnalytics).catch((err) => setError(err.message));
  }, []);

  const maxClassPassengers = Math.max(1, ...(analytics?.classCategories || []).map((item) => Number(item.passengerCount || 0)));

  return (
    <section className="content-section page-top admin-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">SkyLink control center</p>
          <h1>{t.adminDashboard}</h1>
          <p className="section-copy">Monitor bookings, revenue, cabin demand, and operational activity from one focused analytics page.</p>
        </div>
        <div className="page-banner-card">
          <span>Operations status</span>
          <strong>Live</strong>
          <p>Analytics synced</p>
        </div>
      </div>

      <AdminNav />

      {error && <p className="alert">{error}</p>}

      {analytics && (
        <section className="stats-grid">
          <article>
            <span>{t.totalUsers}</span>
            <strong>{analytics.totalUsers}</strong>
          </article>
          <article>
            <span>{t.totalBookings}</span>
            <strong>{analytics.totalBookings}</strong>
          </article>
          <article>
            <span>{t.totalRevenue}</span>
            <strong>{formatMoney(analytics.totalRevenue)}</strong>
          </article>
          <article>
            <span>{t.mostBooked}</span>
            <strong>{analytics.mostBookedFlights?.[0]?.flight_code || '-'}</strong>
          </article>
        </section>
      )}

      {analytics?.classCategories?.length > 0 && (
        <section className="chart-panel">
          <div>
            <p className="eyebrow">{t.analytics}</p>
            <h2>{t.mostBookedClasses}</h2>
          </div>
          <div className="bar-chart">
            {analytics.classCategories.map((category) => {
              const width = `${Math.max(8, (Number(category.passengerCount || 0) / maxClassPassengers) * 100)}%`;
              return (
                <article className="bar-row" key={category.class_type}>
                  <div className="bar-meta">
                    <strong>{category.class_type}</strong>
                    <span>
                      {category.passengerCount} {t.passengersLabel} | {category.bookingCount} {t.bookingsLabel}
                    </span>
                  </div>
                  <div className="bar-track">
                    <span style={{ width }} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}
