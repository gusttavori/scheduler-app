"use client";

import React, { useState, useEffect } from 'react';
import { FaBell, FaBellSlash } from 'react-icons/fa';

// Função para converter a chave VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationButton({ children }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // NOVO: Estado para controlar nosso modal de aviso
  const [modalMessage, setModalMessage] = useState(null);
  
  // Chave pública do .env.local
  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  // 1. Efeito para registrar o Service Worker e verificar o status da inscrição
  useEffect(() => {
    // Verifica se o navegador suporta notificações
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker
        .register('/sw.js') // Registra o service worker
        .then((registration) => {
          // Verifica se já existe uma inscrição
          return registration.pushManager.getSubscription();
        })
        .then((subscription) => {
          if (subscription) {
            setIsSubscribed(true); // Usuário já está inscrito
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Erro no Service Worker:', err);
          setIsLoading(false);
        });
    } else {
      // Navegador não suporta (ex: iOS)
      setIsLoading(false);
    }
  }, []);

  // 2. Função para inscrever (ou desinscrever) o usuário
  const handleSubscriptionToggle = async () => {
    
    // ---- CORREÇÃO PRINCIPAL ----
    // Primeiro, verifica se o navegador tem suporte ANTES de tentar
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      
      // ---- CORREÇÃO DA QUEBRA DE LINHA ----
      // Modificado de string para JSX com <br />
      setModalMessage(
        <>
          Seu dispositivo (iOS) não suporta <br />notificações push de sites.
        </>
      );
      // ------------------------------------

      return;
    }
    // ----------------------------

    if (!VAPID_PUBLIC_KEY) {
      console.error('VAPID_PUBLIC_KEY não definida.');
      return;
    }

    const swRegistration = await navigator.serviceWorker.ready;

    if (isSubscribed) {
      // --- Lógica para DESINSCREVER ---
      const subscription = await swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        // TODO: Enviar requisição ao backend para remover a inscrição do MongoDB
        setIsSubscribed(false);
      }
    } else {
      // --- Lógica para INSCREVER ---
      try {
        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Envia a inscrição para o backend
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });

        setIsSubscribed(true);
      } catch (error) {
        console.error('Falha ao se inscrever:', error);
      }
    }
  };

  // REMOVIDO: O `return null` foi removido. O botão agora sempre aparece.

  return (
    <>
      <button
        onClick={handleSubscriptionToggle}
        disabled={isLoading}
        className="notification-button" // Classe para o CSS
        title={isSubscribed ? 'Desativar Notificações' : 'Ativar Notificações'}
      >
        {isSubscribed ? <FaBellSlash size={18} /> : <FaBell size={18} />}
        
        {children}
      </button>

      {/* NOVO: Nosso modal de aviso personalizado */}
      {modalMessage && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            {/* O <p> agora renderiza o JSX com a quebra de linha */}
            <p>{modalMessage}</p>
            <button 
              className="custom-modal-button"
              onClick={() => setModalMessage(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}