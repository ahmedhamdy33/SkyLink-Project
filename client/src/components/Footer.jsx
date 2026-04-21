import { Link } from 'react-router-dom';
import { Plane, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand">
          <Link className="brand" to="/">
            <span className="brand-mark">
              <Plane size={20} />
            </span>
            <span>SkyLink</span>
          </Link>
          <p>Premium flight booking, seat selection, smart recommendations, and secure trip management in one modern platform.</p>
        </div>

        <div className="footer-links">
          <div>
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/flights">Flights</Link>
            <Link to="/bookings">My Bookings</Link>
          </div>
          <div>
            <h3>Experience</h3>
            <span><Sparkles size={15} /> AI recommendations</span>
            <span><ShieldCheck size={15} /> Secure payments</span>
            <span><Plane size={15} /> Live route search</span>
          </div>
          <div>
            <h3>Contact</h3>
            <span>support@skylink.demo</span>
            <span>Cairo, Egypt</span>
            <span>24/7 flight desk</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>SkyLink demo platform</span>
        <span>Built for premium airline booking experiences</span>
      </div>
    </footer>
  );
}
