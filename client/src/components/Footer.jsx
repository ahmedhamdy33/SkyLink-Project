import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plane } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function Footer() {
  const { currency, language, t } = usePreferences();
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-locale-column">
          <button type="button" className="footer-locale-pill">
            <span>{t.footerCountry}</span>
            <span>{language === 'ar' ? t.footerArabic : t.footerEnglish}</span>
            <span>{currency.symbol} {currency.currency_code}</span>
          </button>
        </div>

        <div className="footer-links">
          <div>
            <Link to="/help-center">{t.footerHelp}</Link>
            <Link to="/privacy-settings">{t.footerPrivacySettings}</Link>
            <Link to="/login">{t.login}</Link>
          </div>
          <div>
            <Link to="/cookie-policy">{t.footerCookiePolicy}</Link>
            <Link to="/privacy-policy">{t.footerPrivacyPolicy}</Link>
            <Link to="/terms-of-service">{t.footerTerms}</Link>
            <Link to="/company-details">{t.footerCompanyDetails}</Link>
          </div>

          <div className="footer-expand-groups">
            <button
              type="button"
              className={`footer-expand-row ${isExploreOpen ? 'is-open' : ''}`}
              onClick={() => setIsExploreOpen((value) => !value)}
            >
              <span>{t.footerExplore}</span>
              <ChevronDown size={18} />
            </button>
            {isExploreOpen ? (
              <div className="footer-expand-panel">
                <Link to="/" onClick={() => setIsExploreOpen(false)}>{t.home}</Link>
                <Link to="/flights" onClick={() => setIsExploreOpen(false)}>{t.flights}</Link>
                <Link to="/assistant" onClick={() => setIsExploreOpen(false)}>{t.assistant}</Link>
                <Link to="/bookings" onClick={() => setIsExploreOpen(false)}>{t.myBookings}</Link>
              </div>
            ) : null}
            <Link to="/company" className="footer-expand-row footer-expand-link">
              <span>{t.footerCompany}</span>
              <ChevronDown size={18} />
            </Link>
            <Link to="/partners" className="footer-expand-row footer-expand-link">
              <span>{t.footerPartners}</span>
              <ChevronDown size={18} />
            </Link>
            <Link to="/trips" className="footer-expand-row footer-expand-link">
              <span>{t.footerTrips}</span>
              <ChevronDown size={18} />
            </Link>
            <Link to="/international-sites" className="footer-expand-row footer-expand-link">
              <span>{t.footerInternational}</span>
              <ChevronDown size={18} />
            </Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t.footerTagline}</p>
        <div className="footer-signoff">
          <span className="footer-signoff-brand">
            <Plane size={15} />
            SkyLink
          </span>
          <span>Ltd 2002 - 2026</span>
        </div>
      </div>
    </footer>
  );
}
