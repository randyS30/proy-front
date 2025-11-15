import { useState } from "react";
import './CSS/CrearExpediente.css';
const API_BASE = "https://proy-back-production.up.railway.app/api/expedientes";

const RENIEC_API = "https://proy-back-production.up.railway.app/api/reniec";

export default function CrearExpediente() {
  const [formData, setFormData] = useState({
    demandante_doc: "",
    demandante: "",
    fecha_nacimiento: "",
    direccion: "",
    demandado_doc: "",
    demandado: "",
    estado: "",
    fecha_inicio: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const consultarReniec = async (tipo) => {
    const doc =
      tipo === "demandante"
        ? formData.demandante_doc
        : formData.demandado_doc;

    if (!doc || (doc.length !== 8 && doc.length !== 9)) {
      alert("Documento inválido (DNI: 8 dígitos, CE: 9 dígitos)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${RENIEC_API}/${doc}`);
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
        alert(" No se encontró en RENIEC, completa los datos manualmente.");
      }
    } catch (err) {
      console.error("Error RENIEC:", err);
    } finally {
      setLoading(false);
    }
  };

  const generarNumeroExpediente = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `EXP-${year}-${rand}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.demandante_doc || !formData.demandante) {
    alert("Completa los datos del demandante");
    return;
  }
  if (!formData.demandado_doc || !formData.demandado) {
    alert("Completa los datos del demandado");
    return;
  }
  if (!formData.estado || !formData.fecha_inicio) {
    alert("Completa estado y fecha inicio");
    return;
  }

    setLoading(true);

    try {
      const numero_expediente = generarNumeroExpediente();
      const body = {
        ...formData,
        numero_expediente,
        creado_por: userId,
      };

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al crear expediente");
      }

      alert("Expediente creado correctamente ✅");
      // limpiar form
      setFormData({
        demandante_doc: "",
        demandante: "",
        fecha_nacimiento: "",
        direccion: "",
        demandado_doc: "",
        demandado: "",
        estado: "",
        fecha_inicio: "",
      });
    } catch (err) {
      console.error("Error creando expediente:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title text-center">Crear Expediente</h2>
      <form onSubmit={handleSubmit} className="form-main">
        <div className="form-section">
          <h3 className="section-title">Datos del Demandante</h3>
          <div className="form-input-group form-input-inline">
            <input
              type="text"
              name="demandante_doc"
              placeholder="DNI"
              value={formData.demandante_doc}
              onChange={handleChange}
              className="form-input form-input-half"
            />
            <button
              type="button"
              onClick={() => consultarReniec("demandante")}
              className="form-button"
            >
              Buscar
            </button>
          </div>
           <div className="form-input-group">
          <input
            type="text"
            placeholder="Nombre completo"
            name="demandante"
            value={formData.demandante}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-input-group">
          <input
            type="text"
            placeholder="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-input-group">
            <label htmlFor="fecha-nacimiento" className="form-label">Fecha de nacimiento:</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Datos del Demandado</h3>
          <div className="form-input-group form-input-inline">
            <input
              type="text"
              name="demandado_doc"
              placeholder="DNI"
              value={formData.demandado_doc}
              onChange={handleChange}
              className="form-input form-input-half"
            />
            <button
              type="button"
              onClick={() => consultarReniec("demandado")}
              className="form-button"
            >
              Buscar
            </button>
          </div>
           <div className="form-input-group">
          
          <input
            type="text"
            name="demandado"
            placeholder="Nombre completo"
            value={formData.demandado}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        </div>

        {/* Estado */}
        <div className="form-input-duo">
          <div className="form-input-group">
            <label htmlFor="fecha-inicio" className="form-label">Estado:</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
             className="form-input"
          >
            <option value="">Seleccione...</option>
            <option value="Abierto">Abierto</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
        <div className="form-input-group">
            <label htmlFor="fecha-inicio" className="form-label">Fecha de inicio:</label>
          <input
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="form-submit-button"
        >
          {loading ? "Creando..." : "Crear Expediente"}
        </button>
      </form>
    </div>
  );
}
