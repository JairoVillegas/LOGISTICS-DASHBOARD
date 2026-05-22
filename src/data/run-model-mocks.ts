import fs from 'fs';
import path from 'path';
import { calcularThetas, asignarGasto, calcularCTS } from '../lib/modelo-asignacion';
import { VentaRow, GastoRow } from '../lib/types';

// Leer los archivos JSON
const ventasPath = path.join(__dirname, 'ventas_agregadas.json');
const gastosPath = path.join(__dirname, 'gastos_por_etapa.json');

const ventas: VentaRow[] = JSON.parse(fs.readFileSync(ventasPath, 'utf8'));
const gastos: GastoRow[] = JSON.parse(fs.readFileSync(gastosPath, 'utf8'));

// 1. Calcular Thetas (alpha = 0.5)
const thetas = calcularThetas(ventas, 0.5);

// 2. Asignar Gastos
const asignacion = asignarGasto(gastos, thetas);

// 3. Calcular CTS (Mensual y Anual)
const { mensual, anual } = calcularCTS(asignacion, ventas);

// Escribir los resultados en JSON
fs.writeFileSync(path.join(__dirname, 'asignacion_historica.json'), JSON.stringify(asignacion, null, 2));
fs.writeFileSync(path.join(__dirname, 'cts_mensual.json'), JSON.stringify(mensual, null, 2));
fs.writeFileSync(path.join(__dirname, 'cts_anual.json'), JSON.stringify(anual, null, 2));
fs.writeFileSync(path.join(__dirname, 'kpis_anuales.json'), JSON.stringify(anual, null, 2)); // kpis anuales son equivalentes

console.log('Mocks del modelo generados y exportados.');
