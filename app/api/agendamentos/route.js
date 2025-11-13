import connectMongoDB from '../../lib/mongodb';
import Agendamento from '../../models/Agendamento';
import { NextResponse } from 'next/server';
import { enviarWhatsApp } from '../../lib/whatsapp'; 

// --- 1. IMPORTS PARA NOTIFICAÇÃO PUSH ---
import webpush from 'web-push';
import Subscription from '../../models/Subscription'; // Modelo de Inscrição

// --- 2. CONFIGURAR WEB-PUSH (fora das funções) ---
// As chaves devem estar no .env.local
webpush.setVapidDetails(
  'mailto:gustavorms1916@gmail.com', // MUDE AQUI: Obrigatório pelo protocolo VAPID (apenas contato)
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * GET: Busca TODOS os agendamentos para o Dashboard.
 * (Sua função original - Está correta)
 */
export async function GET() {
  try {
    await connectMongoDB();

    const agendamentos = await Agendamento.find({})
      .sort({ dataHora: -1 }); 

    return NextResponse.json(agendamentos, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar agendamentos para o dashboard:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar agendamentos.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Cria um novo agendamento, envia WhatsApp E envia Notificação Push.
 * (Função ATUALIZADA)
 */
export async function POST(request) { 
  try {
    // 1. Pega os dados do formulário
    const body = await request.json();
    // Certifique-se de que o 'service' (serviço) está sendo enviado pelo frontend
    const { nome, whatsapp, dataHora, service } = body; 

    // 2. Validação básica
    if (!nome || !whatsapp || !dataHora || !service) {
      return NextResponse.json({ message: 'Dados incompletos (nome, whatsapp, data, serviço).' }, { status: 400 });
    }

    // 3. Conecta ao banco de dados
    await connectMongoDB();

    // 4. Salva o novo agendamento no MongoDB
    const novoAgendamento = await Agendamento.create({
      nome,
      whatsapp,
      dataHora: new Date(dataHora),
      service, // Salva o serviço
      status: 'confirmado' 
    });

    // 5. ENVIA A CONFIRMAÇÃO AUTOMÁTICA (WHATSAPP)
    await enviarWhatsApp(
      'confirmacao',
      novoAgendamento.nome,
      novoAgendamento.whatsapp,
      novoAgendamento.dataHora 
    );

    // --- 6. INÍCIO - ENVIAR NOTIFICAÇÃO PUSH ---
    try {
      // 6.1. Busca todas as inscrições do banco
      const subscriptions = await Subscription.find({});
      
      // 6.2. Define o payload (o que a notificação vai dizer)
      const payload = JSON.stringify({
        title: 'Novo Agendamento!',
        body: `${novoAgendamento.nome} agendou: ${novoAgendamento.service}.`,
      });

      // 6.3. Cria uma lista de promessas de envio
      const promises = subscriptions.map(sub => 
        webpush.sendNotification(sub.toObject(), payload)
      );
      
      // 6.4. Envia todas as notificações em paralelo
      await Promise.all(promises);

    } catch (pushError) {
      // Se o envio do PUSH falhar, não quebra a requisição principal
      console.error('Erro ao enviar notificação push:', pushError);
    }
    // --- 6. FIM - ENVIAR NOTIFICAÇÃO PUSH ---

    // 7. Retorna o agendamento criado com sucesso
    return NextResponse.json(novoAgendamento, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { message: 'Erro ao criar agendamento.' },
      { status: 500 }
    );
  }
}