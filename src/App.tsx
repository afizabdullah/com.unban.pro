import React, { useState, useEffect } from 'react';
import UserView from './components/UserView';
import AdminPanel from './components/AdminPanel';
import ChatRoom from './components/ChatRoom';
import VipSection from './components/VipSection';
import ProxySettingsView from './components/ProxySettingsView';
import GuidesView from './components/GuidesView';
import HelpSupportView from './components/HelpSupportView';
import { Settings, MessageSquare, ShieldCheck, Menu, X, AlertTriangle, Search, Server, PhoneOff, BookOpen, Terminal, Crown, Home, HelpCircle, Loader2, LogOut, MessageCircle, Send, Network } from 'lucide-react';
import { motion } from 'motion/react';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { auth, db } from './firebase-setup';
import { store } from './store/store';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocs, where, addDoc } from 'firebase/firestore';
import { Smartphone, Lock, User, Key, ArrowRight } from 'lucide-react';

// System Logic Component to handle Firebase without polluting App UI
function SystemLogic({ userSession, onSessionUpdate }: { userSession: any, onSessionUpdate: (data: any) => void }) {
  const { notify } = useNotification();
  const [banned, setBanned] = useState(false);
  const [lastVipStatus, setLastVipStatus] = useState<boolean | null>(null);

  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Auth failed:", err));

    let unsubUser: (() => void) | undefined;
    let unsubNotif: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, 'app_users', user.uid);
        setDoc(userDocRef, {
          uid: user.uid,
          lastSeen: serverTimestamp(),
          userName: localStorage.getItem('chatUserName') || 'App User',
          status: 'active'
        }, { merge: true });

        unsubUser = onSnapshot(userDocRef, (snap) => {
          if (snap.exists() && snap.data().status === 'banned') {
            setBanned(true);
          } else {
            setBanned(false);
          }
        }, (err) => {
          console.error("Firestore Listen Error [app_users]:", err.message, err.code, userDocRef.path);
        });

        const notifQuery = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(1));
        unsubNotif = onSnapshot(notifQuery, (snapshot) => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const notifTime = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
              if (new Date().getTime() - notifTime.getTime() < 10000) {
                notify(`${data.title}: ${data.message}`, 'info');
              }
            }
          });
        }, (err) => {
          console.error("Firestore Listen Error [notifications]:", err.message, err.code);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubUser?.();
      unsubNotif?.();
    };
  }, [notify]);

  useEffect(() => {
    let unsubAccount: (() => void) | undefined;

    if (auth.currentUser && userSession?.id) {
      unsubAccount = onSnapshot(doc(db, 'app_accounts', userSession.id), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          onSessionUpdate({ id: snap.id, ...data });

          if (data.status === 'banned') {
            setBanned(true);
          } else {
            setBanned(false);
            if (lastVipStatus === false && data.isVip === true) {
              notify('لقد تم تفعيل قسم VIP! يمكنك الدخول الآن بدون كلمة مرور.', 'success');
            }
            setLastVipStatus(data.isVip || false);
          }
        }
      }, (err) => {
        console.error("Firestore Listen Error [app_accounts]:", err.message, err.code, userSession.id);
      });
    }

    return () => unsubAccount?.();
  }, [userSession?.id, lastVipStatus, onSessionUpdate, notify]);

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center flex-1 h-full min-h-[400px] text-center"
    >
      <div className="card max-w-sm w-full p-10 border-dashed border-neutral-800 bg-transparent flex flex-col items-center gap-6">
        <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
          <Terminal className="w-10 h-10 text-neutral-600" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest mb-2">{title}</h2>
          <p className="text-[10px] text-neutral-600 uppercase font-mono tracking-[0.2em]">Data stream currently offline</p>
        </div>
        <div className="w-12 h-1 bg-neutral-800 rounded-full"></div>
      </div>
    </motion.div>
  );
}

// System Login Screen Component
function LoginScreen({ onLogin, onAdminAuth }: { onLogin: (user: any) => void, onAdminAuth: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { notify } = useNotification();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    // Secret backdoor for admin setup (delete later or keep for recovery)
    if (username === 'ROOT' && password === '716023560') {
      onAdminAuth();
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const q = query(
        collection(db, 'app_accounts'), 
        where('username', '==', username),
        where('password', '==', password)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
        notify('بيانات دخول غير صحيحة', 'error');
      } else {
        const userData = snapshot.docs[0].data();
        if (userData.status === 'banned') {
          setError('هذا الحساب محظور من قبل الإدارة');
          notify('حساب محظور', 'error');
        } else {
          onLogin({ id: snapshot.docs[0].id, ...userData });
          notify('تم تسجيل الدخول بنجاح', 'success');
        }
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 z-[10000] flex items-center justify-center p-4 font-mono overflow-hidden" dir="rtl">
      <div className="matrix-overlay"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[380px] card p-8 relative z-10 flex flex-col items-center"
      >
        <div className="mb-10 text-center">
          <div className="w-20 h-20 rounded-2xl border-2 border-[var(--neon)] flex items-center justify-center mb-5 mx-auto bg-neutral-900/50 shadow-[0_0_30px_rgba(0,255,102,0.2)]">
            <ShieldCheck className="w-10 h-10 text-[var(--neon)]" />
          </div>
          <h1 className="logo-text text-3xl mb-1 tracking-[0.2em]">UNBAN PRO</h1>
          <p className="font-mono text-[10px] text-neutral-500 tracking-[0.3em] uppercase">Security Clearance v4</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">Identity Tag</label>
            <div className="relative group">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-[var(--neon)] transition-colors" />
              <input 
                type="text"
                placeholder="USERNAME"
                className="input-styled pr-12"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">Security Key</label>
            <div className="relative group">
              <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-[var(--neon)] transition-colors" />
              <input 
                type="password"
                placeholder="••••••••"
                className="input-styled pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 border border-red-500/20 bg-red-950/20 rounded-xl flex items-center justify-center gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-400 font-bold">{error}</span>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-styled btn-primary w-full shadow-[0_10px_30px_rgba(0,255,102,0.15)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                AUTHENTICATE
                <ArrowRight className="w-5 h-5 rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--neon)]/10 w-full">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-4">تواصل مع المطور للحصول على حساب</p>
            
            <div className="flex flex-col gap-2">
              <a 
                href="https://wa.me/967783799137" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-green-500/30 bg-green-950/10 hover:bg-green-950/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-gray-300 font-bold">تواصل واتساب (1)</span>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600 rotate-180" />
              </a>

              <a 
                href="https://wa.me/967733234211" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-green-500/30 bg-green-950/10 hover:bg-green-950/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-gray-300 font-bold">تواصل واتساب (2)</span>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600 rotate-180" />
              </a>

              <a 
                href="https://t.me/CYBBEEAGLE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-blue-500/30 bg-blue-950/10 hover:bg-blue-950/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-gray-300 font-bold">تواصل معا دعم عبر تلجرام</span>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600 rotate-180" />
              </a>
            </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [userSession, setUserSession] = useState<any>(() => {
    const saved = localStorage.getItem('user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<'unban' | 'chat' | 'proxies' | 'guides' | 'vip' | 'help'>('unban');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [proxyStatus, setProxyStatus] = useState(store.getProxySettings().isEnabled);

  useEffect(() => {
    const handleProxyChange = (e: any) => setProxyStatus(e.detail.isEnabled);
    window.addEventListener('proxyChanged', handleProxyChange);
    return () => window.removeEventListener('proxyChanged', handleProxyChange);
  }, []);

  const handleAdminAuth = async () => {
    setIsAdmin(true);
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'admins', auth.currentUser.uid), {
          role: 'admin',
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Admin registration failed (expected if already admin):", err);
      }
    }
  };

  useEffect(() => {
    if (userSession) {
      // Monitor if account gets banned while online
      const unsub = onSnapshot(doc(db, 'app_accounts', userSession.id), (doc) => {
        if (doc.exists() && doc.data().status === 'banned') {
          setUserSession(null);
          localStorage.removeItem('user_session');
        }
      });
      return () => unsub();
    }
  }, [userSession]);

  const handleLogin = (data: any) => {
    setUserSession(data);
    localStorage.setItem('user_session', JSON.stringify(data));
    localStorage.setItem('chat_name', data.username);
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('user_session');
  };

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
      {!userSession && !isAdmin && <LoginScreen onLogin={handleLogin} onAdminAuth={handleAdminAuth} />}
      <SystemLogic userSession={userSession} onSessionUpdate={handleLogin} />
      {/* Background for Desktop View */}
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center sm:py-6 sm:px-4 font-mono text-right" dir="rtl">
        
        {/* Mobile Phone Container Constraint */}
        <div className="w-full h-[100dvh] sm:h-[844px] sm:max-h-[90vh] sm:w-[390px] bg-neutral-950 sm:border border-[var(--glass-border)] sm:rounded-[3rem] overflow-hidden relative flex flex-col sm:shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          
          <div className="matrix-overlay"></div>
          <div className="scanline"></div>
          
          {/* Header Bar */}
          <header className="header-glass relative z-50 w-full flex justify-between items-center px-6 py-4 min-h-[70px]">
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
              {proxyStatus && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[9px] text-blue-400 font-bold animate-pulse">
                  <Network className="w-3 h-3" />
                  <span>PROXY_ACTIVE</span>
                </div>
              )}
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
                <aside className={`absolute top-0 right-0 h-full w-[280px] bg-neutral-950/95 backdrop-blur-md border-l border-[var(--glass-border)] z-40 transform transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[110%]'} flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]`}>
                  <div className="p-6 flex-1 flex flex-col overflow-y-auto pt-20">
                    <div className="text-[10px] text-neutral-500 font-bold mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <Terminal className="w-3 h-3" /> System Access
                    </div>
                    
                    <div className="space-y-4">
                      {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                          <button
                            key={item.id}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${isActive ? 'bg-[var(--neon-dim)] ring-1 ring-[var(--neon)]/50' : 'hover:bg-neutral-900 border border-transparent'}`}
                            onClick={() => {
                              setCurrentView(item.id as any);
                              setIsSidebarOpen(false);
                            }}
                          >
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[var(--neon)] text-black shadow-[0_0_15px_rgba(0,255,102,0.5)]' : 'bg-neutral-900 text-neutral-500 group-hover:text-neutral-300'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-sm font-bold transition-all ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                              {item.label}
                            </span>
                          </button>
                        );
                      })}

                      <button
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${currentView === 'chat' ? 'bg-[var(--neon-dim)] ring-1 ring-[var(--neon)]/50' : 'hover:bg-neutral-900 border border-transparent'}`}
                        onClick={() => {
                          setCurrentView('chat');
                          setIsSidebarOpen(false);
                        }}
                      >
                        <div className={`p-2 rounded-xl transition-all ${currentView === 'chat' ? 'bg-[var(--neon)] text-black shadow-[0_0_15px_rgba(0,255,102,0.5)]' : 'bg-neutral-900 text-neutral-500 group-hover:text-neutral-300'}`}>
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-bold transition-all ${currentView === 'chat' ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                          غرفة الدردشة
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-neutral-900 bg-neutral-950 flex flex-col gap-3">
                    <button 
                      onClick={() => { setIsAdmin(true); setIsSidebarOpen(false); }}
                      className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-bold hover:text-white transition-all"
                    >
                      <Settings className="w-4 h-4" /> لوحة الإدارة
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-950/20 border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                      <LogOut className="w-4 h-4" /> الخروج من الحساب
                    </button>
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
                <UserView userSession={userSession} />
              ) : currentView === 'proxies' ? (
                <ProxySettingsView />
              ) : currentView === 'guides' ? (
                <GuidesView />
              ) : currentView === 'vip' ? (
                <VipSection userSession={userSession} />
              ) : currentView === 'help' ? (
                <HelpSupportView />
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
