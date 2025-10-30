import React from 'react';
import './FuncionarioDetalhes.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

// Dados de exemplo para os gráficos (em um projeto real, viriam do funcionário)
const performanceData = [
  { name: 'Jan', value: 1800 }, { name: 'Feb', value: 2330 },
  { name: 'Mar', value: 1900 }, { name: 'Apr', value: 2100 },
  { name: 'May', value: 2500 }, { name: 'Jun', value: 2800 },
];

const metricData1 = [{ name: 'Metric', value: 70 }, { name: 'Remaining', value: 30 }];
const metricData2 = [{ name: 'Metric', value: 60 }, { name: 'Remaining', value: 40 }];
const COLORS = ['#FFBB28', '#EFEFEF'];
const COLORS2 = ['#0088FE', '#EFEFEF'];

export default function FuncionarioDetalhes({ funcionario }) {
  if (!funcionario) {
    return null; // Não renderiza nada se nenhum funcionário estiver selecionado
  }

  return (
    <aside className="detalhes-sidebar">
      <div className="profile-card">
        <img src={funcionario.avatar} alt={`Avatar de ${funcionario.nome}`} className="profile-avatar" />
        <h3 className="profile-name">{funcionario.nome}</h3>
        <p className="profile-role">{funcionario.cargo}</p>
      </div>

      <div className="info-card">
        <h4>Informações de Contato</h4>
        <div className="contact-info">
          <p><HiOutlineMail className="info-icon" /> {funcionario.email}</p>
          <p><HiOutlinePhone className="info-icon" /> {funcionario.celular}</p>
          <p><HiOutlineLocationMarker className="info-icon" /> {funcionario.setor}</p>
        </div>
      </div>

      <div className="info-card">
        <h4>Performance</h4>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={performanceData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis hide={true} />
            <Tooltip cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }} />
            <Bar dataKey="value" fill="#FFC9C9" radius={[10, 10, 10, 10]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="metrics-grid">
        <div className="info-card metric-card">
           <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={metricData1} cx="50%" cy="50%" innerRadius={30} outerRadius={40} dataKey="value" startAngle={90} endAngle={450}>
                {metricData1.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="metric-value">70%</span>
        </div>
        <div className="info-card metric-card">
           <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={metricData2} cx="50%" cy="50%" innerRadius={30} outerRadius={40} dataKey="value" startAngle={90} endAngle={450}>
                {metricData2.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} stroke={COLORS2[index % COLORS2.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="metric-value">60%</span>
        </div>
      </div>
    </aside>
  );
}
