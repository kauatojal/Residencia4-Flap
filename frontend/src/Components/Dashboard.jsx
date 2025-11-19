import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
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

const gestorData = {
  stats: [
    { id: 1, title: 'Total de Tarefas', value: 178, icon: <HiOutlineChartSquareBar />, colorClass: 'stat-card-total' },
    { id: 2, title: 'Tarefas Concluídas', value: 78, icon: <HiOutlineCheckCircle />, colorClass: 'stat-card-concluidas' },
    { id: 3, title: 'Tarefas Pendentes', value: 32, icon: <HiOutlineClock />, colorClass: 'stat-card-pendentes' },
    { id: 4, title: 'Tarefas Atrasadas', value: 14, icon: <HiOutlineExclamationCircle />, colorClass: 'stat-card-atrasadas' },
  ],
  progressoSetor: [
    { name: 'Jan', value: 23400 }, { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 30000 }, { name: 'Apr', value: 22000 },
    { name: 'May', value: 10000 }, { name: 'Jun', value: 23400 },
    { name: 'Jul', value: 5000 },
  ],
  distribuicaoTarefas: [
    { name: 'Design', value: 400 },
    { name: 'Marketing', value: 300 },
    { name: 'Criação', value: 200 },
  ],
};

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

const GestorDashboard = () => (
  <div className="dashboard-main-content">
    <div className="dashboard-header">
      <h1>Dashboard do Gestor</h1>
      <div className="date-picker">10-10-2025 - 10-10-2025</div>
    </div>

    <div className="stats-grid">
      {gestorData.stats.map(stat => (
        <div key={stat.id} className={`stat-card ${stat.colorClass}`}>
          <div className="icon-container">{stat.icon}</div>
          <div className="stat-info">
            <h2>{stat.value}</h2>
            <p>{stat.title}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="dashboard-grid">
      <div className="dashboard-card">
        <h3>Progresso por Setor</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gestorData.progressoSetor} layout="vertical">
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
            <Pie data={gestorData.distribuicaoTarefas} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
              {gestorData.distribuicaoTarefas.map((entry, index) => (
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

const ComumDashboard = () => (
  <div className="common-user-dashboard">
    <h1>Dashboard do Usuário</h1>
    <p>Bem-vindo! Esta é a sua área de visualização de tarefas.</p>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <p>Carregando...</p>;

  if (user.cargos.find(c => c.nome.toLowerCase() === "admin"))
    return <GestorDashboard />
  else
    return <ComumDashboard />;
};

export default Dashboard;
