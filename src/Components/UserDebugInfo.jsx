import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function UserDebugInfo() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }
  }, []);

  if (!userInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'white',
      padding: 20,
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: 400,
      zIndex: 9999,
      fontSize: 12,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔍 User Debug Info</h4>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: 10, 
        borderRadius: 4,
        overflow: 'auto',
        maxHeight: 300
      }}>
        {JSON.stringify(userInfo, null, 2)}
      </pre>
    </div>
  );
}
