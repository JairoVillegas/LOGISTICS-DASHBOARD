// Datos originales
export interface VentaRow {
  compania: 1 | 2;
  marca: number;
  canal: 'AUI' | 'CN' | 'CR' | 'DT' | 'MY' | 'PV' | 'VAP' | 'VE' | 'DG';
  anio: 2020 | 2021 | 2022 | 2023 | 2024;
  mes: number;          // 1–12
  distrito: string;
  ventaCajas: number;
  ventaKg: number;
  ventaM3: number;
}

export interface GastoRow {
  etapa: EtapaLogistica;
  nodo: string;
  anio: number;
  mes: number;
  gastoCopMiles: number;
}

export interface NodoRow {
  nodo: string;
  ciudad: string;
  lat: number;
  lng: number;
  tipo: string;
  despacho: string;
  cia: string;
}

// Tipos de etapa lógistica
export type EtapaLogistica =
  | 'Primario'
  | 'Interalmacen'
  | 'Preventa'
  | 'Otros'
  | 'Directo'
  | 'Almacenamiento_Arriendo'
  | 'Almacenamiento_MO'
  | 'Almacenamiento_Sumin'
  | 'Almacenamiento_Equipos'
  | 'Almacenamiento_Serv';

// Salidas del modelo
export interface ThetaRecord {
  etapa: EtapaLogistica;
  anio: number;
  mes: number;
  thetaC1: number;
  thetaC2: number;
}

export interface AsignacionRecord {
  etapa: EtapaLogistica;
  anio: number;
  mes: number;
  gPt: number;    // gasto total etapa-período (COP miles)
  gC1: number;    // gasto asignado C1
  gC2: number;    // gasto asignado C2
}

export interface CTSMensual {
  fecha: string;  // ISO 'YYYY-MM-01'
  anio: number;
  mes: number;
  ctsC1: number;
  ctsC2: number;
  ctsTotal: number;
  cajasC1: number;
  cajasC2: number;
  ctsPorCajaC1: number;
  ctsPorCajaC2: number;
}

export interface KPIAnual {
  anio: number;
  ctsC1Mm: number;
  ctsC2Mm: number;
  totalMm: number;
  shareC1: number;
  shareC2: number;
  ctsPorCajaC1: number;  // COP/caja
  ctsPorCajaC2: number;
  ctsPorKgC1: number;
  ctsPorKgC2: number;
  ctsPorM3C1: number;
  ctsPorM3C2: number;
}
