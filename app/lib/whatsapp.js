import axios from 'axios';

// --- CONFIGURAÇÃO DA EVOLUTION API ---
// ATENÇÃO: Essas variáveis DEVEM ser configuradas no seu .env.local
// (E também na plataforma Render, nas "Environment Variables" do seu projeto Next.js)

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;     // Ex: https://sua-api.onrender.com
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;     // Sua chave de API secreta
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME; // O nome da sua instância
// ------------------------------------


/**
 * Função interna que envia a mensagem de fato.
 */
async function enviarMensagemReal(phone, message) {
  // 1. Validação de segurança
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE_NAME) {
    console.error('[WhatsApp API] Erro Crítico: Variáveis de ambiente da Evolution API não configuradas.');
    return false;
  }

  // 2. Limpa o número de telefone (remove '()', '-', ' ' etc.)
  let telefoneFormatado = phone.replace(/\D/g, '');

  // 3. Garante que o DDI (55 para Brasil) está presente
  // Se o número tiver 11 dígitos (DDD + 9xxxx-xxxx), adiciona o 55
  if (telefoneFormatado.length === 11) {
    telefoneFormatado = `55${telefoneFormatado}`;
  } 
  // Se tiver 10 dígitos (DDD + xxxx-xxxx, fixo ou sem o 9), adiciona o 55
  else if (telefoneFormatado.length === 10) {
    telefoneFormatado = `55${telefoneFormatado}`;
  }
  // Se já tiver 13 (55 + 11 dígitos), não faz nada.
  // Números com 12 (55 + 10 dígitos) também são aceitos.
  
  // 4. Define o endpoint da API na Render
  const endpoint = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`;

  // 5. Define o payload (corpo da mensagem) que a Evolution espera
  // ---- INÍCIO DA CORREÇÃO (Payload) ----
  // O endpoint /sendText/ espera a propriedade "text" diretamente na raiz.
  const payload = {
    "number": telefoneFormatado,
    "options": {
      "delay": 1200, // Um pequeno atraso para humanizar
      "presence": "composing"
    },
    "text": message // <-- CORRIGIDO! Não está mais dentro de "textMessage"
  };
  // ---- FIM DA CORREÇÃO ----


  // 6. Define os headers (cabeçalhos) com sua chave de API
  const headers = {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY
  };

  // 7. Envia a requisição
  try {
    const response = await axios.post(endpoint, payload, { headers });
    console.log(`[WhatsApp API] Mensagem enviada para ${telefoneFormatado}. ID: ${response.data?.key?.id}`);
    return true;

  } catch (error) {
    // ---- Log Detalhado (Mantido) ----
    let errorMsg = error.message;
    if (error.response && error.response.data) {
        // Transforma a resposta de erro em uma string formatada
        errorMsg = JSON.stringify(error.response.data, null, 2); 
    }
    console.error(`[WhatsApp API] Erro detalhado ao enviar para ${telefoneFormatado}:`, errorMsg);
    // ---- FIM DA CORREÇÃO ----
    return false;
  }
}


/**
 * Função principal que formata as mensagens e chama o envio real.
 * Esta é a função que suas rotas de API (agendar e cron) vão chamar.
 */
export async function enviarWhatsApp(tipo, nome, whatsapp, data) {
  
  // Formata a data para o padrão pt-BR
  const dataFormatada = data.toLocaleString('pt-BR', {
    timeZone: 'America/Bahia', // Use o fuso de Vitória da Conquista
    dateStyle: 'short',
    timeStyle: 'short'
  });
  
  const [dataStr, horaStr] = dataFormatada.split(' ');
  const nomeFormatado = nome.split(' ')[0]; // Pega só o primeiro nome

  let mensagem;

  // Define as mensagens
  if (tipo === 'confirmacao') {
    mensagem = `Olá ${nomeFormatado}! 👋 Seu agendamento está *confirmado* para ${dataStr} às ${horaStr}. 💅\n\nQualquer imprevisto, peço que avise com antecedência.`;
    console.log(`[Envio WhatsApp] Confirmando agendamento para ${nome} (${whatsapp}) em ${dataFormatada}.`);
  
  } else if (tipo === 'lembrete_atendimento') {
    mensagem = `Olá ${nomeFormatado}! Passando para lembrar do seu horário *hoje* às ${horaStr}. Te espero! 😉`;
    console.log(`[Envio WhatsApp] Enviando lembrete de atendimento para ${nome} (${whatsapp}) hoje às ${horaStr}.`);
  
  } else if (tipo === 'lembrete_retorno') {
    mensagem = `Olá ${nomeFormatado}! Já faz 25 dias do seu último procedimento. Que tal agendar seu retorno? ✨\n\nResponda "AGENDAR" e te mostro os horários!`;
    console.log(`[Envio WhatsApp] Enviando lembrete de retorno para ${nome} (${whatsapp}) para hoje (${dataStr}).`);
  
  } else {
    console.warn(`[WhatsApp API] Tipo de mensagem desconhecido: ${tipo}`);
    return; // Tipo desconhecido
  }

  // Envia a mensagem real
  await enviarMensagemReal(whatsapp, mensagem);
}