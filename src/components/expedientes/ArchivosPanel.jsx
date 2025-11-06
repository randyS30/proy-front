import React, { useEffect, useState } from "react";
// Se corrigió la ruta de importación asumiendo que Modal está en 'src/layouts'
import Modal from "../Modal.jsx"; 

const API = "https://proy-back-production.up.railway.app";

// Nueva función para recargar archivos, para no repetir código
const loadArchivos = async (expedienteId, setArchivos, setLoading) => {
  setLoading(true);
  try {
    const res = await fetch(`${API}/api/expedientes/${expedienteId}/archivos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setArchivos(data.success ? data.archivos : []);
  } catch (err) {
    console.error(err);
    setArchivos([]);
  } finally {
    setLoading(false);
  }
};


export default function ArchivosPanel({ expedienteId }) {
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState(null);

  useEffect(() => {
    loadArchivos(expedienteId, setArchivos, setLoading);
  }, [expedienteId]);

  const subirArchivos = async (e) => {
    e.preventDefault();
    if (!filesToUpload || filesToUpload.length === 0) {
      alert("Selecciona al menos un archivo");
      return;
    }
    
    const formData = new FormData();
    for (let f of filesToUpload) {
      if (f.type !== "application/pdf") {
        alert(`El archivo "${f.name}" no es un PDF. Solo se permiten archivos PDF.`);
        return; 
      }
      formData.append("archivos", f);
    }
    
    formData.append("subido_por", "1"); 
    formData.append("expediente_id", expedienteId); 

    try {
      const res = await fetch(`${API}/api/expedientes/${expedienteId}/archivos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // En lugar de solo añadir, recargamos la lista completa
        // para que sea más robusto
        loadArchivos(expedienteId, setArchivos, setLoading);
        setOpenModal(false);
        setFilesToUpload(null);
        alert("✅ Archivos subidos exitosamente.");
      } else {
         alert(`❌ Error del servidor: ${data.message || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al subir archivos");
    }
  };
      
  const eliminarArchivo = async (id) => {
    if (!window.confirm("¿Eliminar archivo?")) return;
    try {
      const res = await fetch(`${API}/api/archivos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        setArchivos((prev) => prev.filter((x) => x.id !== id));
      } else {
        alert(`Error al eliminar: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al eliminar");
    }
  };


  // Esta es la nueva función de descarga que SÍ envía el token
  const descargarArchivoClick = async (archivo) => {
    try {
      const res = await fetch(`${API}/api/archivos/${archivo.id}/download`, {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) {
        // Si el servidor envía un error (ej. 404), léelo como JSON
        const errData = await res.json();
        throw new Error(errData.message || "No se pudo descargar el archivo");
      }

      // 1. Convertir la respuesta en un Blob (el archivo en sí)
      const blob = await res.blob();

      // 2. Crear un link temporal en memoria
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // 3. Poner el nombre original del archivo
      link.setAttribute("download", archivo.nombre_original);
      
      // 4. Simular clic y limpiar
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert(`Error al descargar: ${err.message}`);
    }
  };


  if (loading) return <p>Cargando archivos…</p>;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Archivos</h3>
        <button className="btn" onClick={() => setOpenModal(true)}>+ Subir archivos</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Subido por</th>
              <th>Fecha</th>
              {/* Ancho de columna ajustado */}
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {archivos.length === 0 && (
              <tr><td colSpan="5" className="muted">Sin archivos</td></tr>
            )}
            {archivos.map((ar) => (
              <tr key={ar.id}>
                <td>{ar.id}</td>
                <td>{ar.nombre_original}</td>
                <td>{ar.subido_por}</td> 
                <td>{ar.subido_en ? new Date(ar.subido_en).toLocaleString() : "-"}</td>
                <td>
                  {/* --- CAMBIO AQUÍ --- */}
                  <button 
                    className="btn btn-light" 
                    onClick={() => descargarArchivoClick(ar)}
                  >
                    Descargar
                  </button>
                  
                  {/* --- BOTÓN 'Analizar con IA' ELIMINADO --- */}

                  <button className="btn btn-danger" onClick={() => eliminarArchivo(ar.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Subir archivos" width={480}>
        <form onSubmit={subirArchivos} className="form-grid">
          <label className="full">
            <input type="file" multiple onChange={(e) => setFilesToUpload(e.target.files)} accept="application/pdf"/>
          </label>
          <div className="actions">
            <button type="submit" className="btn btn-primary">Subir</button>
            <button type="button" className="btn" onClick={() => setOpenModal(false)}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}