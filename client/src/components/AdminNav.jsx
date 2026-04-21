import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  return (
    <nav className="admin-subnav" aria-label="Admin sections">
      <NavLink to="/admin" end>
        Analytics
      </NavLink>
      <NavLink to="/admin/add-flight">Add Flight</NavLink>
      <NavLink to="/admin/discounts">Add Discount</NavLink>
      <NavLink to="/admin/flights">Manage Flights</NavLink>
      <NavLink to="/admin/users">Users</NavLink>
    </nav>
  );
}
