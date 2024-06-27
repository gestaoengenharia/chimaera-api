import { Request, Response } from "express";
import getTiles from "../services/tiles";

export async function proxyTiles(req: Request, res: Response): Promise<void> {
  const path = req.originalUrl.split("/tiles")[1];

  try {
    const { data, headers } = await getTiles(path);

    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch data",
      error,
    });
  }
}
