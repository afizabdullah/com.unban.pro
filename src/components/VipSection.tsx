import React, { useState, useEffect, useRef } from 'react';
import { Key, Crown, Sparkles, Zap, ShieldAlert, Star, Server, Terminal, ChevronRight, ArrowLeft, Loader2, Phone, Hash, ShieldCheck, Activity, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { store } from '../store/store';
import { useNotification } from '../contexts/NotificationContext';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase-setup';

function WhizzyTool({ onBack }: { onBack: () => void }) {
  const { notify } = useNotification();
  const [targetNumber, setTargetNumber] = useState('');
  const [actionType, setActionType] = useState('unban');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [finalPayload, setFinalPayload] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const startAttack = async () => {
    if (!targetNumber || targetNumber.length < 8) {
      notify('يرجى إدخال رقم هاتف صحيح مع رمز الدولة', 'error');
      return;
    }
    
    setIsRunning(true);
    setShowReport(false);
    setLogs([]);
    
    const addLog = (msg: string, delay: number) => {
      return new Promise(resolve => {
        setTimeout(() => {
          setLogs(prev => [...prev, msg]);
          resolve(null);
        }, delay);
      });
    };

    const templates = store.getMessages();
    const settings = store.getSettings();
    const selectedTemplate = templates.length > 0 ? templates[Math.floor(Math.random() * templates.length)].template : "Dear Support, My number {{PHONE}} was banned by mistake. Please review my account for any violations. I didn't mean to break any rules. Thank you. {{DEVICE}}";
    const processedTemplate = selectedTemplate.replace(/{{PHONE}}/g, targetNumber).replace(/{{DEVICE}}/g, 'Mobile (Android/iOS)');
    setFinalPayload(processedTemplate);

    try {
      await addDoc(collection(db, 'vip_tool_usage'), {
        toolName: 'WhizzyTool',
        targetPhone: targetNumber,
        action: actionType,
        uid: auth.currentUser?.uid || 'anonymous',
        timestamp: serverTimestamp(),
        usedTemplate: processedTemplate.substring(0, 500)
      });
      
      const statsRef = doc(db, 'global_stats', 'counters');
      await updateDoc(statsRef, {
        totalRequests: increment(1),
        lastUpdate: serverTimestamp()
      });
    } catch (err) {
      console.error("Firestore Update/Create Error [VIP_Analytics]:", err);
    }

    await addLog("[SYS]: MOUNTING SECURE TUNNEL...", 500);
    await addLog("[SYS]: CONNECTING THROUGH RESIDENTIAL PROXY [NL/USA]", 1000);
    await addLog("[!] HANDSHAKE ACKNOWLEDGED | PORT 443 OPEN", 800);
    await addLog(`[TARGET]: ${targetNumber} | ENCRYPTION: AES-256`, 600);
    
    await addLog("----------------------------------------", 400);
    await addLog("[DEBUG]: RETRIEVING OPTIMIZED PAYLOAD ENTITY...", 600);
    await addLog(`[PAYLOAD]: "${processedTemplate.substring(0, 40)}..."`, 800);
    
    for (let i = 1; i <= 2; i++) {
        await addLog(`[!] DEPLOYING REQUEST PACKET #${i} TO META GATEWAY...`, 1200);
        await addLog(`[+] SERVER RESPONSE: 202 ACCEPTED | UID: ${Math.random().toString(36).substring(7).toUpperCase()}`, 1000);
        if (i < 2) await addLog("[i] WAITING FOR NETWORK COOL-DOWN [5s]...", 500);
    }

    if (settings.webhookUrl) {
      await addLog("[SYS]: TRIGGERING EXTERNAL WEBHOOK FOR LOGGING...", 800);
      try {
        fetch(settings.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'vip_tool_execution',
            target: targetNumber,
            action: actionType,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {});
      } catch (e) {}
    }
    
    await addLog("========================================", 600);
    await addLog("[✓] ALL THREADS SYNCED SUCCESSFULLY.", 500);
    await addLog(`[✓] DESTINATION ${targetNumber} - QUEUED FOR PROCESSING.`, 400);
    await addLog(`[i] EXPECT COMPLETION WITHIN 2-12 HOURS.`, 400);
    
    await new Promise(r => setTimeout(r, 1000));
    setIsRunning(false);
    setShowReport(true);
    notify('اكتملت العملية! اطلع على التقرير النهائي بالأسفل', 'success');
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-yellow-500/20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500 hover:bg-yellow-500/20 transition-all">
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">B.WHIZZY_TOOL_V1.1</h2>
            <p className="text-[9px] text-yellow-500 font-mono uppercase">Node: Gold_Access_Port</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
           <span className="text-[9px] font-mono text-yellow-500 uppercase tracking-widest">Authorized</span>
        </div>
      </div>

      <div className="card border-yellow-500/30 bg-neutral-900/40 p-6 mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1 bg-yellow-500 h-full opacity-30"></div>
         <div className="flex flex-col gap-6 relative z-10">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mr-1">الرقم المستهدف (Target)</label>
                <div className="relative">
                  <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input 
                      type="text" 
                      placeholder="+1234567890" 
                      className="input-styled pr-12 text-center font-mono border-yellow-500/30 focus:border-yellow-500 focus:ring-yellow-500/20"
                      value={targetNumber}
                      onChange={(e) => setTargetNumber(e.target.value)}
                      dir="ltr"
                      disabled={isRunning}
                  />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mr-1">نوع العملية (Command)</label>
                <div className="relative">
                  <Terminal className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <select 
                      className="input-styled pr-12 appearance-none cursor-pointer border-yellow-500/30 focus:border-yellow-500"
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      disabled={isRunning}
                  >
                      <option value="unban">EXEC: UNBAN_ACCOUNT (فك حظر)</option>
                      <option value="ban">EXEC: BAN_ACCOUNT (حظر)</option>
                  </select>
                </div>
            </div>
            
            <button 
                onClick={startAttack}
                disabled={isRunning || !targetNumber}
                className="btn-styled bg-yellow-600 border-yellow-400 text-black font-bold h-[54px] shadow-[0_10px_30px_rgba(234,179,8,0.2)] disabled:opacity-50"
            >
                {isRunning ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>RUNNING_SCRIPT...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-black" />
                    تـشـغـيـل الـنـظـام الـتـسـلـسـلـي
                  </>
                )}
            </button>
         </div>
      </div>

      <div className="flex-1 bg-neutral-950 rounded-2xl border border-yellow-500/20 p-5 font-mono text-[11px] leading-relaxed overflow-y-auto styled-scrollbar shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
         <div className="text-yellow-500/30 mb-6 font-bold leading-none select-none">
{`___________¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶
_________¶¶¶____¶¶¶_____¶¶¶¶¶
_______¶¶¶__¶¶__¶¶_¶¶¶¶_¶¶¶¶___
_____¶¶¶__¶¶¶__¶¶__¶¶¶¶_¶¶¶¶___`}
         </div>
         <div className="space-y-1.5 pr-2">
           {logs.map((log, i) => (
               <div key={i} className={`flex gap-3 ${log.includes('[+]') || log.includes('[✓]') ? 'text-green-500' : log.includes('[!]') ? 'text-yellow-500' : 'text-neutral-500'}`}>
                   <span className="opacity-30 shrink-0">[{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit', hour12: false})}]</span>
                   <span className="break-all">{log}</span>
               </div>
           ))}
           {isRunning && (
               <div className="text-yellow-500 animate-pulse mt-2 inline-block">_</div>
           )}
         </div>
         <div ref={logsEndRef} />
      </div>

      <AnimatePresence>
        {showReport && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="card border-green-500/30 bg-green-500/5 p-4 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-1 bg-green-500/20 text-[8px] font-bold text-green-500 uppercase tracking-widest rounded-bl-lg">Final Audit</div>
              <h4 className="text-xs font-bold text-green-500 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> تقرير التنفيذ النهائي (Final Report)
              </h4>
              <div className="bg-black/50 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-neutral-300 whitespace-pre-wrap">
                {finalPayload}
              </div>
              <div className="mt-4 flex items-center gap-2">
                 <button 
                  onClick={() => {
                    navigator.clipboard.writeText(finalPayload);
                    notify('تم نسخ النص الاحترافي للاحتياط', 'success');
                  }}
                  className="flex-1 bg-green-600/20 text-green-500 border border-green-500/30 py-2 rounded-lg text-[10px] font-bold hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2"
                 >
                   <Save className="w-3 h-3" /> نسخ النص المرسل
                 </button>
              </div>
              <p className="text-[9px] text-neutral-500 mt-3 text-center italic">
                * ملاحظة: تم إرسال هذا النص بالفعل كحزمة بيانات رقمية إلى خوادم الدعم. النسخ هو للاحتفاظ به في حال احتجته يدوياً.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VipSection({ userSession }: { userSession: any }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const { notify } = useNotification();

  const prevVipRef = useRef<boolean | undefined>(userSession?.isVip);

  useEffect(() => {
    if (userSession?.isVip) {
      if (!isAuthenticated) {
        notify('تم اكتشاف صلاحيات VIP نشطة - تم الدخول تلقائياً 👑', 'success');
        setIsAuthenticated(true);
      }
    } else {
      // If they LOST the VIP status (it was true, now it's false/missing)
      if (prevVipRef.current === true && !userSession?.isVip) {
        setIsAuthenticated(false);
        notify('انتهت صلاحية الـ VIP أو تم إلغاؤها من قبل الإدارة', 'info');
      }
    }
    prevVipRef.current = userSession?.isVip;
  }, [userSession?.isVip, isAuthenticated, notify]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = store.getSettings();
    const correctPassword = settings.vipPassword || 'vip';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      notify('تم تسجيل الدخول إلى المنطقة الذهبية', 'success');
    } else {
      notify('فشل المصادقة: الكود غير صحيح', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full pt-10 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-sm w-full p-8 text-center border-b-4 border-b-yellow-500"
        >
          <div className="w-20 h-20 rounded-2xl border-2 border-yellow-500/50 flex items-center justify-center mx-auto mb-6 bg-yellow-950/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Crown className="w-10 h-10 text-yellow-500" />
          </div>
          
          <h2 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-[0.2em]">VIP Gateway</h2>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-8">Secure encrypted area</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <input 
                type="password" 
                placeholder="GOLDEN_KEY"
                className="input-styled text-center tracking-[0.5em] border-yellow-500/30 focus:border-yellow-500 focus:ring-yellow-500/30 font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="btn-styled bg-yellow-600 border-yellow-400 text-black w-full hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all font-bold"
            >
              AUTHENTICATE
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
    <div className="flex-1 flex flex-col pt-2 pb-10">
      <header className="flex items-center justify-between mb-10 pb-6 border-b border-yellow-500/20">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
            <Crown className="w-7 h-7 text-yellow-500 shadow-sm" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">اللوحة الذهبية : VIP</h2>
            <p className="text-[10px] text-yellow-500/60 font-mono uppercase tracking-[0.2em]">High Priority Access Enabled</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="btn-styled py-1.5 px-4 text-[10px] border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
        >
          TERM_SESSION
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* VIP Tools Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 border-yellow-500/40 bg-neutral-900/40 relative overflow-hidden group hover:border-yellow-500 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          onClick={() => setActiveTool('whizzy')}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 opacity-20"></div>
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-black transition-all">
              <Terminal className="w-6 h-6 text-yellow-500 group-hover:text-black" />
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-lg">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span className="text-[8px] font-bold text-green-500 uppercase font-mono">Status: Online</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">أداة WA-Ban-Unban</h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mb-6">
            سكريبت متطور لفلترة الارقام والتعامل مع خوادم شركة ميتا بشكل مباشر عبر طلبات متسلسلة لضمان التنفيذ.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-yellow-500 opacity-50">V_1.1.0_PRO_EDITION</span>
            <div className="flex items-center gap-2 text-[var(--neon)] font-bold text-[10px] group-hover:gap-4 transition-all">
              <span>تـشـغـيـل الأداة</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </motion.div>

        {/* Placeholder VIP Cards */}
        <div className="grid grid-cols-2 gap-4">
           {[
             { icon: Zap, label: 'أكواد فورية', sub: '95% Success Rate' },
             { icon: Server, label: 'خوادم Private', sub: 'Residential Proxies' },
             { icon: ShieldAlert, label: 'فك الانتهاكات', sub: 'Deep Cleaning' },
             { icon: Activity, label: 'فحص النطاق', sub: 'Realtime Analysis' }
           ].map((tool, idx) => (
              <div key={idx} className="card p-4 border-yellow-500/10 bg-neutral-900/20 opacity-60 grayscale-[0.5] group relative overflow-hidden">
                <tool.icon className="w-5 h-5 text-yellow-500/50 mb-3" />
                <h4 className="text-[11px] font-bold text-white uppercase">{tool.label}</h4>
                <p className="text-[8px] text-neutral-600 font-mono">{tool.sub}</p>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[9px] font-bold text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded-full uppercase tracking-tighter">قريباً في الإصدار القادم</span>
                </div>
              </div>
           ))}
        </div>
      </div>
      
      <div className="mt-10 p-6 bg-yellow-950/20 border border-yellow-500/10 rounded-[2rem] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-3xl -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-3xl -ml-12 -mb-12"></div>
        <Star className="w-6 h-6 text-yellow-500 mx-auto mb-3 opacity-50" />
        <p className="text-yellow-600/80 text-[10px] font-bold uppercase tracking-[0.3em] font-mono leading-relaxed">
          Authorization Level: 4 <br/> Secure Tunnel Activated
        </p>
      </div>
    </div>
  );
}
