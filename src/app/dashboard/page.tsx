"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useDashboardStore } from "@/store/dashboardStore";

// Tab Components
import { TotalCTSCards } from "@/components/charts/TotalCTSCards";
import { CTSAnualBarras } from "@/components/charts/CTSAnualBarras";
import { SharePie } from "@/components/charts/SharePie";
import { CTSMensualLinea } from "@/components/charts/CTSMensualLinea";
import { CostoPorEtapaHorizontal } from "@/components/charts/CostoPorEtapaHorizontal";
import { SimuladorEscenarios } from "@/components/charts/SimuladorEscenarios";

export default function DashboardPage() {
  const { activeTab } = useDashboardStore();
  
  const [data, setData] = useState<any>({
    kpisAnuales: null,
    ctsMensual: null,
    asignacion: null
  });

  useEffect(() => {
    Promise.all([
      import('@/data/kpis_anuales.json').then(m => m.default),
      import('@/data/cts_mensual.json').then(m => m.default),
      import('@/data/asignacion_historica.json').then(m => m.default)
    ]).then(([kpis, mensual, asig]) => {
      setData({
        kpisAnuales: kpis,
        ctsMensual: mensual,
        asignacion: asig
      });
    }).catch(err => {
      console.error("Error cargando datos:", err);
    });
  }, []);

  if (!data.kpisAnuales) {
    return <div className="flex h-screen items-center justify-center text-[var(--text)]">Cargando Dashboard...</div>;
  }

  return (
    <div className="flex h-screen w-full bg-[var(--bg)] overflow-hidden text-[var(--text)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'overview' && (
              <>
                <TotalCTSCards data={data.kpisAnuales} />
                <div className="grid grid-cols-3 gap-6">
                  <CTSAnualBarras data={data.kpisAnuales} />
                  <SharePie data={data.kpisAnuales} />
                </div>
                <CTSMensualLinea data={data.ctsMensual} />
              </>
            )}

            {activeTab === 'costos' && (
              <div className="space-y-6">
                <CostoPorEtapaHorizontal data={data.asignacion} />
              </div>
            )}

            {activeTab === 'simulador' && (
              <SimuladorEscenarios />
            )}



          </div>
        </main>
      </div>
    </div>
  );
}
