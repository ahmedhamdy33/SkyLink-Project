import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { sitePages } from '../data/sitePages.js';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function SiteInfoPage() {
  const { pathname } = useLocation();
  const { language, t } = usePreferences();
  const localizedPages = sitePages[language] || sitePages.en;
  const page = localizedPages[pathname] ?? localizedPages['/company'];

  return (
    <section className="site-info-page">
      <div className="site-info-hero">
        <div className="site-info-copy">
          <span className="section-eyebrow">{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <div className="site-info-actions">
            <Link className="primary-link-pill" to="/flights">
              {t.browseFlights}
              <ArrowRight size={16} />
            </Link>
            <Link className="secondary-link-pill" to="/assistant">
              {t.askAssistant}
            </Link>
          </div>
        </div>

        <div className="site-info-spotlight">
          <div className="site-info-panel">
            <div className="site-info-panel-icon">
              <Sparkles size={18} />
            </div>
            <h2>{t.skyLinkSnapshot}</h2>
            <div className="site-info-facts">
              {(page.heroFacts ?? []).map((fact) => (
                <div key={fact.label} className="site-info-fact-card">
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="site-info-grid">
        {page.sections.map((section) => (
          <article key={section.title} className="site-info-card">
            <div className="site-info-card-head">
              <div className="site-info-card-mark">
                {section.bullets ? <Compass size={16} /> : <ShieldCheck size={16} />}
              </div>
              <h2>{section.title}</h2>
            </div>
            {section.body ? <p>{section.body}</p> : null}
            {section.bullets ? (
              <ul>
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
