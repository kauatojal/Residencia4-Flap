import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import './BirthdayModal.css';

const BirthdayModal = () => {
  const { user } = useContext(AuthContext);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [enviados, setEnviados] = useState([]);

  useEffect(() => {
    carregarAniversariantes();
  }, []);

  const carregarAniversariantes = async () => {
    const data = await dashboardService.getAniversariantes();
    setAniversariantes(data);
  };

  const enviarParabens = async (aniversariante) => {
    try {
      await dashboardService.enviarParabens(aniversariante.id, user);
      setEnviados([...enviados, aniversariante.id]);
      alert(`Parabéns enviados para ${aniversariante.name}! 🎉`);
    } catch (error) {
      alert('Erro ao enviar parabéns');
    }
  };

  if (aniversariantes.length === 0) {
    return (
      <div className="birthday-card no-birthdays">
        <h3>🎂 Aniversariantes do Dia</h3>
        <p>Nenhum aniversariante hoje</p>
      </div>
    );
  }

  return (
    <div className="birthday-card">
      <h3>🎂 Aniversariantes do Dia</h3>
      <div className="birthday-list">
        {aniversariantes.map(aniversariante => (
          <div key={aniversariante.id} className="birthday-item">
            <div className="birthday-info">
              <span className="birthday-name">{aniversariante.name}</span>
              <span className="birthday-emoji">🎉</span>
            </div>
            <button
              className={`btn-parabens ${enviados.includes(aniversariante.id) ? 'enviado' : ''}`}
              onClick={() => enviarParabens(aniversariante)}
              disabled={enviados.includes(aniversariante.id)}
            >
              {enviados.includes(aniversariante.id) ? '✓ Enviado' : 'Dar Parabéns'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BirthdayModal;
