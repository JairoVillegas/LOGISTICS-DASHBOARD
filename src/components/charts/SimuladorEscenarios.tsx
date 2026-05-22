"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { VentaRow, GastoRow, KPIAnual, EtapaLogistica } from "@/lib/types";
import { calcularThetas, asignarGasto, calcularCTS } from "@/lib/modelo-asignacion";
import { formatCOP } from "@/lib/format";
import { ResponsiveBar } from "@nivo/bar";

export function SimuladorEscenarios() {
  const { filters, setFilter } = useDashboardStore();

  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [gastos, setGastos] = useState<GastoRow[]>([]);

  const [baselineKPI, setBaselineKPI] = useState<KPIAnual | null>(null);
  const [simulatedKPI, setSimulatedKPI] = useState<KPIAnual | null>(null);

  const [loading, setLoading] = useState(true);

  // Cargar datos brutos
  useEffect(() => {
    Promise.all([
      import("@/data/ventas_agregadas.json").then((m) => m.default),
      import("@/data/gastos_por_etapa.json").then((m) => m.default),
    ])
      .then(([v, g]) => {
        // ✅ Tipado correcto del JSON
        const ventasTipadas: VentaRow[] = v.map((item: any) => ({
          ...item,
          compania: item.compania as 1 | 2,
        }));

        setVentas(ventasTipadas);

        // ✅ Tipado correcto del JSON de gastos
        const gastosTipados: GastoRow[] = g.map((item: any) => ({
          ...item,
          etapa: item.etapa as EtapaLogistica,
        }));
        setGastos(gastosTipados);

        // Calcular baseline
        const thetasBase = calcularThetas(ventasTipadas, 0.5);
        const asigBase = asignarGasto(gastosTipados, thetasBase);

        const { anual: kpisBase } = calcularCTS(asigBase, ventasTipadas);

        setBaselineKPI(
          kpisBase.find((k) => k.anio === filters.anioRango[1]) || null
        );

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando mocks del simulador:", err);
        setLoading(false);
      });
  }, [filters.anioRango]);

  // Recalcular escenario cuando cambian filtros
  useEffect(() => {
    if (loading || !ventas.length) return;

    // 1. Aplicar multiplicadores de volumen
    const ventasSimuladas = ventas.map((v) => {
      const mult =
        v.compania === 1
          ? filters.volMultiplierC1
          : filters.volMultiplierC2;

      return {
        ...v,
        ventaCajas: v.ventaCajas * mult,
        ventaKg: v.ventaKg * mult,
        ventaM3: v.ventaM3 * mult,
      };
    });

    // 2. Calcular Thetas con nuevo alpha
    const thetasSim = calcularThetas(ventasSimuladas, filters.alpha);

    // 3. Asignar gasto
    const asigSim = asignarGasto(gastos, thetasSim);

    // 4. Calcular KPIs
    const { anual: kpisSim } = calcularCTS(asigSim, ventasSimuladas);

    setSimulatedKPI(
      kpisSim.find((k) => k.anio === filters.anioRango[1]) || null
    );
  }, [
    filters.alpha,
    filters.volMultiplierC1,
    filters.volMultiplierC2,
    loading,
    ventas,
    gastos,
    filters.anioRango,
  ]);

  if (loading || !baselineKPI || !simulatedKPI) {
    return (
      <div className="p-8 text-center text-[var(--muted)]">
        Cargando simulador...
      </div>
    );
  }

  const deltaC1 = simulatedKPI.ctsC1Mm - baselineKPI.ctsC1Mm;
  const deltaC2 = simulatedKPI.ctsC2Mm - baselineKPI.ctsC2Mm;

  const chartData = [
    {
      escenario: "Baseline",
      "C1 - Bebidas": Math.round(baselineKPI.ctsC1Mm),
      "C2 - Alimentos": Math.round(baselineKPI.ctsC2Mm),
    },
    {
      escenario: "Simulación",
      "C1 - Bebidas": Math.round(simulatedKPI.ctsC1Mm),
      "C2 - Alimentos": Math.round(simulatedKPI.ctsC2Mm),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controles */}
        <Card className="col-span-1 border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-emerald-500">
              Parámetros del Escenario
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-[var(--text)]">
                  Alpha (Peso Kg vs M3)
                </label>

                <span className="text-sm text-[var(--muted)]">
                  {filters.alpha.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={filters.alpha}
                onChange={(e) =>
                  setFilter("alpha", parseFloat(e.target.value))
                }
                className="w-full accent-emerald-500"
              />

              <p className="text-xs text-[var(--muted)] mt-1">
                0 = 100% Volumen (M3) | 1 = 100% Peso (Kg)
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-[var(--c1)]">
                  Volumen C1 (Mult.)
                </label>

                <span className="text-sm text-[var(--muted)]">
                  {filters.volMultiplierC1.toFixed(1)}x
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={filters.volMultiplierC1}
                onChange={(e) =>
                  setFilter(
                    "volMultiplierC1",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full accent-[var(--c1)]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-[var(--c2)]">
                  Volumen C2 (Mult.)
                </label>

                <span className="text-sm text-[var(--muted)]">
                  {filters.volMultiplierC2.toFixed(1)}x
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={filters.volMultiplierC2}
                onChange={(e) =>
                  setFilter(
                    "volMultiplierC2",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full accent-[var(--c2)]"
              />
            </div>

            <button
              onClick={() => {
                setFilter("alpha", 0.5);
                setFilter("volMultiplierC1", 1.0);
                setFilter("volMultiplierC2", 1.0);
              }}
              className="w-full py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-md hover:bg-[var(--border)] transition-colors text-sm"
            >
              Resetear a Baseline
            </button>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--c1)]">
                Impacto C1 - Bebidas
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold text-[var(--c1)]">
                {formatCOP(simulatedKPI.ctsC1Mm)}
              </div>

              <p
                className={`text-sm mt-1 font-medium ${deltaC1 > 0
                  ? "text-rose-500"
                  : deltaC1 < 0
                    ? "text-emerald-500"
                    : "text-[var(--muted)]"
                  }`}
              >
                {deltaC1 > 0 ? "+" : ""}
                {formatCOP(deltaC1)} MM vs Base
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--c2)]">
                Impacto C2 - Alimentos
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold text-[var(--c2)]">
                {formatCOP(simulatedKPI.ctsC2Mm)}
              </div>

              <p
                className={`text-sm mt-1 font-medium ${deltaC2 > 0
                  ? "text-rose-500"
                  : deltaC2 < 0
                    ? "text-emerald-500"
                    : "text-[var(--muted)]"
                  }`}
              >
                {deltaC2 > 0 ? "+" : ""}
                {formatCOP(deltaC2)} MM vs Base
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>
                Comparativa Escenario vs Baseline
              </CardTitle>
            </CardHeader>

            <CardContent className="h-[250px]">
              <ResponsiveBar
                data={chartData}
                keys={["C1 - Bebidas", "C2 - Alimentos"]}
                indexBy="escenario"
                margin={{ top: 10, right: 130, bottom: 50, left: 60 }}
                padding={0.4}
                groupMode="stacked"
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={["var(--c1)", "var(--c2)"]}
                theme={{
                  axis: {
                    ticks: {
                      text: { fill: "var(--muted)" },
                    },
                  },
                  grid: {
                    line: { stroke: "var(--border)" },
                  },
                  tooltip: {
                    container: {
                      background: "var(--surface)",
                      color: "var(--text)",
                    },
                  },
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  format: (v) =>
                    `${(Number(v) / 1000).toFixed(0)}k`,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="#ffffff"
                labelFormat={(v) => formatCOP(Number(v))}
                legends={[
                  {
                    dataFrom: "keys",
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: "left-to-right",
                    symbolSize: 12,
                    itemTextColor: "var(--text)",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}