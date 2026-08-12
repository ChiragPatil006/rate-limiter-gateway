import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = { allowed: '#5EEAD4', blocked: '#FB7185' };

const Analytics = () => {
  const { apiKey } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get('/analytics/summary', {
          headers: { 'x-api-key': apiKey }
        });
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [apiKey]);

  if (loading) return <p>Loading analytics…</p>;
  if (!data) return <p>Failed to load analytics.</p>;

  const pieData = data.statusCounts.map((item) => ({ name: item._id, value: item.count }));
  const lineData = data.requestsOverTime.map((item) => ({ time: item._id, requests: item.count }));

  return (
    <div>
      <div className="eyebrow">Insights</div>
      <h2>Analytics</h2>
      <p style={{ marginBottom: 24 }}>Aggregated view of your gateway traffic.</p>

      <div className="card">
        <div className="eyebrow">Requests over time</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={lineData}>
            <CartesianGrid stroke="#232E3F" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#57647A" fontSize={11} />
            <YAxis allowDecimals={false} stroke="#57647A" fontSize={11} />
            <Tooltip contentStyle={{ background: '#121A26', border: '1px solid #232E3F', borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="requests" stroke="#7C9CFF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="eyebrow">Allowed vs blocked</div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.name] || '#999'} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#121A26', border: '1px solid #232E3F', borderRadius: 8 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="eyebrow">Recent requests</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Endpoint</th><th>Algorithm</th><th>Status</th><th>Latency</th><th>Time</th>
            </tr>
          </thead>
          <tbody>
            {data.recentRequests.map((req) => (
              <tr key={req._id}>
                <td className="mono">{req.endpoint}</td>
                <td className="mono">{req.algorithm}</td>
                <td>
                  <span className={`badge ${req.status === 'allowed' ? 'badge-allowed' : 'badge-blocked'}`}>
                    {req.status}
                  </span>
                </td>
                <td className="mono">{req.responseTimeMs}ms</td>
                <td className="mono">{new Date(req.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;