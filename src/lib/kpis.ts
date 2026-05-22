// TRANSPORTE
export const KPIs = {
  // Costo de Servir por unidad
  ctsPorCaja:     (ctsTotal: number, cajas: number) => cajas > 0 ? (ctsTotal * 1000) / cajas : 0,  // COP/caja
  ctsPorKg:       (ctsTotal: number, kg: number)    => kg > 0 ? (ctsTotal * 1000) / kg : 0,
  ctsPorM3:       (ctsTotal: number, m3: number)    => m3 > 0 ? (ctsTotal * 1000) / m3 : 0,

  // Eficiencia de transporte
  ocupacionVehiculo: (cargaReal: number, capacidadVehiculo: number) =>
    (cargaReal / capacidadVehiculo) * 100,  // % objetivo: Preventa 40-50%, Otros 85%+

  frecuenciaAbastecimiento: (pedidos: number, dias: number) =>
    pedidos / dias,  // pedidos/día por almacén

  // Almacenamiento
  rotacionInventario: (ventaAnual: number, inventarioPromedio: number) =>
    ventaAnual / inventarioPromedio,  // veces/año

  coberturaDias: (inventario: number, ventaDiaria: number) =>
    inventario / ventaDiaria,  // días de stock

  costoM2Bodega: (arriendoMes: number, m2: number) =>
    arriendoMes / m2,  // COP/m2/mes

  productividadAlistamiento: (cajasAlistadas: number, horasHombre: number) =>
    cajasAlistadas / horasHombre,  // cajas/hora-hombre

  // Red logística
  shareGastoPorNodo: (gastoNodo: number, gastoTotal: number) =>
    (gastoNodo / gastoTotal) * 100,  // % del gasto total

  densidadCarga: (kg: number, m3: number) =>
    kg / m3,  // Kg/m3 — C1 ~420, C2 ~250

  // Interalmacén
  tasaConsolidacionInteralmacen: (despachosMixtos: number, totalDespachos: number) =>
    (despachosMixtos / totalDespachos) * 100,  // % almacenes que necesitan interalmacén
}

// Tabla de KPIs con semáforos (RAG: red/amber/green)
export const KPI_UMBRALES = {
  ocupacion_preventa:    { rojo: 30, amarillo: 35, verde: 45 },   // %
  ocupacion_otros:       { rojo: 60, amarillo: 75, verde: 85 },   // %
  cts_por_caja_c1:       { rojo: 5500, amarillo: 4500, verde: 3500 }, // COP
  cts_por_caja_c2:       { rojo: 4000, amarillo: 3500, verde: 3000 }, // COP
  densidad_c1:           { rojo: 380, amarillo: 410, verde: 430 }, // Kg/m3
  densidad_c2:           { rojo: 200, amarillo: 230, verde: 260 }, // Kg/m3
  cobertura_inventario:  { rojo: 30, amarillo: 20, verde: 15 },   // días (invertido: menos es mejor)
}

// Helper para determinar el color RAG dado un valor y sus umbrales
export function getRAGColor(valor: number, umbral: { rojo: number, amarillo: number, verde: number }, invertido = false): 'red' | 'amber' | 'green' {
  if (invertido) {
    if (valor >= umbral.rojo) return 'red';
    if (valor >= umbral.amarillo) return 'amber';
    return 'green';
  } else {
    if (valor <= umbral.rojo) return 'red';
    if (valor <= umbral.amarillo) return 'amber';
    return 'green';
  }
}
