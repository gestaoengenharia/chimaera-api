import express from "express";
import { proxyTiles } from "../controllers/tiles";
import statsController from "../controllers/stats";

const router = express.Router();

/* Rotas utilitárias */
router.get("/health", async (req, res) => {
  await res.json({ alive: true });
});

/* Rotas convencionais */
router.get("/stats/:tenant/:start/:end/:swX/:swY/:neX/:neY", statsController);

/* Rotas de proxy */
router.get("/tiles/*", proxyTiles);

export default router;
