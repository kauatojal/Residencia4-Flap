import React, { useContext, useEffect, useState } from "react";
import './Dashboard.css';
import '../styles/DarkMode.css';
import { AuthContext } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import { quadroService } from "../services/quadroService";
import { atividadeService } from "../services/atividadeService";
import BirthdayModal from "./BirthdayModal";
import TaskPriorityCard from "./TaskPriorityCard";
import UpcomingTasksCard from "./UpcomingTasksCard";
import StatsCard from "./StatsCard";
import {
  HiOutlineChartSquareBar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineViewGrid,
  HiOutlineBell
} from 'react-icons/hi';

const GestorDashboard = () => {
  const [metricas, setMetricas] = useState({
    total: 0,
    concluidas: 0,
    pendentes: 0,
    atrasadas: 0
  });
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [quadrosAtivos, setQuadrosAtivos] = useState([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);
  const [loadingQuadros, setLoadingQuadros] = useState(true);
  const [loadingAtividades, setLoadingAtividades] = useState(true);

  useEffect(() => {
    carregarMetricas();
    carregarQuadrosAtivos();
    carregarAtividades();
  }, []);

  const carregarMetricas = async (inicio, fim) => {
    const data = await dashboardService.getMetricasPorPeriodo(
      inicio || new Date(new Date().setMonth(new Date().getMonth() - 1)),
      fim || new Date()
    );
    setMetricas(data);
  };

  const carregarQuadrosAtivos = async () => {
    setLoadingQuadros(true);
    try {
      const quadros = await quadroService.getQuadrosAtivos();
      setQuadrosAtivos(quadros);
    } catch (error) {
      console.error('Erro ao carregar quadros:', error);
    } finally {
      setLoadingQuadros(false);
    }
  };

  const carregarAtividades = async () => {
    setLoadingAtividades(true);
    try {
      const atividades = await atividadeService.getAtividadesRecentes();
      setAtividadesRecentes(atividades);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoadingAtividades(false);
    }
  };

  const handleFiltrarPeriodo = () => {
    if (dataInicio && dataFim) {
      carregarMetricas(dataInicio, dataFim);
    }
  };

  const stats = [
    { id: 1, title: 'Total de Tarefas', value: metricas.total, icon: <HiOutlineChartSquareBar />, colorClass: 'stat-card-total' },
    { id: 2, title: 'Tarefas Concluídas', value: metricas.concluidas, icon: <HiOutlineCheckCircle />, colorClass: 'stat-card-concluidas' },
    { id: 3, title: 'Tarefas Pendentes', value: metricas.pendentes, icon: <HiOutlineClock />, colorClass: 'stat-card-pendentes' },
    { id: 4, title: 'Tarefas Atrasadas', value: metricas.atrasadas, icon: <HiOutlineExclamationCircle />, colorClass: 'stat-card-atrasadas' },
  ];

  return (
    <div className="dashboard-main-content">
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Dashboard</h1>
          <p>Visão geral do sistema</p>
        </div>
        <div className="date-filter">
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="date-input"
          />
          <span>até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="date-input"
          />
          <button onClick={handleFiltrarPeriodo} className="btn-filtrar">
            Filtrar
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.id} className={`stat-card ${stat.colorClass}`}>
            <div className="icon-container">{stat.icon}</div>
            <div className="stat-info">
              <h2>{stat.value}</h2>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid-3col">
        <BirthdayModal />
        <StatsCard />
      </div>

      <div className="dashboard-grid dashboard-grid-2col">
        <TaskPriorityCard />
        <UpcomingTasksCard />
      </div>

      <div className="dashboard-grid">
        {/* QUADROS ATIVOS */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><HiOutlineViewGrid style={{marginRight: '8px'}} />Quadros Ativos</h3>
          </div>
          {loadingQuadros ? (
            <div className="loading-state">Carregando quadros...</div>
          ) : quadrosAtivos.length === 0 ? (
            <div className="empty-state">Nenhum quadro ativo encontrado</div>
          ) : (
            <div className="quadros-ativos-list">
              {quadrosAtivos.map(quadro => (
                <div key={quadro.id} className="quadro-item">
                  <div className="quadro-info">
                    <div className="quadro-header-item">
                      <div className="quadro-color" style={{ backgroundColor: quadro.cor }}></div>
                      <h4>{quadro.nome}</h4>
                    </div>
                    <p>{quadro.tarefas} tarefas</p>
                  </div>
                  <div className="quadro-progress">
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${quadro.progresso}%`, backgroundColor: quadro.cor }}></div>
                    </div>
                    <span className="progress-text">{quadro.progresso}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ATIVIDADES RECENTES */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><HiOutlineBell style={{marginRight: '8px'}} />Atividades Recentes</h3>
          </div>
          {loadingAtividades ? (
            <div className="loading-state">Carregando atividades...</div>
          ) : atividadesRecentes.length === 0 ? (
            <div className="empty-state">Nenhuma atividade recente</div>
          ) : (
            <div className="atividades-list">
              {atividadesRecentes.map(atividade => (
                <div key={atividade.id} className="atividade-item">
                  <div className={`atividade-icon ${atividade.tipo}`}>
                    {atividade.icone || '•'}
                  </div>
                  <div className="atividade-content">
                    <p>
                      <strong>{atividade.usuario}</strong> {atividade.acao}{' '}
                      <span className="atividade-item-name">{atividade.item}</span>
                    </p>
                    <span className="atividade-tempo">{atividade.tempo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ComumDashboard = () => {
  const [metricas, setMetricas] = useState({
    total: 0,
    concluidas: 0,
    pendentes: 0,
    atrasadas: 0
  });
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    carregarMetricas();
  }, []);

  const carregarMetricas = async (inicio, fim) => {
    const data = await dashboardService.getMetricasPorPeriodo(
      inicio || new Date(new Date().setMonth(new Date().getMonth() - 1)),
      fim || new Date()
    );
    setMetricas(data);
  };

  const handleFiltrarPeriodo = () => {
    if (dataInicio && dataFim) {
      carregarMetricas(dataInicio, dataFim);
    }
  };

  const stats = [
    { id: 1, title: 'Minhas Tarefas', value: metricas.total, icon: <HiOutlineChartSquareBar />, colorClass: 'stat-card-total' },
    { id: 2, title: 'Concluídas', value: metricas.concluidas, icon: <HiOutlineCheckCircle />, colorClass: 'stat-card-concluidas' },
    { id: 3, title: 'Pendentes', value: metricas.pendentes, icon: <HiOutlineClock />, colorClass: 'stat-card-pendentes' },
    { id: 4, title: 'Atrasadas', value: metricas.atrasadas, icon: <HiOutlineExclamationCircle />, colorClass: 'stat-card-atrasadas' },
  ];

  return (
    <div className="dashboard-main-content">
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Dashboard</h1>
          <p>Visão geral do sistema</p>
        </div>
        <div className="date-filter">
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="date-input"
          />
          <span>até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="date-input"
          />
          <button onClick={handleFiltrarPeriodo} className="btn-filtrar">
            Filtrar
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.id} className={`stat-card ${stat.colorClass}`}>
            <div className="icon-container">{stat.icon}</div>
            <div className="stat-info">
              <h2>{stat.value}</h2>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid-2col">
        <BirthdayModal />
        <TaskPriorityCard />
      </div>

      <div className="dashboard-grid-1col">
        <UpcomingTasksCard />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return <p>Carregando...</p>;

  const isGestor = user.cargos?.some(c => 
    c.nome.toLowerCase() === "admin" || c.nome.toLowerCase() === "gestor"
  );

  return isGestor ? <GestorDashboard /> : <ComumDashboard />;
};

export default Dashboard;
