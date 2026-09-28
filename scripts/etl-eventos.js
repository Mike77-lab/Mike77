const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'data');
const raw = path.join(base, 'raw', 'eventos.csv');

if (!fs.existsSync(raw)) throw new Error('No existe el archivo RAW: ' + raw);

const lineas = fs.readFileSync(raw, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean);

const validos = [], rechazados = [];

for (const linea of lineas) {
  const partes = linea.split(',').map(s => s.replace(/^"|"$/g, ''));
  const [fecha, id, metodo, ruta, status, duracion_ms] = partes;
  
  const motivos = [];
  const met = String(metodo || '').trim().toUpperCase();
  const st = Number(status);
  const ms = Number(duracion_ms);

  if (!fecha || !Number.isFinite(Date.parse(fecha))) motivos.push('fecha');
  if (!['GET','POST','PUT','DELETE'].includes(met)) motivos.push('metodo');
  if (!String(ruta || '').startsWith('/')) motivos.push('ruta');
  if (!status || !Number.isInteger(st) || st < 100 || st > 599) motivos.push('status');
  if (duracion_ms === '' || !Number.isFinite(ms) || ms < 0) motivos.push('duracion');
  if (!id) motivos.push('id');

  if (motivos.length) {
    rechazados.push(`${linea},"${motivos.join('|')}"`);
  } else {
    validos.push(`"${fecha}","${id}","${met}","${ruta}","${st}","${ms.toFixed(2)}"`);
  }
}

fs.mkdirSync(path.join(base, 'processed'), { recursive: true });
fs.mkdirSync(path.join(base, 'reports'), { recursive: true });

const cabecera = 'fecha,id,metodo,ruta,status,duracion_ms\n';
fs.writeFileSync(path.join(base, 'processed', 'eventos_validos.csv'), cabecera + validos.join('\n') + '\n');
fs.writeFileSync(path.join(base, 'processed', 'eventos_rechazados.csv'), cabecera + 'motivo\n' + rechazados.join('\n') + '\n');

const total = lineas.length;
const pctValidos = total ? ((validos.length / total) * 100).toFixed(2) : '0.00';
const resumenCalidad = `metrica,valor\ntotal,${total}\nvalidos,${validos.length}\nrechazados,${rechazados.length}\nporcentaje_valido,${pctValidos}\n`;

fs.writeFileSync(path.join(base, 'reports', 'calidad.csv'), resumenCalidad);

console.log({ total, validos: validos.length, rechazados: rechazados.length });