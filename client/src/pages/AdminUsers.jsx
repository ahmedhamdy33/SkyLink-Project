import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import AdminNav from '../components/AdminNav.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function AdminUsers() {
  const { t } = usePreferences();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setUsers(await api.getUsers());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteUser(id) {
    if (!window.confirm(t.deleteUserConfirm)) return;
    try {
      await api.deleteUser(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="content-section page-top admin-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">{t.passengerAccounts}</p>
          <h1>{t.users}</h1>
          <p className="section-copy">{t.usersCopy}</p>
        </div>
        <div className="page-banner-card">
          <span>{t.totalUsers}</span>
          <strong>{users.length}</strong>
          <p>{t.registeredAccounts}</p>
        </div>
      </div>

      <AdminNav />

      {error && <p className="alert">{error}</p>}

      <section className="admin-table">
        {users.map((user) => (
          <article className="table-row user-table-row" key={user.user_id}>
            <strong>{user.full_name}</strong>
            <span>{user.email}</span>
            <span>{user.phone || '-'}</span>
            <span>{user.nationality || '-'}</span>
            <span className="status">{t.statusLabels[user.role] || user.role}</span>
            <button className="ghost" disabled={user.role === 'admin'} onClick={() => deleteUser(user.user_id)}>
              {t.delete}
            </button>
          </article>
        ))}
        {!users.length && <p className="empty">{t.noUsersFound}</p>}
      </section>
    </section>
  );
}
