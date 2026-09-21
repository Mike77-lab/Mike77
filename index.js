const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = process.env.PORT || 3000;

// Ruta 1: Inicio
app.get('/', (req, res) => {
  res.send('Servidor activo y conectado al archivo CSV');
});

// Ruta 2: Leer el CSV de Clientes y devolver la información
app.get('/api/clientes', (req, res) => {
  const clientes = [];

  // Lee el archivo clientes.csv línea por línea
  fs.createReadStream('clientes.csv')
    .pipe(csv())
    .on('data', (data) => clientes.push(data))
    .on('end', () => {
      // Envía los clientes en formato JSON al navegador
      res.json(clientes);
    })
    .on('error', (error) => {
      res.status(500).json({ mensaje: 'Error al leer el archivo CSV', error });
    });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});