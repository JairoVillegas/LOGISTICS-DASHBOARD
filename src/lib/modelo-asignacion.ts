import { VentaRow, GastoRow, ThetaRecord, AsignacionRecord, CTSMensual, KPIAnual, EtapaLogistica } from './types';

/**
 * MODELO THETA — Asignación causal del gasto logístico
 */
export function calcularThetas(
  ventas: VentaRow[],
  alpha: number = 0.5
): ThetaRecord[] {
  // Agrupar ventas por año y mes
  const periodos = new Set(ventas.map(v => `${v.anio}-${v.mes}`));
  const thetas: ThetaRecord[] = [];

  periodos.forEach(periodo => {
    const [anioStr, mesStr] = periodo.split('-');
    const anio = parseInt(anioStr, 10);
    const mes = parseInt(mesStr, 10);

    const ventasPeriodo = ventas.filter(v => v.anio === anio && v.mes === mes);
    
    // Totales C1
    const vC1 = ventasPeriodo.filter(v => v.compania === 1);
    const kgC1 = vC1.reduce((sum, v) => sum + v.ventaKg, 0);
    const m3C1 = vC1.reduce((sum, v) => sum + v.ventaM3, 0);
    const cajasC1 = vC1.reduce((sum, v) => sum + v.ventaCajas, 0);
    const pvCajasC1 = vC1.filter(v => v.canal === 'PV').reduce((sum, v) => sum + v.ventaCajas, 0);

    // Totales C2
    const vC2 = ventasPeriodo.filter(v => v.compania === 2);
    const kgC2 = vC2.reduce((sum, v) => sum + v.ventaKg, 0);
    const m3C2 = vC2.reduce((sum, v) => sum + v.ventaM3, 0);
    const cajasC2 = vC2.reduce((sum, v) => sum + v.ventaCajas, 0);
    const pvCajasC2 = vC2.filter(v => v.canal === 'PV').reduce((sum, v) => sum + v.ventaCajas, 0);

    // Shares globales
    const totalKg = kgC1 + kgC2 || 1;
    const totalM3 = m3C1 + m3C2 || 1;
    const totalCajas = cajasC1 + cajasC2 || 1;
    const totalPvCajas = pvCajasC1 + pvCajasC2 || 1;

    const shareKgC1 = kgC1 / totalKg;
    const shareM3C1 = m3C1 / totalM3;
    const shareCajasC1 = cajasC1 / totalCajas;
    const sharePvC1 = pvCajasC1 / totalPvCajas;

    // Etapas a calcular
    const etapas: EtapaLogistica[] = [
      'Primario', 'Interalmacen', 'Preventa', 'Otros', 'Directo',
      'Almacenamiento_Arriendo', 'Almacenamiento_MO', 'Almacenamiento_Sumin',
      'Almacenamiento_Equipos', 'Almacenamiento_Serv'
    ];

    etapas.forEach(etapa => {
      let thetaC1 = 0;

      switch (etapa) {
        case 'Primario':
        case 'Otros':
          thetaC1 = (alpha * shareKgC1) + ((1 - alpha) * shareM3C1);
          break;
        case 'Interalmacen':
          thetaC1 = 0.0; // Según CONTEXT.md, 100% C2
          break;
        case 'Preventa':
          thetaC1 = sharePvC1;
          break;
        case 'Directo':
          thetaC1 = shareKgC1;
          break;
        case 'Almacenamiento_Arriendo':
        case 'Almacenamiento_MO':
        case 'Almacenamiento_Equipos':
        case 'Almacenamiento_Serv':
          thetaC1 = shareM3C1;
          break;
        case 'Almacenamiento_Sumin':
          thetaC1 = shareCajasC1;
          break;
      }

      thetas.push({
        etapa,
        anio,
        mes,
        thetaC1,
        thetaC2: 1 - thetaC1
      });
    });
  });

  return thetas;
}

export function asignarGasto(
  gastos: GastoRow[],
  thetas: ThetaRecord[]
): AsignacionRecord[] {
  // Agrupar gastos por etapa, año y mes
  const asigMap = new Map<string, AsignacionRecord>();

  gastos.forEach(g => {
    const key = `${g.etapa}-${g.anio}-${g.mes}`;
    if (!asigMap.has(key)) {
      asigMap.set(key, {
        etapa: g.etapa,
        anio: g.anio,
        mes: g.mes,
        gPt: 0,
        gC1: 0,
        gC2: 0
      });
    }
    const record = asigMap.get(key)!;
    record.gPt += g.gastoCopMiles;
  });

  // Asignar en base a los thetas
  const resultados = Array.from(asigMap.values());
  resultados.forEach(res => {
    const theta = thetas.find(t => t.etapa === res.etapa && t.anio === res.anio && t.mes === res.mes);
    if (theta) {
      res.gC1 = res.gPt * theta.thetaC1;
      res.gC2 = res.gPt * theta.thetaC2;
    } else {
      // Default fallback (aunque en teoría siempre debería haber thetas si hay ventas)
      res.gC1 = res.gPt * 0.5;
      res.gC2 = res.gPt * 0.5;
    }
  });

  return resultados;
}

export function calcularCTS(
  asignacion: AsignacionRecord[],
  ventas: VentaRow[]
): { mensual: CTSMensual[]; anual: KPIAnual[] } {
  const mensualMap = new Map<string, CTSMensual>();
  const anualMap = new Map<number, KPIAnual>();

  // Consolidar ventas por periodo
  const ventasMensual = new Map<string, { cajasC1: number, cajasC2: number, kgC1: number, kgC2: number, m3C1: number, m3C2: number }>();
  ventas.forEach(v => {
    const key = `${v.anio}-${v.mes}`;
    if (!ventasMensual.has(key)) {
      ventasMensual.set(key, { cajasC1: 0, cajasC2: 0, kgC1: 0, kgC2: 0, m3C1: 0, m3C2: 0 });
    }
    const entry = ventasMensual.get(key)!;
    if (v.compania === 1) {
      entry.cajasC1 += v.ventaCajas;
      entry.kgC1 += v.ventaKg;
      entry.m3C1 += v.ventaM3;
    } else {
      entry.cajasC2 += v.ventaCajas;
      entry.kgC2 += v.ventaKg;
      entry.m3C2 += v.ventaM3;
    }
  });

  // Llenar mensual a partir de asignación
  asignacion.forEach(a => {
    const key = `${a.anio}-${a.mes}`;
    if (!mensualMap.has(key)) {
      const v = ventasMensual.get(key) || { cajasC1: 0, cajasC2: 0, kgC1: 0, kgC2: 0, m3C1: 0, m3C2: 0 };
      const mesStr = a.mes.toString().padStart(2, '0');
      mensualMap.set(key, {
        fecha: `${a.anio}-${mesStr}-01`,
        anio: a.anio,
        mes: a.mes,
        ctsC1: 0,
        ctsC2: 0,
        ctsTotal: 0,
        cajasC1: v.cajasC1,
        cajasC2: v.cajasC2,
        ctsPorCajaC1: 0,
        ctsPorCajaC2: 0
      });
    }
    const record = mensualMap.get(key)!;
    record.ctsC1 += a.gC1;
    record.ctsC2 += a.gC2;
    record.ctsTotal += a.gPt;
  });

  // Calcular métricas mensuales y rellenar anuales
  mensualMap.forEach(m => {
    m.ctsPorCajaC1 = m.cajasC1 > 0 ? (m.ctsC1 * 1000) / m.cajasC1 : 0;
    m.ctsPorCajaC2 = m.cajasC2 > 0 ? (m.ctsC2 * 1000) / m.cajasC2 : 0;

    if (!anualMap.has(m.anio)) {
      anualMap.set(m.anio, {
        anio: m.anio,
        ctsC1Mm: 0,
        ctsC2Mm: 0,
        totalMm: 0,
        shareC1: 0,
        shareC2: 0,
        ctsPorCajaC1: 0,
        ctsPorCajaC2: 0,
        ctsPorKgC1: 0,
        ctsPorKgC2: 0,
        ctsPorM3C1: 0,
        ctsPorM3C2: 0
      });
    }
    const anual = anualMap.get(m.anio)!;
    anual.ctsC1Mm += m.ctsC1 / 1000;
    anual.ctsC2Mm += m.ctsC2 / 1000;
    anual.totalMm += m.ctsTotal / 1000;
  });

  // Consolidar ventas anuales para calcular métricas unitarias
  const ventasAnual = new Map<number, { cajasC1: number, cajasC2: number, kgC1: number, kgC2: number, m3C1: number, m3C2: number }>();
  ventas.forEach(v => {
    if (!ventasAnual.has(v.anio)) {
      ventasAnual.set(v.anio, { cajasC1: 0, cajasC2: 0, kgC1: 0, kgC2: 0, m3C1: 0, m3C2: 0 });
    }
    const entry = ventasAnual.get(v.anio)!;
    if (v.compania === 1) {
      entry.cajasC1 += v.ventaCajas;
      entry.kgC1 += v.ventaKg;
      entry.m3C1 += v.ventaM3;
    } else {
      entry.cajasC2 += v.ventaCajas;
      entry.kgC2 += v.ventaKg;
      entry.m3C2 += v.ventaM3;
    }
  });

  anualMap.forEach((a, anio) => {
    a.shareC1 = (a.ctsC1Mm / a.totalMm) * 100;
    a.shareC2 = (a.ctsC2Mm / a.totalMm) * 100;

    const v = ventasAnual.get(anio);
    if (v) {
      a.ctsPorCajaC1 = v.cajasC1 > 0 ? (a.ctsC1Mm * 1000000) / v.cajasC1 : 0;
      a.ctsPorCajaC2 = v.cajasC2 > 0 ? (a.ctsC2Mm * 1000000) / v.cajasC2 : 0;
      a.ctsPorKgC1 = v.kgC1 > 0 ? (a.ctsC1Mm * 1000000) / v.kgC1 : 0;
      a.ctsPorKgC2 = v.kgC2 > 0 ? (a.ctsC2Mm * 1000000) / v.kgC2 : 0;
      a.ctsPorM3C1 = v.m3C1 > 0 ? (a.ctsC1Mm * 1000000) / v.m3C1 : 0;
      a.ctsPorM3C2 = v.m3C2 > 0 ? (a.ctsC2Mm * 1000000) / v.m3C2 : 0;
    }
  });

  return {
    mensual: Array.from(mensualMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha)),
    anual: Array.from(anualMap.values()).sort((a, b) => a.anio - b.anio)
  };
}
