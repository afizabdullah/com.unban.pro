import React, { useState, useEffect } from 'react';
import { Shield, Send, Terminal, Smartphone, Key, FileText, Copy, Check, Info, Loader2, Globe, AlertTriangle, Activity, PhoneOff } from 'lucide-react';
import { motion } from 'motion/react';
import { store, Device, BanReason, Language, MessageTemplate } from '../store/store';
import { useNotification } from '../contexts/NotificationContext';

import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot, doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase-setup';

export default function UserView({ userSession }: { userSession: any }) {
  const { notify } = useNotification();
  const [phone, setPhone] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [reasonId, setReasonId] = useState('');
  const [languageId, setLanguageId] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('support@support.whatsapp.com');
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [reasons, setReasons] = useState<BanReason[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [messages, setMessages] = useState<MessageTemplate[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [globalCounters, setGlobalCounters] = useState<any>(null);

  const supportEmails = [
    { id: 'general', name: 'دعم واتساب العام', email: 'support@support.whatsapp.com' },
    { id: 'business', name: 'دعم واتساب للأعمال', email: 'smb@support.whatsapp.com' },
    { id: 'android', name: 'دعم أندرويد', email: 'android_web@support.whatsapp.com' },
    { id: 'iphone', name: 'دعم آيفون', email: 'iphone_web@support.whatsapp.com' },
    { id: 'web', name: 'دعم واتساب ويب', email: 'webclient_web@support.whatsapp.com' },
  ];

  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [includeSupportInfo, setIncludeSupportInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setDevices(store.getDevices());
    setReasons(store.getReasons());
    setLanguages(store.getLanguages());
    setMessages(store.getMessages());
    
    // 1. Fetch User-Specific Stats (Private Log)
    if (auth.currentUser) {
       const q = query(
         collection(db, 'unban_requests'), 
         where('userId', '==', auth.currentUser.uid),
         orderBy('timestamp', 'desc'),
         limit(10)
       );
       const unsubLogs = onSnapshot(q, (snap) => {
         setStats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
       }, (err) => console.error("UserView: Error listening to unban_requests:", err));
       
       return () => unsubLogs();
    }
  }, [auth.currentUser]);

  useEffect(() => {
    const unsubCounters = onSnapshot(doc(db, 'global_stats', 'counters'), (snap) => {
      if (snap.exists()) {
        setGlobalCounters(snap.data());
      }
    }, (err) => console.error("UserView: Error listening to global_stats counters:", err));
    return () => unsubCounters();
  }, []);

  const handleGenerate = async () => {
    if (!phone || !deviceId || !reasonId || !languageId) {
      notify('يرجى ملء جميع البيانات المطلوبة أولاً', 'error');
      return;
    }

    setIsTyping(true);
    setGeneratedMessage('');

    // Logic for message generation
    const template = messages.find(m => m.reasonId === reasonId && m.languageId === languageId);
    let msg = template ? template.template : 'Please unban my account.';
    msg = msg.replace(/{{PHONE}}/g, phone);
    msg = msg.replace(/{{DEVICE}}/g, deviceId);

    if (includeSupportInfo) {
       msg += generateSupportInfo(phone, deviceId);
    }

    // Simulate "System Processing"
    setTimeout(async () => {
      setGeneratedMessage(msg);
      setIsTyping(false);
      notify('تم استخراج البيانات الفنية بنجاح', 'success');

      // Save to Firestore Log
      await saveLog();
    }, 1500);
  };

  const saveLog = async () => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'unban_requests'), {
        userId: auth.currentUser.uid,
        phone,
        deviceId,
        reasonId,
        languageId,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      const countersRef = doc(db, 'global_stats', 'counters');
      const countersSnap = await getDoc(countersRef);
      if (!countersSnap.exists()) {
        await setDoc(countersRef, { totalRequests: 1, lastUpdate: serverTimestamp() });
      } else {
        await updateDoc(countersRef, {
          totalRequests: increment(1),
          lastUpdate: serverTimestamp()
        });
      }
    } catch (e) {
      console.error("Stats update failed:", e);
    }
  };

  const handleSendEmail = () => {
    if (!generatedMessage) return;
    setIsSending(true);
    const subject = encodeURIComponent('Request to Unban WhatsApp Account: ' + phone);
    const body = encodeURIComponent(generatedMessage);
    window.open(`mailto:${selectedEmail}?subject=${subject}&body=${body}`, '_blank');
    
    setTimeout(() => {
      setIsSending(false);
      notify('تم توجيهك إلى تطبيق البريد', 'info');
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 flex-1 w-full pb-10"
    >
      {/* Target Input Section */}
      <section className="card p-6 border-b-4 border-b-[var(--neon)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[var(--neon-dim)] rounded-lg">
            <Smartphone className="w-5 h-5 text-[var(--neon)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">راديو الترددات</h2>
            <p className="text-[10px] text-neutral-500 uppercase">تعيين الهدف وفحص النطاق</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">رقم الهاتف المستهدف</label>
            <div className="relative group">
              <PhoneOff className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-[var(--neon)] transition-colors" />
              <input 
                dir="ltr"
                type="text" 
                placeholder="+967 7xx xxx xxx"
                className="input-styled pr-12 text-center font-mono text-base tracking-widest"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">نظام التشغيل المحاكي ({devices.length})</label>
            <div className="relative">
              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <select 
                className="input-styled pr-12 appearance-none cursor-pointer"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              >
                <option value="">-- اختر الجهاز من القائمة --</option>
                {devices.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">سبب الحظر المفترض</label>
              <div className="relative">
                <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <select 
                  className="input-styled pr-12 appearance-none cursor-pointer"
                  value={reasonId}
                  onChange={(e) => setReasonId(e.target.value)}
                >
                  <option value="">-- اختر السبب --</option>
                  {reasons.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">لغة الطلب</label>
              <div className="relative">
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <select 
                  className="input-styled pr-12 appearance-none cursor-pointer"
                  value={languageId}
                  onChange={(e) => setLanguageId(e.target.value)}
                >
                  <option value="">-- اختر اللغة --</option>
                  {languages.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">إدارة الدعم المستهدفة</label>
            <div className="relative">
              <Send className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <select 
                className="input-styled pr-12 appearance-none cursor-pointer"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
              >
                {supportEmails.map(s => (
                  <option key={s.id} value={s.email}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="relative group w-max">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className={`w-10 h-5 rounded-full transition-all relative ${includeSupportInfo ? 'bg-[var(--neon)]' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${includeSupportInfo ? 'left-6' : 'left-1'}`}></div>
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={includeSupportInfo}
                  onChange={(e) => setIncludeSupportInfo(e.target.checked)}
                />
                <span className={`text-xs font-bold transition-colors ${includeSupportInfo ? 'text-[var(--neon)]' : 'text-neutral-500'}`}>
                  إرفاق البيانات الفنية الدقيقة
                </span>
                <Info className="w-3.5 h-3.5 text-neutral-600 group-hover:text-[var(--neon)] transition-colors" />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <button 
             onClick={handleGenerate} 
             disabled={isTyping}
             className="btn-styled btn-primary w-full shadow-[0_10px_30px_rgba(0,255,102,0.2)] h-[54px]"
          >
            {isTyping ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري التشغيل...</span>
              </div>
            ) : (
              <>
                <Terminal className="w-5 h-5" />
                تـولـيـد كـود فـك الـحـظـر
              </>
            )}
          </button>
        </div>
      </section>

      {/* Result Section */}
      <motion.section 
        layout
        className={`card p-6 border-l-4 border-l-[var(--neon)] transition-all duration-500 overflow-hidden ${generatedMessage ? 'opacity-100 scale-100' : 'opacity-40 grayscale blur-[1px]'}`}
      >
        <div className="flex items-center justify-between mb-5">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--neon-dim)] rounded-lg">
                <FileText className="w-5 h-5 text-[var(--neon)]" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">مخرج النظام</h3>
           </div>
           
           {generatedMessage && (
             <div className="bg-neutral-900 border border-[var(--glass-border)] px-3 py-1 rounded-full text-[10px] font-mono text-neutral-400 animate-pulse">
               READY_FOR_EXPORT
             </div>
           )}
        </div>
        
        <div className="relative mb-6">
          <textarea 
            dir={languageId === 'ar' ? 'rtl' : 'ltr'}
            readOnly
            placeholder="[SYS]: بانتظار إدخال البيانات الفنية للهدف..."
            className="input-styled h-48 sm:h-64 resize-none font-mono text-[11px] leading-relaxed overflow-y-auto styled-scrollbar pt-6"
            value={generatedMessage}
          ></textarea>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => {
              if (!generatedMessage) return;
              navigator.clipboard.writeText(generatedMessage);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              notify('تم نسخ الكود بنجاح', 'success');
            }}
            disabled={!generatedMessage}
            className={`flex-1 btn-styled ${copied ? 'border-green-500 text-green-500' : ''}`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'تم النسخ' : 'نسخ الكود'}
          </button>
          
          <button 
            onClick={handleSendEmail}
            disabled={!generatedMessage || isSending}
            className="flex-1 btn-styled btn-primary shadow-[0_10px_20px_rgba(0,255,102,0.15)]"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isSending ? 'جاري الفتح...' : 'إرسال لشركة واتساب'}
          </button>
        </div>
      </motion.section>

      {/* Stats and Log Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section className="card p-6 bg-neutral-900/40">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-[var(--neon)]" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">الشبكة العالمية</h3>
          </div>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between p-3 border border-[var(--glass-border)] bg-black/40 rounded-xl">
              <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest">إجمالي العمليات</span>
              <span className="text-xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]">
                {globalCounters?.totalRequests?.toLocaleString() || '0'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-[var(--glass-border)] bg-black/40 rounded-xl">
              <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest">حالة السيرفر</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--neon)] uppercase tracking-widest">Optimized</span>
                <div className="status-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6 bg-neutral-900/40 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-[var(--neon)]" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">سجل نشاطك</h3>
          </div>

          <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto styled-scrollbar pr-1">
            {stats.length > 0 ? (
              stats.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 border border-[var(--glass-border)] rounded-lg bg-black/20 text-[10px] font-mono">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-bold">{s.phone}</span>
                    <span className="text-neutral-500 uppercase">{s.reasonId || 'System Fix'}</span>
                  </div>
                  <span className="text-[var(--neon)]/60">
                    {s.timestamp?.toDate ? s.timestamp.toDate().toLocaleDateString('ar-YE') : 'Succeed'}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-neutral-600 gap-2 opacity-50">
                <Terminal className="w-8 h-8" />
                <span className="text-[10px] font-mono uppercase tracking-widest">No activity</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function generateSupportInfo(phone: string, deviceName: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + '.955+0300';
    const osVersion = Math.floor(Math.random() * 3) + 11; // 11, 12, or 13
    
    // Carrier & MCC/MNC Detection (Yemen Focus)
    let carrier = 'Unknown';
    let mccMnc = '000-00';
    if (cleanPhone.startsWith('96777') || cleanPhone.startsWith('96778')) {
        carrier = 'Yemen Mobile';
        mccMnc = '421-03';
    } else if (cleanPhone.startsWith('96773')) {
        carrier = 'YOU (MTN)';
        mccMnc = '421-02';
    } else if (cleanPhone.startsWith('96771')) {
        carrier = 'SabaFon';
        mccMnc = '421-01';
    } else if (cleanPhone.startsWith('96770')) {
        carrier = 'Y Telecom';
        mccMnc = '421-04';
    }

    // Device Metadata extraction
    let mfg = 'Samsung';
    let model = deviceName;
    const parts = deviceName.trim().split(' ');
    if (parts.length > 1) {
        mfg = parts[0];
        model = parts.slice(1).join(' ');
    }

    const mfgUpper = mfg.toUpperCase();
    const modelId = model.split(' ').pop() || model;
    const modelIdUpper = modelId.toUpperCase();
    const board = (mfgUpper + modelIdUpper).slice(0, 8);
    
    const build = `${mfgUpper}/${modelIdUpper}/${modelIdUpper}:${osVersion}/HNCMA-L42CQ/7.1.0.132C185E1R2P1:user/release-keys`;
    const userAgent = `WhatsApp/2.25.29.77 SMBA/${osVersion} Device/${mfgUpper}-${modelIdUpper}`;

    return `\n\n--Support Info--
App: com.whatsapp.w5b
Architecture: aarch64
AutoConf status: null
Board: ${board.toLowerCase()}
Build: ${build}
CCode: YE
CPU ABI: arm64-v8a
Carrier: ${carrier}
Description: 2.25.29.77
Device: ${modelIdUpper}
Device ID: ${Math.floor(Math.random() * 1000)}
Device ISO8601: ${dateStr}
Embeddings Index: state: NOT_STARTED, progress: 0, finished: --, last updated: --
FAQ Results Read: 10
FAQ Results Returned: 10
Is Foldable: false
Is Tablet: false
Kernel: Unknown release unknown version
LC: IN
LG: ar
Manufacturer: ${mfgUpper}
Missing Permissions: android.permission.READ_EXTERNAL_STORAGE, android.permission.NEARBY_WIFI_DEVICES, android.permission.BLUETOOTH_SCAN, android.permission.BLUETOOTH_ADVERTISE, android.permission.SYSTEM_ALERT_WINDOW, android.permission.MANAGE_EXTERNAL_STORAGE, android.permission.BLUETOOTH_CONNECT, com.whatsapp.permission.MIGRATION_CONTENT_PROVIDER, android.permission.ACCESS_COARSE_LOCATION, android.permission.ACCESS_FINE_LOCATION, android.permission.FOREGROUND_SERVICE_MICROPHONE, android.permission.FOREGROUND_SERVICE_CAMERA, android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION, android.permission.FOREGROUND_SERVICE_PHONE_CALL, android.permission.FOREGROUND_SERVICE_DATA_SYNC, android.permission.DETECT_SCREEN_CAPTURE, android.permission.CALL_PHONE, android.permission.WRITE_EXTERNAL_STORAGE, android.permission.RUN_USER_INITIATED_JOBS, android.permission.ACCESS_MEDIA_LOCATION, android.permission.FOREGROUND_SERVICE_LOCATION, android.permission.INSTALL_SHORTCUT, android.permission.READ_PHONE_NUMBERS
Model: ${modelIdUpper}
Network Type: L.T.E.
OS: ${osVersion}
PSI abprops:: ai_psi_enabled:false, semantic_search_enabled:false
Phone Type: G.S.M.
Product: ${modelIdUpper}
Radio MCC-MNC: ${mccMnc}
SIM MCC-MNC: ${mccMnc}
Target: release
Version: 2.25.29.77
Debug info: unregistered
MDEnabled: true
HasMdCompanion: true
Context: register-phone-invalid
useragent: ${userAgent}
Socket Conn: DN
Free Space Built-In: 9321644032 (٩٫٣٢ غ.ب)
Free Space Removable: 9321644032 (٩٫٣٢ غ.ب)
Smb count: 0
Ent count: 0
Connection: W.I.F.I.
Diagnostic Codes: FE-GDE FE-GDC FE-VIDC
Sim: null 5
Network metered: 100:false;186:false
Network restricted: 100:true;186:false
Data roaming: false
Tel roaming: false
ABprops hash state: unregistered
Serverprops hash state: unregistered
anid: ${crypto.randomUUID ? crypto.randomUUID() : '5ee6f5ae-7a1a-4989-96ce-a2a627d1d556'}
XPMigrated: no
backup-restore: backup:0
Screen reader: false
Fingerprint eligible: true
pn: ${cleanPhone}`;
}
