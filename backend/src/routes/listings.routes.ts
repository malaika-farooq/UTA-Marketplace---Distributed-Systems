import { Router } from "express";
import { LISTINGS } from "../data/listings.mem.js";

const r = Router();

// GET /listings?q=&categoryId=&maxPrice=
r.get("/", (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  const categoryId = String(req.query.categoryId ?? "").trim();
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

  const filtered = LISTINGS.filter((l) => {
    const matchQ = !q || l.title.toLowerCase().includes(q);
    const matchCat = !categoryId || categoryId === "all" || l.categoryId === categoryId;
    const matchPrice = maxPrice === null || Number.isNaN(maxPrice) ? true : l.price <= maxPrice;
    return matchQ && matchCat && matchPrice;
  });

  res.json({ listings: filtered });
});

export default r;