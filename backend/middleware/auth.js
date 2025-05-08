const jwt = require('jsonwebtoken');
const roles = require('../roles');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  const sessionId = req.headers.sessionid;

  if (!token || !sessionId) {
    return res.status(401).json({ message: 'No token or session ID provided' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if the session is valid
    if (!sessions[sessionId] || sessions[sessionId].userId !== decoded.userId || sessions[sessionId].token !== token) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    req.user = decoded;
    next();
  });
};

const authorize = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const rolePermissions = roles[userRole].permissions;

    if (rolePermissions.includes(permission)) {
      next();
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }
  };
};

module.exports = { verifyToken, authorize };
