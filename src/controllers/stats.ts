import { Request, Response } from "express";
import { statsSchema } from "../schema/stats";
import bairros from "../mocks/bairros";
import focos from "../mocks/focos";
import statsServicePontenova from "../services/stats";

export default async function statsController(req: Request, res: Response) {
  try {
    const data = statsSchema.safeParse(req.params);

    if (!data.success) {
      res.status(422).json({ error: data.error });
    }

    const result = await statsServicePontenova(data.data!);

    res.send(result);
  } catch (error) {}
}
