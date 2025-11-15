
import { useEffect, useState } from "react";
import { Link, useNavigate} from "react-router-dom";

import "./CSS/Perfil.css";

const API_BASE = "https://proy-back-production.up.railway.app/api/usuarios";

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

const decodeJwt = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
};

const capitalizeWords = (str) =>
  str
    ? str
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    : "";


export default function Perfil() {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const [profile, setProfile] = useState(storedUser || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const handleLogout = () => {
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("justLoggedIn"); 

    
    navigate("/");
  };
  const fetchProfile = async () => {
    if (!token) {
      if (!profile) setError("No hay sesión activa. Inicia sesión.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await handleResponse(res);
        const usuario = data.usuario || data;
        setProfile(usuario);
        localStorage.setItem("user", JSON.stringify(usuario));
        return;
      }

      if (storedUser) {
        setProfile(storedUser);
        return;
      }

      throw new Error("No se pudo obtener perfil desde el servidor ni hay usuario en localStorage.");
    } catch (err) {
      console.error("fetchProfile error:", err);
      setError(err.message || "Error al obtener perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);


  const avatarUrl = (() => {
    const name = profile?.nombre || profile?.name || "Usuario";
  
    return `${profile?.avatar || profile?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=AD0000&color=fff&rounded=true&size=180`}`;
  })();

  if (loading) {
    return (
      <div className="perfil-container">
        <p className="perfil-loading">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1 className="perfil-title">Mi Perfil</h1>
      </div>

      <div className="perfil-content">
        {error && <div className="perfil-error">{error}</div>}

        {!profile ? (
          <p className="perfil-no-data">Perfil no disponible.</p>
        ) : (
          <div className="perfil-card">
            <div className="perfil-avatar-wrap">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="perfil-avatar"
                onError={(e) => {
                  const name = profile?.nombre || profile?.name || "Usuario";
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name
                  )}&background=6c757d&color=fff&rounded=true&size=180`;
                }}
              />
            </div>

            <div className="perfil-info">
              <dl className="perfil-dl">
                <div className="perfil-row">
                  <dt className="perfil-label">ID</dt>
                  <dd className="perfil-value">{profile.id || profile._id || "-"}</dd>
                </div>

                <div className="perfil-row">
                  <dt className="perfil-label">Nombre</dt>
                  <dd className="perfil-value">{capitalizeWords(profile.nombre || profile.name || "-")}</dd>
                </div>

                <div className="perfil-row">
                  <dt className="perfil-label">Correo</dt>
                  <dd className="perfil-value">{profile.email || "-"}</dd>
                </div>

                <div className="perfil-row">
                  <dt className="perfil-label">Rol</dt>
                  <dd className="perfil-value">{profile.rol || "-"}</dd>
                </div>

                
              </dl>
                <div className="perfil-actions">
                <Link to="/expedientes" className="perfil-btn-primary">Mis Expedientes</Link>
                    <button onClick={handleLogout} className="perfil-btn-primary">
                      Cerrar Sesión
                    </button>              
              </div>           
            </div>
          </div>
        )}
      </div>
    </div>
  );
}