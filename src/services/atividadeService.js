import api from '../config/api';

export const atividadeService = {
  getAtividadesRecentes: async () => {
    try {
      const [
        tarefasResponse,
        quadrosResponse,
        comentariosResponse,
        clientesResponse,
        usuariosResponse
      ] = await Promise.all([
        api.get('/tarefa/all').catch(() => ({ data: [] })),
        api.get('/quadro/all').catch(() => ({ data: [] })),
        api.get('/comentario/all').catch(() => ({ data: [] })),
        api.get('/cliente/all').catch(() => ({ data: [] })),
        api.get('/user').catch(() => ({ data: [] }))
      ]);

      const tarefas = tarefasResponse.data || [];
      const quadros = quadrosResponse.data || [];
      const comentarios = comentariosResponse.data || [];
      const clientes = clientesResponse.data || [];
      const usuarios = usuariosResponse.data || [];

      const usuariosMap = new Map();
      usuarios.forEach(user => {
        usuariosMap.set(user.id, user.name || user.email || 'Usuário');
      });

      const atividadesTarefas = formatarAtividadesTarefas(tarefas, usuariosMap);
      const atividadesQuadros = formatarAtividadesQuadros(quadros, usuariosMap);
      const atividadesComentarios = formatarAtividadesComentarios(comentarios, usuariosMap);
      const atividadesClientes = formatarAtividadesClientes(clientes);

      const todasAtividades = [
        ...atividadesTarefas,
        ...atividadesQuadros,
        ...atividadesComentarios,
        ...atividadesClientes
      ];

      return todasAtividades
        .sort((a, b) => new Date(b.dataRaw) - new Date(a.dataRaw))
        .slice(0, 10);

    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return [];
    }
  }
};

const formatarAtividadesTarefas = (tarefas, usuariosMap) => {
  return tarefas
    .sort((a, b) => {
      const dataA = new Date(a.dataAtualizacao || a.dataCriacao);
      const dataB = new Date(b.dataAtualizacao || b.dataCriacao);
      return dataB - dataA;
    })
    .slice(0, 20)
    .map(tarefa => {
      let acao = 'atualizou a tarefa';
      let tipo = 'move';
      let icone = '→';

      if (tarefa.concluida && tarefa.dataConclusao) {
        const diferencaConclusao = Date.now() - new Date(tarefa.dataConclusao).getTime();
        if (diferencaConclusao < 86400000) {
          acao = 'completou a tarefa';
          tipo = 'success';
          icone = '✓';
        }
      }
      
      if (tarefa.arquivada) {
        acao = 'arquivou a tarefa';
        tipo = 'archive';
        icone = '📁';
      }
      
      if (isRecemCriada(tarefa.dataCriacao)) {
        acao = 'criou a tarefa';
        tipo = 'info';
        icone = '+';
      }

      const usuarioId = tarefa.responsaveisIds && tarefa.responsaveisIds.length > 0
        ? tarefa.responsaveisIds[0].usuarioId
        : null;
      
      const nomeUsuario = usuarioId && usuariosMap.has(usuarioId)
        ? usuariosMap.get(usuarioId)
        : 'Usuário';

      return {
        id: `tarefa-${tarefa.id}`,
        usuario: nomeUsuario,
        acao: acao,
        item: tarefa.titulo || 'Tarefa sem título',
        tempo: calcularTempo(tarefa.dataAtualizacao || tarefa.dataCriacao),
        dataRaw: tarefa.dataAtualizacao || tarefa.dataCriacao,
        tipo: tipo,
        icone: icone
      };
    });
};

const formatarAtividadesQuadros = (quadros, usuariosMap) => {
  return quadros
    .sort((a, b) => {
      const dataA = new Date(a.atualizadoEm || a.criadoEm);
      const dataB = new Date(b.atualizadoEm || b.criadoEm);
      return dataB - dataA;
    })
    .slice(0, 15)
    .map(quadro => {
      let acao = 'atualizou o quadro';
      let tipo = 'move';
      let icone = '📊';

      if (quadro.arquivado) {
        acao = 'arquivou o quadro';
        tipo = 'archive';
        icone = '📁';
      } else if (isRecemCriada(quadro.criadoEm)) {
        acao = 'criou o quadro';
        tipo = 'info';
        icone = '+';
      }

      const nomeUsuario = quadro.usuarioId && usuariosMap.has(quadro.usuarioId.usuarioId)
        ? usuariosMap.get(quadro.usuarioId.usuarioId)
        : 'Gestor';

      return {
        id: `quadro-${quadro.id}`,
        usuario: nomeUsuario,
        acao: acao,
        item: quadro.titulo || 'Quadro sem título',
        tempo: calcularTempo(quadro.atualizadoEm || quadro.criadoEm),
        dataRaw: quadro.atualizadoEm || quadro.criadoEm,
        tipo: tipo,
        icone: icone
      };
    });
};

const formatarAtividadesComentarios = (comentarios, usuariosMap) => {
  return comentarios
    .slice(0, 15)
    .map(comentario => {
      const usuarioId = comentario.usuarioId?.usuarioId;
      const nomeUsuario = usuarioId && usuariosMap.has(usuarioId)
        ? usuariosMap.get(usuarioId)
        : 'Usuário';

      const textoComentario = comentario.texto 
        ? (comentario.texto.substring(0, 50) + (comentario.texto.length > 50 ? '...' : ''))
        : 'adicionou um comentário';

      return {
        id: `comentario-${comentario.id}`,
        usuario: nomeUsuario,
        acao: 'comentou em',
        item: textoComentario,
        tempo: calcularTempo(new Date()),
        dataRaw: new Date(),
        tipo: 'comment',
        icone: '💬'
      };
    });
};

const formatarAtividadesClientes = (clientes) => {
  return clientes
    .slice(0, 10)
    .map(cliente => {
      let acao = 'atualizou o cliente';
      let tipo = 'move';
      let icone = '👤';

      if (cliente.arquivado) {
        acao = 'arquivou o cliente';
        tipo = 'archive';
        icone = '📁';
      } else {
        acao = 'cadastrou o cliente';
        tipo = 'info';
        icone = '+';
      }

      return {
        id: `cliente-${cliente.id}`,
        usuario: 'Gestor',
        acao: acao,
        item: cliente.nome || cliente.empresa || 'Cliente',
        tempo: calcularTempo(new Date()),
        dataRaw: new Date(),
        tipo: tipo,
        icone: icone
      };
    });
};

const isRecemCriada = (dataCriacao) => {
  if (!dataCriacao) return false;
  const agora = new Date();
  const criacao = new Date(dataCriacao);
  const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
  return diferencaHoras < 24;
};

const calcularTempo = (data) => {
  if (!data) return 'recentemente';
  
  const agora = new Date();
  const dataPassada = new Date(data);
  const diferenca = agora - dataPassada;

  const segundos = Math.floor(diferenca / 1000);
  const minutos = Math.floor(diferenca / (1000 * 60));
  const horas = Math.floor(diferenca / (1000 * 60 * 60));
  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

  if (segundos < 10) return 'agora mesmo';
  if (segundos < 60) return `${segundos}s atrás`;
  if (minutos < 60) return `${minutos} min atrás`;
  if (horas < 24) return `${horas}h atrás`;
  if (dias === 1) return 'ontem';
  if (dias < 7) return `${dias} dias atrás`;
  if (dias < 30) return `${Math.floor(dias / 7)} semanas atrás`;
  if (dias < 365) return `${Math.floor(dias / 30)} meses atrás`;
  return `${Math.floor(dias / 365)} anos atrás`;
};
