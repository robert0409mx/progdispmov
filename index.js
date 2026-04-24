import express from 'express';
import cors from 'cors';
import db from './database.js';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Ruta principal
app.get('/', (req, res) => {
  console.log('Respondiendo GET /');
  res.json({ 
    mensaje: 'Servidor Express funcionando correctamente',
    fecha: new Date().toISOString()
  });
});

// Endpoint POST para agregar un todo (AHORA GUARDA EN LA BD)
app.post('/agrega_todo', (req, res) => {
  console.log('POST /agrega_todo recibido');
  const { todo } = req.body;
  
  // Validar que se recibió el dato
  if (!todo) {
    return res.status(400).json({ 
      error: 'El campo "todo" es requerido' 
    });
  }
  
  // Insertar en la base de datos
  const query = `INSERT INTO todos (todo) VALUES (?)`;
  
  db.run(query, [todo], function(err) {
    if (err) {
      console.error('Error al guardar en la base de datos:', err.message);
      return res.status(500).json({ 
        error: 'Error al guardar en la base de datos' 
      });
    }
    
    console.log('Todo guardado con ID:', this.lastID);
    console.log('Todo:', todo);
    
    // Responder con estado 201 (Created)
    res.status(201).json({
      mensaje: 'Todo guardado correctamente en la base de datos',
      id: this.lastID,
      todo: todo,
      fecha: new Date().toISOString()
    });
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Base de datos: todos.db`);
  console.log(`Endpoints disponibles:`);
  console.log(`  GET  /`);
  console.log(`  POST /agrega_todo`);
  console.log('========================================');
});

// Endpoint GET para listar todos los todos
app.get('/todos', (req, res) => {
  console.log('GET /todos - Obteniendo todos los registros');
  
  db.all('SELECT * FROM todos ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    console.log(`✓ Se encontraron ${rows.length} registros`);
    res.json({ 
      total: rows.length,
      todos: rows 
    });
  });
});
