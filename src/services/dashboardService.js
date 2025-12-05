import api from '../services/api';

export const dashboardService = {
  getAniversariantes: async () => {
    try {
      const response = await api.get('/user');
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

  enviarParabens: async (usuarioId, remetente) => {
    try {
      const mensagem = `${remetente.name} te desejou parabéns! 🎉🎂`;
      console.log('Enviando parabéns para usuário:', usuarioId, mensagem);
      return { success: true, mensagem };
    } catch (error) {
      console.error('Erro ao enviar parabéns:', error);
      throw error;
    }
  },

  getTarefasPorPrioridade: async () => {
    try {
      const response = await api.get('/tarefa/all');
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

  getTarefasProximasVencimento: async () => {
    try {
      const response = await api.get('/tarefa/all');
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

  getTotalClientes: async () => {
    try {
      const response = await api.get('/cliente/all');
      return response.data.length;
    } catch (error) {
      console.error('Erro ao buscar total de clientes:', error);
      return 0;
    }
  },

  getTotalFuncionarios: async () => {
    try {
      const response = await api.get('/user');
      return response.data.length;
    } catch (error) {
      console.error('Erro ao buscar total de funcionários:', error);
      return 0;
    }
  },

  getMetricasPorPeriodo: async (dataInicio, dataFim) => {
    try {
      const response = await api.get('/tarefa/all');
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
