import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CircleDollarSign, Languages, LogOut, MoonStar, Plane, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { t, theme, language, currency, currencies, setCurrencyCode, toggleTheme, toggleLanguage } = usePreferences();
  const headerRef = useRef(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;

    const syncNavbarHeight = () => {
      const isMobileViewport = window.innerWidth <= 980;
      const height = isMobileViewport ? `${Math.ceil(header.getBoundingClientRect().height)}px` : '0px';
      document.documentElement.style.setProperty('--mobile-navbar-height', height);
    };

    syncNavbarHeight();

    const resizeObserver = new ResizeObserver(syncNavbarHeight);
    resizeObserver.observe(header);
    window.addEventListener('resize', syncNavbarHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncNavbarHeight);
      document.documentElement.style.setProperty('--mobile-navbar-height', '0px');
    };
  }, [user, isAdmin, theme, language, currency.currency_code]);

  return (
    <header className="navbar" ref={headerRef}>
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
          <NavLink to="/assistant">{t.assistant || 'AI Assistant'}</NavLink>
          {user && <NavLink to="/bookings">{t.myBookings}</NavLink>}
          {user && <NavLink to="/notifications">{t.notifications || 'Notifications'}</NavLink>}
          {user && <NavLink to="/account">{t.account || 'Account'}</NavLink>}
        </nav>

        <div className="nav-actions">
          <label className="currency-control" aria-label="Currency">
            <CircleDollarSign size={16} />
            <span>{currency.currency_code === 'EGP' ? 'EG EGP' : currency.currency_code}</span>
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
            <span>{theme === 'light' ? t.light : t.dark}</span>
          </button>
          <button className="ghost icon-button" onClick={toggleLanguage}>
            <Languages size={16} />
            <span>{language === 'en' ? 'EN' : 'AR'}</span>
          </button>
          {user ? (
            <>
              {isAdmin && (
                <NavLink className="button ghost nav-admin-button" to="/admin">
                  <ShieldCheck size={16} />
                  <span>{t.admin}</span>
                </NavLink>
              )}
              <Link className="username" to="/account">
                <UserCircle2 size={16} />
                {user.full_name}
              </Link>
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
