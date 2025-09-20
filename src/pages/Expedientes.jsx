import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useExpedientes } from '../layouts/ExpedienteContext'; // Importa el hook del contexto
import "./Expedientes.css";

const Expedientes = () => {
  const { expedientes } = useExpedientes(); // Obtiene los expedientes del contexto
  const [q, setQ] = useState("");

  const expedientesFiltrados = expedientes.filter((exp) =>
    exp.numero_expediente.toLowerCase().includes(q.toLowerCase())
  );

  const limpiarFiltros = () => {
    setQ("");
  };

  return (
    <div className="exp-container">
      <div className="exp-header">
        <h2>Lista de Expedientes</h2>
        <Link to="/expedientes/nuevo" className="btn btn-success">
          Nuevo Expediente
        </Link>
      </div>

      {/* Filtros */}
      <div className="exp-filters">
        <div className="row">
          <div className="col">
            <label>Buscar por N° de Expediente</label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Número de expediente"
            />
          </div>
        </div>
        <div className="row right">
          <button className="btn btn-secondary" onClick={limpiarFiltros}>
            Limpiar filtro
          </button>
        </div>
      </div>

      {expedientesFiltrados.length === 0 ? (
        <p>No hay expedientes para los filtros aplicados.</p>
      ) : (
        <table className="exp-table">
          <thead className="exp-table-header">
            <tr>
              <th>ID</th>
              <th>N° Expediente</th>
              <th>Demandante</th>
              <th>Demandado</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expedientesFiltrados.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.id}</td>
                <td>{exp.numero_expediente}</td>
                <td>{exp.demandante}</td>
                <td>{exp.demandado}</td>
                <td>{exp.estado}</td>
                <td>{exp.fecha_inicio}</td>
                <td>{exp.fecha_fin}</td>
                <td>
                  <Link to={`/expedientes/${exp.id}`} className="btn btn-primary">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Expedientes;