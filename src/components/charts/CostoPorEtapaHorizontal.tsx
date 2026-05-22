"use client";

import { ResponsiveBar } from "@nivo/bar";
import { AsignacionRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatNumber } from "@/lib/format";
import { useDashboardStore } from "@/store/dashboardStore";

interface Props {
  data: AsignacionRecord[];
}

export function CostoPorEtapaHorizontal({ data }: Props) {
  const { filters } = useDashboardStore();
  const year = filters.anioRango[1]; // Opcional: filtrar por todo el rango

  // Agrupar por etapa para el año seleccionado
  const aggs = new Map<string, { c1: number; c2: number }>();
  data.filter(d => d.anio === year).forEach((d) => {
    if (!aggs.has(d.etapa)) {
      aggs.set(d.etapa, { c1: 0, c2: 0 });
    }
    const entry = aggs.get(d.etapa)!;
    entry.c1 += d.gC1 / 1000; // MM COP
    entry.c2 += d.gC2 / 1000;
  });

  const chartData = Array.from(aggs.entries())
    .map(([etapa, vals]) => ({
      etapa,
      "C1 - Bebidas": Math.round(vals.c1),
      "C2 - Alimentos": Math.round(vals.c2),
      total: vals.c1 + vals.c2,
    }))
    .sort((a, b) => a.total - b.total); // Ordenado para horizontal (menor arriba para nivo default bottom-up)

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Gasto por Etapa ({year}) - MM COP</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveBar
          data={chartData}
          keys={["C1 - Bebidas", "C2 - Alimentos"]}
          indexBy="etapa"
          layout="horizontal"
          margin={{ top: 20, right: 30, bottom: 50, left: 140 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={["var(--c1)", "var(--c2)"]}
          theme={{
            axis: {
              ticks: { text: { fill: "var(--muted)", fontSize: 11 } },
              legend: { text: { fill: "var(--muted)", fontSize: 13 } },
            },
            grid: { line: { stroke: "var(--border)", strokeWidth: 1 } },
            tooltip: { container: { background: "var(--surface)", color: "var(--text)" } },
          }}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            format: (v) => `${formatNumber(Number(v) / 1000, 0)}k`,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
          labelSkipWidth={30}
          labelSkipHeight={12}
          labelTextColor="#ffffff"
          labelFormat={(v) => formatNumber(Number(v), 0)}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 45,
              itemsSpacing: 2,
              itemWidth: 120,
              itemHeight: 20,
              itemDirection: "left-to-right",
              symbolSize: 12,
              itemTextColor: "var(--text)",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
