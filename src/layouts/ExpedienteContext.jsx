import React, { createContext, useState, useContext } from 'react';

// Crea el contexto
const ExpedienteContext = createContext();

// Hook personalizado para usar el contexto
export const useExpedientes = () => {
  return useContext(ExpedienteContext);
};

// Componente proveedor que envolverá tu app
export const ExpedienteProvider = ({ children }) => {
  const [expedientes, setExpedientes] = useState([]);

  // Función para agregar un nuevo expediente
  const addExpediente = (newExpediente) => {
    // Asigna un ID único temporal
    const expedienteConId = { ...newExpediente, id: Date.now() };
    setExpedientes((prevExpedientes) => [...prevExpedientes, expedienteConId]);
  };

  return (
    <ExpedienteContext.Provider value={{ expedientes, addExpediente }}>
      {children}
    </ExpedienteContext.Provider>
  );
};