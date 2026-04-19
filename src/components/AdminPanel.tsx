import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, Database, Activity, Smartphone, LogOut, Plus, Trash2, Save, AlertTriangle, Globe, Settings, Download, Eraser, FileText, Users, Bell, Ban, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { store, Device, RequestStat, MessageTemplate, BanReason, Language, AppSettings } from '../store/store';
import { useNotification } from '../contexts/NotificationContext';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase-setup';
import { GoogleGenAI } from "@google/genai";

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const { notify } = useNotification();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'stats' | 'messages' | 'users' | 'devices' | 'reasons' | 'languages' | 'settings'>('stats');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = store.getSettings();
    if (password === settings.adminPassword) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة. اختراق غير مصرح به.');
    }
  };

  const handleResetPassword = () => {
    store.saveSettings({ ...store.getSettings(), adminPassword: '716023560', vipPassword: 'vip' });
    notify('تم إعادة ضبط بيانات الاعتماد لـ الإدارة و الـ VIP.', 'info');
  };

  if (!isAuthenticated) {
    return (
      <div className="tool-pane max-w-md mx-auto w-full mt-20">
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 mx-auto mb-4 text-[var(--neon)] opacity-80" />
          <h2 className="text-2xl font-bold font-mono">ADMIN_ACCESS_REQUIRED</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Enter Password..."
              className="input-styled text-center"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm font-mono text-center">{error}</p>}
          <button 
            type="submit"
            className="btn-styled w-full"
          >
            AUTHORIZE
          </button>
        </form>
        
        <div className="mt-6 text-center border-t border-[var(--neon)]/20 pt-4">
          <p className="text-xs text-gray-500 mb-2">نسيت كلمة المرور؟ اضغط هنا لإعادة ضبط كلمات المرور الخاصة بك إلى القيَم الافتراضية:</p>
          <button 
            type="button" 
            onClick={handleResetPassword}
            className="text-[var(--neon)] opacity-80 hover:opacity-100 underline text-sm transition-opacity"
          >
            إعادة ضبط النظام
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="tool-pane max-w-5xl mx-auto w-full h-[80vh] flex flex-col p-0 overflow-hidden"
    >
      {/* Admin Header */}
      <div className="border-b border-[var(--neon)] p-4 flex justify-between items-center bg-[var(--dim-green)]/30">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-[var(--neon)]" />
          <h2 className="text-xl font-bold">SYSTEM_ROOT</h2>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center text-sm border border-[var(--neon)] text-[var(--neon)] px-3 py-1 hover:bg-[var(--neon)] hover:text-black transition-colors"
        >
          <LogOut className="w-4 h-4 ml-1" /> EXIT
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-l border-[var(--neon)] p-3 flex md:flex-col gap-2 bg-[var(--dark-bg)]/80 overflow-x-auto md:overflow-y-auto shrink-0 hide-scrollbar shadow-[inset_0_0_20px_rgba(0,255,0,0.05)]">
          {[
            { id: 'stats', label: 'الإحصائيات', icon: Activity },
            { id: 'users', label: 'إدارة المستخدمين', icon: Users },
            { id: 'messages', label: 'الرسائل والأكواد', icon: Database },
            { id: 'devices', label: 'خيارات الأجهزة', icon: Smartphone },
            { id: 'reasons', label: 'أسباب الحظر', icon: AlertTriangle },
            { id: 'languages', label: 'اللغات المتوفرة', icon: Globe },
            { id: 'settings', label: 'إعدادات النظام', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative w-full flex items-center gap-3 p-3 text-sm md:text-base rounded-lg transition-all duration-300 outline-none overflow-hidden shrink-0 whitespace-nowrap
                  ${isActive 
                    ? 'bg-[var(--dim-green)] text-[var(--neon)] shadow-[inset_-4px_0_0_var(--neon),0_0_10px_rgba(0,255,0,0.1)]' 
                    : 'text-gray-400 hover:bg-green-900/20 hover:text-gray-200 hover:shadow-[inset_-2px_0_0_rgba(0,255,0,0.5)]'
                  }`}
              >
                <div className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-[var(--neon)]/10' : 'bg-gray-800/50 group-hover:bg-gray-800'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--neon)] drop-shadow-[0_0_5px_var(--neon)]' : 'text-gray-500 group-hover:text-[var(--neon)]/70'}`} />
                </div>
                <span className="font-bold tracking-wide">{tab.label}</span>
                {isActive && (
                  <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'stats' && <StatsView />}
          {activeTab === 'users' && <UsersAdmin />}
          {activeTab === 'messages' && <MessagesAdmin />}
          {activeTab === 'devices' && <DevicesAdmin />}
          {activeTab === 'reasons' && <ReasonsAdmin />}
          {activeTab === 'languages' && <LanguagesAdmin />}
          {activeTab === 'settings' && <SettingsAdmin />}
        </div>
      </div>
    </motion.div>
  );
}

// ...StatsView, DevicesAdmin, MessagesAdmin will be below

function StatsView() {
  const { notify } = useNotification();
  const [stats, setStats] = useState<RequestStat[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    setStats(store.getStats());
    setDevices(store.getDevices());
  }, []);

  const handleExportCSV = () => {
    if (stats.length === 0) {
      notify('لا توجد بيانات لتصديرها', 'error');
      return;
    }
    
    let csv = "ID,Date,Time,Phone,Device,ReasonID\n";
    stats.forEach(s => {
      const dt = new Date(s.timestamp);
      csv += `"${s.id}","${dt.toLocaleDateString()}","${dt.toLocaleTimeString()}","${s.phone}","${s.deviceId}","${s.reasonId}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-unban-stats-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    notify('تم تصدير البيانات بنجاح', 'success');
  };

  const handleClearLogs = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح كافة سجلات الطلبات بشكل نهائي؟ لا يمكن استرجاعها لاحقاً.')) {
      store.clearStats();
      setStats([]);
      notify('تم مسح السجلات بنجاح', 'info');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-2 border-b border-[var(--neon)]">
        <h3 className="text-xl font-bold flex items-center mb-4 sm:mb-0">
          <Activity className="w-5 h-5 ml-2" /> سجل الطلبات الشامل
        </h3>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-styled flex items-center px-3 py-1 text-sm bg-[var(--dim-green)]">
            <Download className="w-4 h-4 ml-1" /> تصدير CSV
          </button>
          <button onClick={handleClearLogs} className="btn-styled flex items-center px-3 py-1 text-sm bg-red-900 border-red-500 text-red-100 hover:bg-red-800">
            <Eraser className="w-4 h-4 ml-1" /> مسح السجل
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-xs opacity-80">إجمالي الطلبات</p>
          <p className="text-2xl font-bold">{stats.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs opacity-80">نجاح (تقديري)</p>
          <p className="text-2xl font-bold">{Math.floor(stats.length * 0.71)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs opacity-80">طلبات اليوم</p>
          <p className="text-2xl font-bold">
            {stats.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs opacity-80">كفاءة النظام</p>
          <p className="text-2xl font-bold">71%</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="border border-[var(--neon)] bg-[var(--dark-bg)]/50 overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-[var(--dim-green)] border-b border-[var(--neon)]">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الهاتف</th>
                <th className="p-3">الجهاز</th>
              </tr>
            </thead>
            <tbody>
              {stats.slice().reverse().map(stat => (
                <tr key={stat.id} className="border-b border-[var(--grid-line)] hover:bg-[var(--dim-green)]/30 transition-colors">
                  <td className="p-3 font-mono">{new Date(stat.timestamp).toLocaleString('en-GB')}</td>
                  <td className="p-3 font-mono" dir="ltr">{stat.phone}</td>
                  <td className="p-3">{stat.deviceId}</td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center opacity-50">لا توجد سجلات بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersAdmin() {
  const { notify } = useNotification();
  const [users, setUsers] = useState<any[]>([]);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'app_users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const u = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(u);
    });
    return () => unsubscribe();
  }, []);

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
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-6 flex items-center border-b border-[var(--neon)] pb-2 text-[var(--neon)]">
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
  
  const [selectedReason, setSelectedReason] = useState(reasons[0]?.id || '1');
  const [selectedLang, setSelectedLang] = useState(languages[0]?.id || 'ar');
  const [targetDevice, setTargetDevice] = useState('');
  const [currentText, setCurrentText] = useState('');
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMessages(store.getMessages());
    setReasons(store.getReasons());
    setLanguages(store.getLanguages());
    setDevices(store.getDevices());
  }, []);

  // Update selected dropdowns when reasons/languages are loaded if empty
  useEffect(() => {
    if (!selectedReason && reasons.length > 0) setSelectedReason(reasons[0].id);
    if (!selectedLang && languages.length > 0) setSelectedLang(languages[0].id);
  }, [reasons, languages, selectedReason, selectedLang]);

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
        <h3 className="text-xl font-bold mb-6 flex items-center border-b border-[var(--neon)] pb-2">
          <Database className="w-5 h-5 ml-2" /> محرر كودات فك الحظر
        </h3>
        
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
  
  useEffect(() => {
    setSettings(store.getSettings());
  }, []);

  const handleChange = (field: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
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
            <input 
              type="password" 
              placeholder="sk-..."
              className="input-styled font-mono"
              value={settings.externalApiKey || ''}
              onChange={(e) => handleChange('externalApiKey', e.target.value)}
              dir="ltr"
            />
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

