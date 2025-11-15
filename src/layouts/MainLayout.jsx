import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal.jsx"; 

const API = "https://proy-back-production.up.railway.app";

// Componente pequeño para el item de la alerta
function AlertaItem({ alerta, onVerClick }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
  const fechaEvento = new Date(alerta.fecha_evento);
  // El split y join es para corregir la zona horaria (un truco común)
  const fechaEventoUTC = new Date(fechaEvento.toISOString().split('T')[0]);

  const esVencido = fechaEventoUTC < hoy;

  return (
    <div 
      className="alerta-item" 
      style={esVencido ? { borderLeft: "4px solid #e53e3e" } : { borderLeft: "4px solid #f6e05e" }}
    >
      <div className="alerta-info">
        <strong>{alerta.tipo_evento}</strong> (Exp: {alerta.numero_expediente})
        <p>{alerta.descripcion || "Sin descripción"}</p>
      </div>
      <div className="alerta-fecha">
        <strong>{esVencido ? "Venció" : "Vence"}:</strong>
        {new Date(alerta.fecha_evento).toLocaleDateString()}
      </div>
      <button onClick={onVerClick} className="btn btn-light">
        Ver
      </button>
    </div>
  );
}

export default function MainLayout() {
  const [alertas, setAlertas] = useState([]);
  const [showAlertaModal, setShowAlertaModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Al cargar el layout principal, buscamos las alertas
    const fetchAlertas = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/"); // Si no hay token, fuera
        return;
      }

      try {
        const res = await fetch(`${API}/api/alertas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.status === 401) { // Si el token expiró
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        const data = await res.json();
        if (data.success && data.alertas.length > 0) {
          setAlertas(data.alertas);
          setShowAlertaModal(true); // ¡Abrimos el modal!
        }
      } catch (err) {
        console.error("Error cargando alertas:", err);
      }
    };

    // Llamamos a la función solo una vez
    fetchAlertas();
  }, [navigate]); // navigate se incluye como dependencia

  return (
    <>
      <Navbar />
      <div className="container">
        <Outlet /> 
      </div>

      {/* =================================== */}
      {/* ¡AQUÍ ESTÁ EL NUEVO MODAL DE ALERTAS! */}
      {/* =================================== */}
      <Modal 
        open={showAlertaModal} 
        onClose={() => setShowAlertaModal(false)} 
        title={`🔔 ${alertas.length} Alertas de Eventos`}
        width={700}
      >
        <div className="alertas-list">
          <p className="muted" style={{textAlign: 'center', marginTop: 0}}>
            Eventos vencidos o por vencer en los próximos 3 días.
          </p>
          {alertas.map(alerta => (
            <AlertaItem 
              key={alerta.evento_id} 
              alerta={alerta} 
              onVerClick={() => {
                // Al hacer clic en "Ver", cerramos el modal y navegamos al expediente
                setShowAlertaModal(false);
                navigate(`/expedientes/${alerta.expediente_id}`);
              }}
            />
          ))}
        </div>
      </Modal>
    </>
  );
}