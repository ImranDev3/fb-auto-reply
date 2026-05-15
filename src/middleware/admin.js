/**
 * Admin Middleware
 * Only allows users with role 'admin' to access
 */

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required.' });
  }
};

module.exports = { adminOnly };
