import React, { useState, useEffect } from "react";
import { LayoutGrid, Archive, Home, UserCog, Building2, Search, Moon, Sun, LogOut, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import "./Kanban.css";
import '../styles/DarkMode.css';

function Kanban({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState({ nome: "Carregando...", inicial: "" });

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleMenuClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Realizando logout...");
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserData({ nome: "Visitante", inicial: "V" });
        return;
      }

      try {
        const response = await api.get('/user/me');
        
        if (response.data) {
          const data = response.data;
          const nome = data.name || data.nome || "";
          const email = data.email || "";
          
          let nomeExibicao = nome || email || "Usuário";
          
          let iniciais = "";
          const partesNome = nomeExibicao.split(' ');
          if (partesNome.length >= 2) {
            iniciais = partesNome[0].charAt(0).toUpperCase() + partesNome[1].charAt(0).toUpperCase();
          } else {
            iniciais = nomeExibicao.substring(0, 2).toUpperCase();
          }

          setUserData({
            nome: nomeExibicao,
            inicial: iniciais
          });
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        setUserData({ nome: "Erro ao carregar", inicial: "?" });
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="kanban-wrapper">
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

      <aside className={`kanban-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src="/Logo_flap.png" alt="Flap" className="sidebar-logo" onError={(e) => e.target.style.display='none'} />
        </div>

        <nav className="sidebar-nav">
          <button 
            type="button"
            onClick={() => handleMenuClick('/dashboard')} 
            className={`sidebar-btn ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <Home size={20} /> <span>Dashboard</span>
          </button>
          
          <button 
            type="button"
            onClick={() => handleMenuClick('/kanban')} 
            className={`sidebar-btn ${isActive('/kanban') ? 'active' : ''}`}
          >
            <LayoutGrid size={20} /> <span>Kanban</span>
          </button>
          
          <button 
            type="button"
            onClick={() => handleMenuClick('/usuarios')} 
            className={`sidebar-btn ${isActive('/usuarios') ? 'active' : ''}`}
          >
            <UserCog size={20} /> <span>Equipe</span>
          </button>
                    
          <button 
            type="button"
            onClick={() => handleMenuClick('/clientes')} 
            className={`sidebar-btn ${isActive('/clientes') ? 'active' : ''}`}
          >
            <Building2 size={20} /> <span>Clientes</span>
          </button>
          
          <button 
            type="button"
            onClick={() => handleMenuClick('/arquivados')} 
            className={`sidebar-btn ${isActive('/arquivados') ? 'active' : ''}`}
          >
            <Archive size={20} /> <span>Arquivados</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{userData.inicial}</div>
            <div className="user-info">
              <p className="user-name" title={userData.nome}>{userData.nome}</p>
            </div>
          </div>
          
          <div className="user-actions">
            <button 
              type="button"
              className="sidebar-action-btn" 
              onClick={toggleTheme}
              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

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
