import { z } from "zod";
import bairros from "../mocks/bairros";
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
          TO_CHAR(data, 'MM') AS mes
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
      ),
      acumulado_focos AS (
        SELECT 
          generate_series($1::date, $2::date, '1 day'::interval) AS dia
      )
      SELECT
        COALESCE(focos_corrente.total_focos_corrente, 0) AS total_focos,
        COALESCE(media_focos.media_focos_dia, 0) AS media_focos_dia,
        COALESCE(focos_corrente.total_focos_corrente, 0) - COALESCE(focos_anterior.total_focos_ano_anterior, 0) AS aumento,
        (COALESCE(focos_corrente.total_focos_corrente, 0) - COALESCE(focos_anterior.total_focos_ano_anterior, 0)) * 100.0 / (COALESCE(focos_anterior.total_focos_ano_anterior, 0) + 1) AS aumento_percentual,
        COALESCE(mes_maior_focos.mes, 'N/A') AS mes_com_mais_focos,
        COALESCE(mes_maior_focos.total_focos_mes, 0) AS total_focos_mes,
        acumulado_focos.dia AS acumulado_dia,
        COALESCE(SUM(focos_periodo.focos_por_dia) OVER (ORDER BY acumulado_focos.dia), 0) AS acumulado
      FROM acumulado_focos
      LEFT JOIN focos_periodo ON acumulado_focos.dia = focos_periodo.dia
      LEFT JOIN focos_corrente ON TRUE
      LEFT JOIN focos_anterior ON TRUE
      LEFT JOIN media_focos ON TRUE
      LEFT JOIN mes_maior_focos ON TRUE
      ORDER BY acumulado_focos.dia;
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

    const stats = result.rows[0] || {
      total_focos: 0,
      media_focos_dia: 0,
      aumento: 0,
      aumento_percentual: 0,
      mes_com_mais_focos: "N/A",
      total_focos_mes: 0,
    };

    const focos = result.rows.map((row) => [
      new Date(row.acumulado_dia).getTime(),
      parseInt(row.acumulado),
    ]);

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
    return {
      error: error,
      meta: params,
      bairros: bairros,
      focos: [],
      stats: {
        totalFocos: 0,
        mediaFocos: 0,
        aumentoMesmoPeriodoPerc: 0,
        aumentoMesmoPeriodoQtde: 0,
        mesComMaiorNumero: "N/A",
        mesComMaiorNumeroQtde: 0,
      },
    };
  }
}
