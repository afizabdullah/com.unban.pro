import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, Database, Activity, Smartphone, LogOut, Plus, Trash2, Save, AlertTriangle, Globe, Settings, Download, Eraser, FileText, Users, Bell, Ban, Sparkles, Loader2, ShieldCheck, User, Crown, RefreshCw, Wand2, ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { store, Device, RequestStat, MessageTemplate, BanReason, Language, AppSettings } from '../store/store';
import { useNotification } from '../contexts/NotificationContext';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, getDocs, setDoc, orderBy, limit } from 'firebase/firestore';
import { db, auth, signInWithGoogle } from '../firebase-setup';
import { GoogleGenAI } from "@google/genai";

import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const { notify } = useNotification();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminAuthReady, setIsAdminAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'a716023560@gmail.com' && user.emailVerified) {
        setIsAuthenticated(true);
      }
      setIsAdminAuthReady(true);
    });
    return () => unsub();
  }, []);

  const [activeTab, setActiveTab] = useState<'stats' | 'messages' | 'users' | 'devices' | 'reasons' | 'languages' | 'settings'>('stats');

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user && user.email === 'a716023560@gmail.com') {
        try {
          await setDoc(doc(db, 'app_admins', user.uid), {
            role: 'admin',
            email: user.email,
            timestamp: serverTimestamp()
          });
          setIsAuthenticated(true);
          notify('تم تسجيلك كمسؤول وتفعيل الصلاحيات.', 'success');
        } catch (err) {
          console.error("Firestore Error [app_admins]:", err);
          notify('خطأ في تفعيل صلاحيات الخادم.', 'error');
        }
      } else {
        notify('تم تسجيل الدخول، ولكن هذا الحساب ليس له صلاحيات إدارية.', 'info');
      }
    } catch (err) {
      console.error("Google Auth failed:", err);
      notify('فشل تسجيل الدخول بواسطة Google.', 'error');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = store.getSettings();
    if (password === settings.adminPassword) {
      setIsAuthenticated(true);
      setError('');
      // Elevate to admin in Firestore if password is correct
      if (auth.currentUser) {
        setDoc(doc(db, 'app_admins', auth.currentUser.uid), {
          role: 'admin',
          via: 'password',
          timestamp: serverTimestamp()
        }, { merge: true }).catch(err => {
          console.error("Admin elevation failed at [app_admins]:", err);
          notify('خطأ في تفعيل صلاحيات الخادم. يرجى تسجيل الدخول عبر Google مرة واحدة.', 'info');
        });
      }
    } else {
      setError('كلمة المرور غير صحيحة. اختراق غير مصرح به.');
    }
  };

  const handleResetPassword = () => {
    store.saveSettings({ ...store.getSettings(), adminPassword: '716023560', vipPassword: 'vip' });
    notify('تم إعادة ضبط بيانات الاعتماد لـ الإدارة و الـ VIP.', 'info');
  };

  if (!isAdminAuthReady) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Authenticating root access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full pt-10 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-sm w-full p-8 text-center border-b-4 border-b-red-500"
        >
          <div className="w-20 h-20 rounded-2xl border-2 border-red-500/50 flex items-center justify-center mx-auto mb-6 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          
          <h2 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-[0.2em]">Root Authority</h2>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-8">Access restricted to core system admins</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <input 
                type="password" 
                placeholder="ACCESS_TOKEN"
                className="input-styled text-center tracking-[0.5em] border-red-500/30 focus:border-red-500 focus:ring-red-500/30 font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-2 border border-red-500/20 bg-red-950/40 rounded text-[10px] text-red-400 font-bold uppercase"
              >
                {error}
              </motion.div>
            )}
            <button 
              type="submit"
              className="btn-styled bg-red-600 border-red-400 text-white w-full hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
            >
              AUTHORIZE_SESSION
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-[1px] bg-red-500/10"></div>
              <span className="text-[10px] text-neutral-600 uppercase font-mono">OR</span>
              <div className="flex-1 h-[1px] bg-red-500/10"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="btn-styled bg-white/5 border-white/10 text-white w-full hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              SIGN_IN_WITH_GOOGLE
            </button>
            <p className="text-[8px] text-neutral-600 mt-2 text-center uppercase tracking-tighter">
              ⚠️ IF LOGIN FAILS ON EXTERNAL DOMAINS, ADD YOUR URL TO FIREBASE AUTH AUTHORIZED DOMAINS
            </p>
          </form>
          
          <div className="mt-8 pt-6 border-t border-red-500/10 text-center">
            <button 
              type="button" 
              onClick={handleResetPassword}
              className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest hover:text-red-400 transition-colors"
            >
              Emergency Wipe & Reset
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col flex-1 max-w-6xl mx-auto w-full h-[calc(100vh-120px)] card p-0 overflow-hidden relative"
    >
      <div className="matrix-overlay opacity-20"></div>
      
      {/* Admin Header */}
      <header className="header-glass relative z-10 px-6 py-4 flex justify-between items-center bg-neutral-900/60 border-b border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest">مـركـز الـتـحـكـم : ROOT</h2>
            <p className="text-[9px] text-red-500 font-mono uppercase tracking-[0.2em]">Administrative Override Active</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="btn-styled py-1.5 px-4 text-[10px] border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <LogOut className="w-4 h-4" /> TERMINATE
        </button>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <nav className="w-full md:w-56 border-b md:border-b-0 md:border-l border-[var(--glass-border)] p-3 flex md:flex-col gap-2 bg-black/20 overflow-x-auto md:overflow-y-auto shrink-0 styled-scrollbar">
          {[
            { id: 'stats', label: 'الشبكة والعمليات', icon: Activity },
            { id: 'users', label: 'إدارة الرواد', icon: Users },
            { id: 'messages', label: 'كودات الوصول', icon: Database },
            { id: 'devices', label: 'قاعدة الأجهزة', icon: Smartphone },
            { id: 'reasons', label: 'مستودع الأسباب', icon: AlertTriangle },
            { id: 'languages', label: 'معدل اللغات', icon: Globe },
            { id: 'settings', label: 'ثوابت النظام', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 outline-none whitespace-nowrap
                  ${isActive 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                    : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-neutral-600 group-hover:text-neutral-400'}`} />
                <span className={`text-[11px] font-bold tracking-wide ${isActive ? 'text-white' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto styled-scrollbar bg-black/10">
          {activeTab === 'stats' && <StatsView />}
          {activeTab === 'users' && <UsersAdmin />}
          {activeTab === 'messages' && <MessagesAdmin />}
          {activeTab === 'devices' && <DevicesAdmin />}
          {activeTab === 'reasons' && <ReasonsAdmin />}
          {activeTab === 'languages' && <LanguagesAdmin />}
          {activeTab === 'settings' && <SettingsAdmin />}
        </main>
      </div>
    </motion.div>
  );
}

function StatsView() {
  const { notify } = useNotification();
  const [stats, setStats] = useState<any[]>([]);
  const [globalCounters, setGlobalCounters] = useState<any>(null);

  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsubCounters = onSnapshot(doc(db, 'global_stats', 'counters'), (snap) => {
      if (snap.exists()) setGlobalCounters(snap.data());
    }, (err) => {
      console.error("AdminPanel stats listener error [global_stats]:", err);
    });

    const q = query(collection(db, 'unban_requests'), orderBy('timestamp', 'desc'), limit(50));
    const unsubRequests = onSnapshot(q, (snapshot) => {
      setStats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("AdminPanel unban_requests listener error:", err);
      if (err.code === 'permission-denied') {
        notify('ليس لديك صلاحيات كافية لعرض جميع العمليات. سجل دخول Google لتفعيل الوصول الكامل.', 'error');
      }
    });

    return () => {
      unsubCounters();
      unsubRequests();
    };
  }, []);

  const handleSyncStats = async () => {
    setSyncing(true);
    try {
      // Get counts from main collections
      const [unbanSnap, vipSnap, chatSnap] = await Promise.all([
        getDocs(collection(db, 'unban_requests')),
        getDocs(collection(db, 'vip_tool_usage')),
        getDocs(collection(db, 'chat_messages'))
      ]);

      const realTotal = unbanSnap.size + vipSnap.size + chatSnap.size;
      
      const countersRef = doc(db, 'global_stats', 'counters');
      await setDoc(countersRef, {
        totalRequests: realTotal,
        lastUpdate: serverTimestamp(),
        lastSync: serverTimestamp()
      }, { merge: true });

      notify(`تمت المزامنة بنجاح! الإجمالي الحقيقي: ${realTotal}`, 'success');
    } catch (err) {
      console.error("Sync failed:", err);
      notify('فشلت عملية المزامنة', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCSV = () => {
    if (stats.length === 0) return notify('لا توجد بيانات لتصديرها', 'error');
    let csv = "ID,Date,Time,Phone,Device,ReasonID,UserID\n";
    stats.forEach(s => {
      const dt = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
      csv += `"${s.id}","${dt.toLocaleDateString()}","${dt.toLocaleTimeString()}","${s.phone}","${s.deviceId}","${s.reasonId}","${s.userId}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `whatsapp-global-stats-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    notify('تم تصدير البيانات بنجاح', 'success');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-2 border-b border-[var(--neon)]">
        <h3 className="text-xl font-bold flex items-center mb-4 sm:mb-0">
          <Activity className="w-5 h-5 ml-2" /> إحصائيات النظام العالمية
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handleSyncStats} 
            disabled={syncing}
            className="btn-styled flex items-center px-3 py-1 text-sm border-blue-500/50 text-blue-400"
          >
            {syncing ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <RefreshCw className="w-4 h-4 ml-1" />}
            مزامنة البيانات
          </button>
          <button onClick={handleExportCSV} className="btn-styled flex items-center px-3 py-1 text-sm bg-[var(--dim-green)]">
            <Download className="w-4 h-4 ml-1" /> تصدير CSV
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card text-center border-yellow-500/30">
          <p className="text-xs opacity-80">إجمالي الطلبات (عالمي)</p>
          <p className="text-2xl font-bold text-[var(--neon)]">{globalCounters?.totalRequests || stats.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs opacity-80">طلب ناجح (مُقدر)</p>
          <p className="text-2xl font-bold text-green-400">
            {globalCounters ? Math.floor(globalCounters.totalRequests * 0.72) : Math.floor(stats.length * 0.72)}
          </p>
        </div>
      </div>
      
      <div className="border border-[var(--neon)] bg-[var(--dark-bg)]/50 overflow-x-auto">
        <table className="w-full text-right text-sm whitespace-nowrap">
          <thead className="bg-[var(--dim-green)] border-b border-[var(--neon)]">
            <tr>
              <th className="p-3">التاريخ</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">رقم المستخدم</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(stat => (
              <tr key={stat.id} className="border-b border-[var(--grid-line)] hover:bg-[var(--dim-green)]/30 transition-colors">
                <td className="p-3 font-mono">
                  {stat.timestamp?.toDate ? stat.timestamp.toDate().toLocaleString('en-GB') : new Date(stat.timestamp).toLocaleString('en-GB')}
                </td>
                <td className="p-3 font-mono" dir="ltr">{stat.phone}</td>
                <td className="p-3 text-[10px] opacity-60 font-mono">{stat.userId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersAdmin() {
  const { notify } = useNotification();
  const [users, setUsers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDevice, setNewDevice] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const qUsers = query(collection(db, 'app_users'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      const u = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(u);
    }, (err) => {
      console.error("Firestore Listen Error [app_users]:", err);
    });

    const qAccounts = query(collection(db, 'app_accounts'));
    const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
      const a = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccounts(a);
    }, (err) => {
      console.error("Firestore Listen Error [app_accounts]:", err);
    });

    return () => {
      unsubUsers();
      unsubAccounts();
    };
  }, []);

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    setIsCreating(true);
    try {
      await addDoc(collection(db, 'app_accounts'), {
        username: newUsername,
        password: newPassword,
        displayName: newName,
        phoneNumber: newPhone,
        deviceName: newDevice,
        status: 'active',
        createdAt: serverTimestamp()
      });
      notify('تم إنشاء حساب المستخدم بنجاح', 'success');
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewPhone('');
      setNewDevice('');
    } catch (e) {
      notify('فشل في إنشاء الحساب', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleAccountStatus = async (accountId: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'app_accounts', accountId), {
        status: currentStatus === 'active' ? 'banned' : 'active'
      });
      notify('تم تحديث حالة الحساب بنجاح', 'success');
    } catch (e) {
      notify('فشل في تحديث الحالة', 'error');
    }
  };

  const toggleAccountVip = async (accountId: string, currentIsVip: boolean) => {
    try {
      await updateDoc(doc(db, 'app_accounts', accountId), {
        isVip: !currentIsVip
      });
      notify(`تم ${!currentIsVip ? 'تفعيل' : 'إلغاء'} الـ VIP للمستخدم بنجاح`, 'success');
    } catch (e) {
      notify('فشل في تحديث حالة الـ VIP', 'error');
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) return;
    try {
      // For deletion we need deleteDoc (let's assume it's imported or I should add it)
      // Actually updateDoc works for the request, but deletion is safer for "admin cleanup"
      // I'll stick to BAN for now as requested, but I'll add a delete field or use status
      await updateDoc(doc(db, 'app_accounts', accountId), { status: 'deleted' });
      notify('تم حذف الحساب', 'info');
    } catch (e) {
      notify('فشل الحذف', 'error');
    }
  };

  const toggleBan = async (userId: string, currentBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'app_users', userId), {
        status: currentBlocked ? 'active' : 'banned',
        isBlocked: !currentBlocked
      });
      notify(`تم ${currentBlocked ? 'فك حظر' : 'حظر'} المستخدم بنجاح`, 'success');
    } catch (e) {
      notify('فشل في تعديل حالة المستخدم', 'error');
    }
  };

  const sendNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        title: notifTitle,
        message: notifBody,
        timestamp: serverTimestamp(),
        type: 'admin'
      });
      notify('تم إرسال الإشعار لجميع المستخدمين بنجاح!', 'success');
      setNotifTitle('');
      setNotifBody('');
    } catch (e) {
      notify('فشل إرسال الإشعار', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-bold mb-6 flex items-center border-b border-[var(--neon)] pb-2 text-[var(--neon)]">
          <ShieldCheck className="w-5 h-5 ml-2" /> مـركـز إدارة الـحـسـابـات (جـديـد)
        </h3>
        
        <div className="card mb-6 bg-[var(--dim-green)]/10 border-dashed">
          <form onSubmit={createAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="input-group">
                <label className="text-xs mb-1 opacity-70">اسم المستخدم (بالإنجليزي للدخول)</label>
                <input 
                  type="text" 
                  placeholder="USERNAME" 
                  className="input-styled"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="text-xs mb-1 opacity-70">كلمة المرور</label>
                <input 
                  type="text" 
                  placeholder="PASSWORD" 
                  className="input-styled"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="text-xs mb-1 opacity-70">الاسم الكامل (بالعربي)</label>
                <input 
                  type="text" 
                  placeholder="مثال: أحمد محمد" 
                  className="input-styled"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="text-xs mb-1 opacity-70">رقم الهاتف</label>
                <input 
                  type="text" 
                  placeholder="+967..." 
                  className="input-styled text-left"
                  dir="ltr"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="text-xs mb-1 opacity-70">اسم الجهاز</label>
                <input 
                  type="text" 
                  placeholder="مثال: Samsung S22" 
                  className="input-styled"
                  value={newDevice}
                  onChange={(e) => setNewDevice(e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="btn-styled w-full flex items-center justify-center gap-2 py-3"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  إنشاء الحساب
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-3">
           {accounts.filter(a => a.status !== 'deleted').map(acc => (
             <div key={acc.id} className="card flex items-center justify-between border-[var(--neon)]/30">
               <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${acc.status === 'banned' ? 'bg-red-950 text-red-500' : 'bg-green-950 text-green-500'}`}>
                   <User className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-bold">{acc.displayName || acc.username} {acc.phoneNumber && <span className="text-[10px] text-[var(--neon)] opacity-60">({acc.phoneNumber})</span>}</p>
                   <div className="flex items-center gap-2 mt-0.5">
                     <p className="text-[10px] opacity-50 font-mono tracking-widest uppercase">USER: {acc.username} | PASS: {acc.password}</p>
                     {acc.deviceName && <p className="text-[9px] bg-white/5 px-1.5 rounded opacity-40">📱 {acc.deviceName}</p>}
                   </div>
                 </div>
               </div>
               
               <div className="flex gap-2">
                 <button 
                   onClick={() => toggleAccountVip(acc.id, acc.isVip || false)}
                   className={`px-3 py-1 text-xs border rounded transition-all flex items-center gap-1 ${acc.isVip ? 'bg-yellow-900/30 border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-gray-900/30 border-gray-500 text-gray-500'}`}
                 >
                   <Crown className={`${acc.isVip ? 'fill-yellow-500' : ''} w-3 h-3`} />
                   {acc.isVip ? 'مُشترك VIP' : 'تفعيل VIP'}
                 </button>

                 <button 
                   onClick={() => toggleAccountStatus(acc.id, acc.status)}
                   className={`px-3 py-1 text-xs border rounded transition-all ${acc.status === 'banned' ? 'bg-green-900/30 border-green-500 text-green-500' : 'bg-red-900/30 border-red-500 text-red-500'}`}
                 >
                   {acc.status === 'banned' ? 'إلغاء الحظر' : 'حظر الدخول'}
                 </button>
                 <button 
                   onClick={() => deleteAccount(acc.id)}
                   className="p-2 text-red-500 hover:bg-red-500/10 rounded border border-red-500/30"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             </div>
           ))}
           {accounts.filter(a => a.status !== 'deleted').length === 0 && (
             <div className="text-center p-8 border border-dashed border-gray-800 opacity-40 text-sm">
                لا توجد حسابات مسجلة. قم بإنشاء أول حساب بالأعلى.
             </div>
           )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-6 flex items-center border-b border-[var(--neon)] pb-2 text-blue-400">
          <Bell className="w-5 h-5 ml-2" /> إرسال إشعار عام للمشتركين
        </h3>
        <div className="card space-y-4">
          <input 
            type="text" 
            placeholder="عنوان الإشعار..." 
            className="input-styled"
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
          />
          <textarea 
            placeholder="نص الإشعار..." 
            className="input-styled h-24"
            value={notifBody}
            onChange={(e) => setNotifBody(e.target.value)}
          />
          <button 
            onClick={sendNotification}
            disabled={isSending}
            className="btn-styled w-full flex justify-center items-center gap-2"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} إرسال الإشعار للكل
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-6 flex items-center border-b border-[var(--neon)] pb-2 text-red-500">
          <Users className="w-5 h-5 ml-2" /> قائمة المستخدمين والتحكم
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {users.map((u) => (
            <div key={u.id} className="card flex items-center justify-between border-red-500/20">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${u.isBlocked ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-green-500 shadow-[0_0_10px_green]'}`}></div>
                <div>
                  <p className="font-bold text-sm">{u.userName || 'مستخدم مجهول'}</p>
                  <p className="text-[10px] opacity-70 font-mono tracking-tighter">{u.id}</p>
                </div>
              </div>
              <button 
                onClick={() => toggleBan(u.id, u.isBlocked)}
                className={`p-2 rounded-lg border transition-all ${u.isBlocked ? 'bg-green-900/20 border-green-500 text-green-500' : 'bg-red-900/20 border-red-500 text-red-500'}`}
                title={u.isBlocked ? 'فك الحظر' : 'حظر المستخدم'}
              >
                {u.isBlocked ? <ShieldCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center p-10 border border-dashed border-gray-700 opacity-50 text-sm">لا يوجد مستخدمون نشطون حالياً</div>
          )}
        </div>
      </div>
    </div>
  );
}

function DevicesAdmin() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [newDevice, setNewDevice] = useState('');

  useEffect(() => {
    setDevices(store.getDevices());
  }, []);

  const handleAdd = () => {
    if (!newDevice.trim()) return;
    const updated = [...devices, { id: Date.now().toString(), name: newDevice }];
    setDevices(updated);
    store.saveDevices(updated);
    setNewDevice('');
  };

  const handleDelete = (id: string) => {
    const updated = devices.filter(d => d.id !== id);
    setDevices(updated);
    store.saveDevices(updated);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6 flex items-center border-b border-[var(--neon)] pb-2">
        <Smartphone className="w-5 h-5 ml-2" /> إدارة الأجهزة
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex-1 input-group">
          <input 
            type="text" 
            placeholder="اسم الجهاز الجديد..."
            className="input-styled"
            value={newDevice}
            onChange={(e) => setNewDevice(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAdd}
          className="btn-styled flex justify-center items-center py-2 px-6"
        >
          <Plus className="w-5 h-5 ml-1" /> إضافة
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {devices.map(device => (
          <div key={device.id} className="card flex justify-between items-center py-3">
            <span>{device.name}</span>
            <button onClick={() => handleDelete(device.id)} className="text-red-500 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesAdmin() {
  const { notify } = useNotification();
  const [messages, setMessages] = useState<MessageTemplate[]>([]);
  const [reasons, setReasons] = useState<BanReason[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [targetDevice, setTargetDevice] = useState('');
  const [currentText, setCurrentText] = useState('');
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    setMessages(store.getMessages());
    const r = store.getReasons();
    const l = store.getLanguages();
    setReasons(r);
    setLanguages(l);
    setDevices(store.getDevices());
    
    if (r.length > 0) setSelectedReason(r[0].id);
    if (l.length > 0) setSelectedLang(l[0].id);
  }, []);

  useEffect(() => {
    const msg = messages.find(m => 
      m.reasonId === selectedReason && 
      m.languageId === selectedLang && 
      (m.targetDevice || '') === targetDevice.trim()
    );
    setCurrentText(msg ? msg.template : '');
  }, [selectedReason, selectedLang, targetDevice, messages]);

  const handleSave = () => {
    if (!currentText.trim()) return;
    let updated = [...messages];
    const index = updated.findIndex(m => 
      m.reasonId === selectedReason && 
      m.languageId === selectedLang && 
      (m.targetDevice || '') === targetDevice.trim()
    );
    
    if (index >= 0) {
      updated[index].template = currentText;
    } else {
      updated.push({
        id: Date.now().toString(),
        reasonId: selectedReason,
        languageId: selectedLang,
        targetDevice: targetDevice.trim() || undefined,
        template: currentText
      });
    }
    
    setMessages(updated);
    store.saveMessages(updated);
    notify('تم الحفظ بنجاح', 'success');
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting it
    if (window.confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      store.saveMessages(updated);
    }
  };

  const generateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    const settings = store.getSettings();
    if (!settings.externalApiKey) {
      notify('يرجى تزويد مفتاح Gemini API في تبويب الإعدادات أولاً', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: settings.externalApiKey });
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a professional support email template for WhatsApp ban removal. 
        Context: ${aiPrompt}. 
        Language: ${languages.find(l => l.id === selectedLang)?.name || 'Arabic'}.
        Target Device: ${targetDevice || 'General'}.
        Rules: 
        1. Use placeholders like {{PHONE}} for the number and {{DEVICE}} for the model.
        2. Keep it formal and polite.
        3. Only return the final template text, no other text or markdown markers.`
      });
      
      const result = response.text;
      if (result) {
        setCurrentText(result.trim());
        notify('تم توليد القالب بنجاح بواسطة الذكاء الاصطناعي', 'success');
        setAiPrompt('');
      }
    } catch (e) {
      notify('فشل توليد القالب. تأكد من صحة مفتاح API وقوة الاتصال.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const getReasonName = (id: string) => reasons.find(r => r.id === id)?.name || id;
  const getLangName = (id: string) => languages.find(l => l.id === id)?.name || id;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6 border-b border-[var(--neon)] pb-2">
          <h3 className="text-xl font-bold flex items-center">
            <Database className="w-5 h-5 ml-2" /> محرر كودات فك الحظر
          </h3>
          <button 
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-600/20 border border-red-500/30 rounded-lg text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            <Wand2 className="w-4 h-4" /> مساعد إنشاء القوالب
          </button>
        </div>

        {showWizard && (
          <TemplateWizard 
            reasons={reasons} 
            languages={languages} 
            devices={devices} 
            onClose={() => setShowWizard(false)}
            onSave={(newTemplate) => {
              const updated = [...messages, newTemplate];
              setMessages(updated);
              store.saveMessages(updated);
              setShowWizard(false);
              notify('تم إضافة القالب الجديد بنجاح', 'success');
            }}
          />
        )}
        
        <div className="card space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 bg-[var(--neon)] h-full"></div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="input-group flex-1">
              <label className="text-[var(--neon)] block mb-2 font-bold">السبب المستهدف:</label>
              <select 
                className="input-styled"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                {reasons.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            
            <div className="input-group flex-1">
              <label className="text-[var(--neon)] block mb-2 font-bold">اللغة:</label>
              <select 
                className="input-styled"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
              >
                {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="text-[var(--neon)] block mb-1 font-bold">
              تخصيص الرسالة لجهاز معين (اختياري)
            </label>
            <p className="text-xs mb-3 opacity-70">
              اتركه فارغاً لتعميم الرسالة على كل الأجهزة، أو اكتب اسم جهاز مباشر ليتم اعتماده كقالب خاص.
            </p>
            <input 
              type="text" 
              list="devices-list"
              className="input-styled"
              placeholder="جميع الأجهزة الافتراضية"
              value={targetDevice}
              onChange={(e) => setTargetDevice(e.target.value)}
            />
            <datalist id="devices-list">
              {devices.map(d => (
                <option key={d.id} value={d.name} />
              ))}
            </datalist>
          </div>

          <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-lg space-y-3">
             <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" /> مساعد Gemini الذكي لتوليد القوالب
             </div>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 placeholder="اشرح نوع الرسالة المطلوبة (مثال: طلب مهذب لفك حظر بسبب سبام لجهاز سامسونج بالعربي)..." 
                 className="input-styled text-xs bg-purple-900/10 border-purple-500/30"
                 value={aiPrompt}
                 onChange={(e) => setAiPrompt(e.target.value)}
               />
               <button 
                 onClick={generateWithAi}
                 disabled={isGenerating || !aiPrompt.trim()}
                 className="btn-styled bg-purple-600 border-purple-400 text-white px-4 py-2 hover:bg-purple-500 flex items-center justify-center min-w-[100px]"
               >
                 {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'توليد ✨'}
               </button>
             </div>
          </div>

          <div className="input-group pt-4 border-t border-[var(--grid-line)]">
            <label className="text-[var(--neon)] block mb-3 font-bold">
              صيغة الرسالة (استخدم {'{{PHONE}}'} و {'{{DEVICE}}'} للمتغيرات):
            </label>
            <textarea 
              className="input-styled h-56 leading-relaxed resize-y"
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              dir="auto"
              placeholder="اكتب هنا النص المخصص..."
            />
          </div>

          <button 
            onClick={handleSave}
            className="btn-styled w-full flex items-center justify-center py-3 text-lg font-bold shadow-[0_0_15px_rgba(0,255,0,0.2)]"
          >
            <Save className="w-5 h-5 ml-2" /> حفظ النموذج الحالي
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center border-b border-[var(--grid-line)] pb-2 opacity-90">
          <FileText className="w-5 h-5 ml-2" /> القوالب المحفوظة ({messages.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              onClick={() => {
                setSelectedReason(msg.reasonId);
                setSelectedLang(msg.languageId);
                setTargetDevice(msg.targetDevice || '');
              }}
              className="card cursor-pointer hover:bg-[var(--dim-green)]/20 transition-all border border-[var(--grid-line)] flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[var(--dim-green)] text-[var(--neon)] text-xs px-2 py-1 rounded-sm border border-[var(--neon)]">
                      {getLangName(msg.languageId)}
                    </span>
                    <span className="bg-[var(--dark-bg)] border border-[var(--grid-line)] text-xs px-2 py-1 rounded-sm opacity-80">
                      {getReasonName(msg.reasonId)}
                    </span>
                    {msg.targetDevice && (
                      <span className="bg-yellow-900/30 text-yellow-400 border border-yellow-700/50 text-xs px-2 py-1 rounded-sm">
                        {msg.targetDevice}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleDeleteTemplate(msg.id, e)}
                    className="text-red-500 opacity-50 group-hover:opacity-100 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm opacity-70 line-clamp-3 leading-relaxed" dir="auto">
                  {msg.template}
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center p-8 border border-dashed border-[var(--grid-line)] opacity-50">
              لا توجد أي قوالب محفوظة بعد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateWizard({ reasons, languages, devices, onClose, onSave }: { 
  reasons: BanReason[], 
  languages: Language[], 
  devices: Device[], 
  onClose: () => void,
  onSave: (t: MessageTemplate) => void 
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    lang: languages[0]?.id || '',
    reason: reasons[0]?.id || '',
    device: '',
    template: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const handleGenerate = async () => {
    const settings = store.getSettings();
    if (!settings.externalApiKey) {
      alert('يرجى تزويد مفتاح Gemini API في تبويب الإعدادات أولاً');
      return;
    }

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: settings.externalApiKey });
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a professional WhatsApp ban removal template.
        Language: ${languages.find(l => l.id === data.lang)?.name}.
        Reason: ${reasons.find(r => r.id === data.reason)?.name}.
        Device: ${data.device || 'General'}.
        Draft Context: ${prompt || 'Standard formal appeal'}.
        Rules: Use {{PHONE}} and {{DEVICE}} as placeholders. Formal tone. Return ONLY text.`
      });
      const result = response.text;
      if (result) {
        setData({ ...data, template: result.trim() });
        setStep(4);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="card max-w-2xl w-full p-0 overflow-hidden border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="bg-red-950/40 p-4 border-b border-red-500/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-white uppercase tracking-widest text-sm">مساعد إنشاء القوالب الذكي</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Progress Bar */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-800 -z-0"></div>
            <div className="absolute top-1/2 left-0 h-0.5 bg-red-600 transition-all duration-500 -z-0" style={{ width: `${((step-1)/3)*100}%` }}></div>
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold relative z-10 transition-all duration-300 ${step >= s ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-neutral-900 border-neutral-700 text-neutral-500'}`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>

          <div className="min-h-[250px]">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center">
                <Globe className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white">اختر لغة القالب</h4>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  {languages.map(l => (
                    <button 
                      key={l.id}
                      onClick={() => setData({ ...data, lang: l.id })}
                      className={`p-4 rounded-xl border text-sm font-bold transition-all ${data.lang === l.id ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white">حدد سبب الحظر المستهدف</h4>
                <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                  {reasons.map(r => (
                    <button 
                      key={r.id}
                      onClick={() => setData({ ...data, reason: r.id })}
                      className={`p-3 rounded-xl border text-sm font-bold text-right transition-all px-6 ${data.reason === r.id ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center">
                <Smartphone className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white">الجهاز المستهدف (اختياري)</h4>
                <div className="max-w-md mx-auto space-y-4">
                  <input 
                    type="text" 
                    list="wizard-devices"
                    placeholder="اكتب اسم الجهاز أو اتركه فارغاً للكل..."
                    className="input-styled text-center"
                    value={data.device}
                    onChange={(e) => setData({ ...data, device: e.target.value })}
                  />
                  <datalist id="wizard-devices">
                    {devices.map(d => <option key={d.id} value={d.name} />)}
                  </datalist>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">تلميح: تحديد جهاز معين يساعد في قبول الطلب بشكل أسرع</p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-red-500 uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> مـسـودة الـقـالـب الـنـهـائـي
                  </h4>
                  <button 
                    onClick={() => setStep(4.5)} 
                    className="text-[10px] bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30 hover:bg-purple-500 hover:text-white transition-all"
                  >
                    إعادة التوليد بذكاء ✨
                  </button>
                </div>
                <textarea 
                  className="input-styled h-40 text-xs leading-relaxed font-mono"
                  value={data.template}
                  onChange={(e) => setData({ ...data, template: e.target.value })}
                  dir="auto"
                  placeholder="اكتب النص هنا أو استخدم الذكاء الاصطناعي لتوليده..."
                />
              </motion.div>
            )}

            {step === 4.5 && (
              <motion.div initial={{ opacity: 1 }} className="space-y-6 text-center py-4">
                <Sparkles className="w-16 h-16 text-purple-500 mx-auto animate-pulse" />
                <div className="max-w-md mx-auto space-y-4">
                  <h4 className="text-lg font-bold text-white">توليد بواسطة الذكاء الاصطناعي</h4>
                  <p className="text-xs text-neutral-500">أوصف طلبك وسيقوم Gemini بكتابة مسودة احترافية مع جميع المتغيرات المطلوبة.</p>
                  <textarea 
                    className="input-styled h-24 text-center text-sm"
                    placeholder="مثال: طلب رسمي ومهذب بلهجة صادقة لفك حظر رقم سامسونج..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="btn-styled bg-purple-600 border-purple-400 w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> بـدء الـتـولـيـد الـذكـي</>}
                  </button>
                  <button onClick={() => setStep(4)} className="text-xs text-neutral-500 underline">تخطي، سأكتبه يدوياً</button>
                </div>
              </motion.div>
            )}
          </div>

          {step < 4.5 && (
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-red-500/10">
              <button 
                onClick={prev} 
                disabled={step === 1}
                className="flex items-center gap-2 text-neutral-500 hover:text-white disabled:opacity-0 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-xs font-bold">السابق</span>
              </button>
              
              <button 
                onClick={step === 4 ? () => onSave({ id: Date.now().toString(), languageId: data.lang, reasonId: data.reason, targetDevice: data.device || undefined, template: data.template }) : (step === 3 && !data.template ? () => setStep(4.5) : next)}
                disabled={(step === 1 && !data.lang) || (step === 2 && !data.reason)}
                className="flex items-center gap-2 bg-red-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-red-500 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                <span className="text-sm">{step === 4 ? 'حفظ وإغلاق' : (step === 3 && !data.template ? 'توليد النص' : 'التالي')}</span>
                {step === 4 ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReasonsAdmin() {
  const [reasons, setReasons] = useState<BanReason[]>([]);
  const [newReason, setNewReason] = useState('');

  useEffect(() => {
    setReasons(store.getReasons());
  }, []);

  const handleAdd = () => {
    if (!newReason.trim()) return;
    const updated = [...reasons, { id: Date.now().toString(), name: newReason }];
    setReasons(updated);
    store.saveReasons(updated);
    setNewReason('');
  };

  const handleDelete = (id: string) => {
    const updated = reasons.filter(r => r.id !== id);
    setReasons(updated);
    store.saveReasons(updated);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6 flex items-center border-b border-[var(--neon)] pb-2">
        <AlertTriangle className="w-5 h-5 ml-2" /> إدارة أسباب الحظر المحتملة
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex-1 input-group">
          <input 
            type="text" 
            placeholder="اسم السبب الجديد..."
            className="input-styled"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAdd}
          className="btn-styled flex justify-center items-center py-2 px-6"
        >
          <Plus className="w-5 h-5 ml-1" /> إضافة
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {reasons.map(reason => (
          <div key={reason.id} className="card flex justify-between items-center py-3">
            <span>{reason.name}</span>
            <button onClick={() => handleDelete(reason.id)} className="text-red-500 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguagesAdmin() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [newLangId, setNewLangId] = useState('');
  const [newLangName, setNewLangName] = useState('');

  useEffect(() => {
    setLanguages(store.getLanguages());
  }, []);

  const handleAdd = () => {
    if (!newLangId.trim() || !newLangName.trim()) return;
    const updated = [...languages, { id: newLangId, name: newLangName }];
    setLanguages(updated);
    store.saveLanguages(updated);
    setNewLangId('');
    setNewLangName('');
  };

  const handleDelete = (id: string) => {
    const updated = languages.filter(l => l.id !== id);
    setLanguages(updated);
    store.saveLanguages(updated);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6 flex items-center border-b border-[var(--neon)] pb-2">
        <Globe className="w-5 h-5 ml-2" /> إدارة اللغات المتوفرة
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex-1 input-group">
          <input 
            type="text" 
            placeholder="معرف اللغة (مثل: tr، es)"
            className="input-styled"
            value={newLangId}
            onChange={(e) => setNewLangId(e.target.value)}
            dir="ltr"
          />
        </div>
        <div className="flex-2 input-group flex-[2]">
          <input 
            type="text" 
            placeholder="اسم اللغة (مثل: Türkçe)"
            className="input-styled"
            value={newLangName}
            onChange={(e) => setNewLangName(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAdd}
          className="btn-styled flex justify-center items-center py-2 px-6"
        >
          <Plus className="w-5 h-5 ml-1" /> إضافة
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {languages.map(lang => (
          <div key={lang.id} className="card flex justify-between items-center py-3">
            <div>
              <span className="font-bold text-[var(--neon)] ml-2 bg-[var(--dim-green)] px-2 py-1 text-xs whitespace-nowrap">{(lang.id).toUpperCase()}</span>
              <span>{lang.name}</span>
            </div>
            <button onClick={() => handleDelete(lang.id)} className="text-red-500 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsAdmin() {
  const { notify } = useNotification();
  const [settings, setSettings] = useState<AppSettings>({ adminPassword: '' });
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    setSettings(store.getSettings());
  }, []);

  const handleChange = (field: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const checkApiKey = async () => {
    if (!settings.externalApiKey) {
      notify('يرجى إدخال مفتاح API أولاً', 'error');
      return;
    }
    setIsChecking(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: settings.externalApiKey });
      await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "test"
      });
      notify('تم التحقق من مفتاح API: الاتصال ناجح ✅', 'success');
    } catch (e) {
      console.error(e);
      notify('فشل التحقق: مفتاح API غير صالح أو منتهي الصلاحية ❌', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = () => {
    store.saveSettings(settings);
    notify('تم حفظ الإعدادات بنجاح!', 'success');
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6 flex items-center border-b border-[var(--neon)] pb-2">
        <Settings className="w-5 h-5 ml-2" /> إعدادات النظام وربط API
      </h3>
      
      <div className="space-y-6">
        <div className="card space-y-4">
          <h4 className="text-lg font-bold border-b border-[var(--grid-line)] pb-2">كلمات المرور</h4>
          <div className="flex flex-col gap-4">
            <div className="input-group">
              <label>كلمة مرور الإدارة (Admin):</label>
              <input 
                type="text" 
                className="input-styled"
                value={settings.adminPassword}
                onChange={(e) => handleChange('adminPassword', e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="input-group">
              <label>كلمة مرور المشتركين (VIP):</label>
              <input 
                type="text" 
                className="input-styled"
                value={settings.vipPassword || ''}
                onChange={(e) => handleChange('vipPassword', e.target.value)}
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h4 className="text-lg font-bold border-b border-[var(--grid-line)] pb-2">مفاتيح الربط (API Keys)</h4>
          <div className="input-group">
            <label>مفتاح API الخارجي (مثل: OpenAI / Gemini / إلخ):</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="sk-..."
                className="input-styled font-mono flex-1"
                value={settings.externalApiKey || ''}
                onChange={(e) => handleChange('externalApiKey', e.target.value)}
                dir="ltr"
              />
              <button 
                onClick={checkApiKey}
                disabled={isChecking}
                className="btn-styled bg-neutral-900 border-neutral-700 text-xs px-4 flex items-center gap-2"
              >
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                فحص
              </button>
            </div>
            <p className="text-xs opacity-70 mt-1">يُستخدم لربط التطبيق بخدمات الذكاء الاصطناعي الخارجية لتوليد الرسائل المتقدمة.</p>
          </div>
        </div>

        <div className="card space-y-4">
          <h4 className="text-lg font-bold border-b border-[var(--grid-line)] pb-2">إعدادات الـ Webhooks</h4>
          <div className="input-group">
            <label>رابط الـ Webhook (Webhook URL):</label>
            <input 
              type="url" 
              placeholder="https://..."
              className="input-styled font-mono"
              value={settings.webhookUrl || ''}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              dir="ltr"
            />
            <p className="text-xs opacity-70 mt-1">يُستخدم لإرسال إشعارات أو بيانات الطلبات إلى نظام خارجي أو سيرفرك الخاص.</p>
          </div>
        </div>

        <div className="card space-y-4">
          <h4 className="text-lg font-bold border-b border-[var(--grid-line)] pb-2 text-[var(--neon)]">البيانات الفنية للدعم (Technical Info)</h4>
          <div className="input-group">
            <label>قالب البيانات الفنية المرفقة (Support Info Template):</label>
            <p className="text-[10px] opacity-70 mb-2">
              استخدم المتغيرات التالية: {'{{PHONE}}'}, {'{{MODEL}}'}, {'{{BOARD}}'}, {'{{BUILD}}'}, {'{{CARRIER}}'}, {'{{MCC_MNC}}'}, {'{{OS}}'}, {'{{USER_AGENT}}'}, {'{{UUID}}'}, {'{{RANDOM_ID}}'}, {'{{ISO_DATE}}'}, {'{{MFG}}'}
            </p>
            <textarea 
              className="input-styled h-64 font-mono text-[10px] leading-tight"
              value={settings.supportInfoTemplate || ''}
              onChange={(e) => handleChange('supportInfoTemplate', e.target.value)}
              dir="ltr"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="btn-styled w-full flex items-center justify-center py-3 text-lg mt-4"
        >
          <Save className="w-5 h-5 ml-2" /> حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}

