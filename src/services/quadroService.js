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

export const quadroService = {
  // Buscar quadros ativos com estatísticas
  getQuadrosAtivos: async () => {
    try {
      // Buscar todos os quadros
      const quadrosResponse = await axios.get(`${API_URL}/quadro/all`, getAuthHeaders());
      const quadros = quadrosResponse.data;
      
      // Filtrar apenas quadros não arquivados e limitar a 4
      const quadrosAtivos = quadros.filter(q => !q.arquivado).slice(0, 4);

      // Para cada quadro, buscar suas tarefas e calcular progresso
      const quadrosComEstatisticas = await Promise.all(
        quadrosAtivos.map(async (quadro) => {
          try {
            const tarefasResponse = await axios.get(
              `${API_URL}/tarefa/by-quadro/${quadro.id}`, 
              getAuthHeaders()
            );
            const tarefas = tarefasResponse.data;
            
            // Filtrar tarefas não arquivadas
            const tarefasNaoArquivadas = tarefas.filter(t => !t.arquivada);
            const totalTarefas = tarefasNaoArquivadas.length;
            const tarefasConcluidas = tarefasNaoArquivadas.filter(t => t.concluida).length;
            
            // Calcular progresso
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

// Cores padrão se o quadro não tiver cor definida
const getRandomColor = () => {
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
};
