"use client";

import { ResponsivePie } from "@nivo/pie";
import { KPIAnual } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatNumber } from "@/lib/format";
import { useDashboardStore } from "@/store/dashboardStore";

interface Props {
  data: KPIAnual[];
}

export function SharePie({ data }: Props) {
  const { filters } = useDashboardStore();
  const year = filters.anioRango[1];
  const yearData = data.find((d) => d.anio === year);

  if (!yearData) return null;

  const chartData = [
    {
      id: "C1 - Bebidas",
      label: "C1 - Bebidas",
      value: yearData.ctsC1Mm,
      color: "var(--c1)",
    },
    {
      id: "C2 - Alimentos",
      label: "C2 - Alimentos",
      value: yearData.ctsC2Mm,
      color: "var(--c2)",
    },
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Share de Gasto ({year})</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] relative">
        <ResponsivePie
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
          innerRadius={0.6}
          padAngle={1.5}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={({ data }) => data.color}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          enableArcLinkLabels={false}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#ffffff"
          arcLabel={(d) => `${((d.value / yearData.totalMm) * 100).toFixed(1)}%`}
          theme={{
            tooltip: { container: { background: "var(--surface)", color: "var(--text)" } },
            legends: { text: { fill: "var(--muted)" } },
          }}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 45,
              itemsSpacing: 10,
              itemWidth: 110,
              itemHeight: 18,
              itemTextColor: "var(--text)",
              itemDirection: "left-to-right",
              symbolSize: 14,
              symbolShape: "circle",
            },
          ]}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
          <span className="text-xl font-bold text-[var(--text)]">
            {formatNumber(yearData.totalMm, 0)}
          </span>
          <span className="text-xs text-[var(--muted)]">MM COP</span>
        </div>
      </CardContent>
    </Card>
  );
}
