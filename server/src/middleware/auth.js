import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

const secret = process.env.JWT_SECRET || 'skylink-secret-123';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch (_error) {
    return next(new AppError('Invalid or expired token.', 401));
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    req.user = jwt.verify(token, secret);
  } catch (_error) {
    req.user = null;
  }

  return next();
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required.', 403));
  }

  return next();
}
