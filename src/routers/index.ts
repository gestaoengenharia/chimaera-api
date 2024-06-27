import express from "express";
import { proxyTiles } from "../controllers/tiles";

const router = express.Router();

/* Rotas utilitárias */
router.get("/health", async (req, res) => {
  await res.json({ alive: true });
});

/* Rotas de proxy */
router.get("/tiles/*", proxyTiles);

export default router;
