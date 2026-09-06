import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { env } from '../../config/env.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'SALES_PURCHASE']).optional().default('SALES_PURCHASE'),
  contactId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  const { name, email, password, role, contactId } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return sendError(res, 'A user with this email address already exists.', 'EMAIL_EXISTS', 400);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      contactId: contactId || null,
    },
    select: { id: true, name: true, email: true, role: true, contactId: true, createdAt: true },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    contactId: user.contactId,
  });

  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, { user, token }, 'User registered successfully.', 201);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return sendError(res, 'Invalid credentials or inactive account.', 'INVALID_CREDENTIALS', 401);
  }

  const match = await comparePassword(password, user.passwordHash);
  if (!match) {
    return sendError(res, 'Invalid credentials or inactive account.', 'INVALID_CREDENTIALS', 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    contactId: user.contactId,
  });

  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    contactId: user.contactId,
  };

  return sendSuccess(res, { user: safeUser, token }, 'Login successful.');
}

export async function logout(req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME);
  return sendSuccess(res, null, 'Logged out successfully.');
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, name: true, email: true, role: true, contactId: true, lastLoginAt: true, createdAt: true },
  });

  if (!user) {
    return sendError(res, 'User not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, user);
}
