const base = process.argv[2] || 'http://localhost:3000';
const total = Number(process.argv[3] || 100);
const concurrencia = Number(process.argv[4] || 5);

const metodos = ['GET', 'POST', 'PUT', 'DELETE'];

async function una(i) {
  const metodo = metodos[i % metodos.length];
  const ruta = i % 7 === 0 ? '/api/clientes/999999' : '/api/laboratorio/evento';
  try {
    const r = await fetch(base + ruta, { method: metodo });
    await r.text();
    return String(r.status);
  } catch (e) {
    return 'ERROR_RED';
  }
}

async function main() {
  const conteo = {};
  const inicio = Date.now();
  for (let i = 0; i < total; i += concurrencia) {
    const lote = Array.from({ length: Math.min(concurrencia, total - i) }, (_, j) => una(i + j));
    for (const estado of await Promise.all(lote)) {
      conteo[estado] = (conteo[estado] || 0) + 1;
    }
  }
  const segundos = Math.max((Date.now() - inicio) / 1000, 0.001);
  console.log({ total, segundos, porSegundo: (total / segundos).toFixed(2), conteo });
}

main().catch(console.error);