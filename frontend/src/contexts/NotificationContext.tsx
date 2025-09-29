import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = uuidv4();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 5000); // Notificação desaparece após 5 segundos
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div style={notificationContainerStyle}>
        {notifications.map((notif) => (
          <div key={notif.id} style={{ ...notificationStyle, ...notificationTypeStyle[notif.type] }}>
            {notif.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Estilos básicos para as notificações
const notificationContainerStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const notificationStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '5px',
  color: 'white',
  fontWeight: 'bold',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

const notificationTypeStyle = {
  success: { backgroundColor: '#4CAF50' },
  error: { backgroundColor: '#F44336' },
  info: { backgroundColor: '#2196F3' },
};
