import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import listingsRoutes from "./routes/listings.routes.js";
import configRoutes from "./routes/config.routes.js";
import messagingRoutes from "./routes/messaging.routes.js";

dotenv.config();

const app = express();

const ORIGIN = process.env.CORS_ORIGIN || true;
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/listings", listingsRoutes);
app.use("/config", configRoutes);
app.use("/messaging", messagingRoutes);

const port = Number(process.env.PORT || 8080);
app.listen(port, "0.0.0.0", () => console.log(`backend listening on ${port}`));