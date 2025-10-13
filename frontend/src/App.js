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

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");

  function handleLogin() {
    // Simulando um login de gestor para testes
    setUser({ role: 'gestor' });
    setScreen("dashboard");
  }

  function handleLogout() {
    setUser(null);
    setScreen("login");
  }

  // Props para navegação, passadas para o componente de Layout (Kanban)
  const switchProps = {
    onSwitchDashboard: () => setScreen("dashboard"),
    onSwitchKanban: () => setScreen("kanban"),
    onSwitchProjetos: () => setScreen("projetos"),
    onSwitchConfiguracoes: () => setScreen("configuracoes"),
    onSwitchNotificacoes: () => setScreen("notificacoes"),
    onSwitchUsuarios: () => setScreen("usuarios"),
    onSwitchClientes: () => setScreen("clientes"),
    onSwitchPerfil: () => setScreen("perfil"),
    onLogout: handleLogout,
  };

  // Função que decide qual tela/componente renderizar na área de conteúdo
  const renderContent = () => {
    switch (screen) {
      case "dashboard":
        return <Dashboard userRole={user?.role} />;
      case "kanban":
        return <KanbanBoard />;
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
        // Ajuste final: Usando a prop 'onReturn' para voltar à lista de usuários
        return <Cadastro onReturn={() => setScreen("usuarios")} />;
      default:
        return null;
    }
  }

  // Função principal que controla a renderização geral
  function renderScreen() {
    // Se não há usuário logado, mostra apenas a tela de Login
    if (!user) {
      return <Login onLogin={handleLogin} />;
    }

    // Se há um usuário, mostra o Layout Principal (Kanban) com a tela correta dentro
    return (
      <Kanban {...switchProps}>
        {renderContent()}
      </Kanban>
    );
  }

  return <div>{renderScreen()}</div>;
}

export default App;