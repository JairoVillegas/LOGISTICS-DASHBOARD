"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { KPIAnual } from "@/lib/types";
import { formatCOP, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  data: KPIAnual[];
}

export function TotalCTSCards({ data }: Props) {
  const { filters } = useDashboardStore();
  const [current, setCurrent] = useState<KPIAnual | null>(null);
  const [previous, setPrevious] = useState<KPIAnual | null>(null);

  useEffect(() => {
    // Tomamos el último año del rango como "año seleccionado" para este overview
    const year = filters.anioRango[1];
    const curr = data.find((d) => d.anio === year);
    const prev = data.find((d) => d.anio === year - 1);
    setCurrent(curr || null);
    setPrevious(prev || null);
  }, [filters.anioRango, data]);

  if (!current) return null;

  const getYoY = (curr: number, prev: number | undefined) => {
    if (!prev) return null;
    const diff = ((curr - prev) / prev) * 100;
    return diff;
  };

  const renderMetric = (title: string, value: string, yoy: number | null, colorClass: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[var(--muted)]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {yoy !== null && (
          <p className="text-xs flex items-center mt-1">
            {yoy > 0 ? (
              <TrendingUp className="text-rose-500 mr-1 h-4 w-4" />
            ) : (
              <TrendingDown className="text-emerald-500 mr-1 h-4 w-4" />
            )}
            <span className={yoy > 0 ? "text-rose-500" : "text-emerald-500"}>
              {Math.abs(yoy).toFixed(1)}% YoY
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {renderMetric(
        "Gasto Total Red (MM COP)",
        formatCOP(current.totalMm),
        getYoY(current.totalMm, previous?.totalMm),
        "text-[var(--text)]"
      )}
      {renderMetric(
        "CTS C1 - Bebidas (MM COP)",
        formatCOP(current.ctsC1Mm),
        getYoY(current.ctsC1Mm, previous?.ctsC1Mm),
        "text-[var(--c1)]"
      )}
      {renderMetric(
        "CTS C2 - Alimentos (MM COP)",
        formatCOP(current.ctsC2Mm),
        getYoY(current.ctsC2Mm, previous?.ctsC2Mm),
        "text-[var(--c2)]"
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[var(--muted)]">Ratio C1 / C2</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[var(--text)]">
            {(current.ctsC1Mm / current.ctsC2Mm).toFixed(2)}x
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            {current.shareC1.toFixed(1)}% vs {current.shareC2.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
