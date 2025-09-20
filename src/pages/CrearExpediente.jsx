import { useState } from "react";

const API_BASE = "https://proy-back-production.up.railway.app/api/expedientes";
// cambia esto a la URL de RENIEC en Railway
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
  const userId = localStorage.getItem("userId"); // el id del usuario logueado

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Consulta RENIEC (demandante o demandado)
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
        alert("⚠️ No se encontró en RENIEC, completa los datos manualmente.");
      }
    } catch (err) {
      console.error("Error RENIEC:", err);
    } finally {
      setLoading(false);
    }
  };

  // Genera EXP-AÑO-0000
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
        creado_por: userId, // aquí automáticamente
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
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Crear Expediente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Documento Demandante</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="demandante_doc"
              value={formData.demandante_doc}
              onChange={handleChange}
              className="border p-2 flex-1 rounded"
            />
            <button
              type="button"
              onClick={() => consultarReniec("demandante")}
              className="bg-blue-500 text-white px-3 rounded"
            >
              Buscar
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold">Demandante</label>
          <input
            type="text"
            name="demandante"
            value={formData.demandante}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Fecha Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Documento Demandado</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="demandado_doc"
              value={formData.demandado_doc}
              onChange={handleChange}
              className="border p-2 flex-1 rounded"
            />
            <button
              type="button"
              onClick={() => consultarReniec("demandado")}
              className="bg-blue-500 text-white px-3 rounded"
            >
              Buscar
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold">Demandado</label>
          <input
            type="text"
            name="demandado"
            value={formData.demandado}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block font-semibold">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">Seleccione...</option>
            <option value="Abierto">Abierto</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">Fecha Inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Creando..." : "Crear Expediente"}
        </button>
      </form>
    </div>
  );
}
