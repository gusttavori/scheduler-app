import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb'; // Certifique-se que o caminho @/ funciona (ou use ../../)
import Agendamento from '@/models/Agendamento';
import Subscription from '@/models/Subscription'; 
import { enviarWhatsApp } from '@/lib/whatsapp'; 
import webpush from 'web-push';

// --- CONFIGURAÇÃO WEB-PUSH ---
// É recomendável mover essas chaves para variáveis de ambiente, mas se já estiverem no .env.local, ok.
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn("AVISO: Chaves VAPID não configuradas no .env.local");
}

webpush.setVapidDetails(
  'mailto:gustavorms1916@gmail.com', 
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * GET: Busca TODOS os agendamentos para o Dashboard.
 */
export async function GET() {
  try {
    await connectMongoDB();

    // Busca e ordena do mais recente para o mais antigo
    const agendamentos = await Agendamento.find({}).sort({ dataHora: -1 }); 

    return NextResponse.json(agendamentos, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar agendamentos.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Cria agendamento + WhatsApp + Notificação Push
 */
export async function POST(request) { 
  try {
    const body = await request.json();
    const { nome, whatsapp, dataHora, service } = body; 

    // 1. Validação básica
    if (!nome || !whatsapp || !dataHora || !service) {
      return NextResponse.json(
        { message: 'Dados incompletos (nome, whatsapp, data ou serviço faltando).' }, 
        { status: 400 }
      );
    }

    await connectMongoDB();

    // 2. Cria o Agendamento
    const novoAgendamento = await Agendamento.create({
      nome,
      whatsapp,
      dataHora: new Date(dataHora),
      service, 
      status: 'confirmado' 
    });

    // 3. Dispara WhatsApp (sem await para não travar a resposta se demorar)
    // Se precisar garantir o envio, coloque 'await', mas isso deixa a UI mais lenta.
    enviarWhatsApp(
      'confirmacao',
      novoAgendamento.nome,
      novoAgendamento.whatsapp,
      novoAgendamento.dataHora 
    ).catch(err => console.error("Erro ao enviar WhatsApp:", err));

    // 4. Dispara Notificações Push
    // Envolvemos em try/catch para garantir que o agendamento seja retornado mesmo se o push falhar
    try {
      const subscriptions = await Subscription.find({});
      
      const payload = JSON.stringify({
        title: 'Novo Agendamento! 📅',
        body: `${novoAgendamento.nome} agendou ${novoAgendamento.service}.`,
        // Você pode adicionar uma URL aqui se quiser que ao clicar vá para o dashboard
        data: { url: '/dashboard' } 
      });

      // Mapeia os envios individualmente para tratar erros de inscrição inválida (ex: usuário limpou cache)
      const pushPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, payload);
        } catch (err) {
          // Se o erro for 410 (Gone) ou 404 (Not Found), a inscrição não existe mais. Devemos deletar.
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`Removendo inscrição inválida: ${sub._id}`);
            await Subscription.findByIdAndDelete(sub._id);
          } else {
            console.error('Erro ao enviar push para uma inscrição:', err);
          }
        }
      });
      
      // Aguarda todos os disparos (sem travar se um falhar)
      await Promise.all(pushPromises);

    } catch (pushError) {
      console.error('Erro geral no sistema de Push:', pushError);
    }

    // 5. Retorna sucesso
    return NextResponse.json(novoAgendamento, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { message: 'Erro interno ao processar agendamento.' },
      { status: 500 }
    );
  }
}