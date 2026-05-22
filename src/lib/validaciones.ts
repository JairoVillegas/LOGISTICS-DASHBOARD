import { AsignacionRecord, ThetaRecord, KPIAnual } from './types';

export interface ValidationReport {
  cierreContable: boolean;
  exhaustividad: boolean;
  participacionHistorica: boolean;
  errores: string[];
}

export function validarModelo(
  asignacion: AsignacionRecord[],
  thetas: ThetaRecord[],
  kpisAnuales: KPIAnual[]
): ValidationReport {
  const reporte: ValidationReport = {
    cierreContable: true,
    exhaustividad: true,
    participacionHistorica: true,
    errores: []
  };

  const EPSILON = 0.01;

  // Regla 1: cierre contable — G_C1 + G_C2 = G_pt para cada fila
  for (const asig of asignacion) {
    const sum = asig.gC1 + asig.gC2;
    if (Math.abs(sum - asig.gPt) > EPSILON) {
      reporte.cierreContable = false;
      reporte.errores.push(`Cierre contable falló en ${asig.etapa} (${asig.anio}-${asig.mes}): gC1+gC2=${sum}, gPt=${asig.gPt}`);
    }
  }

  // Regla 2: theta_C1 + theta_C2 = 1.0 (exhaustividad)
  for (const theta of thetas) {
    const sum = theta.thetaC1 + theta.thetaC2;
    if (Math.abs(sum - 1.0) > EPSILON) {
      reporte.exhaustividad = false;
      reporte.errores.push(`Exhaustividad falló en ${theta.etapa} (${theta.anio}-${theta.mes}): tC1+tC2=${sum}`);
    }
  }

  // Regla 3: participación C1 entre 55% y 70% (rango histórico 59%–63%)
  for (const kpi of kpisAnuales) {
    if (kpi.shareC1 < 55 || kpi.shareC1 > 70) {
      reporte.participacionHistorica = false;
      reporte.errores.push(`Participación C1 fuera de rango en ${kpi.anio}: ${kpi.shareC1.toFixed(1)}%`);
    }
  }

  return reporte;
}
