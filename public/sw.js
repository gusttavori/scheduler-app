// public/sw.js

// "self" é o próprio service worker
self.addEventListener('push', (event) => {
  // Pega os dados da notificação (o texto que enviamos do backend)
  const data = event.data.json();

  const title = data.title || 'Novo Agendamento';
  const options = {
    body: data.body,
    icon: '/AmeliaAmadoNails.png', // Ícone (coloque um na pasta /public)
    badge: '/AmeliaAmadoNails.png', // Ícone da barra (opcional)
  };

  // Exibe a notificação
  event.waitUntil(self.registration.showNotification(title, options));
});

// Opcional: Ação ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Foca na janela do app se estiver aberta, ou abre uma nova
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url == '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/profissional/dashboard');
    })
  );
});