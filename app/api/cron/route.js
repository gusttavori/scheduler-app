import { NextResponse } from 'next/server';
import connectMongoDB from '../../lib/mongodb';
import Agendamento from '../../models/Agendamento';
import { enviarWhatsApp } from '../../lib/whatsapp'; // Importamos sua função de envio

// Pega a chave secreta das suas variáveis de ambiente
const CRON_SECRET = process.env.CRON_SECRET;

// Define o fuso horário correto
const TIME_ZONE = 'America/Bahia';

/**
 * GET: Rota acessada pelo Cron Job do Render.
 * (Corrigido para JavaScript puro)
 */
export async function GET(request) { // <-- CORRIGIDO: Removido ': Request'
  // 1. VERIFICAÇÃO DE SEGURANÇA
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== CRON_SECRET) {
    console.warn('[CRON] Tentativa de acesso não autorizada.');
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // --- Chave correta, iniciar processo ---
  console.log('[CRON] Iniciando verificação de lembretes...');

  try {
    await connectMongoDB();

    // 2. LÓGICA DE "LEMBRETE DE ATENDIMENTO" (HOJE)
    const hoje = new Date(new Date().toLocaleString('en-US', { timeZone: TIME_ZONE }));
    const inicioDoDia = new Date(hoje.setHours(0, 0, 0, 0));
    const fimDoDia = new Date(hoje.setHours(23, 59, 59, 999));

    const agendamentosDeHoje = await Agendamento.find({
      dataHora: {
        $gte: inicioDoDia, // Maior ou igual a hoje 00:00
        $lte: fimDoDia,   // Menor ou igual a hoje 23:59
      },
      status: 'confirmado',
    });

    console.log(`[CRON] Encontrados ${agendamentosDeHoje.length} agendamentos para hoje.`);
    
    // Envia os lembretes de HOJE
    for (const agendamento of agendamentosDeHoje) {
      await enviarWhatsApp(
        'lembrete_atendimento',
        agendamento.nome,
        agendamento.whatsapp,
        agendamento.dataHora
      );
      await new Promise(res => setTimeout(res, 2000)); 
    }

    // 3. LÓGICA DE "LEMBRETE DE RETORNO" (25 DIAS)
    const dataBaseRetorno = new Date(new Date().toLocaleString('en-US', { timeZone: TIME_ZONE }));
    dataBaseRetorno.setDate(dataBaseRetorno.getDate() - 25);
    
    const inicioDiaRetorno = new Date(dataBaseRetorno.setHours(0, 0, 0, 0));
    const fimDiaRetorno = new Date(dataBaseRetorno.setHours(23, 59, 59, 999));

    const agendamentosParaRetorno = await Agendamento.find({
      dataHora: {
        $gte: inicioDiaRetorno,
        $lte: fimDiaRetorno,
      },
      status: 'confirmado',
    });

    console.log(`[CRON] Encontrados ${agendamentosParaRetorno.length} agendamentos de 25 dias atrás.`);

    // Envia os lembretes de RETORNO
    for (const agendamento of agendamentosParaRetorno) {
      await enviarWhatsApp(
        'lembrete_retorno',
        agendamento.nome,
        agendamento.whatsapp,
        agendamento.dataHora // A data do agendamento original
      );
      await new Promise(res => setTimeout(res, 2000));
    }

    // 4. SUCESSO
    return NextResponse.json({ 
      success: true, 
      lembretesHoje: agendamentosDeHoje.length,
      lembretesRetorno: agendamentosParaRetorno.length
    });

  } catch (error) {
    console.error('[CRON] Erro ao processar lembretes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}