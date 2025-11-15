import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

import Modal from "../components/Modal.jsx"; 

const API = "https://proy-back-production.up.railway.app";


function AlertaItem({ alerta, onVerClick }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); 
  const fechaEvento = new Date(alerta.fecha_evento);

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
 
    const fetchAlertas = async (token) => {
      try {
        const res = await fetch(`${API}/api/alertas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.status === 401) { 
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        const data = await res.json();
        if (data.success && data.alertas.length > 0) {
          setAlertas(data.alertas);
          setShowAlertaModal(true); 
        }
      } catch (err) {
        console.error("Error cargando alertas:", err);
      }
    };

 
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

  
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");

   
    if (justLoggedIn === "true") {

      sessionStorage.removeItem("justLoggedIn");
      
      fetchAlertas(token);
    }


  }, [navigate]); 

  return (
    <>
      <Navbar />
      <div className="container">
        <Outlet /> 
      </div>


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