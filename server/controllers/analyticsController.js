const RequestLog = require('../models/RequestLog');

const getSummary = async (req, res) => {
  try {
    const apiKey = req.gatewayUser?.apiKey || req.query.apiKey;

    // Total counts by status
    const statusCounts = await RequestLog.aggregate([
      { $match: { apiKey } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Requests over time (grouped by minute, for a simple time-series)
    const requestsOverTime = await RequestLog.aggregate([
      { $match: { apiKey } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d %H:%M', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent requests (last 20)
    const recentRequests = await RequestLog.find({ apiKey })
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({
      statusCounts,
      requestsOverTime,
      recentRequests
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

module.exports = { getSummary };