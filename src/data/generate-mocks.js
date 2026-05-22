const fs = require('fs');
const path = require('path');

// Generar ventas_agregadas.json
// Agrupado por [compania, canal, anio, mes, distrito]
const ventas = [];
const anios = [2020, 2021, 2022, 2023];
const meses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const companias = [1, 2];
const canales = ['PV', 'DT', 'VAP', 'CN', 'MY', 'AUI', 'CR', 'DG', 'VE'];
const distritos = ['BOGOTA', 'MEDELLIN', 'CALI', 'BQUILLA', 'BMANGA', 'PEREIRA'];

// Para que cuadre con ~300.000 MM de CTS en total, C1 (183,698 MM, 60.9%) y C2 (118,156 MM, 39.1%)
// Y Cajas: C1 = 45.6M, C2 = 39.3M
const cajasTargetC1_Anual = 45600000 / 4;
const cajasTargetC2_Anual = 39300000 / 4;

anios.forEach(anio => {
  meses.forEach(mes => {
    companias.forEach(cia => {
      canales.forEach(canal => {
        distritos.forEach(distrito => {
          let factorCanal = 0.1;
          if (canal === 'PV') factorCanal = cia === 1 ? 0.35 : 0.15;
          if (canal === 'DT') factorCanal = cia === 1 ? 0.20 : 0.30;
          
          let cajasBase = cia === 1 ? (cajasTargetC1_Anual/12) : (cajasTargetC2_Anual/12);
          cajasBase = cajasBase * factorCanal / distritos.length;
          
          // Variabilidad YoY
          if (anio === 2021) cajasBase *= 1.2;
          if (anio === 2022) cajasBase *= 1.4;
          if (anio === 2023) cajasBase *= 1.1;

          let densidad = 400; // Kg/M3
          if (cia === 1) densidad = 430;
          if (cia === 2) densidad = 222;

          // Añadir ruido
          cajasBase *= (0.9 + Math.random() * 0.2);
          
          const kg = cajasBase * (cia === 1 ? 8.7 : 4.6); // aprox kg por caja
          const m3 = kg / densidad;

          ventas.push({
            compania: cia,
            marca: cia === 1 ? 1 : 2,
            canal: canal,
            anio: anio,
            mes: mes,
            distrito: distrito,
            ventaCajas: cajasBase,
            ventaKg: kg,
            ventaM3: m3
          });
        });
      });
    });
  });
});

fs.writeFileSync(path.join(__dirname, 'ventas_agregadas.json'), JSON.stringify(ventas, null, 2));

// Generar gastos_por_etapa.json
// Agrupado por [etapa, anio, mes]
const gastos = [];
const etapas = [
  { nombre: 'Primario', share: 0.258 },
  { nombre: 'Interalmacen', share: 0.02 },
  { nombre: 'Preventa', share: 0.20 },
  { nombre: 'Otros', share: 0.259 },
  { nombre: 'Directo', share: 0.062 },
  { nombre: 'Almacenamiento_Arriendo', share: 0.08 },
  { nombre: 'Almacenamiento_MO', share: 0.10 },
  { nombre: 'Almacenamiento_Sumin', share: 0.005 },
  { nombre: 'Almacenamiento_Equipos', share: 0.01 },
  { nombre: 'Almacenamiento_Serv', share: 0.006 }
];

const gastoAnual = {
  2020: 63401600, // Miles
  2021: 67276300,
  2022: 82648400,
  2023: 88800900
};

anios.forEach(anio => {
  const gTotalMes = gastoAnual[anio] / 12;
  meses.forEach(mes => {
    etapas.forEach(etapa => {
      const gastoEtapaMes = gTotalMes * etapa.share * (0.95 + Math.random() * 0.1);
      gastos.push({
        etapa: etapa.nombre,
        nodo: distritos[Math.floor(Math.random() * distritos.length)],
        anio: anio,
        mes: mes,
        gastoCopMiles: gastoEtapaMes
      });
    });
  });
});

fs.writeFileSync(path.join(__dirname, 'gastos_por_etapa.json'), JSON.stringify(gastos, null, 2));

console.log('Mocks generados exitosamente.');
