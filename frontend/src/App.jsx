import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import useAuth from "./context/useAuth";

// Componentes
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Kanban from "./Components/Kanban";
import KanbanHome from "./Components/KanbanHome";
import Configuracoes from "./Components/Configuracoes";
import Arquivados from "./Components/Arquivados"; // ✅ USANDO O COMPONENTE CERTO
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

// App principal
function MainApp() {
  const { user, logout } = useAuth();

  return (
    <Kanban
      onSwitchDashboard={() => (window.location.href = "/dashboard")}
      onSwitchKanban={() => (window.location.href = "/kanban")}
      // ✅ IMPORTANTE: O botão deve levar para /arquivados agora
      onSwitchProjetos={() => (window.location.href = "/arquivados")} 
      onSwitchConfiguracoes={() => (window.location.href = "/configuracoes")}
      onSwitchNotificacoes={() => (window.location.href = "/notificacoes")}
      onSwitchUsuarios={() => (window.location.href = "/usuarios")}
      onSwitchClientes={() => (window.location.href = "/clientes")}
      onSwitchPerfil={() => (window.location.href = "/perfil")}
      onLogout={logout}
    >
      <Routes>
        <Route path="/dashboard" element={<Dashboard userRole={user?.role} />} />
        
        <Route path="/kanban" element={<KanbanHome />} />
        
        {/* ✅ AQUI ESTÁ O TRUQUE: As rotas apontam para Arquivados.jsx */}
        <Route path="/arquivados" element={<Arquivados />} />
        <Route path="/projetos" element={<Navigate to="/arquivados" replace />} />

        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/usuarios" element={<ListaFuncionarios />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/novo" element={<CadastroCliente />} />
        <Route path="/perfil" element={<EditarPerfil />} />
        <Route path="/cadastro-func" element={<Cadastro />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Kanban>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </AuthProvider>
  );
}