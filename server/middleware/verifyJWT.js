const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  // 1. Get the token from the Authorization header
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>" -> just the token part

  try {
    // 2. Verify the token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach the decoded payload to req, so later routes know who's calling
    req.userId = decoded.userId;

    // 4. Pass control to the next handler
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyJWT;