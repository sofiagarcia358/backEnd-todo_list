// Requiriendo las dependencias necesarias
var express = require('express');
var cors = require('cors');
var path = require('path');
var mysql = require('mysql2');

// Crear una instancia de la aplicación Express
var app = express();

// Usar CORS para permitir solicitudes desde el puerto 5500 (o el origen de tu frontend)
app.use(cors({
  origin: 'http://127.0.0.1:5501', // Ajusta esto al origen de tu frontend
}));

// Middlewares para la configuración básica de Express
app.use(express.json()); // Para parsear JSON en las solicitudes
app.use(express.urlencoded({ extended: false })); // Para parsear formularios

// Configurar la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Usa el usuario que tengas configurado en MySQL
  password: 'sofiag1', // Usa la contraseña que tengas configurada en MySQL
  database: 'todo_list' // Nombre de la base de datos a la que deseas conectarte
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// Ruta para consultar los usuarios desde la base de datos
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});

//-------------------------------------------------------------------
// CONSULTAS A MI BASE DE DATOS SQL EN MYSQL SERVER


  
  // Conectar a la base de datos
  db.connect((err) => {
  if (err) {
  console.error('Error de conexión a la base de datos: ', err);
  return;
  }
  console.log('Conexión a la base de datos establecida');
  });
  
  // Ruta para consultar los usuarios desde la base de datos
  app.get('/tareas', (req, res) => {
  // Realiza una consulta SELECT a la base de datos
  
  db.query('SELECT * FROM tareas', (err, results) => {
  if (err) {
  console.error('Error al ejecutar la consulta: ', err);
  res.status(500).send('Error en la consulta');
  return;
  }
  // Enviar los resultados de la consulta como respuesta en formato JSON
  res.json(results);
  });
  
  });
  app.post('/agregar', (req, res) => {
    const { nombre_tarea, estado } = req.body;
    
    if (!nombre_tarea || !estado) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const query = 'INSERT INTO tareas (nombre_tarea, estado) VALUES (?, ?)';
    db.query(query, [nombre_tarea, estado], (err, result) => {
    if (err) {
    console.error('Error al insertar la tarea: ', err);
    return res.status(500).json({ error: 'Error al guardar la tarea' });
    }
    res.status(201).json({ id: result.insertId, nombre_tarea, estado });
    });
    });
     

  
//-------------------------------------------------------------------

// Ruta de login (ahora valida las credenciales en lugar de insertarlas)
app.post('/login', (req, res) => {
  const { usuario, contraseña } = req.body;
  
  if (!usuario || !contraseña) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }
  
  const query = 'SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?';
  db.query(query, [usuario, contraseña], (err, results) => {
    if (err) {
      console.error('Error al consultar usuario: ', err);
      return res.status(500).json({ error: 'Error al verificar usuario' });
    }

    if (results.length > 0) {
      // Si encontramos un usuario, lo autenticamos
      res.status(200).json({ mensaje: 'Autenticación exitosa', usuario: results[0] });
    } else {
      // Si no encontramos el usuario o la contraseña no es correcta
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  });
});
//crea un usuario, verificando que no exista
app.post('/registrar', (req, res) => {
  const { usuario, contraseña, correo } = req.body;
  
  if (!usuario || !contraseña || !correo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Verificar si el usuario o correo ya existe
  const checkQuery = 'SELECT * FROM usuarios WHERE usuario = ? OR correo = ?';
  db.query(checkQuery, [usuario, correo], (err, results) => {
    if (err) {
      console.error('Error al verificar usuario:', err);
      return res.status(500).json({ error: 'Error al verificar usuario' });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'El usuario o correo ya existe' });
    }

    // Insertar nuevo usuario
    const insertQuery = 'INSERT INTO usuarios (usuario, contraseña, correo) VALUES (?, ?, ?)';
    db.query(insertQuery, [usuario, contraseña, correo], (err, result) => {
      if (err) {
        console.error('Error al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: result.insertId });
    });
  });
});

app.post('/agregar-tarea', (req, res) => {
  const { nombre_tarea, estado, usuario_id } = req.body;

  if (!nombre_tarea || !estado || !usuario_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const query = 'INSERT INTO tareas (nombre_tarea, estado, usuario_id) VALUES (?, ?, ?)';
  db.query(query, [nombre_tarea, estado, usuario_id], (err, result) => {
      if (err) {
          console.error('Error al agregar tarea: ', err);
          return res.status(500).json({ error: 'Error al guardar la tarea' });
      }
      res.status(201).json({ mensaje: 'Tarea agregada con éxito', id: result.insertId });
  });
});
app.get('/tareas/:usuario_id', (req, res) => {
  const usuario_id = req.params.usuario_id;

  const query = 'SELECT * FROM tareas WHERE usuario_id = ?';
  db.query(query, [usuario_id], (err, results) => {
      if (err) {
          console.error('Error al obtener tareas: ', err);
          return res.status(500).json({ error: 'Error al obtener las tareas' });
      }
      res.json(results);
  });
});
app.delete('/tareas/:id', (req, res) => {
  const tarea_id = req.params.id;

  const query = 'DELETE FROM tareas WHERE id = ?';
  db.query(query, [tarea_id], (err, result) => {
      if (err) {
          console.error('Error al eliminar tarea: ', err);
          return res.status(500).json({ error: 'Error al eliminar la tarea' });
      }
      res.json({ mensaje: 'Tarea eliminada con éxito' });
  });
});



// Configurar el puerto en el que se escucharán las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;
