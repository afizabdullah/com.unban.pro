import React, { useState, useEffect } from 'react';
import UserView from './components/UserView';
import AdminPanel from './components/AdminPanel';
import ChatRoom from './components/ChatRoom';
import VipSection from './components/VipSection';
import { Settings, MessageSquare, ShieldCheck, Menu, X, AlertTriangle, Search, Server, PhoneOff, BookOpen, Terminal, Crown, Home, HelpCircle, Loader2 } from 'lucide-react';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { auth, db } from './firebase-setup';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, collection, query, orderBy, limit } from 'firebase/firestore';

// System Logic Component to handle Firebase without polluting App UI
function SystemLogic() {
  const { notify } = useNotification();
  const [banned, setBanned] = useState(false);

  useEffect(() => {
    // 1. Initial Anonymous Login
    signInAnonymously(auth).catch(e => console.error("Firebase Login Error:", e));

    let unsubUser: (() => void) | undefined;
    let unsubNotif: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 2. Register/Update User Data
        const userDocRef = doc(db, 'app_users', user.uid);
        
        setDoc(userDocRef, {
           uid: user.uid,
           lastSeen: serverTimestamp(),
           userName: localStorage.getItem('chat_name') || 'App User',
           status: 'active'
        }, { merge: true });

        // 3. Subscription to Ban Status
        unsubUser = onSnapshot(userDocRef, (snap) => {
          if (snap.exists() && snap.data().status === 'banned') {
            setBanned(true);
          } else {
            setBanned(false);
          }
        });

        // 4. Notification Listener
        const notifQuery = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(1));
        unsubNotif = onSnapshot(notifQuery, (snapshot) => {
           snapshot.docChanges().forEach(change => {
             if (change.type === 'added') {
               const data = change.doc.data();
               const notifTime = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
               // Only show if received in the last 10 seconds (avoid showing old notifications on load)
               if (new Date().getTime() - notifTime.getTime() < 10000) {
                 notify(`${data.title}: ${data.message}`, 'info');
               }
             }
           });
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubUser?.();
      unsubNotif?.();
    };
  }, [notify]);

  if (banned) {
    return (
      <div className="fixed inset-0 bg-neutral-950 z-[9999] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.1)_0%,transparent_70%)]"></div>
        <div className="relative">
           <AlertTriangle className="w-24 h-24 text-red-600 mb-6 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)] mx-auto" />
           <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tighter">ACCESS_DENIED</h1>
           <div className="w-full h-[1px] bg-red-600/50 mb-6 mx-auto"></div>
           <p className="text-gray-400 text-lg mb-8 max-w-sm leading-relaxed font-mono">
              لقد تم حظر جهازك بشكل دائم من استخدام نظامنا. <br />
              <span className="text-red-500/80 text-sm">[ السبب: انتهاك سياسات الاستخدام ]</span>
           </p>
           <div className="p-3 border border-red-500/30 bg-red-900/10 rounded-lg">
             <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Signature: {auth.currentUser?.uid}</p>
           </div>
        </div>
      </div>
    );
  }

  return null;
}

// Under construction placeholder view
function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full opacity-80 min-h-[400px]">
      <Terminal className="w-16 h-16 text-[var(--neon)] mb-4 animate-pulse duration-1000" />
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 font-mono text-xs text-center max-w-[250px] leading-relaxed mb-6">
        [SYS]: جاري تطوير هذه الواجهة... <br/>سيتم إتاحتها قريباً.
      </p>
      <div className="w-32 h-1 bg-gray-800 rounded overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full bg-[var(--neon)] animate-[pulse_2s_ease-in-out_infinite] w-full" style={{ transformOrigin: 'left', animation: 'load-bar 2s infinite alternate' }}></div>
      </div>
    </div>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<'unban' | 'chat' | 'proxies' | 'guides' | 'vip' | 'help'>('unban');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'unban', label: 'الرئيسية (فك الحظر)', icon: Home },
    { id: 'chat', label: 'غرفة الدردشة', icon: MessageSquare },
    { id: 'proxies', label: 'خوادم البروكسي', icon: Server },
    { id: 'guides', label: 'شروحات وثغرات', icon: BookOpen },
    { id: 'help', label: 'المساعدة والدعم', icon: HelpCircle },
    { id: 'vip', label: 'قسم الـ VIP', icon: Crown },
  ] as const;

  return (
    <NotificationProvider>
      <SystemLogic />
      {/* Background for Desktop View */}
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center sm:py-6 sm:px-4 font-mono text-right" dir="rtl">
        
        {/* Mobile Phone Container Constraint */}
        <div className="w-full h-[100dvh] sm:h-[844px] sm:max-h-[90vh] sm:w-[390px] bg-[var(--dark-bg)] sm:border border-[var(--grid-line)] sm:rounded-[2.5rem] overflow-hidden relative flex flex-col sm:shadow-[0_0_50px_rgba(0,40,0,0.5)]">
          
          <div className="matrix-overlay"></div>
          
          {/* Header Bar */}
          <header className="header-glass relative z-50 w-full flex justify-between items-center px-4 py-3 border-b border-[var(--neon)]/30 min-h-[60px]">
            <div className="flex items-center gap-3">
              {!isAdmin && (
                <button 
                  className="text-[var(--neon)] p-1 hover:bg-[var(--dim-green)] rounded"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
              <div className="logo-text text-base">
                {isAdmin ? 'ADMIN' : 'UNBAN 4.0'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] opacity-80">
                <span className="hidden sm:inline">متصل</span>
                <span className="w-2 h-2 bg-[var(--neon)] rounded-full status-pulse"></span>
              </span>
              {isAdmin && (
                <button 
                  onClick={() => setIsAdmin(false)}
                  className="text-red-400 p-1 px-2 text-xs border border-red-500/30 rounded"
                >
                  إغلاق
                </button>
              )}
            </div>
          </header>

          {/* Main Layout Area */}
          <div className="flex flex-1 relative z-10 w-full overflow-hidden">
            
            {/* Sidebar (Mobile Overlay Behavior Always) */}
            {!isAdmin && (
              <>
                {/* Overlay Backdrop */}
                {isSidebarOpen && (
                  <div 
                    className="absolute inset-0 bg-black/60 z-30 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                  ></div>
                )}
                
                {/* Sidebar Drawer */}
                <aside className={`absolute top-0 right-0 h-full w-[260px] bg-[var(--dark-bg)] border-l border-[var(--neon)] z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[110%]'} flex flex-col shadow-[rgba(0,255,0,0.1)_-5px_0px_15px]`}>
                  <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                    <div className="text-sm text-[var(--neon)] font-bold mb-4 border-b border-[var(--neon)]/30 pb-2">
                      قائمة النظام
                    </div>
                    
                    <div className="space-y-2">
                      {menuItems.map(item => {
                        const Icon = item.icon;
                        return (
                          <button 
                            key={item.id}
                            onClick={() => { setCurrentView(item.id as any); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 w-full p-2.5 rounded transition-all outline-none text-sm ${currentView === item.id ? 'bg-[var(--dim-green)] text-[var(--neon)] border border-[var(--neon)]' : 'hover:bg-[var(--dim-green)]/30 text-gray-300'}`}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-8 mb-6">
                      <div className="card p-3 border-[var(--neon)] bg-green-900/10 text-center flex flex-col gap-2">
                        <MessageSquare className="w-6 h-6 mx-auto text-[var(--neon)] opacity-90" />
                        <div>
                          <p className="text-sm font-bold text-white mb-1">تواصل مع الآخرين</p>
                          <p className="text-[9px] text-gray-400 leading-snug">شارك خبراتك في الغرفة العامة</p>
                        </div>
                        <button 
                          onClick={() => { setCurrentView('chat'); setIsSidebarOpen(false); }} 
                          className="btn-styled w-full flex justify-center items-center gap-2 text-xs shadow-[0_0_10px_var(--neon)] py-2"
                        >
                          دخول للغرفة
                        </button>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-[var(--grid-line)]">
                      <button 
                        onClick={() => { setIsAdmin(true); setIsSidebarOpen(false); }}
                        className="flex flex-row-reverse items-center justify-end gap-2 w-full p-2 text-gray-400 hover:text-white transition-colors mb-3 outline-none text-sm"
                      >
                        الإعدادات
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      <div className="bg-red-950/40 border border-red-500/50 rounded-lg p-2 text-center shadow-[0_0_15px_rgba(255,0,0,0.1)]">
                        <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1 animate-pulse" />
                        <p className="text-red-400 text-[10px] font-bold leading-relaxed">
                          تحذير: لا تدخل هنا! <br/> سيتم حظرك من البرنامج فوراً.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </>
            )}

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-4 flex flex-col relative w-full styled-scrollbar">
              {isAdmin ? (
                <AdminPanel onLogout={() => setIsAdmin(false)} />
              ) : currentView === 'chat' ? (
                <ChatRoom />
              ) : currentView === 'unban' ? (
                <UserView />
              ) : currentView === 'vip' ? (
                <VipSection />
              ) : currentView === 'help' ? (
                <PlaceholderView title="المساعدة والدعم" />
              ) : (
                <PlaceholderView title={menuItems.find(m => m.id === currentView)?.label || 'غير معروف'} />
              )}
            </main>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}
