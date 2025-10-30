import React, { useState } from "react";
import "./Kanban.css";

function Kanban({
  onSwitchDashboard,
  onSwitchProjetos,
  onSwitchConfiguracoes,
  onSwitchNotificacoes,
  onLogout,
  onSwitchUsuarios,
  onSwitchClientes,
  onSwitchKanban,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClick = (callback) => {
    callback();
    setMenuOpen(false);
  };

  return (
    <div className="kanban-wrapper">
      <button className="hamburger-btn" onClick={toggleMenu} aria-label="Menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {menuOpen && <div className="sidebar-overlay" onClick={toggleMenu}></div>}

      <aside className={`kanban-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <img src="/Logo_flap.png" alt="Flap" className="kanban-logo" />

        <nav className="sidebar-main-menu">
          <button onClick={() => handleMenuClick(onSwitchDashboard)} className="sidebar-btn">Dashboard</button>
          <button onClick={() => handleMenuClick(onSwitchKanban)} className="sidebar-btn">Kanban</button>
          <button onClick={() => handleMenuClick(onSwitchUsuarios)} className="sidebar-btn">Usuários</button>
          <button onClick={() => handleMenuClick(onSwitchClientes)} className="sidebar-btn">Clientes</button>
          <button onClick={() => handleMenuClick(onSwitchConfiguracoes)} className="sidebar-btn">Arquivados</button>
          <button onClick={() => handleMenuClick(onSwitchNotificacoes)} className="sidebar-btn">
            Notificações
            <span className="kanban-notification-dot">1</span>
          </button>
          <button onClick={() => handleMenuClick(onSwitchConfiguracoes)} className="sidebar-btn">Configurações</button>
          <button onClick={() => handleMenuClick(onLogout)} className="sidebar-btn">Sair</button>
        </nav>

        <div className="kanban-user">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: "#ececec", borderRadius: "50%", padding: 10, fontSize: 20 }}>👤</span>
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
