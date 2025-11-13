import React from 'react';

// Função para formatar a data
const formatarData = (isoString) => {
  const data = new Date(isoString);
  // Você pode ajustar opções de formatação como quiser
  const opcoes = {
    dateStyle: 'short', // ex: 12/11/2025
    timeStyle: 'short', // ex: 14:00
  };
  // Retorna algo como "12/11/2025 às 14:00"
  return data.toLocaleString('pt-BR', opcoes).replace(',', ' às');
};

// Componente do Card
export default function AppointmentCard({ appointment }) {
  // Desestruturamos as props de 'appointment'
  const { nome, whatsapp, dataHora, status } = appointment;

  // Mapeia os status para as classes CSS
  const statusClasses = {
    confirmado: 'status-confirmado',
    pendente: 'status-pendente',
    cancelado: 'status-cancelado',
  };

  // Pega a classe CSS correta ou usa 'pendente' como padrão
  const statusClass = statusClasses[status] || 'status-pendente';
  
  // Limpa o número de WhatsApp para criar o link (remove +, espaços, -, etc.)
  const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '';

  return (
    <div className="appointment-card">
      <div>
        <h4>{nome}</h4>
        <p>{whatsapp || 'Telefone não informado'}</p>
        <span className="date">{formatarData(dataHora)}</span>
      </div>
      
      {/* NOVO: Wrapper para as ações (status + botão) */}
      <div className="card-actions">
        <span className={`status-badge ${statusClass}`}>
          {status}
        </span>
        
        {/* NOVO: Botão de WhatsApp */}
        {whatsapp && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button"
            title="Enviar mensagem"
            // Evita que o clique no link propague para o card (se houver)
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Ícone de WhatsApp (SVG P&B) */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="18" 
              height="18" 
              fill="currentColor"
            >
              <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.85L2 22l5.25-1.38c1.41.79 3.02 1.25 4.79 1.25 5.46 0 9.91-4.45 9.91-9.91a9.87 9.87 0 0 0-2.95-7.05zM12.04 20.13c-1.55 0-3.04-.39-4.35-1.08l-.31-.18-3.24.85.87-3.17-.2-.33a8.134 8.134 0 0 1-1.26-4.31c0-4.54 3.7-8.24 8.24-8.24a8.216 8.216 0 0 1 5.83 2.41 8.216 8.216 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zM16.46 14c-.18-.09-.95-.47-1.1-.52-.15-.05-.26-.08-.37.08-.11.16-.42.52-.51.62-.1.1-.18.11-.33.04-.15-.07-.63-.23-1.2-.74-.44-.39-.74-.88-.83-1.03-.09-.15-.01-.23.07-.31.07-.07.15-.18.23-.27.08-.09.11-.15.17-.25.06-.1.03-.18-.01-.27-.05-.09-.37-.88-.51-1.21-.14-.32-.28-.28-.37-.28s-.18-.01-.26-.01c-.08 0-.21.03-.32.15-.11.12-.42.41-.42.99s.42 1.15.48 1.23c.06.08.83 1.27 2.01 1.77.29.12.52.19.7.25.18.06.34.05.47-.03.14-.08.42-.17.48-.33.06-.16.06-.3.04-.33s-.05-.08-.09-.12z"/>
            </svg>
            <span>Enviar mensagem</span>
          </a>
        )}
      </div>
    </div>
  );
}