import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import gatewayInstance from '../api/gatewayInstance';

const Playground = () => {
    const { apiKey } = useAuth();
    const [logs, setLogs] = useState([]);
    const [algorithm, setAlgorithm] = useState('token');

    const sendSingleRequest = async () => {
        const startTime = Date.now();
        try {
            const response = await gatewayInstance.get('/weather', {
                headers: {
                    'x-api-key': apiKey,
                    'x-algorithm': algorithm
                }
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
        const entry = {
            status,
            data,
            duration,
            timestamp: new Date().toLocaleTimeString()
        };
        setLogs((prevLogs) => [entry, ...prevLogs]); // newest on top
    };

    const runSpamTest = async () => {
        const requestCount = 20;
        const promises = [];
        for (let i = 0; i < requestCount; i++) {
            promises.push(sendSingleRequest());
        }
        await Promise.all(promises);
    };

    return (
        <div>
            <h2>API Playground</h2>

            <div>
                <label>Active Algorithm: </label>
                <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                    <option value="fixed">Fixed Window</option>
                    <option value="sliding">Sliding Window Log</option>
                    <option value="token">Token Bucket</option>
                </select>
            </div>

            <br />

            <button onClick={sendSingleRequest}>Send Request</button>
            <button onClick={runSpamTest}>Spam Test (20 requests)</button>

            <h3>Live Log</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {logs.map((log, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '8px',
                            marginBottom: '4px',
                            backgroundColor: log.status === 'allowed' ? '#d4edda' : '#f8d7da',
                            borderRadius: '4px'
                        }}
                    >
                        {log.status === 'allowed' ? '✅ Allowed' : log.status === 'blocked' ? '❌ Blocked (429)' : '⚠️ Error'}
                        {' — '}{log.timestamp}{' — '}{log.duration}ms
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Playground;