import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DropboxCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Captura o token do hash da URL
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get('access_token');

    if (access_token) {
      // Salva o token no localStorage
      localStorage.setItem('dropbox_token', access_token);
      
      // Envia mensagem para a janela pai (popup)
      if (window.opener) {
        window.opener.postMessage({ access_token }, window.location.origin);
        window.close();
      } else {
        // Se não for popup, redireciona
        alert('✅ Dropbox conectado com sucesso!');
        navigate('/kanban');
      }
    } else {
      alert('❌ Erro ao conectar com Dropbox');
      navigate('/kanban');
    }
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="loading-spinner"></div>
      <p>Conectando ao Dropbox...</p>
    </div>
  );
}
