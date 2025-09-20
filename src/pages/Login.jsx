import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './CSS/Login.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://proy-back-production.up.railway.app/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(`Bienvenido ${data.user.nombre}`);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-form-container">
      {/* Columna de la izquierda para el texto y el logo */}
      <div className="login-content-left">
        <h1>Sistema Judicial</h1>
        <img src="/src/img/logos.png" alt="Logo de Sistema Judicial" />
         <p>Te ayuda a gestionar y optimizar tus procesos legales de forma eficiente.</p>
      </div>

      {/* Columna de la derecha para el formulario */}
      <div className="login-form-right">
        <div className="login-form-card">
          <h1 className="login-form-heading">
            Iniciar Sesión
          </h1>
          <form className="login-form-wrapper" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label className="login-form-label">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="login-form-input"
                required
              />
            </div>
            <div className="login-form-group">
              <label className="login-form-label">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="login-form-input"
                required
              />
            </div>
            <button
              type="submit"
              className="login-form-button"
            >
              Ingresar
            </button>
          </form>
          {error && <p className="login-form-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}