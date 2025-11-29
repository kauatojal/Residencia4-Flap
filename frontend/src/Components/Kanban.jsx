import React, { useState, useEffect } from "react";
import { LayoutGrid, Archive, Home, Users, Search, Moon, Sun, LogOut, Menu } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Kanban.css";
import userService from "../services/userService";

const THEME_KEY = "flap_theme";

function Kanban({ children, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [username, setUsername] = useState(null)
  const [userData, setUserData] = useState({ nome: "Carregando...", inicial: "" });
  const navigate = useNavigate();

  // Lógica do Tema Escuro (Dark Mode)
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleMenuClick = (callback) => {
    if (callback) callback();
    setMenuOpen(false);
  };

  async function loadCurrentUserName() {
    const user = await userService.getMe()
    setUsername(user.name)
  }

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Garante que o clique não suba para elementos pais

    if (onLogout && typeof onLogout === 'function') {
      onLogout();
    } else {
      console.error("Função onLogout não encontrada ou inválida. Forçando redirecionamento.");
      // Fallback de segurança: limpa o token e vai para login manualmente se a prop falhar
      localStorage.removeItem('token');
      window.location.href = "/";
    }
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // Efeito para aplicar a classe 'dark-mode' no HTML e salvar no LocalStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
         setUserData({ nome: "Visitante", inicial: "V" });
         return;
      }

      try {
        const data = await userService.getMe()

        // Lógica: Tenta Nome + Sobrenome. Se falhar, tenta email.
        const nome = data.nome || "";
        const sobrenome = data.sobrenome || "";

        let nomeExibicao = "";
        if (nome || sobrenome) {
            nomeExibicao = `${nome} ${sobrenome}`.trim();
        } else {
            nomeExibicao = data.email || "Usuário";
        }

        // Gera iniciais
        let iniciais = "";
        if (nome) iniciais += nome.charAt(0).toUpperCase();
        if (sobrenome) iniciais += sobrenome.charAt(0).toUpperCase();

        if (!iniciais && nomeExibicao) {
          iniciais = nomeExibicao.substring(0, 2).toUpperCase();
        }

        setUserData({
          nome: nomeExibicao,
          inicial: iniciais
        });
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        setUserData({ nome: "Erro ao carregar", inicial: "?" });
      }
    };

    fetchUser();
  }, [])

  return (
    <div className="kanban-wrapper">
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

      <aside className={`kanban-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
           <img src="/Logo_flap.png" alt="Flap" className="sidebar-logo" onError={(e) => e.target.style.display='none'} />
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`sidebar-btn ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <Home size={20} /> <span>Dashboard</span>
          </Link>

          <Link
            to="/kanban"
            className={`sidebar-btn ${isActive('/kanban') ? 'active' : ''}`}
          >
            <LayoutGrid size={20} /> <span>Kanban</span>
          </Link>

          <Link
            to="/usuarios"
            className={`sidebar-btn ${isActive('/usuarios') ? 'active' : ''}`}
          >
            <Users size={20} /> <span>Usuários</span>
          </Link>

          <Link
            to="/clientes"
            className={`sidebar-btn ${isActive('/clientes') ? 'active' : ''}`}
          >
            <Users size={20} /> <span>Clientes</span>
          </Link>

          <Link
            to="/arquivados"
            className={`sidebar-btn ${isActive('/projetos') ? 'active' : ''}`}
          >
            <Archive size={20} /> <span>Arquivados</span>
          </Link>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{userData.inicial}</div>
            <div className="user-info">
               <p className="user-name" title={userData.nome}>{userData.nome}</p>
            </div>
          </div>

          <div className="user-actions">
             {/* Botão Modo Noturno */}
             <button
                type="button"
                className="sidebar-action-btn"
                onClick={() => setDark(!dark)}
                title={dark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
             >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
             </button>

             {/* Botão Sair - Chama handleLogout */}
             <button
                type="button"
                className="sidebar-action-btn logout"
                onClick={handleLogout}
                title="Sair"
             >
                <LogOut size={18} />
             </button>
          </div>
        </div>
      </aside>

      <div className="kanban-content-wrapper">
        <header className="top-header">
           <div className="header-left">
             <button type="button" className="mobile-menu-btn" onClick={toggleMenu}>
               <Menu size={24} />
             </button>

             <div className="search-bar-container">
                <input type="text" placeholder="Pesquisar tarefas..." className="search-input" />
                <Search className="search-icon" size={18}/>
             </div>
           </div>
        </header>

        <main className="main-content">
           {children}
        </main>
      </div>
    </div>
  );
}

export default Kanban;
