import type { Request, Response, NextFunction } from 'express';

export function requireRole(role: 'doctor' | 'patient') {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;
    if (!auth || !auth.userMetadata || auth.userMetadata.role !== role) {
      return res.status(403).json({ error: 'Access denied. Incorrect role.' });
    }
    next();
  };
}