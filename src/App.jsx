import React, { useState } from "react";
import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext, useIsAuthenticated } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Components
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Kanban from "./Components/Kanban";
import KanbanHome from "./Components/KanbanHome";
import QuadroTarefas from "./Components/QuadroTarefas"; // ✅ NOVO COMPONENTE
import Arquivados from "./Components/Arquivados";
import Notificacoes from "./Components/Notificacoes";
import ListaFuncionarios from "./Components/ListaFuncionarios";
import GestaoEquipe from "./Components/GestaoEquipe";
import Clientes from "./Components/Clientes";
import CadastroCliente from "./Components/CadastroCliente";
import Cadastro from "./Components/Cadastro";
import DropboxCallback from "./Components/DropboxCallback"; // ✅ Dropbox

function MainApp() {
  const { user, logoutUser } = useAuthContext();

  return (
    <Kanban
      onSwitchDashboard={() => (window.location.href = "/dashboard")}
      onSwitchKanban={() => (window.location.href = "/kanban")}
      onSwitchProjetos={() => (window.location.href = "/arquivados")}
      onSwitchNotificacoes={() => (window.location.href = "/notificacoes")}
      onSwitchUsuarios={() => (window.location.href = "/usuarios")}
      onSwitchClientes={() => (window.location.href = "/clientes")}
      onLogout={logoutUser}
    >
      <Routes>
        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard userRole={user?.role} />}
        />

        {/* ✅ KANBAN - TELA DE QUADROS */}
        <Route
          path="/kanban"
          element={<KanbanHome />}
        />

        {/* ✅ KANBAN - TELA DE TAREFAS DO QUADRO */}
        <Route
          path="/kanban/:id"
          element={<QuadroTarefas />}
        />

        {/* ARQUIVADOS */}
        <Route
          path="/arquivados"
          element={<Arquivados />}
        />

        {/* Redirect antigo */}
        <Route path="/projetos" element={<Navigate to="/arquivados" replace />} />

        {/* ✅ DROPBOX CALLBACK */}
        <Route path="/dropbox-callback" element={<DropboxCallback />} />

        {/* NOTIFICAÇÕES */}
        <Route
          path="/notificacoes"
          element={<Notificacoes />}
        />

        {/* GESTÃO DE EQUIPE */}
        <Route
          path="/usuarios"
          element={<GestaoEquipe />}
        />

        {/* Lista de funcionários (rota alternativa) */}
        <Route
          path="/usuarios/lista"
          element={<ListaFuncionarios />}
        />

        {/* CLIENTES */}
        <Route
          path="/clientes"
          element={<Clientes />}
        />

        <Route
          path="/clientes/novo"
          element={<CadastroCliente />}
        />

        {/* CADASTRO DE FUNCIONÁRIOS */}
        <Route
          path="/cadastro-func"
          element={<Cadastro />}
        />

        {/* Fallback - redireciona para dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Kanban>
  );
}

function AppRoutes() {
  const isAuthenticated = useIsAuthenticated()

  return (
    <BrowserRouter>
      {!isAuthenticated && (
        <div>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}

      {isAuthenticated && (
        <div>
          <MainApp />
        </div>
      )}
    </BrowserRouter>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        {/* <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/*" element={<MainApp />} />
        </Routes> */}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
