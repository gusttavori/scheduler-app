import mongoose, { Schema } from 'mongoose';

const agendamentoSchema = new Schema(
  {
    nome: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    dataHora: {
      type: Date,
      required: true,
      unique: true, // Garante que não haja dois agendamentos no mesmo slot
    },
    dataRetorno: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'confirmado', // "confirmado" ou "cancelado"
    },
  },
  {
    timestamps: true,
  }
);

// Evita recriar o modelo em ambiente de dev
const Agendamento = mongoose.models.Agendamento || mongoose.model('Agendamento', agendamentoSchema);

export default Agendamento;