"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { KPIAnual } from "@/lib/types";
import { formatCOP, formatNumber } from "@/lib/format";
import { KPI_UMBRALES, getRAGColor } from "@/lib/kpis";
import { useDashboardStore } from "@/store/dashboardStore";

interface Props {
  data: KPIAnual[];
}

export function KPIGrid({ data }: Props) {
  const { filters } = useDashboardStore();
  const year = filters.anioRango[1];
  const yearData = data.find((d) => d.anio === year);

  if (!yearData) return null;

  // Evaluar semáforos
  const colorC1 = getRAGColor(yearData.ctsPorCajaC1, KPI_UMBRALES.cts_por_caja_c1, true);
  const colorC2 = getRAGColor(yearData.ctsPorCajaC2, KPI_UMBRALES.cts_por_caja_c2, true);

  const RAGIndicator = ({ color }: { color: 'red' | 'amber' | 'green' }) => {
    const colorClass = 
      color === 'green' ? 'bg-emerald-500' : 
      color === 'amber' ? 'bg-amber-500' : 'bg-rose-500';
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${colorClass} animate-pulse`} />
        <span className="text-xs text-[var(--muted)] capitalize">{color === 'red' ? 'Alerta' : color === 'amber' ? 'Aviso' : 'Óptimo'}</span>
      </div>
    );
  };

  const kpis = [
    {
      title: "CTS por Caja C1 (Bebidas)",
      value: formatCOP(yearData.ctsPorCajaC1),
      rag: colorC1,
      target: `< ${formatCOP(KPI_UMBRALES.cts_por_caja_c1.verde)}`
    },
    {
      title: "CTS por Caja C2 (Alimentos)",
      value: formatCOP(yearData.ctsPorCajaC2),
      rag: colorC2,
      target: `< ${formatCOP(KPI_UMBRALES.cts_por_caja_c2.verde)}`
    },
    {
      title: "CTS por Kg C1",
      value: formatCOP(yearData.ctsPorKgC1),
      rag: 'amber' as const, // mock RAG
      target: `Monitoreo`
    },
    {
      title: "CTS por Kg C2",
      value: formatCOP(yearData.ctsPorKgC2),
      rag: 'green' as const, // mock RAG
      target: `Monitoreo`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted)]">{kpi.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text)] mb-2">{kpi.value}</div>
            <div className="flex items-center justify-between mt-1">
              <RAGIndicator color={kpi.rag} />
              <span className="text-xs text-[var(--muted)]">Target: {kpi.target}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
