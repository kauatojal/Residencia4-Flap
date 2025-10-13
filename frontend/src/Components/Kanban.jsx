import React from "react";
import "./Kanban.css";

function Kanban({
  onSwitchDashboard,
  onSwitchKanban,
  onSwitchProjetos,
  onSwitchConfiguracoes,
  onSwitchNotificacoes,
  onLogout,
  onSwitchUsuarios,
  onSwitchClientes,
  children,
}) {
  return (
    <div className="kanban-wrapper">
      <aside className="kanban-sidebar">
        <img src="/Logo_flap.png" alt="Flap" className="kanban-logo" />

        <nav className="sidebar-main-menu">
          <button onClick={onSwitchDashboard} className="sidebar-btn">
            Dashboard
          </button>
          <button onClick={onSwitchKanban} className="sidebar-btn">
            Kanban
          </button>
          <button onClick={onSwitchProjetos} className="sidebar-btn">
            Projetos
          </button>
          <button onClick={onSwitchUsuarios} className="sidebar-btn">
            Usuários
          </button>
          <button onClick={onSwitchClientes} className="sidebar-btn">
            Clientes
          </button>
          <button onClick={onSwitchConfiguracoes} className="sidebar-btn">
            Arquivados
          </button>
          <button onClick={onSwitchNotificacoes} className="sidebar-btn">
            Notificações
            <span className="kanban-notification-dot">1</span>
          </button>
          <button onClick={onSwitchConfiguracoes} className="sidebar-btn">
            Configurações
          </button>
          <button onClick={onLogout} className="sidebar-btn">
            Sair
          </button>
        </nav>

        <div className="kanban-user">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                background: "#ececec",
                borderRadius: "50%",
                padding: 10,
                fontSize: 20,
              }}
            >
              👤
            </span>
            <div>
              <span style={{ fontWeight: 600 }}>Usuario1</span>
              <br />
              <small style={{ color: "#888" }}>Design</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="kanban-main">{children}</main>
    </div>
  );
}

export default Kanban;
