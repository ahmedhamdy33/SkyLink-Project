import { Link, NavLink } from 'react-router-dom';
import { CircleDollarSign, Languages, LogOut, MoonStar, Plane, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { t, theme, language, currency, currencies, setCurrencyCode, toggleTheme, toggleLanguage } = usePreferences();

  return (
    <header className="navbar">
      <div className="navbar-shell">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Plane size={20} />
          </span>
          <span>SkyLink</span>
        </Link>

        <nav className="navlinks">
          <NavLink to="/">{t.home}</NavLink>
          <NavLink to="/flights">{t.flights}</NavLink>
          {user && <NavLink to="/bookings">{t.myBookings}</NavLink>}
          {isAdmin && <NavLink to="/admin">{t.admin}</NavLink>}
        </nav>

        <div className="nav-actions">
          <label className="currency-control" aria-label="Currency">
            <CircleDollarSign size={16} />
            <span>{currency.symbol}</span>
            <select className="currency-select" value={currency.currency_code} onChange={(event) => setCurrencyCode(event.target.value)}>
              {currencies.map((item) => (
                <option key={item.currency_code} value={item.currency_code}>
                  {item.currency_code === 'EGP' ? 'EG EGP' : item.currency_code}
                </option>
              ))}
            </select>
          </label>
          <button className="ghost icon-button" onClick={toggleTheme}>
            <MoonStar size={16} />
            <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="ghost icon-button" onClick={toggleLanguage}>
            <Languages size={16} />
            <span>{language === 'en' ? 'EN' : 'AR'}</span>
          </button>
          {user ? (
            <>
              <span className="username">
                <UserCircle2 size={16} />
                {user.full_name}
              </span>
              <button className="icon-button" onClick={logout}>
                <LogOut size={16} />
                <span>{t.logout}</span>
              </button>
            </>
          ) : (
            <>
              <Link className="button ghost" to="/login">
                {t.login}
              </Link>
              <Link className="button" to="/register">
                {t.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
