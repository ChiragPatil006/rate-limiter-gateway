import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = { allowed: '#28a745', blocked: '#dc3545' };

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

  if (loading) return <p>Loading analytics...</p>;
  if (!data) return <p>Failed to load analytics.</p>;

  const pieData = data.statusCounts.map((item) => ({
    name: item._id,
    value: item.count
  }));

  const lineData = data.requestsOverTime.map((item) => ({
    time: item._id,
    requests: item.count
  }));

  return (
    <div>
      <h2>Analytics</h2>

      <h3>Requests Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="requests" stroke="#007bff" />
        </LineChart>
      </ResponsiveContainer>

      <h3>Allowed vs Blocked</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
            {pieData.map((entry, index) => (
              <Cell key={index} fill={COLORS[entry.name] || '#999'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <h3>Recent Requests</h3>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Algorithm</th>
            <th>Status</th>
            <th>Response Time (ms)</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {data.recentRequests.map((req) => (
            <tr key={req._id}>
              <td>{req.endpoint}</td>
              <td>{req.algorithm}</td>
              <td>{req.status}</td>
              <td>{req.responseTimeMs}</td>
              <td>{new Date(req.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Analytics;