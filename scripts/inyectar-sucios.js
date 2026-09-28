const fs = require('node:fs');
const path = require('node:path');
const archivo = path.join(__dirname, '..', 'data', 'raw', 'eventos.csv');

if (!fs.existsSync(archivo)) throw new Error('Primero genera tráfico para crear el archivo de eventos');

const filasSucias = [
  '"",prueba-1,GET,/api/clientes,200,4',
  '"2026-09-28T12:00:00Z",prueba-2,GTE,/api/clientes,200,4',
  '"2026-09-28T12:00:00Z",prueba-3,GET,/api/clientes,ABC,4',
  '"2026-09-28T12:00:00Z",prueba-4,GET,/api/clientes,200,-7'
].join('\n') + '\n';

fs.appendFileSync(archivo, filasSucias);
console.log('Se agregaron 4 filas de prueba sucias a', archivo);