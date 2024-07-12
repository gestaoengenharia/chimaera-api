import { z } from "zod";
import bairros from "../mocks/bairros";
import focos from "../mocks/focos";
import client from "../repositories/db";
import { statsSchema } from "../schema/stats";

const db = client;

export default async function statsServicePontenova(
  params: z.infer<typeof statsSchema>
) {
  try {
    const startDateLastYear = new Date(
      params.start.getFullYear() - 1,
      params.start.getMonth(),
      params.start.getDate()
    );
    const endDateLastYear = new Date(
      params.end.getFullYear() - 1,
      params.end.getMonth(),
      params.end.getDate()
    );

    const combinedQuery = `
      WITH focos_periodo AS (
        SELECT 
          DATE(data) AS dia, 
          COUNT(*) AS focos_por_dia,
          TO_CHAR(data, 'YYYY-MM') AS mes
        FROM data.focos
        WHERE geom && ST_MakeEnvelope($3, $4, $5, $6, 4326)
        GROUP BY dia, mes
      ),
      focos_corrente AS (
        SELECT 
          COUNT(*) AS total_focos_corrente
        FROM data.focos
        WHERE data BETWEEN $1 AND $2
        AND geom && ST_MakeEnvelope($3, $4, $5, $6, 4326)
      ),
      focos_anterior AS (
        SELECT 
          COUNT(*) AS total_focos_ano_anterior
        FROM data.focos
        WHERE data BETWEEN $7 AND $8
        AND geom && ST_MakeEnvelope($3, $4, $5, $6, 4326)
      ),
      media_focos AS (
        SELECT
          AVG(focos_por_dia) AS media_focos_dia
        FROM focos_periodo
        WHERE dia BETWEEN $1 AND $2
      ),
      mes_maior_focos AS (
        SELECT
          mes,
          COUNT(*) AS total_focos_mes
        FROM focos_periodo
        GROUP BY mes
        ORDER BY total_focos_mes DESC
        LIMIT 1
      )
      SELECT
        focos_corrente.total_focos_corrente AS total_focos,
        media_focos.media_focos_dia,
        (focos_corrente.total_focos_corrente - focos_anterior.total_focos_ano_anterior) AS aumento,
        (focos_corrente.total_focos_corrente - focos_anterior.total_focos_ano_anterior) * 100.0 / focos_anterior.total_focos_ano_anterior AS aumento_percentual,
        mes_maior_focos.mes AS mes_com_mais_focos,
        mes_maior_focos.total_focos_mes AS total_focos_mes
      FROM focos_corrente, focos_anterior, media_focos, mes_maior_focos;
    `;

    const result = await db.query(combinedQuery, [
      params.start,
      params.end,
      params.swX,
      params.swY,
      params.neX,
      params.neY,
      startDateLastYear,
      endDateLastYear,
    ]);

    const stats = result.rows[0];

    return {
      meta: params,
      bairros: bairros,
      focos: focos,
      stats: {
        totalFocos: stats.total_focos,
        mediaFocos: stats.media_focos_dia,
        aumentoMesmoPeriodoPerc: stats.aumento_percentual,
        aumentoMesmoPeriodoQtde: stats.aumento,
        mesComMaiorNumero: stats.mes_com_mais_focos,
        mesComMaiorNumeroQtde: stats.total_focos_mes,
      },
    };
  } catch (error) {
    throw error;
  }
}
