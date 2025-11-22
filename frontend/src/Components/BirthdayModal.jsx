import React, { useEffect, useState } from "react";
import "./BirthdayModal.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8090";

function isSameMonthDay(dateString, compareDate = new Date()) {
  if (!dateString) return false;
  const d = new Date(dateString);
  return d.getUTCMonth() === compareDate.getUTCMonth() && d.getUTCDate() === compareDate.getUTCDate();
}

export default function BirthdayModal({ openOnDashboard = true }) {
  const [celebrants, setCelebrants] = useState([]);
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // pega usuario autenticado
        const meRes = await fetch(`${API_BASE}/v1/user/me`, { credentials: "include" });
        if (meRes.ok) setMe(await meRes.json());
      } catch (e) {
        // ignore
      }

      try {
        const res = await fetch(`${API_BASE}/v1/user`);
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        const users = await res.json();

        const today = new Date();
        const anivers = users.filter(u => isSameMonthDay(u.dataNascimento, today));
        setCelebrants(anivers);
        if (anivers.length > 0 && openOnDashboard) {
          // show only once per session - but the user asked ALWAYS when it's someone birthday.
          // We'll show every time the dashboard mounts if it's birthday.
          setShow(true);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [openOnDashboard]);

  const wish = async (celebrant) => {
    if (!me) {
      alert("Você precisa estar autenticado para desejar parabéns.");
      return;
    }
    setSending(celebrant.id);
    const payload = {
      toUserId: celebrant.id,
      fromUserId: me.id || null,
      fromName: me.name || me.nome || "Usuário",
      timestamp: new Date().toISOString(),
    };

    // Tenta enviar para endpoint backend (opcional). se falhar, grava localStorage
    try {
      const res = await fetch(`${API_BASE}/v1/notificacao/aniversario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Sem endpoint de notificações");
      // sucesso: exibir confirmação e fechar modal (ou deixar aberto para outros)
      alert(`Mensagem enviada para ${celebrant.name || celebrant.nome}!`);
    } catch (err) {
      console.warn("Falha ao postar (fallback localStorage).", err);
      // fallback: grava local
      const key = `birthday_wishes_${celebrant.id}`;
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push({ fromName: payload.fromName, fromUserId: payload.fromUserId, timestamp: payload.timestamp });
      localStorage.setItem(key, JSON.stringify(prev));
      alert(`Parabéns salvo localmente para ${celebrant.name || celebrant.nome}.`);
    } finally {
      setSending(null);
    }
  };

  if (!show || celebrants.length === 0) return null;

  return (
    <div className="birthday-modal-backdrop" role="dialog" aria-modal="true">
      <div className="birthday-modal">
        <button className="close-x" onClick={() => setShow(false)} aria-label="Fechar">×</button>
        <div className="balloons-wrap" aria-hidden>
          <div className="balloon b1">🎈</div>
          <div className="balloon b2">🎈</div>
          <div className="balloon b3">🎈</div>
          <div className="balloon b4">🎈</div>
        </div>

        <h2>Hoje é aniversário!</h2>

        <div className="celebrants-list">
          {celebrants.map(c => (
            <div key={c.id} className="celebrant-item">
              <div>
                <strong>{c.name || c.nome}</strong>
                <div className="small-muted">{c.email || ""}</div>
              </div>
              <div>
                <button
                  className="btn-wish"
                  onClick={() => wish(c)}
                  disabled={sending === c.id}
                >
                  {sending === c.id ? "Enviando..." : "Desejar parabéns"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
