import React from 'react';
import './Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineChartSquareBar, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';

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
  tarefasResponsavel: [
    { id: 1, nome: 'usuario1', setor: 'Design', tarefas: 30, pendentes: 3 },
    { id: 2, nome: 'usuario2', setor: 'Marketing', tarefas: 35, pendentes: 5 },
    { id: 3, nome: 'usuario3', setor: 'Desenvolvimento', tarefas: 48, pendentes: 3 },
    { id: 4, nome: 'usuario4', setor: 'Comercial', tarefas: 20, pendentes: 4 },
  ],
  projetosPrioritarios: [
    { id: 1, nome: 'Lançamento Site', cliente: 'Cliente A', prazo: '30/10/2025', prioridade: 'Alta' },
    { id: 2, nome: 'Campanha Redes Sociais', cliente: 'Cliente B', prazo: '15/11/2025', prioridade: 'Média' },
    { id: 3, nome: 'Relatório Trimestral', cliente: 'Cliente C', prazo: '20/12/2025', prioridade: 'Baixa' },
  ]
};

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

const GestorDashboard = () => {
  return (
    <div className="dashboard-main-content">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
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
          <div className="card-header">
            <h3>Progresso por Setor</h3>
            <span className="more-options">...</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gestorData.progressoSetor} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }}/>
              <Bar dataKey="value" fill="#8884d8" barSize={20} radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Distribuição de Tarefas</h3>
            <span className="more-options">...</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={gestorData.distribuicaoTarefas} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                {gestorData.distribuicaoTarefas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
           <div className="distribuicao-legend">
              {gestorData.distribuicaoTarefas.map((entry, index) => (
                <div key={`legend-${index}`} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Tarefas por Responsável</h3>
            <span className="more-options">...</span>
          </div>
          <table className="tarefas-table">
            <thead>
              <tr>
                <th>Responsável</th>
                <th>Setor</th>
                <th>Tarefas</th>
                <th>Pendentes</th>
              </tr>
            </thead>
            <tbody>
              {gestorData.tarefasResponsavel.map(item => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.setor}</td>
                  <td>{item.tarefas}</td>
                  <td>{item.pendentes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Projetos Prioritários</h3>
            <span className="more-options">...</span>
          </div>
          <div className="projetos-list">
            {gestorData.projetosPrioritarios.map(proj => (
              <div key={proj.id} className="projeto-item">
                <div className="projeto-info">
                  <h4>{proj.nome}</h4>
                  <p>Cliente: {proj.cliente} | Prazo: {proj.prazo}</p>
                </div>
                <span className={`priority-tag priority-${proj.prioridade.toLowerCase()}`}>{proj.prioridade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ComumDashboard = () => {
  return (
    <div className="common-user-dashboard">
      <h1>Dashboard do Usuário</h1>
      <p>Bem-vindo! Esta é a sua área de visualização de tarefas.</p>
    </div>
  );
};

const Dashboard = ({ userRole }) => {
  if (userRole === 'gestor') {
    return <GestorDashboard />;
  }
  
  return <ComumDashboard />;
};

export default Dashboard;