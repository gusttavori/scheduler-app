import connectMongoDB from '../../lib/mongodb';
import Subscription from '../../models/Subscription'; // Importa o novo modelo
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const subscription = await request.json();

    // Validação básica
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { message: 'Inscrição inválida.' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    await Subscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      subscription,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      { message: 'Inscrição salva com sucesso!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao salvar inscrição:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}