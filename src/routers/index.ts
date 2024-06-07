import express from "express";

const router = express.Router();

/* Rotas utilitárias */
router.get("/health", async (req, res) => {
  await res.json({ alive: true });
});

export default router;
