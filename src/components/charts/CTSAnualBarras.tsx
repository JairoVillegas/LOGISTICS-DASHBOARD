"use client";

import { ResponsiveBar } from "@nivo/bar";
import { KPIAnual } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatNumber } from "@/lib/format";

interface Props {
  data: KPIAnual[];
}

export function CTSAnualBarras({ data }: Props) {
  const chartData = data.map((d) => ({
    year: d.anio.toString(),
    "C1 - Bebidas": Math.round(d.ctsC1Mm),
    "C2 - Alimentos": Math.round(d.ctsC2Mm),
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Evolución CTS Anual (MM COP)</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveBar
          data={chartData}
          keys={["C1 - Bebidas", "C2 - Alimentos"]}
          indexBy="year"
          margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
          padding={0.3}
          groupMode="grouped"
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={["var(--c1)", "var(--c2)"]}
          theme={{
            axis: {
              ticks: { text: { fill: "var(--muted)", fontSize: 12 } },
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
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            format: (v) => `${formatNumber(Number(v) / 1000, 0)}k`,
          }}
          labelSkipWidth={12}
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
              translateY: 40,
              itemsSpacing: 2,
              itemWidth: 120,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 12,
              itemTextColor: "var(--text)",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
