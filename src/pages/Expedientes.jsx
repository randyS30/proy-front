import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Expedientes.css";

const API = "https://proy-back-production.up.railway.app";

const Expedientes = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    // construir query params (no añadimos parámetros vacíos)
    const p = new URLSearchParams();
    if (q && q.trim()) p.set("q", q.trim());
    if (estado) p.set("estado", estado);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    const qs = p.toString() ? `?${p.toString()}` : "";

    // debounce + permitir cancelar fetch anterior
    setLoading(true);
    setErr("");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/expedientes${qs}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({ success: false, message: "Respuesta inválida" }));

        if (!res.ok) {
          setExpedientes([]);
          setErr(data.message || `HTTP ${res.status}`);
        } else {
          setExpedientes(Array.isArray(data.expedientes) ? data.expedientes : []);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // fetch abortado (normal en debounce)
          return;
        }
        console.error("fetch expedientes error:", err);
        setErr("Error de red");
        setExpedientes([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [q, estado, from, to]);

  const limpiarFiltros = () => {
    setQ("");
    setEstado("");
    setFrom("");
    setTo("");
  };

  const analizarExpedienteIA = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${API}/api/expedientes/${id}/analizar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json());
      if (r.success) {
        alert("✅ Análisis generado y guardado en reportes");
      } else {
        alert("❌ No se pudo analizar: " + (r.message || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Error en análisis IA");
    }
  };

  const fmt = (d) => (d ? d.slice(0, 10) : "—");

  return (
    <div className="exp-container">
      <div className="exp-header">
        <h2>Lista de Expedientes</h2>
        <Link to="/expedientes/nuevo" className="btn btn-success">Nuevo Expediente</Link>
      </div>

      <div className="exp-filters">
        <div className="row">
          <div className="col">
            <label>Buscar</label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="N° expediente, demandante o demandado"
            />
          </div>
          <div className="col">
            <label>Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="Abierto">Abierto</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>
          <div className="col">
            <label>Desde</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col">
            <label>Hasta</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <div className="row right">
          <button className="btn btn-secondary" onClick={limpiarFiltros}>Limpiar filtros</button>
        </div>
      </div>

      {loading && <p>Cargando...</p>}
      {err && <p className="text-error">{err}</p>}

      {!loading && !err && (
        <>
          {expedientes.length === 0 ? (
            <p>No hay expedientes para los filtros aplicados.</p>
          ) : (
            <table className="exp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>N° Expediente</th>
                  <th>Demandante</th>
                  <th>Demandado</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Creado por</th>
                  <th>Archivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expedientes.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.id}</td>
                    <td>{exp.numero_expediente}</td>
                    <td>{exp.demandante}</td>
                    <td>{exp.demandado}</td>
                    <td>{exp.estado}</td>
                    <td>{fmt(exp.fecha_inicio)}</td>
                    <td>{fmt(exp.fecha_fin)}</td>
                    <td>{exp.creado_por_nombre || exp.creado_por || "—"}</td>
                    <td>
                      {exp.archivo ? (
                        <>
                          <a href={`${API}/uploads/${exp.archivo}`} target="_blank" rel="noopener noreferrer" className="btn btn-link">Ver archivo</a>
                          <button className="btn btn-warning" onClick={() => analizarExpedienteIA(exp.id)}>Analizar IA</button>
                        </>
                      ) : "—"}
                    </td>
                    <td>
                      <Link to={`/expedientes/${exp.id}`} className="btn btn-primary">Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default Expedientes;
