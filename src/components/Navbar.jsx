import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>Sistema Judicial</h1>

      <div className="navbar-links"> 
        <Link to="/inicio">Inicio</Link>
        <Link to="/expedientes">Expedientes</Link>
        <Link to="/usuarios">Usuarios</Link>
        <Link to="/reportes">Reportes</Link>

        <Link to="/perfil" className="profile-icon" title="Ver Perfil">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            width="24px" 
            height="24px"
          >
            <path 
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
            />
          </svg>
        </Link>

      </div>
    </nav>
  );
}
