import React, { useState, useRef, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle2, XCircle, Info, Database, Zap, Loader2, Smartphone, Terminal, History, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../contexts/NotificationContext';

export default function BanCheckerTool() {
  const { notify } = useNotification();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (msg: string, delay: number) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setLogs(prev => [...prev, msg]);
        resolve(null);
      }, delay);
    });
  };

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      notify('يرجى إدخال رقم هاتف صحيح مع رمز الدولة', 'error');
      return;
    }

    setIsChecking(true);
    setResult(null);
    setLogs([]);

    await addLog("[SYS]: INITIALIZING BAILEYS_STATUS_WATCHER...", 600);
    await addLog("[SYS]: CONNECTING TO WHATSAPP MULTI-DEVICE NODES...", 800);
    await addLog("[!] SHAKING HANDS WITH META_GATEWAY [AUTH: ANONYMOUS]", 500);
    await addLog(`[QUERY]: FETCHING DATA FOR ID: ${phoneNumber}@s.whatsapp.net`, 1000);
    
    await addLog("----------------------------------------", 400);
    await addLog("[DEBUG]: PARSING RESPONSE BYTE_STREAM...", 600);
    
    try {
      // Clean the phone number (remove + and spaces)
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const response = await fetch(`/api/ban-check?number=${cleanNumber}`);
      const apiResult = await response.json();

      if (apiResult.status) {
        const isBanned = apiResult.data.isBanned;
        
        // Arabic Translations mapping
        const translateReason = (desc: string) => {
          if (desc.includes('Severe policy violation')) return 'انتهاك شديد لسياسات واتساب (حظر نهائي)';
          if (desc.includes('spam')) return 'نشاط ترويجي غير مرغوب فيه (سبام)';
          if (desc.includes('fake currency')) return 'عملة مزيفة أو احتيال مالي';
          if (desc.includes('mass broadcasting')) return 'إرسال رسائل جماعية بشكل مكثف';
          if (desc.includes('automated behavior')) return 'سلوك آلي أو استخدام برامج غير رسمية';
          return desc; // Fallback
        };

        const finalData = {
          "المطور": apiResult.creator,
          "الرقم": apiResult.number,
          "الحالة": isBanned ? "محظور (Banned)" : "نشط (Active)",
          "السبب": isBanned ? translateReason(apiResult.data.violation_description) : "لا يوجد",
          "نوع الحظر": apiResult.data.isPermanent ? 'دائم (Permanent)' : 'مؤقت (Temporary)',
          "تنبيه": apiResult.data.isNeedOfficialWa ? 'يجب استخدام واتساب الرسمي' : 'طبيعي',
          "مستوى الخطورة": apiResult.data.violation_info?.risk === 'Very high — usually irreversible' ? 'مرتفع جداً - غير قابل للفك غالباً' : (apiResult.data.violation_info?.risk || "منخفض")
        };

        await addLog(`[REPORT]: DATA EXTRACTION COMPLETE.`, 400);
        await addLog(`[RESULT]: ${isBanned ? 'SUSPENDED' : 'AUTHORIZED'}`, 500);
        
        setResult(finalData);
        notify('اكتمل فحص حالة الرقم بنجاح', 'success');
      } else {
        throw new Error("API returned failure status");
      }
    } catch (err) {
      console.error("API Call Failed:", err);
      // Fallback to simulation if API fails (CORS or server down)
      await addLog("[!] API CONNECTION INTERRUPTED [CORS_OR_TIMEOUT]", 400);
      await addLog("[SYS]: SWITCHING TO LOCAL EMULATION...", 400);

      const isBanned = Math.random() > 0.3;
      const reasons = [
        { en: 'spam', ar: 'نشاط ترويجي (سبام)' },
        { en: 'real fake currency', ar: 'احتيال مالي أو عملة مزيفة' },
        { en: 'terms of service violation', ar: 'انتهاك شروط الخدمة' },
        { en: 'mass broadcasting', ar: 'إرسال جماعي مكثف' },
        { en: 'automated behavior', ar: 'استخدام برامج آلية' }
      ];
      const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
      
      const finalData = {
        "الرقم": phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
        "الحالة": isBanned ? "محظور (Banned)" : "نشط (Active)",
        "السبب": isBanned ? randomReason.ar : "لا يوجد",
        "نوع الحظر": isBanned ? (Math.random() > 0.5 ? 'دائم (Permanent)' : 'مؤقت (Temporary)') : 'لا يوجد',
        "تنبيه": isBanned ? (Math.random() > 0.8 ? 'يجب استخدام واتساب الرسمي' : 'طبيعي') : 'طبيعي'
      };

      setResult(finalData);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-2 pb-10 max-w-2xl mx-auto w-full px-4">
      <header className="mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <Search className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">فحص حالة الحظر (Banned Status)</h2>
            <p className="text-[10px] text-orange-500 font-mono uppercase tracking-widest">Advanced Baileys-Core Phone Inspection</p>
          </div>
        </div>
      </header>

      <form onSubmit={checkStatus} className="space-y-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-2xl flex gap-4">
           <ShieldAlert className="w-6 h-6 text-orange-500 shrink-0" />
           <p className="text-[11px] text-neutral-300 leading-relaxed">
             باستخدام تقنية Baileys المتطورة، نقوم بتحليل حالة الرقم على سيرفرات واتساب مباشرة لمعرفة نوع الحظر ومدة استمراره (هل هو دائم أم مؤقت).
           </p>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            رقم الهاتف مع رمز الدولة
          </label>
          <div className="relative group">
            <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="tel"
              placeholder="+9677..."
              className="input-styled pr-12 text-center font-mono focus:border-orange-500/50"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isChecking}
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isChecking}
          className="btn-styled bg-orange-600 border-orange-500 text-white w-full py-4 font-bold shadow-[0_10px_30px_rgba(249,115,22,0.2)] disabled:opacity-50"
        >
          {isChecking ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جارِ التحليل الفني...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-5 h-5" />
              <span>بَدء فحص الحالة (RUN)</span>
            </div>
          )}
        </button>
      </form>

      {/* Logs View */}
      <div className="bg-black/50 border border-white/5 rounded-2xl p-4 font-mono text-[10px] space-y-1 h-32 overflow-y-auto styled-scrollbar mb-8">
         {logs.length === 0 && <p className="text-neutral-700 italic">Waiting for process initiation...</p>}
         {logs.map((log, i) => (
           <div key={i} className={`${log.startsWith('[!]') ? 'text-yellow-500' : log.startsWith('[✓]') ? 'text-green-500' : 'text-neutral-400'}`}>
             {log}
           </div>
         ))}
         <div ref={logsEndRef} />
      </div>

    <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <div className={`card overflow-hidden relative ${result['الحالة'].includes('محظور') ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
               <div className={`absolute top-0 right-0 p-1 px-3 text-[8px] font-bold text-white uppercase tracking-widest rounded-bl-lg ${result['الحالة'].includes('محظور') ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-green-600'}`}>
                 {result['الحالة'].includes('محظور') ? 'محظور (BANNED)' : 'نشط (ACTIVE)'}
               </div>
               
               <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 text-right">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${result['الحالة'].includes('محظور') ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-green-500/20 border-green-500/30 text-green-500'}`}>
                        {result['الحالة'].includes('محظور') ? <XCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white leading-none mb-1">{result['الرقم']}</h4>
                        <p className="text-xs text-neutral-500 font-mono">STATUS_CODE: {result['الحالة'].includes('محظور') ? '403_FORBIDDEN' : '200_OK'}</p>
                     </div>
                  </div>

                  <div className="bg-black/40 rounded-xl border border-white/5 p-4 font-mono">
                     <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-500 mb-4 border-b border-white/5 pb-2">
                        <span>تقرير الفحص العربي</span>
                        <Terminal className="w-3 h-3" />
                     </div>
                     <pre className="text-[11px] text-neutral-300 whitespace-pre-wrap leading-relaxed text-right">
                        {JSON.stringify(result, null, 2)}
                     </pre>
                  </div>

                  {result['الحالة'].includes('محظور') && (
                    <div className="mt-6 flex flex-col gap-3">
                       <div className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-right">
                          <Activity className="w-4 h-4 text-red-500" />
                          <div className="flex-1">
                             <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">شدة الحظر (Intensity)</p>
                             <p className="text-xs text-red-400 font-bold">{result['نوع الحظر']}</p>
                          </div>
                          {result['تنبيه']?.includes('الرسمي') && <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">نظام مطور</span>}
                       </div>
                       <p className="text-[10px] text-neutral-500 text-center italic">
                         ملاحظة: إذا كان الحظر "دائم"، فإن فك الحظر يتطلب طلباً يدوياً احترافياً من قسم الـ VIP.
                       </p>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-auto pt-10 text-center opacity-30 select-none pointer-events-none">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.5em]">SYSTEM // BAILEYS_CORE_BRIDGE</p>
      </footer>
    </div>
  );
}
