import React, { useContext, useEffect, useState } from "react";
import './Dashboard.css';
import '../styles/DarkMode.css';
import { AuthContext } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import BirthdayModal from "./BirthdayModal";
import TaskPriorityCard from "./TaskPriorityCard";
import UpcomingTasksCard from "./UpcomingTasksCard";
import StatsCard from "./StatsCard";
import './Dashboard.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  HiOutlineChartSquareBar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle
} from 'react-icons/hi';

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

const GestorDashboard = () => {
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
    { id: 1, title: 'Total de Tarefas', value: metricas.total, icon: <HiOutlineChartSquareBar />, colorClass: 'stat-card-total' },
    { id: 2, title: 'Tarefas Concluídas', value: metricas.concluidas, icon: <HiOutlineCheckCircle />, colorClass: 'stat-card-concluidas' },
    { id: 3, title: 'Tarefas Pendentes', value: metricas.pendentes, icon: <HiOutlineClock />, colorClass: 'stat-card-pendentes' },
    { id: 4, title: 'Tarefas Atrasadas', value: metricas.atrasadas, icon: <HiOutlineExclamationCircle />, colorClass: 'stat-card-atrasadas' },
  ];

  const progressoSetor = [
    { name: 'Jan', value: 23400 }, { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 30000 }, { name: 'Apr', value: 22000 },
    { name: 'May', value: 10000 }, { name: 'Jun', value: 23400 },
  ];

  const distribuicaoTarefas = [
    { name: 'Design', value: 400 },
    { name: 'Marketing', value: 300 },
    { name: 'Criação', value: 200 },
  ];

  return (
    <div className="dashboard-main-content">
      <div className="dashboard-header">
        <h1>Dashboard do Gestor</h1>
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

      {/* Linha 1: Aniversariantes e Estatísticas */}
      <div className="dashboard-grid dashboard-grid-3col">
        <BirthdayModal />
        <StatsCard />
      </div>

      {/* Linha 2: Prioridades e Próximas Tarefas */}
      <div className="dashboard-grid dashboard-grid-2col">
        <TaskPriorityCard />
        <UpcomingTasksCard />
      </div>

      {/* Linha 3: Gráficos */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Progresso por Setor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressoSetor} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <h3>Distribuição de Tarefas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={distribuicaoTarefas} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                {distribuicaoTarefas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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
        <h1>Meu Dashboard</h1>
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

      {/* Linha 1: Aniversariantes e Prioridades */}
      <div className="dashboard-grid dashboard-grid-2col">
        <BirthdayModal />
        <TaskPriorityCard />
      </div>

      {/* Linha 2: Próximas Tarefas */}
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
