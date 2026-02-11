import { Request, Response, NextFunction } from 'express';
import { authClient } from '../grpc-clients.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.substring(7);

  authClient.ValidateToken({ token }, (err: any, response: any) => {
    if (err) {
      console.error('Token validation error:', err);
      return res.status(500).json({ error: 'Token validation failed' });
    }

    if (!response.valid) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = response.user_id;
    next();
  });
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  authClient.ValidateToken({ token }, (err: any, response: any) => {
    if (!err && response.valid) {
      req.userId = response.user_id;
    }
    next();
  });
}
