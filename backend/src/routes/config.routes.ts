import { Router } from "express";
import { MARKETPLACE_CONFIG } from "../data/marketplace.mem.js";

const r = Router();

r.get("/marketplace", (_req, res) => res.json(MARKETPLACE_CONFIG));

export default r;