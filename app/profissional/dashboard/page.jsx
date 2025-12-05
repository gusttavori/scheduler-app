"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dashboard.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AppointmentCard from "./components/AppointmentCard";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/agendamentos");
        setAppointments(response.data);
        setError(null);
      } catch (err) {
        setError("Não foi possível carregar os agendamentos.");
        console.error("Erro ao buscar agendamentos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Função para deletar um agendamento
  const handleDelete = async (id) => {
    try {
      // 1. Chamada para API
      // Certifique-se que sua API suporta o método DELETE nesta rota
      await axios.delete(`/api/agendamentos/${id}`);

      // 2. Atualiza o estado local removendo o item deletado
      setAppointments((prevAppointments) => 
        prevAppointments.filter((appointment) => appointment._id !== id)
      );

    } catch (err) {
      console.error("Erro ao excluir agendamento:", err);
      alert("Erro ao excluir o agendamento. Tente novamente.");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Header />
        
        <main className="main-content">

          <div className="section-header">
            <h2>Meus Agendamentos</h2>
            <input type="date" className="date-input" />
          </div>

          {loading && <p>Carregando agendamentos...</p>}
          
          {error && <p style={{ color: "red" }}>{error}</p>}
          
          {!loading && !error && (
            <div className="appointments-list">
              {appointments.length === 0 ? (
                <p>Nenhum agendamento encontrado.</p>
              ) : (
                appointments.map((a) => (
                  <AppointmentCard 
                    key={a._id} 
                    appointment={a} 
                    onDelete={handleDelete} // Passando a função de deletar
                  />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}