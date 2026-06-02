const jwt = require('jsonwebtoken');

const extractToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length);
};

exports.requireAdminAccess = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization || '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const accessCodePrefix = decoded?.accessCode?.slice(0, 2);

    if (accessCodePrefix !== 'AD') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
