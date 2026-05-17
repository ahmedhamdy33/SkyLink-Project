import { NavLink } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function AdminNav() {
  const { t } = usePreferences();

  return (
    <nav className="admin-subnav" aria-label={t.admin}>
      <NavLink to="/admin" end>
        {t.analytics}
      </NavLink>
      <NavLink to="/admin/aircraft">{t.aircraft}</NavLink>
      <NavLink to="/admin/add-flight">{t.addFlight}</NavLink>
      <NavLink to="/admin/discounts">{t.discount}</NavLink>
      <NavLink to="/admin/flights">{t.manageSchedule}</NavLink>
      <NavLink to="/admin/users">{t.users}</NavLink>
    </nav>
  );
}
