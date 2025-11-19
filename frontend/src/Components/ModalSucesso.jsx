import React from "react";
import "./ModalSucesso.css";

export default function ModalSucesso({
  tipo = "sucesso", // "sucesso" | "erro" | "confirmacao"
  mensagem,
  onFechar,
  onConfirmar // usado só em tipo="confirmacao"
}) {
  const icones = {
    sucesso: "✅",
    erro: "❌",
    confirmacao: "⚠️"
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-container modal-${tipo}`}>
        <div className="modal-header">
          <span className="modal-icone">{icones[tipo]}</span>
          <h3>
            {tipo === "sucesso" && "Sucesso!"}
            {tipo === "erro" && "Erro!"}
            {tipo === "confirmacao" && "Confirmação"}
          </h3>
        </div>

        <p className="modal-mensagem">{mensagem}</p>

        <div className="modal-botoes">
          {tipo === "confirmacao" ? (
            <>
              <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
              <button className="btn-confirmar" onClick={onConfirmar}>Confirmar</button>
            </>
          ) : (
            <button className="btn-fechar" onClick={onFechar}>Fechar</button>
          )}
        </div>
      </div>
    </div>
  );
}
