"use client";

import { ResponsiveLine } from "@nivo/line";
import { CTSMensual } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCOP } from "@/lib/format";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  data: CTSMensual[];
}

export function CTSMensualLinea({ data }: Props) {
  const c1Data = data.map((d) => ({
    x: d.fecha,
    y: d.ctsPorCajaC1,
  }));

  const c2Data = data.map((d) => ({
    x: d.fecha,
    y: d.ctsPorCajaC2,
  }));

  const chartData = [
    { id: "C1 - Bebidas", data: c1Data, color: "var(--c1)" },
    { id: "C2 - Alimentos", data: c2Data, color: "var(--c2)" },
  ];

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Costo de Servir por Caja (COP)</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
          xScale={{ type: "time", format: "%Y-%m-%d", precision: "month" }}
          xFormat="time:%Y-%m"
          yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
          colors={({ color }) => color}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            format: "%b '%y",
            tickValues: "every 3 months",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            format: (v) => `$${Number(v).toLocaleString("es-CO")}`,
          }}
          pointSize={0}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          useMesh={true}
          theme={{
            axis: {
              ticks: { text: { fill: "var(--muted)", fontSize: 11 } },
              legend: { text: { fill: "var(--muted)", fontSize: 13 } },
            },
            grid: { line: { stroke: "var(--border)", strokeWidth: 1 } },
            tooltip: { container: { background: "var(--surface)", color: "var(--text)" } },
          }}
          tooltip={({ point }) => {
            const date = parseISO(point.data.xFormatted as string);
            return (
              <div className="bg-[var(--surface)] border border-[var(--border)] p-2 rounded shadow text-sm text-[var(--text)]">
                <div className="mb-1 text-[var(--muted)] font-medium">
                  {format(date, "MMMM yyyy", { locale: es })}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: point.color }}
                  />
                  <span>
                    <strong>{point.seriesId}:</strong> {formatCOP(point.data.y as number)} / caja
                  </span>
                </div>
              </div>
            );
          }}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 45,
              itemsSpacing: 10,
              itemDirection: "left-to-right",
              itemWidth: 120,
              itemHeight: 20,
              itemOpacity: 0.85,
              symbolSize: 12,
              symbolShape: "circle",
              itemTextColor: "var(--text)",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
