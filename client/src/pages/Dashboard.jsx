import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const { apiKey, plan, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p><strong>Plan:</strong> {plan}</p>
      <p><strong>API Key:</strong> {apiKey}</p>
      <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy API Key'}</button>
      <br /><br />
      <nav>
        <Link to="/playground">Go to Playground</Link> | <Link to="/analytics">Go to Analytics</Link>
      </nav>
      <br /><br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;