import { CheckCircle2, Sparkles } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext.jsx';

export default function CelebrationPanel({ title, description, compact = false }) {
  const { t } = usePreferences();

  return (
    <div className={`celebration-panel ${compact ? 'compact' : ''}`} aria-live="polite">
      <span className="celebration-orb celebration-orb-one" />
      <span className="celebration-orb celebration-orb-two" />
      <span className="celebration-orb celebration-orb-three" />

      <div className="celebration-icon">
        <CheckCircle2 size={22} />
      </div>

      <div className="celebration-copy">
        <p className="eyebrow">
          <Sparkles size={14} />
          {t.success}
        </p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
