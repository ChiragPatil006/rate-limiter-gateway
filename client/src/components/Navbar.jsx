import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { plan, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-dot"></span>
        RateGate
      </div>
      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/playground" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Playground
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Analytics
        </NavLink>
      </nav>
      <div className="nav-footer">
        {plan && <div className="plan-chip">{plan} plan</div>}
        <button className="btn btn-danger-outline" style={{ width: '100%' }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Navbar;