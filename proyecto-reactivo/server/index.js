const express = require("express"); // Framework web para Node.js
const cors = require("cors"); // Middleware para permitir conexiones desde el frontend
const bodyParser = require("body-parser"); // Middleware para parsear JSON en las peticiones
const mongoose = require("mongoose"); // Biblioteca para modelado de datos de MongoDB

const app = express(); // Creamos la aplicación Express
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARES ---
app.use(cors());
app.use(bodyParser.json());

// --- CONEXIÓN A MONGODB ---
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sensores_db";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Conectado a MongoDB..."))
  .catch((err) => console.error("No se pudo conectar a MongoDB:", err));

// --- MODELO DE DATOS ---
const sensorSchema = new mongoose.Schema({
  nombre: String,
  tipo: { type: String, enum: ["Temperatura", "Humedad", "Luz", "Presión"] },
  valor: Number,
  fecha: { type: Date, default: Date.now },
});

const Sensor = mongoose.model("Sensor", sensorSchema);

// ==========================================
// RUTAS DE LA API (Endpoints)
// ==========================================

// GET /api/sensores - Obtener todos los sensores
app.get("/api/sensores", async (req, res) => {
  try {
    const sensores = await Sensor.find();
    res.json(sensores);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener sensores" });
  }
});

// POST /api/sensores - Crear un nuevo sensor
app.post("/api/sensores", async (req, res) => {
  try {
    const nuevoSensor = new Sensor({
      nombre: req.body.nombre,
      tipo: req.body.tipo,
      valor: Number(req.body.valor),
    });
    const guardado = await nuevoSensor.save();
    res.status(201).json(guardado);
  } catch (err) {
    res.status(400).json({ error: "Error al crear sensor" });
  }
});

// DELETE /api/sensores/:id - Eliminar un sensor por ID
app.delete("/api/sensores/:id", async (req, res) => {
  try {
    const eliminado = await Sensor.findByIdAndDelete(req.params.id);
    if (!eliminado)
      return res.status(404).json({ error: "Sensor no encontrado" });
    res.json({ mensaje: "Sensor eliminado correctamente", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar sensor" });
  }
});

// GET /api/sensores/tipo/:tipo - Filtrar por tipo
app.get("/api/sensores/tipo/:tipo", async (req, res) => {
  try {
    const filtrados = await Sensor.find({ tipo: req.params.tipo });
    res.json(filtrados);
  } catch (err) {
    res.status(500).json({ error: "Error al filtrar sensores" });
  }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`  GET    /api/sensores`);
  console.log(`  POST   /api/sensores`);
  console.log(`  DELETE /api/sensores/:id`);
});
