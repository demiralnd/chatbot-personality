import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

export function requireAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}