import React, { useState, useEffect } from 'react';
import { Search, X, Check, Plus } from 'lucide-react';
import './KanbanFilter.css';

export default function KanbanFilter({ isOpen, onClose, filters, setFilters }) {
  const [members, setMembers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [flags, setFlags] = useState([]);
  const [showCreateFlag, setShowCreateFlag] = useState(false);
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagColor, setNewFlagColor] = useState('#4a67ff');
  const [searchMember, setSearchMember] = useState('');

  const token = localStorage.getItem('token');
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    // Carregar Usuários
    fetch('http://localhost:8090/v1/user', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setMembers(data))
      .catch(err => console.error("Erro ao carregar usuários", err));

    // Carregar Clientes
    fetch('http://localhost:8090/v1/cliente/all', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setCompanies(data))
      .catch(err => console.error("Erro ao carregar clientes", err));

    // Carregar FLAGS
    fetch('http://localhost:8090/v1/flag/all', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setFlags(data.filter(f => f.ativo !== false)))
      .catch(err => console.error("Erro ao carregar flags", err));
  };

  const handleCreateFlag = async () => {
    if (!newFlagName.trim()) {
      alert('Digite um nome para a flag');
      return;
    }

    try {
      const response = await fetch('http://localhost:8090/v1/flag', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nome: newFlagName.trim(),
          cor: newFlagColor,
          ativo: true
        })
      });

      if (response.ok) {
        const newFlag = await response.json();
        setFlags([...flags, newFlag]);
        setNewFlagName('');
        setNewFlagColor('#4a67ff');
        setShowCreateFlag(false);
      } else {
        alert('Erro ao criar flag. Talvez já exista uma com esse nome.');
      }
    } catch (error) {
      console.error('Erro ao criar flag:', error);
      alert('Erro ao criar flag.');
    }
  };

  const toggleFlag = (flagId) => {
    const currentFlags = filters.flags || [];
    const newFlags = currentFlags.includes(flagId)
      ? currentFlags.filter(id => id !== flagId)
      : [...currentFlags, flagId];
    
    setFilters({...filters, flags: newFlags});
  };

  const filteredMembers = members.filter(m => 
    m.nome?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchMember.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay">
      <div className="filter-modal-content filter-modal-wide">
        <div className="filter-header">
          <h2>Filtros</h2>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        
        <div className="filter-body filter-body-3col">
          {/* Coluna Membros */}
          <div className="filter-column border-right">
            <h3>Pesquisar membro</h3>
            <div className="filter-search">
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <div className="filter-list">
              {filteredMembers.map(member => (
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
          <div className="filter-column border-right">
            <h3>Empresa</h3>
            <div className="filter-list mt-4">
              {companies.map(company => (
                <div 
                  key={company.id}
                  onClick={() => setFilters({...filters, company: filters.company === company.id ? null : company.id})}
                  className={`filter-item ${filters.company === company.id ? 'active' : ''}`}
                >
                  <span className="company-name">{company.nome}</span>
                  {filters.company === company.id && <Check size={16} className="check-icon"/>}
                </div>
              ))}
            </div>
          </div>

          {/* Coluna FLAGS */}
          <div className="filter-column">
            <div className="filter-column-header">
              <h3>Prioridade (Flags)</h3>
              <button 
                onClick={() => setShowCreateFlag(!showCreateFlag)} 
                className="btn-add-flag"
                title="Criar nova flag"
              >
                <Plus size={16} />
              </button>
            </div>

            {showCreateFlag && (
              <div className="create-flag-form">
                <input 
                  type="text"
                  placeholder="Nome da flag"
                  value={newFlagName}
                  onChange={(e) => setNewFlagName(e.target.value)}
                  className="flag-name-input"
                  maxLength={30}
                />
                <div className="flag-color-picker">
                  <input 
                    type="color"
                    value={newFlagColor}
                    onChange={(e) => setNewFlagColor(e.target.value)}
                    className="color-input"
                  />
                  <span className="color-label">{newFlagColor}</span>
                </div>
                <div className="flag-form-buttons">
                  <button onClick={() => setShowCreateFlag(false)} className="btn-flag-cancel">
                    Cancelar
                  </button>
                  <button onClick={handleCreateFlag} className="btn-flag-create">
                    Criar
                  </button>
                </div>
              </div>
            )}

            <div className="filter-list mt-2">
              {flags.map(flag => (
                <div 
                  key={flag.id}
                  onClick={() => toggleFlag(flag.id)}
                  className={`filter-item flag-item ${(filters.flags || []).includes(flag.id) ? 'active' : ''}`}
                >
                  <div className="flag-color-box" style={{ backgroundColor: flag.cor }}></div>
                  <span className="flag-name">{flag.nome}</span>
                  {(filters.flags || []).includes(flag.id) && <Check size={16} className="check-icon"/>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-footer">
          <button 
            onClick={() => { 
              setFilters({member: null, company: null, flags: []}); 
              onClose(); 
            }} 
            className="btn-cancel"
          >
            Limpar
          </button>
          <button onClick={onClose} className="btn-apply">Aplicar</button>
        </div>
      </div>
    </div>
  );
}
