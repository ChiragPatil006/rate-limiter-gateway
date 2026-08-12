import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { apiKey, plan } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="eyebrow">Overview</div>
      <h2>Dashboard</h2>
      <p style={{ marginBottom: 28 }}>Your gateway credentials and quick links.</p>

      <div className="card">
        <div className="eyebrow">Account</div>
        <p style={{ margin: '0 0 4px 0', color: 'var(--text)' }}>Plan: <span className="badge badge-allowed">{plan}</span></p>
        <div className="eyebrow" style={{ marginTop: 16 }}>API Key</div>
        <div className="key-box">{apiKey}</div>
        <button className="btn btn-primary" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy API Key'}
        </button>
      </div>

      <div className="card-row">
        <Link to="/playground" className="card" style={{ flex: 1, minWidth: 220, textDecoration: 'none', color: 'inherit' }}>
          <div className="eyebrow">Test live</div>
          <h3 style={{ marginBottom: 4 }}>Playground →</h3>
          <p>Send requests and watch rate limiting happen in real time.</p>
        </Link>
        <Link to="/analytics" className="card" style={{ flex: 1, minWidth: 220, textDecoration: 'none', color: 'inherit' }}>
          <div className="eyebrow">Inspect</div>
          <h3 style={{ marginBottom: 4 }}>Analytics →</h3>
          <p>See allowed vs blocked traffic and request history.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;