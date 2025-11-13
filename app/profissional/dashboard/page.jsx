"use client"; // <-- CORREÇÃO: Adicionado no topo

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
        // Agora esta rota GET vai funcionar e trazer os dados completos
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
                // Ajustamos as props enviadas para o AppointmentCard
                // Passamos o objeto 'a' (agendamento) inteiro
                appointments.map((a) => (
                  <AppointmentCard key={a._id} appointment={a} />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}