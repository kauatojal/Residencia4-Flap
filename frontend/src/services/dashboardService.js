import axios from 'axios';

const API_URL = 'http://localhost:8090/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const dashboardService = {
  // Buscar aniversariantes do dia
  getAniversariantes: async () => {
    try {
      const response = await axios.get(`${API_URL}/user`, getAuthHeaders());
      const hoje = new Date();
      const mesHoje = hoje.getMonth();
      const diaHoje = hoje.getDate();
      
      return response.data.filter(user => {
        if (user.dataNascimento) {
          const dataNasc = new Date(user.dataNascimento);
          return dataNasc.getMonth() === mesHoje && dataNasc.getDate() === diaHoje;
        }
        return false;
      });
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error);
      return [];
    }
  },

  // Enviar notificação de parabéns
  enviarParabens: async (usuarioId, remetente) => {
    try {
      // Ajuste conforme sua API de notificações
      const mensagem = `${remetente.name} te desejou parabéns! 🎉🎂`;
      // Implementar endpoint de notificação quando disponível
      console.log('Enviando parabéns para usuário:', usuarioId, mensagem);
      return { success: true, mensagem };
    } catch (error) {
      console.error('Erro ao enviar parabéns:', error);
      throw error;
    }
  },

  // Buscar tarefas por prioridade
  getTarefasPorPrioridade: async () => {
    try {
      const response = await axios.get(`${API_URL}/tarefa/all`, getAuthHeaders());
      const tarefas = response.data;
      
      const prioridades = {
        CRITICA: 0,
        ALTA: 0,
        MEDIA: 0,
        BAIXA: 0
      };

      tarefas.forEach(tarefa => {
        if (tarefa.flag && tarefa.flag.nome) {
          const prioridade = tarefa.flag.nome.toUpperCase();
          if (prioridades.hasOwnProperty(prioridade)) {
            prioridades[prioridade]++;
          }
        }
      });

      return prioridades;
    } catch (error) {
      console.error('Erro ao buscar tarefas por prioridade:', error);
      return { CRITICA: 0, ALTA: 0, MEDIA: 0, BAIXA: 0 };
    }
  },

  // Buscar tarefas próximas do vencimento
  getTarefasProximasVencimento: async () => {
    try {
      const response = await axios.get(`${API_URL}/tarefa/all`, getAuthHeaders());
      const tarefas = response.data;
      const hoje = new Date();

      const tarefasPendentes = tarefas
        .filter(t => t.dataVencimento && !t.concluida)
        .map(t => ({
          ...t,
          dataVencimentoObj: new Date(t.dataVencimento)
        }))
        .sort((a, b) => a.dataVencimentoObj - b.dataVencimentoObj)
        .slice(0, 5);

      return tarefasPendentes;
    } catch (error) {
      console.error('Erro ao buscar tarefas próximas do vencimento:', error);
      return [];
    }
  },

  // Buscar total de clientes
  getTotalClientes: async () => {
    try {
      const response = await axios.get(`${API_URL}/cliente/all`, getAuthHeaders());
      return response.data.length;
    } catch (error) {
      console.error('Erro ao buscar total de clientes:', error);
      return 0;
    }
  },

  // Buscar total de funcionários
  getTotalFuncionarios: async () => {
    try {
      const response = await axios.get(`${API_URL}/user`, getAuthHeaders());
      return response.data.length;
    } catch (error) {
      console.error('Erro ao buscar total de funcionários:', error);
      return 0;
    }
  },

  // Buscar métricas de tarefas por período
  getMetricasPorPeriodo: async (dataInicio, dataFim) => {
    try {
      const response = await axios.get(`${API_URL}/tarefa/all`, getAuthHeaders());
      const tarefas = response.data;

      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);

      const tarefasFiltradas = tarefas.filter(t => {
        const dataTarefa = new Date(t.dataCriacao || t.dataVencimento);
        return dataTarefa >= inicio && dataTarefa <= fim;
      });

      return {
        total: tarefasFiltradas.length,
        concluidas: tarefasFiltradas.filter(t => t.concluida).length,
        pendentes: tarefasFiltradas.filter(t => !t.concluida && new Date(t.dataVencimento) >= new Date()).length,
        atrasadas: tarefasFiltradas.filter(t => !t.concluida && new Date(t.dataVencimento) < new Date()).length
      };
    } catch (error) {
      console.error('Erro ao buscar métricas por período:', error);
      return { total: 0, concluidas: 0, pendentes: 0, atrasadas: 0 };
    }
  }
};
