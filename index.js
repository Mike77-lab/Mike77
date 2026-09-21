const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const fastcsv = require('fast-csv');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para entender datos en formato JSON enviados en el cuerpo de la petición (POST y PUT)
app.use(express.json());

// Función auxiliar para leer todos los clientes del archivo CSV
const leerClientes = () => {
  return new Promise((resolve, reject) => {
    const clientes = [];
    if (!fs.existsSync('clientes.csv')) {
      return resolve([]);
    }
    fs.createReadStream('clientes.csv')
      .pipe(csv())
      .on('data', (data) => clientes.push(data))
      .on('end', () => resolve(clientes))
      .on('error', (err) => reject(err));
  });
};

// Función auxiliar para sobrescribir el archivo CSV con la lista actualizada de clientes
const guardarClientes = (clientes) => {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream('clientes.csv');
    fastcsv
      .write(clientes, { headers: true })
      .pipe(ws)
      .on('finish', () => resolve())
      .on('error', (err) => reject(err));
  });
};

// -------------------------------------------------------------
// OPERACIONES CRUD
// -------------------------------------------------------------

// 1. READ (GET): Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await leerClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al leer el archivo CSV', error });
  }
});

// 2. CREATE (POST): Agregar un nuevo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const clientes = await leerClientes();
    const nuevoCliente = req.body; // Se esperan los campos: id, nombre, correo, telefono, ciudad, edad

    // Comprobar si el ID ya existe
    const existe = clientes.some((c) => String(c.id) === String(nuevoCliente.id));
    if (existe) {
      return res.status(400).json({ mensaje: 'El ID ingresado ya existe' });
    }

    clientes.push(nuevoCliente);
    await guardarClientes(clientes);
    res.status(201).json({ mensaje: 'Cliente agregado con éxito', cliente: nuevoCliente });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar el nuevo cliente', error });
  }
});

// 3. UPDATE (PUT): Actualizar un cliente por su ID
app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    let clientes = await leerClientes();

    const index = clientes.findIndex((c) => String(c.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    // Actualiza los datos conservando el ID original
    clientes[index] = { ...clientes[index], ...datosActualizados, id };
    await guardarClientes(clientes);

    res.json({ mensaje: 'Cliente actualizado con éxito', cliente: clientes[index] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el cliente', error });
  }
});

// 4. DELETE (DELETE): Eliminar un cliente por su ID
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let clientes = await leerClientes();

    const existe = clientes.some((c) => String(c.id) === String(id));
    if (!existe) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    // Filtrar para excluir el cliente con el ID especificado
    clientes = clientes.filter((c) => String(c.id) !== String(id));
    await guardarClientes(clientes);

    res.json({ mensaje: `Cliente con ID ${id} eliminado con éxito` });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el cliente', error });
  }
});

app.listen(port, () => {
  console.log(`Servidor CRUD ejecutándose en el puerto ${port}`);
});