"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { cn } from "@/components/ui/Card";
import { LayoutDashboard, BarChart3, Settings2 } from "lucide-react";

export function Sidebar() {
  const { activeTab, setActiveTab } = useDashboardStore();

  const tabs = [
    { id: "overview", label: "Resumen Ejecutivo", icon: LayoutDashboard },
    { id: "costos", label: "Costo de Servir", icon: BarChart3 },
    { id: "simulador", label: "Simulador Escenarios", icon: Settings2 },
  ] as const;

  return (
    <div className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
        <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-[var(--c1)] rounded-sm flex items-center justify-center text-xs text-white">Q</div>
          Quala<span className="text-[var(--muted)] font-normal text-sm">Logistics</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]" 
                  : "text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
