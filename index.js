const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Ruta principal
app.get('/', (req, res) => {
  res.send('servidor activo con aws y eso');
});

// Ruta 1: Devolver una lista de productos en formato JSON
app.get('/api/productos', (req, res) => {
  res.json([
    { id: 1, nombre: 'Camiseta', precio: 25 },
    { id: 2, nombre: 'Zapatos', precio: 60 }
  ]);
});

// Ruta 2: "Hacer preguntas" al servidor con parámetros en la URL
app.get('/saludo/:nombre', (req, res) => {
  const nombreUsuario = req.params.nombre;
  res.send(`¡Hola ${nombreUsuario}! Bienvenido a la tienda virtual.`);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});