import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Fallback secrets for development/hackathon (MUST be changed in real production!)
// Hackathon demo keys - DO NOT USE IN REAL PRODUCTION
const JWT_SECRET = process.env.JWT_SECRET || 'f0cac1feef9a71f7a994cb2bb97aaaefd5d9f6ff10a3367456b018b03ddc0eab';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '0a038d4f2703a6f2850f3fa966394a46364f4d02893b9fd72f160a657773cc1a';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ ТОЛЬКО ДЛЯ ХАКАТОНА: Используется JWT_SECRET по умолчанию. Пожалуйста, установите собственный секрет в реальной среде!');
}

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function generateTokens(payload: JwtPayload) {
  // Clean the payload to remove any existing exp/iat properties
  const { exp, iat, ...cleanPayload } = payload;

  const authToken = jwt.sign(cleanPayload, JWT_SECRET, {
    expiresIn: '10m',
  });

  const refreshToken = jwt.sign(cleanPayload, JWT_REFRESH_SECRET, {
    expiresIn: '2w',
  });

  return { authToken, refreshToken };
}

export function verifyAuthToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  const payload = verifyAuthToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
}

export function roleMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
