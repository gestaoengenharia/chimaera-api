import { Request, Response } from "express";
import { statsSchema } from "../schema/stats";
import statsServicePontenova from "../services/stats";

export default async function statsController(req: Request, res: Response) {
  try {
    const data = statsSchema.safeParse(req.params);

    if (!data.success) {
      res.status(422).json({ error: data.error });
      return;
    }

    const result = await statsServicePontenova(data.data!);

    res.send(result);
    return
  } catch (error) {
    res.status(500).json({ error });
  }
}
