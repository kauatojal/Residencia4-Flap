import React, { useState } from "react";
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

function App() {
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState("login");
  const [kanbanSelecionado, setKanbanSelecionado] = useState<any>(null);

  function handleLogin() {
    setUser({ role: 'gestor' });
    setScreen("dashboard");
  }

  function handleLogout() {
    setUser(null);
    setScreen("login");
  }

  function handleSelectKanban(kanban: any) {
    setKanbanSelecionado(kanban);
    setScreen("kanban-board");
  }

  function handleVoltarKanbans() {
    setKanbanSelecionado(null);
    setScreen("kanban-home");
  }

  const switchProps = {
    onSwitchDashboard: () => setScreen("dashboard"),
    onSwitchKanban: () => {
      setKanbanSelecionado(null);
      setScreen("kanban-home");
    },
    onSwitchProjetos: () => setScreen("projetos"),
    onSwitchConfiguracoes: () => setScreen("configuracoes"),
    onSwitchNotificacoes: () => setScreen("notificacoes"),
    onSwitchUsuarios: () => setScreen("usuarios"),
    onSwitchClientes: () => setScreen("clientes"),
    onSwitchPerfil: () => setScreen("perfil"),
    onLogout: handleLogout,
  };

  const renderContent = () => {
    switch (screen) {
      case "dashboard":
        return <Dashboard userRole={user?.role} />;

      case "kanban-home":
        return <KanbanHome onSelectKanban={handleSelectKanban} />;

      case "kanban-board":
        return (
          <div className="kanban-board-container">
            <div className="kanban-board-header-top">
              <button className="btn-voltar-home" onClick={handleVoltarKanbans}>
                ← Voltar
              </button>
              <h2 className="quadro-nome">{kanbanSelecionado?.nome}</h2>
            </div>
            <KanbanBoard />
          </div>
        );

      case "configuracoes":
        return <Configuracoes />;
      case "projetos":
        return <Projetos />;
      case "notificacoes":
        return <Notificacoes />;
      case "usuarios":
        return <ListaFuncionarios onAddFuncionario={() => setScreen("cadastro-func")} />;
      case "clientes":
        return <CadastroCliente />;
      case "perfil":
        return <EditarPerfil />;
      case "cadastro-func":
        return <Cadastro onReturn={() => setScreen("usuarios")} />;
      default:
        return null;
    }
  }

  function renderScreen() {
    if (!user) {
      return <Login onLogin={handleLogin} />;
    }

    return (
      <Kanban {...switchProps}>
        {renderContent()}
      </Kanban>
    );
  }

  return <div>{renderScreen()}</div>;
}

export default App;
