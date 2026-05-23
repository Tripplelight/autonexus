// src/middleware/auth.js
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role };
    }
  } catch {}
  next();
};

// Legacy — kept for backward compat, maps to SUPER_ADMIN
export const adminOnly = (req, res, next) => {
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role))
    return res.status(403).json({ message: 'Admin access required' });
  next();
};

export const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'SUPER_ADMIN')
    return res.status(403).json({ message: 'Super admin access required' });
  next();
};

export const dealerOnly = (req, res, next) => {
  if (!['DEALER', 'SUPER_ADMIN'].includes(req.user?.role))
    return res.status(403).json({ message: 'Dealer access required' });
  next();
};

export const dealerOrAdmin = (req, res, next) => {
  if (!['DEALER', 'SUPER_ADMIN', 'ADMIN'].includes(req.user?.role))
    return res.status(403).json({ message: 'Access denied' });
  next();
};