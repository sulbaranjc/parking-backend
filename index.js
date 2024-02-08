require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

app.use(express.json()); // Para parsear application/json


// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Verificar conexión a la base de datos
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado a la base de datos MySQL');
});

app.get('/hola', (req, res) => {
  res.send('Hola Mundo');
});

//DEVUELVE TODOS LOS PARKINGS
app.get('/api/parkings', (req, res) => {
  const query = 'SELECT * FROM aparcamiento';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener los datos de los parkings');
    } else {
      res.json(results);
    }
  });
});


// CAMBIAR DISPONIBILIDAD DE UN PARKING
app.post('/api/parkings/disponibilidad', async (req, res) => {
  const { numeroEspacio, disponible } = req.body;
  const query = 'UPDATE aparcamiento SET disponible = ? WHERE numero = ?';

  try {
    const [result] = await db.promise().query(query, [disponible, numeroEspacio]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Disponibilidad actualizada correctamente.' });
    } else {
      res.status(404).json({ success: false, message: 'Espacio no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar la disponibilidad.', error: error.message });
  }
});

//INSERTAR UN TICKET
app.post('/api/tickets/ingresar', async (req, res) => {
  const { aparcamiento_id, matricula, precio_hora } = req.body;
  // No necesitas recibir fecha_entrada desde el frontend

  // Usa la función NOW() de MySQL para establecer la fecha y hora actuales
  const query = `
    INSERT INTO ticket (aparcamiento_id, matricula, fecha_entrada, precio_hora) 
    VALUES (?, ?, NOW(), ?)
  `;

  try {
    const [result] = await db.promise().query(query, [aparcamiento_id, matricula, precio_hora]);
    // Después de insertar el ticket, obtén los datos completos del ticket insertado
    const [fullTicket] = await db.promise().query('SELECT * FROM ticket WHERE id = ?', [result.insertId]);
    
    res.json({ success: true, message: 'Ticket creado con éxito.', ticket: fullTicket[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear el ticket.', error: error.message });
  }
});



//DEVUELVE TODOS LOS TICKETS ACTIVOS
app.get('/api/tickets/activos', async (req, res) => {
  const query = 'SELECT * FROM ticket WHERE fecha_salida IS NULL';

  try {
    const [rows] = await db.promise().query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los tickets activos.', error: error.message });
  }
});

//cierra un ticket
app.post('/api/tickets/cerrar', async (req, res) => {
  // Asumiendo que recibimos el id del ticket y el precio por hora
  const { ticketId, precioHora } = req.body;

  // Selecciona el ticket para obtener la fecha de entrada y calcular el tiempo
  const selectQuery = 'SELECT fecha_entrada FROM ticket WHERE id = ?';
  const updateQuery = `
    UPDATE ticket 
    SET fecha_salida = NOW(), 
        total_pagar = TIMESTAMPDIFF(MINUTE, fecha_entrada, NOW()) * ? 
    WHERE id = ? AND fecha_salida IS NULL
  `;

  try {
    // Seleccionar ticket para calcular el total a pagar
    const [tickets] = await db.promise().query(selectQuery, [ticketId]);

    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket no encontrado.' });
    }

    // Actualiza el ticket con la fecha de salida y el total a pagar
    const [updateResult] = await db.promise().query(updateQuery, [precioHora, ticketId]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'No se pudo actualizar el ticket.' });
    }

    // Selecciona el ticket actualizado para enviarlo de vuelta al frontend
    const [updatedTickets] = await db.promise().query('SELECT * FROM ticket WHERE id = ?', [ticketId]);
    
    res.json({ success: true, ticket: updatedTickets[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cerrar el ticket.', error: error.message });
  }
});

// Endpoint para calcular los ingresos totales del día
app.get('/api/ingresos/totales', async (req, res) => {
  const queryIngresosTotales = `
    SELECT SUM(total_pagar) AS ingresos_totales
    FROM ticket
    WHERE DATE(fecha_salida) = CURDATE();
  `;

  try {
    const [result] = await db.promise().query(queryIngresosTotales);
    const ingresosTotales = result[0].ingresos_totales || 0;
    res.json({ success: true, ingresosTotales: ingresosTotales });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al calcular los ingresos totales.', error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});