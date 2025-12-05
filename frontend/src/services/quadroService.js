import api from '../config/api';

export const quadroService = {
  getQuadrosAtivos: async () => {
    try {
      const quadrosResponse = await api.get('/quadro/all');
      const quadros = quadrosResponse.data;
      
      const quadrosAtivos = quadros.filter(q => !q.arquivado).slice(0, 4);

      const quadrosComEstatisticas = await Promise.all(
        quadrosAtivos.map(async (quadro) => {
          try {
            const tarefasResponse = await api.get(`/tarefa/by-quadro/${quadro.id}`);
            const tarefas = tarefasResponse.data;
            
            const tarefasNaoArquivadas = tarefas.filter(t => !t.arquivada);
            const totalTarefas = tarefasNaoArquivadas.length;
            const tarefasConcluidas = tarefasNaoArquivadas.filter(t => t.concluida).length;
            
            const progresso = totalTarefas > 0 
              ? Math.round((tarefasConcluidas / totalTarefas) * 100) 
              : 0;

            return {
              id: quadro.id,
              nome: quadro.titulo,
              tarefas: totalTarefas,
              progresso: progresso,
              cor: quadro.cor || getRandomColor()
            };
          } catch (error) {
            console.error(`Erro ao buscar tarefas do quadro ${quadro.id}:`, error);
            return {
              id: quadro.id,
              nome: quadro.titulo,
              tarefas: 0,
              progresso: 0,
              cor: quadro.cor || getRandomColor()
            };
          }
        })
      );

      return quadrosComEstatisticas;
    } catch (error) {
      console.error('Erro ao buscar quadros ativos:', error);
      return [];
    }
  }
};

const getRandomColor = () => {
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
};
