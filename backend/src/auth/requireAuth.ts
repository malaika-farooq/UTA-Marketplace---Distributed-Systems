import { NextFunction, Request, Response } from "express";
import { verifyToken } from "./jwt.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      token?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = String(req.headers.authorization || "");
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return res.status(401).json({ error: "missing token" });

  const userId = verifyToken(token);
  if (!userId) return res.status(401).json({ error: "invalid token" });

  req.userId = userId;
  req.token = token;
  next();
}