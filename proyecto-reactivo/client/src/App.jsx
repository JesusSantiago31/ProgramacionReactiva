import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [sensores, setSensores] = useState([]);
  const [nuevoSensor, setNuevoSensor] = useState({ nombre: '', tipo: 'Temperatura', valor: '' });
  const [filtro, setFiltro] = useState('Todos');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const API_URL = `${BASE_URL}/api/sensores`;

  // Cargar sensores al iniciar
  useEffect(() => {
    fetchSensores();
  }, []);

  const fetchSensores = async () => {
    try {
      setCargando(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los sensores');
      const data = await response.ok ? await response.json() : [];
      setSensores(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const agregarSensor = async (e) => {
    e.preventDefault();
    if (!nuevoSensor.nombre || !nuevoSensor.valor) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoSensor),
      });

      if (!response.ok) throw new Error('Error al agregar el sensor');
      
      const creado = await response.json();
      setSensores([...sensores, creado]);
      setNuevoSensor({ nombre: '', tipo: 'Temperatura', valor: '' });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarSensor = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el sensor');
      
      setSensores(sensores.filter(s => s._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const sensoresFiltrados = filtro === 'Todos' 
    ? sensores 
    : sensores.filter(s => s.tipo === filtro);

  return (
    <div className="contenedor">
      <header>
        <h1>Panel de Monitoreo de Sensores</h1>
        <p className="subtitulo">Programación Reactiva - Unidad 1</p>
      </header>

      {error && <div className="error">{error}</div>}

      <form className="formulario" onSubmit={agregarSensor}>
        <input
          type="text"
          placeholder="Nombre del sensor"
          value={nuevoSensor.nombre}
          onChange={(e) => setNuevoSensor({ ...nuevoSensor, nombre: e.target.value })}
          required
        />
        <select
          value={nuevoSensor.tipo}
          onChange={(e) => setNuevoSensor({ ...nuevoSensor, tipo: e.target.value })}
        >
          <option value="Temperatura">Temperatura</option>
          <option value="Humedad">Humedad</option>
          <option value="Luz">Luz</option>
          <option value="Presión">Presión</option>
        </select>
        <input
          type="number"
          placeholder="Valor"
          value={nuevoSensor.valor}
          onChange={(e) => setNuevoSensor({ ...nuevoSensor, valor: e.target.value })}
          required
        />
        <button type="submit">Agregar Sensor</button>
      </form>

      <div className="filtros">
        <label>Filtrar por tipo:</label>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Temperatura">Temperatura</option>
          <option value="Humedad">Humedad</option>
          <option value="Luz">Luz</option>
          <option value="Presión">Presión</option>
        </select>
      </div>

      {cargando ? (
        <div className="cargando">Cargando sensores...</div>
      ) : sensoresFiltrados.length === 0 ? (
        <div className="vacio">No hay sensores para mostrar.</div>
      ) : (
        <div className="grid-sensores">
          {sensoresFiltrados.map((sensor) => (
            <div key={sensor._id} className="tarjeta-sensor">
              <h3>{sensor.nombre}</h3>
              <p className="tipo">{sensor.tipo}</p>
              <p className="valor">
                {sensor.valor}
                {sensor.tipo === 'Temperatura' ? '°C' : 
                 sensor.tipo === 'Humedad' ? '%' : 
                 sensor.tipo === 'Luz' ? ' lx' : ''}
              </p>
              <button 
                className="btn-eliminar" 
                onClick={() => eliminarSensor(sensor._id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;