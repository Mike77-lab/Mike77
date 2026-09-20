const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;

// Ruta principal que responde con la frase solicitada
app.get('/', (req, res) => {
  res.send('servidor activo');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
