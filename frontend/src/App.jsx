import React, { useState } from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import useAuth from "./context/useAuth";

// Componentes
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Kanban from "./Components/Kanban";
import KanbanBoard from "./Components/KanbanBoard";
import KanbanHome from "./Components/KanbanHome";
import Configuracoes from "./Components/Configuracoes";
import Projetos from "./Components/Projetos";
import Notificacoes from "./Components/Notificacoes";
import ListaFuncionarios from "./Components/ListaFuncionarios";
import Clientes from "./Components/Clientes"; // ✅ ALTERADO: importa a página de listagem
import CadastroCliente from "./Components/CadastroCliente";
import EditarPerfil from "./Components/EditarPerfil";
import Cadastro from "./Components/Cadastro";

// 🔒 Rota protegida
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

// 🌟 App principal
function MainApp() {
  const { user, logout } = useAuth();
  const [kanbanSelecionado, setKanbanSelecionado] = useState(null);
  const navigate = useNavigate();

  // 🔹 Quando clica em um quadro, muda de rota automaticamente
  const handleSelectKanban = (kanban) => {
    setKanbanSelecionado(kanban);
    navigate(`/kanban/${kanban.id}`);
  };

  return (
    <Kanban onLogout={logout}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard userRole={user?.role} />} />
        <Route
          path="/kanban"
          element={<KanbanHome onSelectKanban={handleSelectKanban} />}
        />
        <Route
          path="/kanban/:id"
          element={
            <div className="kanban-board-container">
              <div className="kanban-board-header-top">
                <Link className="btn-voltar-home" to="/kanban">
                  ← Voltar
                </Link>
                <h2 className="quadro-nome">{kanbanSelecionado?.nome}</h2>
              </div>
              <KanbanBoard />
            </div>
          }
        />
        <Route path="/projetos" element={<Projetos />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route
          path="/usuarios"
          element={
            <ListaFuncionarios onAddFuncionario={() => (window.location.href = "/cadastro-func")} />
          }
        />
        <Route path="/clientes" element={<Clientes />} /> {/* ✅ ALTERADO */}
        <Route path="/perfil" element={<EditarPerfil />} />
        <Route path="/cadastro-func" element={<Cadastro />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Kanban>
  );
}

// 🚀 Export final
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/*"
          element={
            // <ProtectedRoute>
              <MainApp />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
