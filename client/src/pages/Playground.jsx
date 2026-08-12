import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import gatewayInstance from '../api/gatewayInstance';

const Playground = () => {
  const { apiKey } = useAuth();
  const [logs, setLogs] = useState([]);
  const [algorithm, setAlgorithm] = useState('token');
  const [spamming, setSpamming] = useState(false);

  const sendSingleRequest = async () => {
    const startTime = Date.now();
    try {
      const response = await gatewayInstance.get('/weather', {
        headers: { 'x-api-key': apiKey, 'x-algorithm': algorithm }
      });
      addLog('allowed', response.data, Date.now() - startTime);
    } catch (err) {
      if (err.response?.status === 429) {
        addLog('blocked', err.response.data, Date.now() - startTime);
      } else {
        addLog('error', { message: 'Request failed' }, Date.now() - startTime);
      }
    }
  };

  const addLog = (status, data, duration) => {
    const entry = { status, data, duration, timestamp: new Date().toLocaleTimeString() };
    setLogs((prev) => [entry, ...prev]);
  };

  const runSpamTest = async () => {
    setSpamming(true);
    const promises = [];
    for (let i = 0; i < 20; i++) promises.push(sendSingleRequest());
    await Promise.all(promises);
    setSpamming(false);
  };

  const allowedCount = logs.filter((l) => l.status === 'allowed').length;
  const blockedCount = logs.filter((l) => l.status === 'blocked').length;
  const strip = [...logs].slice(0, 30).reverse();

  return (
    <div>
      <div className="eyebrow">Live testing</div>
      <h2>Playground</h2>
      <p style={{ marginBottom: 24 }}>Send requests through the gateway and watch the rate limiter respond in real time.</p>

      <div className="card">
        <div className="eyebrow">Active algorithm</div>
        <select className="input" style={{ maxWidth: 260, marginBottom: 16 }} value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
          <option value="fixed">Fixed Window</option>
          <option value="sliding">Sliding Window Log</option>
          <option value="token">Token Bucket</option>
        </select>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={sendSingleRequest}>Send Request</button>
          <button className="btn" onClick={runSpamTest} disabled={spamming}>
            {spamming ? 'Firing 20 requests…' : 'Spam Test (20 requests)'}
          </button>
        </div>
      </div>

      <div className="card-row">
        <div className="stat-tile">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{allowedCount}</div>
          <div className="stat-label">Allowed</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{blockedCount}</div>
          <div className="stat-label">Blocked</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{logs.length}</div>
          <div className="stat-label">Total requests</div>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Traffic pulse</div>
        <div className="pulse-strip">
          {strip.length === 0 && <span style={{ color: 'var(--text-faint)', fontSize: 12, alignSelf: 'center' }}>Send a request to see live traffic here</span>}
          {strip.map((log, i) => (
            <div key={i} className={`pulse-bar ${log.status === 'allowed' ? 'allowed' : 'blocked'}`}></div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Live log</div>
        <div className="log-list">
          {logs.map((log, index) => (
            <div className="log-entry" key={index}>
              <span className={`badge ${log.status === 'allowed' ? 'badge-allowed' : log.status === 'blocked' ? 'badge-blocked' : 'badge-error'}`}>
                {log.status === 'allowed' ? '✓ Allowed' : log.status === 'blocked' ? '✕ Blocked (429)' : '⚠ Error'}
              </span>
              <span className="log-meta">{log.timestamp} · {log.duration}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playground;