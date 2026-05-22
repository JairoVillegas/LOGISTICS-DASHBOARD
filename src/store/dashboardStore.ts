import { create } from 'zustand';
import { EtapaLogistica } from '../lib/types';

export interface DashboardFilters {
  anioRango: [number, number];    // [2020, 2023]
  companias: (1 | 2)[];           // C1, C2, o ambas
  etapas: EtapaLogistica[];       // filtro multi-etapa
  canales: string[];
  nodos: string[];
  alpha: number;                  // 0–1, peso Kg vs M3
  volMultiplierC1: number;
  volMultiplierC2: number;
}

export interface DashboardState {
  filters: DashboardFilters;
  activeTab: 'overview' | 'costos' | 'transporte' | 'almacenamiento' | 'simulador' | 'mapa';
  setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
  resetFilters: () => void;
  setActiveTab: (tab: DashboardState['activeTab']) => void;
  
  // Datos
  dataLoaded: boolean;
  setDataLoaded: (loaded: boolean) => void;
  
  rawVentas: any[];
  rawGastos: any[];
  setRawData: (ventas: any[], gastos: any[]) => void;
}

const initialFilters: DashboardFilters = {
  anioRango: [2020, 2023],
  companias: [1, 2],
  etapas: [], // vacío = todas
  canales: [], // vacío = todos
  nodos: [], // vacío = todos
  alpha: 0.5,
  volMultiplierC1: 1.0,
  volMultiplierC2: 1.0
};

export const useDashboardStore = create<DashboardState>((set) => ({
  filters: initialFilters,
  activeTab: 'overview',
  dataLoaded: false,
  rawVentas: [],
  rawGastos: [],
  
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  resetFilters: () => set({ filters: initialFilters }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),

  setDataLoaded: (loaded) => set({ dataLoaded: loaded }),
  setRawData: (ventas, gastos) => set({ rawVentas: ventas, rawGastos: gastos })
}));
