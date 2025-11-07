'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/Agendar.css'; // CSS externo

// --- LÓGICA DE HORÁRIOS ---
const HORARIOS_BASE = ['13:00', '16:00'];
const DATA_ZERO_QUINZENAL = new Date(Date.UTC(2025, 10, 3));

function getWeeksDiff(dataSelecionada) {
  const diffTime = Math.abs(dataSelecionada.getTime() - DATA_ZERO_QUINZENAL.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}
// --- FIM DA LÓGICA DE HORÁRIOS ---

export default function AgendarForm() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horariosDoDia, setHorariosDoDia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/agendamentos')
      .then((res) => res.json())
      .then((data) => {
        setHorariosOcupados(data.horariosOcupados || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Não foi possível carregar os horários.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setHora('');
    setHorariosDoDia([]);
    if (!data) return;

    try {
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataSelecionada = new Date(Date.UTC(ano, mes - 1, dia));
      const diaDaSemana = dataSelecionada.getUTCDay();

      if (diaDaSemana === 1) {
        const semanasDiferenca = getWeeksDiff(dataSelecionada);
        if (semanasDiferenca % 2 !== 0) setHorariosDoDia(HORARIOS_BASE);
      } else {
        setHorariosDoDia(HORARIOS_BASE);
      }
    } catch {
      setHorariosDoDia([]);
    }
  }, [data]);

  const handleWhatsAppChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    if (value.length > 15) value = value.substring(0, 15);
    setWhatsapp(value);
  };

  const isHorarioOcupado = (horaSlot) => {
    if (!data) return false;
    try {
      const [ano, mes, dia] = data.split('-').map(Number);
      const [h, m] = horaSlot.split(':').map(Number);
      const dataHoraSlotISO = new Date(ano, mes - 1, dia, h, m).toISOString();
      return horariosOcupados.includes(dataHoraSlotISO);
    } catch {
      return false;
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!nome || !whatsapp || !data || !hora) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (whatsapp.length < 14) {
      setError('Insira um número de WhatsApp válido.');
      return;
    }

    setLoading(true);
    try {
      const [ano, mes, dia] = data.split('-').map(Number);
      const [h, m] = hora.split(':').map(Number);
      const dataHoraISO = new Date(ano, mes - 1, dia, h, m).toISOString();

      const res = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, whatsapp, dataHora: dataHoraISO }),
      });

      if (res.ok) router.push('/sucesso');
      else {
        const errorData = await res.json();
        setError(errorData.message || 'Erro ao tentar agendar.');
      }
    } catch {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agendar-container">
      <h1 className="titulo">Agende seu horário</h1>
      <p className="subtitulo">Escolha o melhor momento para cuidar de você</p>

      <form onSubmit={handleSubmit} className="agendar-form">
        {error && <div className="erro">{error}</div>}

        <label>Nome completo</label>
        <input
          type="text"
          placeholder="Digite seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label>Telefone</label>
        <input
          type="tel"
          placeholder="(00) 00000-0000"
          value={whatsapp}
          onChange={handleWhatsAppChange}
          maxLength="15"
          required
        />

        <label>Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          min={getTodayString()}
          required
        />

        <label>Horário</label>
        <select
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          disabled={!data}
          required
        >
          <option value="">
            {!data
              ? 'Escolha uma data primeiro'
              : horariosDoDia.length > 0
              ? 'Selecione um horário'
              : 'Nenhum horário disponível'}
          </option>
          {horariosDoDia.map((horario) => {
            const ocupado = isHorarioOcupado(horario);
            return (
              <option key={horario} value={horario} disabled={ocupado}>
                {horario} {ocupado ? '(Ocupado)' : ''}
              </option>
            );
          })}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Confirmando...' : 'Confirmar agendamento'}
        </button>
      </form>
    </div>
  );
}
