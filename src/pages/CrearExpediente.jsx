import React, { useState } from "react";
import Button from "../components/Button";
import './CSS/CrearExpediente.css';

const CrearExpediente = () => {
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
    creado_por: "admin",
    archivo: null,
  });

  const [loading, setLoading] = useState(false);

  const consultarReniec = async (tipo) => {
    const doc = tipo === "demandante" ? formData.demandante_doc : formData.demandado_doc;

    if (!doc || (doc.length !== 8 && doc.length !== 9)) {
      alert("Documento inválido (DNI: 8 dígitos, CE: 9 dígitos)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://proy-back-production.up.railway.app/api/reniec/${doc}`);
      const data = await res.json();

      if (data.success) {
        if (tipo === "demandante") {
          setFormData((prev) => ({
            ...prev,
            demandante: data.nombre || "",
            fecha_nacimiento: data.fecha_nacimiento || "",
            direccion: data.direccion || "",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            demandado: data.nombre || "",
          }));
        }
      } else {
        alert("⚠️ No se encontró en RENIEC, completa los datos manualmente.");
      }
    } catch (err) {
      console.error("Error RENIEC:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "archivo") {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (formData.archivo) {
      formDataToSend.append("archivo", formData.archivo);
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://proy-back-production.up.railway.app/api/expedientes",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("✅ Expediente creado correctamente");
        setFormData({
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
          creado_por: "admin",
          archivo: null,
        });
      } else {
        alert(data.message || "❌ Error al crear expediente");
      }
    } catch (err) {
      console.error("Error creando expediente:", err);
    }
  };

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
          <div className="form-input-group form-input-inline">
            <input
              type="text"
              placeholder="DNI/CE"
              className="form-input form-input-half"
              value={formData.demandante_doc}
              onChange={(e) => setFormData({ ...formData, demandante_doc: e.target.value })}
            />
            <Button
              variant="primary"
              onClick={() => consultarReniec("demandante")}
              loading={loading}
              className="form-button"
            >
              {loading ? "..." : "Buscar"}
            </Button>
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
          <div className="form-input-group form-input-inline">
            <input
              type="text"
              placeholder="DNI/CE"
              className="form-input form-input-half"
              value={formData.demandado_doc}
              onChange={(e) => setFormData({ ...formData, demandado_doc: e.target.value })}
            />
            <Button
              variant="primary"
              onClick={() => consultarReniec("demandado")}
              disabled={loading}
              className="form-button"
            >
              {loading ? "..." : "Buscar"}
            </Button>
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
          <div className="form-input-group">
            <input
              type="file"
              className="form-input"
              onChange={(e) => setFormData({ ...formData, archivo: e.target.files[0] })}
            />
          </div>
        </div>

        {/* Sección de Fechas de Fin y Archivo */}
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