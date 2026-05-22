"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { Filter } from "lucide-react";

export function Header() {
  const { filters, setFilter } = useDashboardStore();

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-[var(--text)]">Dashboard Logístico</h1>
        <div className="h-4 w-px bg-[var(--border)]"></div>
        <select 
          className="bg-transparent text-sm font-medium text-[var(--muted)] outline-none cursor-pointer hover:text-[var(--text)]"
          value={filters.anioRango[1]}
          onChange={(e) => setFilter("anioRango", [2020, parseInt(e.target.value)])}
        >
          <option value={2020}>Año 2020</option>
          <option value={2021}>Año 2021</option>
          <option value={2022}>Año 2022</option>
          <option value={2023}>Año 2023</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] px-3 py-1.5 border border-[var(--border)] rounded-md transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>
    </header>
  );
}
