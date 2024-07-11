import { Request, Response } from "express";
import { statsSchema } from "../schema/stats";
import bairros from "../mocks/bairros";
import focos from "../mocks/focos";

export default function statsController(req: Request, res: Response) {
  const data = statsSchema.safeParse(req.params);

  if (data.success) {
    res.send({ meta: data.data, bairros: bairros, focos: focos });
  } else {
    res.status(422).json({ error: data.error });
  }
}
