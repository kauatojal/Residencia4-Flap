import React, { useState, useEffect } from "react";
import Kanban from "./Components/Kanban";
import Login from "./Components/Login";
import Cadastro from "./Components/Cadastro";
import Configuracoes from "./Components/Configuracoes";
import Projetos from "./Components/Projetos";
import Notificacoes from "./Components/Notificacoes";
import ListaFuncionarios from "./Components/ListaFuncionarios";
import CadastroCliente from "./Components/CadastroCliente";
import EditarPerfil from "./Components/EditarPerfil";
import Dashboard from "./Components/Dashboard";
import KanbanBoard from "./Components/KanbanBoard";
import KanbanHome from "./Components/KanbanHome";
import api from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");
  const [kanbanSelecionado, setKanbanSelecionado] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const verifyToken = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/user/me'); // Corrigido: Removido /v1
          setUser(response.data);
          setScreen("dashboard");
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error("Erro ao validar token ou buscar usuário:", error);
          localStorage.clear();
          delete api.defaults.headers.common['Authorization'];
          setScreen("login");
        }
      }
      setAppLoading(false);
    };
    verifyToken();
  }, []);

  async function handleLogin(email, password) {
    if (!email || !password) {
        alert("Por favor, preencha email e senha.");
        throw new Error("Campos vazios");
    }

    try {
        const loginResponse = await api.post('/auth/login', { email, password });
        const { token } = loginResponse.data;

        if (!token) {
             throw new Error("Token não recebido na resposta do login.");
        }

        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
            const userResponse = await api.get('/user/me');
            const userData = userResponse.data;

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setScreen("dashboard");

        } catch (userError) {
             console.error("Erro ao buscar dados do usuário após login:", userError);
             alert("Login bem-sucedido, mas falha ao buscar dados do usuário.");
             localStorage.removeItem('authToken');
             delete api.defaults.headers.common['Authorization'];
             throw userError;
        }

    } catch (err) {
        console.error("Erro no login:", err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setScreen("login");

        alert("Falha no login. Verifique seu email e senha.");
        throw err;
    }
  }


  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setScreen("login");
  }

  function handleSelectKanban(kanban) {
    setKanbanSelecionado(kanban);
    setScreen("kanban-board");
  }

  function handleVoltarKanbans() {
    setKanbanSelecionado(null);
    setScreen("kanban-home");
  }

  const switchProps = {
    onSwitchDashboard: () => setScreen("dashboard"),
    onSwitchKanban: () => { setKanbanSelecionado(null); setScreen("kanban-home"); },
    onSwitchProjetos: () => setScreen("projetos"),
    onSwitchConfiguracoes: () => setScreen("configuracoes"),
    onSwitchNotificacoes: () => setScreen("notificacoes"),
    onSwitchClientes: () => setScreen("clientes"),
    onSwitchPerfil: () => setScreen("perfil"),
    onLogout: handleLogout,
  };

  if (user?.cargo?.nome === 'GESTOR') {
    switchProps.onSwitchUsuarios = () => setScreen("usuarios");
  }

  const renderContent = () => {
    const userRole = user?.cargo?.nome;

    switch (screen) {
      case "dashboard": return <Dashboard userRole={userRole} />;
      case "kanban-home": return <KanbanHome onSelectKanban={handleSelectKanban} />;
      case "kanban-board":
          return (
            <div className="kanban-board-container">
                 <div className="kanban-board-header-top">
                   <button className="btn-voltar-home" onClick={handleVoltarKanbans}> ← Voltar </button>
                   <h2 className="quadro-nome">{kanbanSelecionado?.nome}</h2>
                 </div>
                 <KanbanBoard />
            </div>
           );
      case "configuracoes": return <Configuracoes />;
      case "projetos": return <Projetos />;
      case "notificacoes": return <Notificacoes />;
      case "usuarios":
          if (userRole !== 'GESTOR') {
            setScreen("dashboard");
            return <Dashboard userRole={userRole} />;
          }
          return <ListaFuncionarios onAddFuncionario={() => setScreen("cadastro-func")} />;
      case "clientes": return <CadastroCliente />;
      case "perfil": return <EditarPerfil />;
      case "cadastro-func":
          return <Cadastro onReturn={() => setScreen("usuarios")} />;
      default: return null;
    }
  }

  function renderScreen() {
    if (appLoading) return <div>Carregando...</div>;
    if (!user) return <Login onLogin={handleLogin} />;

    return (
      <Kanban {...switchProps}>
        {renderContent()}
      </Kanban>
    );
  }

  return <div>{renderScreen()}</div>;
}

export default App;