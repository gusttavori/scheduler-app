"use client"; // <-- Necessário para onClick e useRouter

import React from "react";
// Adiciona o ícone de Sair (FaSignOutAlt)
import { FaCalendarAlt, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation"; // Importa o hook de roteamento
import NotificationButton from './NotificationButton'; // Importa o novo botão

export default function Sidebar() {
  const router = useRouter(); // Inicializa o router

  // Função que será chamada no clique
  const handleLogout = () => {
    // Redireciona o usuário para a página de login
    router.push('/profissional/login');
  };

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {/* TODO: Lógica de .active */}
          <li className="active">
            <FaCalendarAlt /> 
            {/* Este <span> é escondido no mobile */}
            <span>Agendamentos</span>
          </li>

          {/* NOVO ITEM DE NOTIFICAÇÃO */}
          <li className="notification-item">
            <NotificationButton>
              {/* Este <span> é escondido no mobile */}
            </NotificationButton>
            <span>Notificações</span>
          </li>

          <li onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> 
            {/* Este <span> é escondido no mobile */}
            <span>Sair</span>
          </li>
        </ul>
      </nav>
      
      <img src="/reservaon.png" alt="Logo ReservaON" className="logo" />
    </aside>
  );
}