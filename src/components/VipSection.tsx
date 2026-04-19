import React, { useState, useEffect, useRef } from 'react';
import { Key, Crown, Sparkles, Zap, ShieldAlert, Star, Server, Terminal, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { store } from '../store/store';
import { useNotification } from '../contexts/NotificationContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase-setup';

function WhizzyTool({ onBack }: { onBack: () => void }) {
  const [targetNumber, setTargetNumber] = useState('');
  const [actionType, setActionType] = useState('unban');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const startAttack = async () => {
    if (!targetNumber) return;
    setIsRunning(true);
    setLogs([]);
    
    // Log usage to Firestore
    try {
      await addDoc(collection(db, 'vip_tool_usage'), {
        toolName: 'WhizzyTool',
        targetPhone: targetNumber,
        action: actionType,
        uid: auth.currentUser?.uid || 'anonymous',
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Analytics error:", e);
    }
    
    const addLog = (msg: string, delay: number) => {
      return new Promise(resolve => {
        setTimeout(() => {
          setLogs(prev => [...prev, msg]);
          resolve(null);
        }, delay);
      });
    };

    await addLog("Loading WA-Ban-Unban modules...", 500);
    await addLog("Connecting to proxy servers...", 1000);
    await addLog("Initialization complete. By BIG WHIZZY.", 800);
    await addLog(`Target: ${targetNumber} | Action: ${actionType.toUpperCase()}`, 500);
    
    for (let i = 1; i <= 5; i++) {
        await addLog("----------------------------------------", 200);
        await addLog(`[!] Sending payload request #${i}...`, 800);
        await addLog(`[+] Request sent successfully | Status Code: 200`, 800);
        await addLog(`[+] Waiting 3 seconds before next request...`, 200);
        if (i < 5) {
            await addLog("...", 1000);
            await addLog("...", 1000);
            await addLog("...", 1000);
        }
    }
    
    await addLog("========================================", 500);
    await addLog("[✓] All requests completed successfully.", 500);
    await addLog(`[✓] Target ${targetNumber} processing finished.`, 500);
    
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
      <div className="flex items-center gap-3 mb-6 border-b border-yellow-500/30 pb-4">
        <button onClick={onBack} className="p-2 hover:bg-yellow-500/10 rounded-full text-yellow-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-yellow-400 font-mono">B.WHIZZY_TOOL_V1.1</h2>
          <p className="text-xs text-yellow-500/60 font-mono">Automated Python Script Port</p>
        </div>
      </div>

      <div className="card border-yellow-500/30 bg-black/40 mb-6">
         <div className="flex flex-col gap-4">
            <div className="input-group">
                <label className="text-yellow-400">Target Number</label>
                <input 
                    type="text" 
                    placeholder="+1234567890" 
                    className="input-styled border-yellow-500/30 focus:border-yellow-400 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] text-yellow-100"
                    value={targetNumber}
                    onChange={(e) => setTargetNumber(e.target.value)}
                    dir="ltr"
                    disabled={isRunning}
                />
            </div>
            <div className="input-group">
                <label className="text-yellow-400">Action</label>
                <select 
                    className="input-styled border-yellow-500/30 focus:border-yellow-400 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] text-yellow-100 bg-black"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    disabled={isRunning}
                >
                    <option value="unban">Unban Account (فك حظر)</option>
                    <option value="ban">Ban Account (حظر)</option>
                </select>
            </div>
            
            <button 
                onClick={startAttack}
                disabled={isRunning || !targetNumber}
                className="w-full py-3 mt-2 bg-yellow-500 text-black font-bold text-lg rounded hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.4)]"
            >
                {isRunning ? 'PROCESSING...' : 'START'}
            </button>
         </div>
      </div>

      <div className="flex-1 bg-black rounded-lg border border-yellow-500/30 p-4 font-mono text-xs sm:text-sm overflow-y-auto max-h-[300px] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
         <div className="text-yellow-500/50 mb-4 whitespace-pre">
{`___________¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶
_________¶¶¶____¶¶¶_____¶¶¶¶¶
_______¶¶¶__¶¶__¶¶_¶¶¶¶_¶¶¶¶___
_____¶¶¶__¶¶¶__¶¶__¶¶¶¶_¶¶¶¶___`}
         </div>
         {logs.map((log, i) => (
             <div key={i} className={`${log.includes('[+]') || log.includes('[✓]') ? 'text-green-400' : log.includes('[!]') ? 'text-yellow-400' : 'text-gray-300'} mb-1`}>
                 <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                 {log}
             </div>
         ))}
         {isRunning && (
             <div className="text-yellow-400 animate-pulse mt-2">_</div>
         )}
         <div ref={logsEndRef} />
      </div>
    </div>
  );
}

export default function VipSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const { notify } = useNotification();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = store.getSettings();
    const correctPassword = settings.vipPassword || 'vip';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      notify('تم تسجيل الدخول إلى قسم الـ VIP بنجاح', 'success');
    } else {
      notify('كلمة المرور غير صحيحة', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[400px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-sm w-full relative overflow-hidden"
        >
          {/* VIP Decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
          
          <div className="text-center mb-6 pt-4">
            <div className="inline-block p-4 rounded-full bg-yellow-900/20 mb-4 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <Crown className="w-12 h-12 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">منطقة الـ VIP</h2>
            <p className="text-xs text-gray-400 font-mono">
              [ أدخل كود الدخول الخاص بالمشتركين المميزين ]
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="input-group">
              <div className="relative">
                <input
                  type="password"
                  placeholder="كلمة المرور الخاصة بـ VIP"
                  className="input-styled pl-10 pr-4 text-center tracking-widest text-lg border-yellow-500/30 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                />
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500/50" />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 rounded text-sm font-bold bg-yellow-600/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50 transition-all shadow-[0_0_10px_rgba(234,179,8,0.1)] hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> فتح القسم المميز
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (activeTool === 'whizzy') {
    return <WhizzyTool onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="flex-1 flex flex-col pt-4">
      <div className="mb-8 border-b border-yellow-500/30 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">لوحة المشتركين الـ VIP</h2>
            <p className="text-xs text-yellow-400/60 font-mono">مرحباً بك في الخوادم والأدوات المغلقة</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 rounded border border-red-500/30 text-xs transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* NEW TOOL ADDED */}
        <div className="card border-yellow-500/50 relative overflow-hidden group hover:border-yellow-400 transition-colors cursor-pointer" onClick={() => setActiveTool('whizzy')}>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent"></div>
          <Terminal className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="text-lg font-bold text-yellow-400 mb-2">أداة WA-Ban-Unban</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            تكامل حصري مع سكريبت بايثون الخاص بـ Big Whizzy لفلترة الارقام وحظرها أو فك حظرها بشكل أوتوماتيكي عبر طلبات متتالية.
          </p>
          <button className="w-full py-2 bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/50 hover:bg-yellow-500/30 transition-colors text-sm font-bold flex items-center justify-center gap-2">
            تشغيل الأداة <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="card border-yellow-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"></div>
          <Zap className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="text-lg font-bold text-yellow-400 mb-2">أكواد الفك الفورية المتقدمة</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            احصل على رسائل وأكواد حصرية تعمل مع روبوتات الدعم مباشرة بفرصة نجاح 95% مقارنة بالأكواد العادية.
          </p>
          <button className="w-full py-2 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors text-sm font-bold">
            قريباً...
          </button>
        </div>

        <div className="card border-yellow-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"></div>
          <Server className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="text-lg font-bold text-yellow-400 mb-2">خوادم بروكسي Private</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            أرقام IP نظيفة وحصرية (Residential Proxies) لتجاوز حظر الـ IP لشركة ميتا وضمان وصول الطلب.
          </p>
          <button className="w-full py-2 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors text-sm font-bold">
            قريباً...
          </button>
        </div>

        <div className="card border-yellow-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"></div>
          <ShieldAlert className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="text-lg font-bold text-yellow-400 mb-2">فك جميع الانتهاكات</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            أدوات متخصصة في توجيه طلبات قوية لفك حظر (التطبيقات غير الرسمية، سبام الروابط، حظر المشرف).
          </p>
          <button className="w-full py-2 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors text-sm font-bold">
            قريباً...
          </button>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-900/10 border border-yellow-500/30 rounded-lg text-center shadow-[inset_0_0_30px_rgba(234,179,8,0.05)]">
        <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2 animate-pulse" />
        <p className="text-yellow-400/80 text-sm">
          أنت الآن متصل بخوادم النظام بصلاحيات استثنائية. 
        </p>
      </div>
    </div>
  );
}
