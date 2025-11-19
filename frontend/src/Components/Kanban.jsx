import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Kanban.css";

function Kanban({
  onSwitchDashboard,
  onSwitchProjetos,
  onLogout,
  onSwitchUsuarios,
  onSwitchClientes,
  onSwitchKanban,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const navigate = useNavigate();

  // Mock de notificações - substituir por dados reais da API
  const notificacoes = [
    { id: 1, texto: "Nova tarefa atribuída a você", tempo: "5 min", lida: false },
    { id: 2, texto: "Prazo do projeto se aproximando", tempo: "1 hora", lida: false },
    { id: 3, texto: "Comentário em sua tarefa", tempo: "2 horas", lida: true },
  ];

  const naoLidas = notificacoes.filter(n => !n.lida).length;

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
          <button onClick={() => handleMenuClick(onSwitchProjetos)} className="sidebar-btn">Arquivados</button>
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

      <main className="kanban-main">
        {/* BOTÃO FLUTUANTE DE NOTIFICAÇÕES */}
        <div className="notif-container-flutuante">
          <button
            className="btn-sino"
            onClick={() => setMostrarNotif(!mostrarNotif)}
            aria-label="Notificações"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {naoLidas > 0 && <span className="badge-notif">{naoLidas}</span>}
          </button>

          {mostrarNotif && (
            <>
              <div
                className="notif-overlay"
                onClick={() => setMostrarNotif(false)}
              />
              <div className="notif-dropdown">
                <div className="notif-header">
                  <h3>Notificações</h3>
                  <button className="btn-marcar-lidas">Marcar como lidas</button>
                </div>

                <div className="notif-lista">
                  {notificacoes.length === 0 ? (
                    <div className="notif-vazia">
                      <p>Nenhuma notificação</p>
                    </div>
                  ) : (
                    notificacoes.map(n => (
                      <div key={n.id} className={`notif-item ${!n.lida ? 'nao-lida' : ''}`}>
                        <div className="notif-conteudo">
                          <p className="notif-texto">{n.texto}</p>
                          <span className="notif-tempo">Há {n.tempo}</span>
                        </div>
                        {!n.lida && <div className="notif-indicador" />}
                      </div>
                    ))
                  )}
                </div>

                <div className="notif-footer">
                  <button
                    className="btn-ver-todas"
                    onClick={() => {
                      setMostrarNotif(false);
                      navigate("/notificacoes");
                    }}
                  >
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CONTEÚDO DA PÁGINA */}
        {children}
      </main>
    </div>
  );
}

export default Kanban;
