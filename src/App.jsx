import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import useAuth from "./context/useAuth";

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

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function MainApp() {
  const { user, logout } = useAuth();

  return (
    <Kanban
      onSwitchDashboard={() => (window.location.href = "/dashboard")}
      onSwitchKanban={() => (window.location.href = "/kanban")}
      onSwitchProjetos={() => (window.location.href = "/arquivados")}
      onSwitchNotificacoes={() => (window.location.href = "/notificacoes")}
      onSwitchUsuarios={() => (window.location.href = "/usuarios")}
      onSwitchClientes={() => (window.location.href = "/clientes")}
      onLogout={logout}
    >
      <Routes>
        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard userRole={user?.role} />
            </ProtectedRoute>
          }
        />

        {/* ✅ KANBAN - TELA DE QUADROS */}
        <Route
          path="/kanban"
          element={
            <ProtectedRoute>
              <KanbanHome />
            </ProtectedRoute>
          }
        />

        {/* ✅ KANBAN - TELA DE TAREFAS DO QUADRO */}
        <Route
          path="/kanban/:id"
          element={
            <ProtectedRoute>
              <QuadroTarefas />
            </ProtectedRoute>
          }
        />

        {/* ARQUIVADOS */}
        <Route
          path="/arquivados"
          element={
            <ProtectedRoute>
              <Arquivados />
            </ProtectedRoute>
          }
        />

        {/* Redirect antigo */}
        <Route path="/projetos" element={<Navigate to="/arquivados" replace />} />

        {/* ✅ DROPBOX CALLBACK */}
        <Route path="/dropbox-callback" element={<DropboxCallback />} />

        {/* NOTIFICAÇÕES */}
        <Route
          path="/notificacoes"
          element={
            <ProtectedRoute>
              <Notificacoes />
            </ProtectedRoute>
          }
        />

        {/* GESTÃO DE EQUIPE */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <GestaoEquipe />
            </ProtectedRoute>
          }
        />

        {/* Lista de funcionários (rota alternativa) */}
        <Route
          path="/usuarios/lista"
          element={
            <ProtectedRoute>
              <ListaFuncionarios />
            </ProtectedRoute>
          }
        />

        {/* CLIENTES */}
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clientes/novo"
          element={
            <ProtectedRoute>
              <CadastroCliente />
            </ProtectedRoute>
          }
        />

        {/* CADASTRO DE FUNCIONÁRIOS */}
        <Route
          path="/cadastro-func"
          element={
            <ProtectedRoute>
              <Cadastro />
            </ProtectedRoute>
          }
        />

        {/* Fallback - redireciona para dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Kanban>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
