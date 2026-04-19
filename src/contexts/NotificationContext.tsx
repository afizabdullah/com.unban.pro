import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-[90%] max-w-md pointer-events-none" dir="rtl">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -50, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(5px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`pointer-events-auto flex items-center justify-between w-full px-4 py-3 rounded border bg-gray-950/90 backdrop-blur-md overflow-hidden relative group
                ${n.type === 'success' ? 'border-[var(--neon)] text-[var(--neon)] shadow-[0_0_20px_rgba(0,255,0,0.2)]' : 
                  n.type === 'error' ? 'border-red-500 text-red-500 shadow-[0_0_20px_rgba(255,0,0,0.2)]' : 
                  'border-cyan-500 text-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.2)]'}`}
            >
              <div className="flex items-center gap-3 relative z-10 w-full">
                {n.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />}
                {n.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />}
                {n.type === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />}
                <span className="text-sm font-mono font-bold tracking-tight mt-0.5">{n.message}</span>
                
                <button 
                  onClick={() => remove(n.id)} 
                  className="mr-auto p-1 opacity-50 hover:opacity-100 hover:bg-white/10 rounded transition-all outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Matrix scanline effect */}
              <div className="absolute inset-0 w-full h-full pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20"></div>
              <div className={`absolute top-0 left-0 w-1/3 h-full mix-blend-overlay ${n.type === 'success' ? 'bg-gradient-to-r from-transparent via-[var(--neon)] to-transparent' : n.type === 'error' ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent'} opacity-20 animate-[pulse_1.5s_infinite]`}></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
