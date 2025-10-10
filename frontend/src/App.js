import React, { useState } from "react";
import Kanban from "./Components/Kanban";
import Login from "./Components/Login";
import Cadastro from "./Components/Cadastro";
import RecuperarSenha from "./Components/RecuperarSenha";
import Configuracoes from "./Components/Configuracoes";
import Projetos from "./Components/Projetos";
import Notificacoes from "./Components/Notificacoes";
import ListaFuncionarios from "./Components/ListaFuncionarios";
import CadastroCliente from "./Components/CadastroCliente";
import EditarPerfil from "./Components/EditarPerfil";

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");

  function handleLogin() {
    setUser("usuario");
    setScreen("kanban");
  }

  function handleLogout() {
    setUser(null);
    setScreen("login");
  }

  function renderScreen() {
    if (!user) {
      if (screen === "login")
        return (
          <Login
            onLogin={handleLogin}
            onSwitchCadastro={() => setScreen("cadastro")}
            onSwitchRecuperar={() => setScreen("recuperarSenha")}
          />
        );
      if (screen === "cadastro")
        return <Cadastro onSwitchLogin={() => setScreen("login")} />;
      if (screen === "recuperarSenha")
        return <RecuperarSenha onSwitchLogin={() => setScreen("login")} />;
    }

    switch (screen) {
      case "kanban":
        return (
          <Kanban
            onSwitchKanban={() => setScreen("kanban")}
            onSwitchProjetos={() => setScreen("projetos")}
            onSwitchConfiguracoes={() => setScreen("configuracoes")}
            onSwitchNotificacoes={() => setScreen("notificacoes")}
            onSwitchUsuarios={() => setScreen("usuarios")}
            onSwitchClientes={() => setScreen("clientes")}
            onSwitchPerfil={() => setScreen("perfil")}
            onLogout={handleLogout}
          />
        );
      case "configuracoes":
        return <Configuracoes />;
      case "projetos":
        return <Projetos />;
      case "notificacoes":
        return <Notificacoes />;
      case "usuarios":
        return <ListaFuncionarios />;
      case "clientes":
        return <CadastroCliente />;
      case "perfil":
        return <EditarPerfil />;
      default:
        return <Kanban />;
    }
  }

  return <div>{renderScreen()}</div>;
}

export default App;