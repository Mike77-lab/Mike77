const fs = require('node:fs');
const path = require('node:path');

const entrada = path.resolve(process.argv[2] || path.join(__dirname, '..', 'data', 'raw', 'eventos.csv'));
const salida = path.resolve(process.argv[3] || path.join(__dirname, '..', 'data', 'reports', 'reporte_batch.csv'));

if (!fs.existsSync(entrada)) throw new Error('No existe el archivo: ' + entrada);

const contenido = fs.readFileSync(entrada, 'utf8').trim().split(/\r?\n/);
const lineas = contenido.slice(1).filter(Boolean);

const filas = lineas.map(l => {
  const partes = l.split(',').map(s => s.replace(/^"|"$/g, ''));
  return { fecha: partes[0], id: partes[1], metodo: partes[2], ruta: partes[3], status: partes[4], duracion_ms: partes[5] };
});

const contar = campo => filas.reduce((a, f) => {
  const clave = f[campo] || 'VACIO';
  a[clave] = (a[clave] || 0) + 1;
  return a;
}, {});

const tiempos = filas.map(f => Number(f.duracion_ms)).filter(n => Number.isFinite(n) && n >= 0).sort((a, b) => a - b);
const promedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;
const p95 = tiempos.length ? tiempos[Math.ceil(tiempos.length * 0.95) - 1] : 0;

let reporteCSV = 'grupo,nombre,valor\n';
reporteCSV += `general,eventos,${filas.length}\n`;
reporteCSV += `general,promedio_ms,${promedio.toFixed(2)}\n`;
reporteCSV += `general,p95_ms,${p95.toFixed(2)}\n`;

for (const campo of ['metodo', 'status', 'ruta']) {
  for (const [nombre, valor] of Object.entries(contar(campo))) {
    reporteCSV += `${campo},${nombre},${valor}\n`;
  }
}

fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, reporteCSV);

console.log(`Analizadas ${filas.length} filas | Promedio: ${promedio.toFixed(2)} ms | P95: ${p95.toFixed(2)} ms`);
console.log('Reporte guardado en:', salida);