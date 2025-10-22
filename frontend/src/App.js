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
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setScreen("dashboard");
      } catch (e) {
        console.error("Erro ao parsear usuário do localStorage", e);
        localStorage.clear(); 
      }
    }
    setAppLoading(false);
  }, []);

  async function handleLogin(email, password) {
    if (!email || !password) {
      alert("Por favor, preencha email e senha.");
      throw new Error("Campos vazios");
    }
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setScreen("dashboard");
    } catch (err) {
      console.error("Erro no login:", err);
      alert("Falha no login. Verifique seu email e senha.");
      throw err; 
    }
  }

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
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

  if (user?.role === 'ROLE_GESTOR') {
    switchProps.onSwitchUsuarios = () => setScreen("usuarios");
  }

  const renderContent = () => {
    switch (screen) {
      case "dashboard": return <Dashboard userRole={user?.role} />;
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
        if (user?.role !== 'ROLE_GESTOR') {
          setScreen("dashboard"); 
          return <Dashboard userRole={user?.role} />; 
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