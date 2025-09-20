import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useExpedientes } from '../layouts/ExpedienteContext'; // Importa el hook del contexto
import './CSS/CrearExpediente.css';

const CrearExpediente = () => {
  const navigate = useNavigate();
  const { addExpediente } = useExpedientes(); // Usa la función del contexto

  const [formData, setFormData] = useState({
    numero_expediente: "",
    demandante_doc: "",
    demandante: "",
    fecha_nacimiento: "",
    direccion: "",
    demandado_doc: "",
    demandado: "",
    estado: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Usa la función del contexto para agregar el expediente
    addExpediente(formData);
    
    alert("✅ Expediente creado exitosamente");
    navigate("/expedientes"); // Redirige a la lista
  };

  // ... (El resto del código JSX del formulario es el mismo)
  return (
    <div className="form-container">
      <h2 className="form-title text-center">Crear Expediente</h2>
      <form onSubmit={handleSubmit} className="form-main">
        {/* Sección de Número de Expediente */}
        <div className="form-input-group">
          <input
            type="text"
            placeholder="Número de expediente"
            className="form-input"
            value={formData.numero_expediente}
            onChange={(e) => setFormData({ ...formData, numero_expediente: e.target.value })}
            required
          />
        </div>
        {/* Sección de Demandante */}
        <div className="form-section">
          <h3 className="section-title">Datos del Demandante</h3>
          <div className="form-input-group">
            <input
              type="text"
              placeholder="DNI/CE"
              className="form-input"
              value={formData.demandante_doc}
              onChange={(e) => setFormData({ ...formData, demandante_doc: e.target.value })}
            />
          </div>
          
          <div className="form-input-group">
            <input
              type="text"
              placeholder="Nombre completo"
              className="form-input"
              value={formData.demandante}
              onChange={(e) => setFormData({ ...formData, demandante: e.target.value })}
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="fecha-nacimiento" className="form-label">Fecha de nacimiento:</label>
            <input
              id="fecha-nacimiento"
              type="date"
              className="form-input"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            />
          </div>
        </div>
        {/* Sección de Demandado y Dirección */}
        <div className="form-section">
          <h3 className="section-title">Datos del Demandado</h3>
          <div className="form-input-group">
            <input
              type="text"
              placeholder="DNI/CE"
              className="form-input"
              value={formData.demandado_doc}
              onChange={(e) => setFormData({ ...formData, demandado_doc: e.target.value })}
            />
          </div>
          <div className="form-input-group">
            <input
              type="text"
              placeholder="Nombre completo"
              className="form-input"
              value={formData.demandado}
              onChange={(e) => setFormData({ ...formData, demandado: e.target.value })}
            />
          </div>
          <div className="form-input-group">
            <input
              type="text"
              placeholder="Dirección"
              className="form-input"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>
        </div>
        {/* Sección de Estado y Fechas */}
        <div className="form-input-duo">
          <div className="form-input-group">
            <select
              className="form-input"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              required
            >
              <option value="">-- Estado --</option>
              <option value="Abierto">Abierto</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>
        </div>
        {/* Sección de Fechas */}
        <div className="form-input-duo">
          <div className="form-input-group">
            <label htmlFor="fecha-inicio" className="form-label">Fecha de inicio:</label>
            <input
              id="fecha-inicio"
              type="date"
              className="form-input"
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="fecha-fin" className="form-label">Fecha de fin:</label>
            <input
              id="fecha-fin"
              type="date"
              className="form-input"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
            />
          </div>
        </div>
        <Button type="submit" className="form-submit-button">
          Crear Expediente
        </Button>
      </form>
    </div>
  );
};

export default CrearExpediente;