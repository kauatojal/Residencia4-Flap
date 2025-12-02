import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import useAuth from "./context/useAuth";
import DropboxCallback from "./Components/DropboxCallback";

// Componentes
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Kanban from "./Components/Kanban";
import KanbanHome from "./Components/KanbanHome";
import Configuracoes from "./Components/Configuracoes";
import Arquivados from "./Components/Arquivados";
import Notificacoes from "./Components/Notificacoes";
import ListaFuncionarios from "./Components/ListaFuncionarios";
import Clientes from "./Components/Clientes";
import CadastroCliente from "./Components/CadastroCliente";
import EditarPerfil from "./Components/EditarPerfil";
import Cadastro from "./Components/Cadastro";

// Rota protegida
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

// App principal com rotas internas
function MainApp() {
  const { user, logout } = useAuth();

  return (
    <Kanban
      onSwitchDashboard={() => (window.location.href = "/dashboard")}
      onSwitchKanban={() => (window.location.href = "/kanban")}
      onSwitchProjetos={() => (window.location.href = "/arquivados")} 
      onSwitchConfiguracoes={() => (window.location.href = "/configuracoes")}
      onSwitchNotificacoes={() => (window.location.href = "/notificacoes")}
      onSwitchUsuarios={() => (window.location.href = "/usuarios")}
      onSwitchClientes={() => (window.location.href = "/clientes")}
      onSwitchPerfil={() => (window.location.href = "/perfil")}
      onLogout={logout}
    >
      <Routes>
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard userRole={user?.role} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/kanban" 
          element={
            <ProtectedRoute>
              <KanbanHome />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/arquivados" 
          element={
            <ProtectedRoute>
              <Arquivados />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/projetos" element={<Navigate to="/arquivados" replace />} />

        <Route path="/dropbox-callback" element={<DropboxCallback />} />
        
        <Route 
          path="/configuracoes" 
          element={
            <ProtectedRoute>
              <Configuracoes />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/notificacoes" 
          element={
            <ProtectedRoute>
              <Notificacoes />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute>
              <ListaFuncionarios />
            </ProtectedRoute>
          } 
        />
        
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
        
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <EditarPerfil />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cadastro-func" 
          element={
            <ProtectedRoute>
              <Cadastro />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Kanban>
  );
}

// Componente App principal - APENAS UMA DECLARAÇÃO
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
