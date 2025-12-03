import React, { useState } from "react";
import { Link, Routes, Route, Navigate, useNavigate, BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuthContext, useIsAuthenticated } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import DropboxCallback from "./Components/DropboxCallback";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Kanban from "./Components/Kanban";
import KanbanHome from "./Components/KanbanHome";
import KanbanBoard from "./Components/KanbanBoard";
import Configuracoes from "./Components/Configuracoes";
import Arquivados from "./Components/Arquivados";
import Notificacoes from "./Components/Notificacoes";
import ListaFuncionarios from "./Components/ListaFuncionarios";
import Clientes from "./Components/Clientes";
import CadastroCliente from "./Components/CadastroCliente";
import EditarPerfil from "./Components/EditarPerfil";
import Cadastro from "./Components/Cadastro";

function MainApp() {
  const { user, logoutUser } = useAuthContext();
  const [kanbanSelecionado, setKanbanSelecionado] = useState(null);
  const navigate = useNavigate();

  const handleSelectKanban = (kanban) => {
    setKanbanSelecionado(kanban);
    navigate(`/kanban/${kanban.id}`);
  };

  return (
    <Kanban onLogout={logoutUser}>
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
        <Route path="/arquivados" element={<Arquivados />} />
        <Route path="/projetos" element={<Navigate to="/arquivados" replace />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/usuarios" element={<ListaFuncionarios />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/novo" element={<CadastroCliente />} />
        <Route path="/perfil" element={<EditarPerfil />} />
        <Route path="/cadastro-func" element={<Cadastro />} />
        <Route path="/dropbox-callback" element={<DropboxCallback />} />
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
