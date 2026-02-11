import { Router } from "express";
import { signToken } from "../auth/jwt";

const r = Router();

// POST /auth/dev-login { userId }
r.post("/dev-login", (req, res) => {
  const userId = String((req.body as { userId?: unknown })?.userId ?? "").trim();
  if (!userId) return res.status(400).json({ error: "userId required" });

  // TODO: later validate userId exists in DB
  const token = signToken(userId);

  return res.json({ token, userId });
});

export default r;