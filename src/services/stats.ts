import { z } from "zod";
import { statsSchema } from "../schema/stats";
import bairros from "../mocks/bairros";
import focos from "../mocks/focos";
import client from "../repositories/db";

const db = client;

export default async function statsServicePontenova(
  params: z.infer<typeof statsSchema>
) {
  try {
    const totalFocosQuery = await db.query(
      `
      SELECT COUNT(*) AS total_focos
      FROM data.focos
      WHERE data BETWEEN $1 AND $2
      AND geom && ST_MakeEnvelope($3, $4, $5, $6, 4326);
    `,
      [params.start, params.end, params.swX, params.swY, params.neX, params.neY]
    );

    const totalFocos = totalFocosQuery.rows[0].total_focos;

    const mediaFocosQuery = await db.query(
      `
      SELECT AVG(focos_por_dia) AS media_focos_dia
      FROM (
          SELECT DATE(data) AS dia, COUNT(*) AS focos_por_dia
          FROM data.focos
          WHERE data BETWEEN $1 AND $2
          AND geom && ST_MakeEnvelope($3, $4, $5, $6, 4326)
          GROUP BY DATE(data)
      ) subquery;
    `,
      [params.start, params.end, params.swX, params.swY, params.neX, params.neY]
    );

    const mediaFocos = mediaFocosQuery.rows[0].media_focos_dia;

    const aumentoMesmoPeriodoQuery = await db.query(
      `
      WITH focos_ano_corrente AS (
        SELECT COUNT(*) AS total_focos
        FROM data.focos
        WHERE data BETWEEN $1 AND $2
        AND geom && ST_MakeEnvelope($3, $4, $5, $6, 4326)
      ),
      focos_ano_anterior AS (
        SELECT COUNT(*) AS total_focos
        FROM data.focos
        WHERE data BETWEEN $3 AND $4
        AND geom && ST_MakeEnvelope($3, $4, $5, $6, 4326)
      )
      SELECT 
        (focos_ano_corrente.total_focos - focos_ano_anterior.total_focos) AS aumento,
        (focos_ano_corrente.total_focos - focos_ano_anterior.total_focos) * 100.0 / focos_ano_anterior.total_focos AS aumento_percentual
      FROM focos_ano_corrente, focos_ano_anterior;
    `,
      [
        params.start,
        params.end,
        new Date(
          params.start.getFullYear() - 1,
          params.start.getMonth(),
          params.start.getDate()
        ),
        new Date(
          params.end.getFullYear() - 1,
          params.end.getMonth(),
          params.end.getDate()
        ),
        params.swX,
        params.swY,
        params.neX,
        params.neY,
      ]
    );

    const aumentoMesmoPeriodoQtde = aumentoMesmoPeriodoQuery.rows[0].aumento;
    const aumentoMesmoPeriodoPerc =
      aumentoMesmoPeriodoQuery.rows[0].aumento_percentual;

    const mesComMaiorNumeroQuery = await db.query(
      `
      SELECT TO_CHAR(data, 'YYYY-MM') AS mes, COUNT(*) AS total_focos
      FROM data.focos
      WHERE data BETWEEN $1 AND $2
      AND geom && ST_MakeEnvelope($3, $4, $5, $6, 4326)
      GROUP BY TO_CHAR(data, 'YYYY-MM')
      ORDER BY total_focos DESC
      LIMIT 1;
    `,
      [params.start, params.end, params.swX, params.swY, params.neX, params.neY]
    );

    const mesComMaiorNumero = mesComMaiorNumeroQuery.rows[0].mes;
    const mesComMaiorNumeroQtde = mesComMaiorNumeroQuery.rows[0].total_focos;

    return {
      meta: params,
      bairros: bairros,
      focos: focos,
      stats: {
        totalFocos,
        mediaFocos,
        aumentoMesmoPeriodoPerc,
        aumentoMesmoPeriodoQtde,
        mesComMaiorNumero,
        mesComMaiorNumeroQtde,
      },
    };
  } catch (error) {
    throw error;
  }
}
