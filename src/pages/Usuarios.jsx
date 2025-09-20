import { useEffect, useState } from "react";
import './CSS/Usuarios.css';

const API_BASE = "https://proy-back-production.up.railway.app/api/usuarios";
const ROLES = ["Admin", "Abogado", "Asistente"];

// regex: mínimo 8 chars, al menos 1 mayúscula, 1 minúscula y 1 número.
// permite símbolos también.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);

  const token = localStorage.getItem("token");

  const handleResponse = async (res) => {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || JSON.stringify(data));
      return data;
    } else {
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);
      return txt;
    }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await handleResponse(res);
      setUsuarios(data.usuarios || []);
    } catch (err) {
      console.error("fetchUsuarios error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setEmail("");
    setRol("");
    setPassword("");
    setConfirmPassword("");
    setEditingUserId(null);
    setError(null);
  };

  // devuelve el rol "canónico" según ROLES (case-insensitive)
  const canonicalRole = (r) => {
    if (!r) return null;
    const found = ROLES.find((x) => x.toLowerCase() === r.trim().toLowerCase());
    return found || null;
  };

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // VALIDACIONES: isEdit = true cuando es PUT (no se exige password)
  const validar = (isEdit = false) => {
    const n = (nombre || "").trim();
    const em = (email || "").trim();
    if (!n) return "Nombre es obligatorio";
    if (!em) return "Email es obligatorio";
    if (!validateEmail(em)) return "Formato de email inválido";
    if (!rol) return "Selecciona un rol";
    if (!canonicalRole(rol)) return `Rol inválido. Valores válidos: ${ROLES.join(", ")}`;
    if (!isEdit) {
      if (!password) return "Contraseña es obligatoria";
      if (!passwordRegex.test(password))
        return "La contraseña debe tener mínimo 8 caracteres e incluir mayúscula, minúscula y número";
      if (password !== confirmPassword) return "Las contraseñas no coinciden";
    }
    return null;
  };

  // capitalizar cada palabra (para nombre)
  const capitalizeWords = (str) =>
    str
      ? str
          .split(" ")
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      : "";

  // CREATE
  const crearUsuario = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validar(false);
    if (v) return setError(v);

    const body = {
      nombre: nombre.trim(),
      email: email.trim(),
      rol: canonicalRole(rol), // envía la forma exacta: Admin/Abogado/Asistente
      password,
    };

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await handleResponse(res);
      if (data.usuario) {
        // añade nuevo usuario al inicio
        setUsuarios((s) => [data.usuario, ...s]);
      } else {
        await fetchUsuarios();
      }
      limpiarFormulario();
    } catch (err) {
      console.error("crearUsuario error:", err);
      // si el error viene del CHECK constraint, lo hacemos más claro
      if (err.message && err.message.toLowerCase().includes("violates check constraint")) {
        setError(
          "El rol enviado no está permitido por la base de datos. Asegúrate de seleccionar uno de: " +
            ROLES.join(", ")
        );
      } else {
        setError(err.message);
      }
    }
  };

  // BEGIN EDIT
  const comenzarEdicion = (u) => {
    setEditingUserId(u.id);
    setNombre(u.nombre || "");
    setEmail(u.email || "");
    setRol(u.rol || "");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  // SAVE EDIT (PUT) - no enviamos password por defecto
  const guardarEdicion = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validar(true);
    if (v) return setError(v);

    const body = {
      nombre: nombre.trim(),
      email: email.trim(),
      rol: canonicalRole(rol),
    };

    try {
      const res = await fetch(`${API_BASE}/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await handleResponse(res);
      if (data.usuario) {
        setUsuarios((s) => s.map((u) => (u.id === data.usuario.id ? data.usuario : u)));
      } else {
        await fetchUsuarios();
      }
      limpiarFormulario();
    } catch (err) {
      console.error("guardarEdicion error:", err);
      if (err.message && err.message.toLowerCase().includes("violates check constraint")) {
        setError(
          "No se pudo actualizar: el rol enviado no está permitido por la base de datos. Selecciona uno de: " +
            ROLES.join(", ")
        );
      } else {
        setError(err.message);
      }
    }
  };

  // DELETE
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleResponse(res);
      setUsuarios((s) => s.filter((u) => u.id !== id));
    } catch (err) {
      console.error("eliminar error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1 className="usuarios-title">Gestión de Usuarios</h1>
        <p className="usuarios-subtitle">Lista, edita y crea usuarios en el sistema.</p>
      </div>

      <div className="usuarios-content">
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <form onSubmit={editingUserId ? guardarEdicion : crearUsuario} className="user-form">
            <h2 className="form-title">{editingUserId ? "Editar Usuario" : "Crear Usuario"}</h2>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input 
                className="form-input" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="form-input" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rol</label>
              <select 
                className="form-input" 
                value={rol} 
                onChange={(e) => setRol(e.target.value)}
                required
              >
                <option value="">-- Seleccione rol --</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {!editingUserId && (
              <>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar contraseña</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingUserId ? "Guardar cambios" : "Crear usuario"}
              </button>
              {editingUserId && (
                <button type="button" onClick={limpiarFormulario} className="btn-cancel">
                  Cancelar
                </button>
              )}
              <button type="button" onClick={fetchUsuarios} className="btn-refresh">
                Refrescar
              </button>
            </div>
          </form>
        </div>

        <div className="table-section">
          <h2 className="table-title">Usuarios Existentes</h2>
          <div className="table-wrapper">
            {loading ? (
              <p className="loading-message">Cargando usuarios...</p>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th className="table-th">ID</th>
                    <th className="table-th">Nombre</th>
                    <th className="table-th">Email</th>
                    <th className="table-th">Rol</th>
                    <th className="table-th">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id} className="table-row">
                      <td className="table-td">{u.id}</td>
                      <td className="table-td">{capitalizeWords(u.nombre)}</td>
                      <td className="table-td">{u.email}</td>
                      <td className="table-td">{u.rol}</td>
                      <td className="table-td">
                        <button className="btn-edit" onClick={() => comenzarEdicion(u)}>
                          Editar
                        </button>
                        <button className="btn-delete" onClick={() => eliminar(u.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan="5" className="no-data-message">
                        No hay usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}