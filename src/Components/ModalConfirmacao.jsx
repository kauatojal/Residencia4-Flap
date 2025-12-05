import React from 'react';
import { X, AlertTriangle, Trash2, Archive } from 'lucide-react';
import './ModalConfirmacao.css';

export default function ModalConfirmacao({
  isOpen,
  onClose,
  onConfirm,
  titulo = 'Confirmar ação',
  mensagem = 'Deseja continuar?',
  textoBotaoConfirmar = 'Confirmar',
  textoBotaoCancelar = 'Cancelar',
  tipoBotao = 'danger' // 'danger', 'warning', 'primary'
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (tipoBotao) {
      case 'danger':
        return <Trash2 size={48} />;
      case 'warning':
        return <Archive size={48} />;
      default:
        return <AlertTriangle size={48} />;
    }
  };

  const getColorClass = () => {
    switch (tipoBotao) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="modal-confirmacao-overlay" onClick={onClose}>
      <div className="modal-confirmacao-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-confirmacao" onClick={onClose}>
          <X size={20} />
        </button>

        <div className={`modal-confirmacao-icon ${getColorClass()}`}>
          {getIcon()}
        </div>

        <h2 className="modal-confirmacao-titulo">{titulo}</h2>
        <p className="modal-confirmacao-mensagem">{mensagem}</p>

        <div className="modal-confirmacao-footer">
          <button className="btn-cancelar" onClick={onClose}>
            {textoBotaoCancelar}
          </button>
          <button 
            className={`btn-confirmar ${getColorClass()}`}
            onClick={() => {
              onConfirm();
            }}
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
