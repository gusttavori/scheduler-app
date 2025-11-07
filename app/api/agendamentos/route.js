import connectMongoDB from '../../lib/mongodb';
import Agendamento from '../../models/Agendamento';
import { NextResponse } from 'next/server';
import { enviarWhatsApp } from '../../lib/whatsapp'; // 1. IMPORTAMOS A FUNÇÃO DE ENVIO

/**
 * GET: Busca horários já ocupados.
 * (Sua função original, mantida como está)
 */
export async function GET() {
  try {
    await connectMongoDB();
    const agendamentos = await Agendamento.find({
      status: 'confirmado',
    }).select('dataHora');

    const horariosOcupados = agendamentos.map(ag => ag.dataHora.toISOString());
    return NextResponse.json({ horariosOcupados }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar horários.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Cria um novo agendamento e envia a confirmação.
 * (Corrigido para JavaScript puro)
 */
export async function POST(request) { // <-- CORRIGIDO: Removido ': Request'
  try {
    // 2. Pega os dados do formulário (enviados pelo front-end)
    const body = await request.json();
    const { nome, whatsapp, dataHora } = body;

    // 3. Validação básica
    if (!nome || !whatsapp || !dataHora) {
      return NextResponse.json({ message: 'Dados incompletos.' }, { status: 400 });
    }

    // 4. Conecta ao banco de dados
    await connectMongoDB();

    // 5. Salva o novo agendamento no MongoDB
    const novoAgendamento = await Agendamento.create({
      nome,
      whatsapp,
      dataHora: new Date(dataHora),
      status: 'confirmado' // Define o status inicial
    });

    // 6. 🔥 ENVIA A CONFIRMAÇÃO AUTOMÁTICA 🔥
    // Chama sua função 'enviarWhatsApp' que usa a Evolution API
    await enviarWhatsApp(
      'confirmacao',
      novoAgendamento.nome,
      novoAgendamento.whatsapp,
      novoAgendamento.dataHora // Passa o objeto Date
    );

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