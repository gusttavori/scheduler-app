import connectMongoDB from '../../lib/mongodb';
import Agendamento from '../../models/Agendamento';
import { enviarWhatsApp } from '../../lib/whatsapp';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { nome, whatsapp, dataHora } = await request.json();

    if (!nome || !whatsapp || !dataHora) {
      return NextResponse.json(
        { message: 'Nome, WhatsApp e Data/Hora são obrigatórios.' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // 1. Converte a string ISO para o objeto Date (Ex: 12:30 no fuso local)
    const dataAgendamento = new Date(dataHora);

    // --- INÍCIO DA CORREÇÃO ---
    
    // 2. Cria uma data separada para o lembrete
    const dataLembrete = new Date(dataAgendamento); 
    
    // 3. Subtrai 3 horas da data do lembrete (Ex: 12:30 -> 09:30)
    dataLembrete.setHours(dataLembrete.getHours() - 3);

    // --- FIM DA CORREÇÃO ---


    // 4. Verifica se o horário de 12:30 já existe
    const agendamentoExistente = await Agendamento.findOne({
      dataHora: dataAgendamento, // Procura pela data original do agendamento
      status: 'confirmado',
    });

    if (agendamentoExistente) {
      return NextResponse.json(
        { message: '❌ Este horário já está agendado. Escolha outro horário.' },
        { status: 409 }
      );
    }

    // 5. Calcula a data de retorno (25 dias depois)
    const dataRetorno = new Date(dataAgendamento);
    dataRetorno.setDate(dataRetorno.getDate() + 25);

    // 6. Salva o agendamento no banco (com a data original de 12:30)
    const novoAgendamento = await Agendamento.create({
      nome,
      whatsapp,
      dataHora: dataAgendamento, // Salva 12:30
      dataRetorno,
      status: 'confirmado',
    });

    // 7. Envia a notificação de confirmação
    await enviarWhatsApp('confirmacao', nome, whatsapp, dataAgendamento);

    return NextResponse.json(
      { message: 'Agendamento confirmado!', data: novoAgendamento },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    if (error.code === 11000) {
       return NextResponse.json(
         { message: '❌ Este horário já está agendado. Escolha outro horário.' },
         { status: 409 }
       );
    }
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}