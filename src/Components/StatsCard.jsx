import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { HiOutlineUsers, HiOutlineUserGroup } from 'react-icons/hi';
import './StatsCard.css';

const StatsCard = () => {
  const [stats, setStats] = useState({
    clientes: 0,
    funcionarios: 0
  });

  useEffect(() => {
    carregarStats();
  }, []);

  const carregarStats = async () => {
    const [clientes, funcionarios] = await Promise.all([
      dashboardService.getTotalClientes(),
      dashboardService.getTotalFuncionarios()
    ]);
    
    setStats({ clientes, funcionarios });
  };

  return (
    <div className="stats-card-container">
      <div className="stat-box stat-clientes">
        <div className="stat-icon">
          <HiOutlineUserGroup />
        </div>
        <div className="stat-content">
          <h4>Clientes</h4>
          <p className="stat-number">{stats.clientes}</p>
        </div>
      </div>

      <div className="stat-box stat-funcionarios">
        <div className="stat-icon">
          <HiOutlineUsers />
        </div>
        <div className="stat-content">
          <h4>Funcionários</h4>
          <p className="stat-number">{stats.funcionarios}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
