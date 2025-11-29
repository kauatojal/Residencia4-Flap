import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import './KanbanFilter.css';

export default function KanbanFilter({ isOpen, onClose, filters, setFilters }) {
  const [members, setMembers] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Carregar Usuários - GET /v1/user
      fetch('http://localhost:8090/v1/user', { headers })
        .then(res => res.ok ? res.json() : [])
        .then(data => setMembers(data))
        .catch(err => console.error("Erro ao carregar usuários", err));

      // Carregar Clientes - GET /v1/cliente/all
      fetch('http://localhost:8090/v1/cliente/all', { headers })
        .then(res => res.ok ? res.json() : [])
        .then(data => setCompanies(data))
        .catch(err => console.error("Erro ao carregar clientes", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay">
      <div className="filter-modal-content">
        <div className="filter-header">
          <h2>Filtros</h2>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        
        <div className="filter-body">
          {/* Coluna Membros */}
          <div className="filter-column border-right">
            <h3>Pesquisar membro</h3>
            <div className="filter-search">
              <input type="text" placeholder="Buscar..." />
              <Search className="search-icon" size={16} />
            </div>
            <div className="filter-list">
              {members.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => setFilters({...filters, member: filters.member === member.id ? null : member.id})}
                  className={`filter-item ${filters.member === member.id ? 'active' : ''}`}
                >
                  <div className="member-avatar">
                    {member.nome ? member.nome.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="member-info">
                    <p className="member-name">{member.nome}</p>
                    <p className="member-email">{member.email}</p>
                  </div>
                  {filters.member === member.id && <Check size={16} className="check-icon"/>}
                </div>
              ))}
            </div>
          </div>

          {/* Coluna Empresas */}
          <div className="filter-column">
            <h3>Empresa</h3>
            <div className="filter-list mt-4">
              {companies.map(company => (
                <div 
                  key={company.id}
                  onClick={() => setFilters({...filters, company: filters.company === company.nome ? null : company.nome})}
                  className={`filter-item ${filters.company === company.nome ? 'active' : ''}`}
                >
                  <span className="company-name">{company.nome}</span>
                  {filters.company === company.nome && <Check size={16} className="check-icon"/>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-footer">
          <button onClick={() => { setFilters({member: null, company: null}); onClose(); }} className="btn-cancel">Limpar</button>
          <button onClick={onClose} className="btn-apply">Aplicar</button>
        </div>
      </div>
    </div>
  );
}