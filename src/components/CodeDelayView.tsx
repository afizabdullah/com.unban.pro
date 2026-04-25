import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, RefreshCw, Smartphone, ShieldCheck, AlertCircle, Zap, Send, FileText, Copy, Check, Info, Loader2 } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { store } from '../store/store';

export default function CodeDelayView() {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [deviceType, setDeviceType] = useState('android');
  const [whatsappSupport, setWhatsappSupport] = useState(true);
  const [includeSupportInfo, setIncludeSupportInfo] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState('support@support.whatsapp.com');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const supportEmails = [
    { id: 'general', name: 'دعم واتساب العام', email: 'support@support.whatsapp.com' },
    { id: 'business', name: 'دعم واتساب للأعمال', email: 'smb@support.whatsapp.com' },
    { id: 'android', name: 'دعم أندرويد', email: 'android_web@support.whatsapp.com' },
    { id: 'iphone', name: 'دعم آيفون', email: 'iphone_web@support.whatsapp.com' },
    { id: 'web', name: 'دعم واتساب ويب', email: 'webclient_web@support.whatsapp.com' },
  ];

  const handleFix = () => {
    if (!phone.trim()) {
      notify("يرجى إدخال رقم الهاتف أولاً", "error");
      return;
    }
    
    setLoading(true);
    setGeneratedMessage('');
    
    // Construct the email body
    let body = `Por favor, pesquise o código OTP para este número porque outra pessoa acidentalmente se conectou com meu número e eu tive que esperar 8 horas, por favor, pesquise novamente neste número: ${phone}`;
    
    if (includeSupportInfo) {
      body += generateSupportInfo(phone, deviceType === 'android' ? 'Samsung S23 Ultra' : 'iPhone 15 Pro');
    }

    setTimeout(() => {
      setLoading(false);
      setGeneratedMessage(body);
      notify("تم توليد الطلب التقني بنجاح. يمكنك الآن نسخه أو إرساله.", "success");
    }, 1200);
  };

  const handleSendEmail = () => {
    if (!generatedMessage) return;
    setIsSending(true);
    const subject = encodeURIComponent("Suporte WhatsApp - Problema com Código OTP");
    const body = encodeURIComponent(generatedMessage);
    window.open(`mailto:${selectedEmail}?subject=${subject}&body=${body}`, '_blank');
    
    setTimeout(() => {
      setIsSending(false);
      notify("تم توجيهك إلى تطبيق البريد", "info");
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col space-y-6 flex-1 w-full pb-10"
    >
      <div className="card p-6 border-b-2 border-blue-500/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
            <Clock className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">حل مشكلة تأخير الكود</h2>
            <p className="text-[10px] text-blue-400 font-mono">Bypass_Cooldown_v2.0_Advanced</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-100 leading-relaxed">
                هذا القسم مخصص للحالات التي يظهر فيها تنبيه: "لا يمكنك طلب رسالة نصية إلا بعد 8 ساعات أو 24 ساعة". يتم توجيهك تلقائياً للدعم الفني الرسمي.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">رقم الهاتف المستهدف</label>
              <div className="relative group">
                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="tel"
                  placeholder="+967 7xx xxx xxx"
                  className="input-styled pr-12 focus:border-blue-500 font-mono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">نوع الجهاز</label>
              <select 
                className="input-styled focus:border-blue-500 transition-all cursor-pointer"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
              >
                <option value="android">أندرويد (Android)</option>
                <option value="iphone">آيفون (iOS)</option>
              </select>
            </div>
            <div className="flex flex-col justify-end gap-2 pb-1">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className={`w-8 h-4 rounded-full transition-all relative ${includeSupportInfo ? 'bg-blue-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${includeSupportInfo ? 'left-4.5' : 'left-0.5'}`}></div>
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={includeSupportInfo}
                  onChange={(e) => setIncludeSupportInfo(e.target.checked)}
                />
                <span className={`text-[10px] font-bold uppercase transition-colors ${includeSupportInfo ? 'text-blue-400' : 'text-neutral-500'}`}>
                  إرفاق البيانات الفنية
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className={`w-8 h-4 rounded-full transition-all relative ${whatsappSupport ? 'bg-blue-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${whatsappSupport ? 'left-4.5' : 'left-0.5'}`}></div>
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={whatsappSupport}
                  onChange={(e) => setWhatsappSupport(e.target.checked)}
                />
                <span className={`text-[10px] font-bold uppercase transition-colors ${whatsappSupport ? 'text-blue-400' : 'text-neutral-500'}`}>
                   الدعم العالي (High Priority)
                </span>
              </label>
            </div>
          </div>

          <button 
            onClick={handleFix}
            disabled={loading}
            className="btn-styled w-full bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-[0_10px_20px_rgba(37,99,235,0.2)] h-[54px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                تـولـيـد طـلـب فـك الـتـأخـيـر
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {generatedMessage && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 border-l-4 border-l-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                 <FileText className="w-4 h-4 text-blue-400" /> مخرج الطلب التقني
               </h3>
               <div className="text-[9px] font-mono text-blue-400 animate-pulse uppercase tracking-widest">
                 ENCRYPTED_PAYLOAD_READY
               </div>
            </div>
            
            <textarea 
              readOnly
              className="input-styled h-48 resize-none font-mono text-[10px] leading-relaxed mb-4 p-4 bg-black/40"
              value={generatedMessage}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedMessage);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  notify('تم نسخ الطلب بنجاح', 'success');
                }}
                className={`flex-1 btn-styled ${copied ? 'border-green-500 text-green-500' : 'border-neutral-800'}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ' : 'نسخ الكود'}
              </button>
              
              <button 
                onClick={handleSendEmail}
                disabled={isSending}
                className="flex-1 btn-styled bg-blue-600 border-blue-400 text-white hover:bg-blue-500"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSending ? 'جاري الفتح...' : 'إرسال لشركة واتساب'}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 bg-neutral-900 overflow-hidden relative">
          <div className="matrix-overlay opacity-5"></div>
          <h3 className="text-xs font-bold text-blue-400 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> تعليمات هامة للمحترفين
          </h3>
          <ul className="space-y-3">
            <Step num="1" text="قم بمسح بيانات تطبيق واتساب (Clear Data) من إعدادات الهاتف." />
            <Step num="2" text="قم بتشغيل وضع الطيران لمدة 30 ثانية ثم أوقفه." />
            <Step num="3" text="أرسل الطلب أعلاه عبر Gmail وانتظر الرد الرسمي." />
            <Step num="4" text="افتح واتساب واطلب الكود عبر 'اتصال' (Call Me) بعد استلام الرد." />
          </ul>
        </div>

        <div className="card p-5 bg-neutral-900 border-neutral-800 overflow-hidden relative text-left" dir="ltr">
          <div className="matrix-overlay opacity-5"></div>
          <h3 className="text-xs font-bold text-red-500 mb-4 flex items-center gap-2 ltr">
            <RefreshCw className="w-4 h-4" /> TECHNICAL_METADATA
          </h3>
          <div className="space-y-2 font-mono text-[9px] text-gray-500 uppercase tracking-tighter">
            <p>System: Bypass_v2.1_Stable</p>
            <p>Device_Binding: {deviceType.toUpperCase()}</p>
            <p>Support_Level: {whatsappSupport ? 'FULL_PRIORITY' : 'STANDARD'}</p>
            <p>Network: TLS_ENCRYPTED_SIGNAL</p>
            <p>Status: {generatedMessage ? 'READY_TO_SEND' : 'WAITING_FOR_INIT'}</p>
          </div>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}

function Step({ num, text }: { num: string, text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px] font-bold text-blue-400 shrink-0">{num}</span>
      <p className="text-[11px] text-gray-400">{text}</p>
    </li>
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

  const settings = store.getSettings();
  let template = settings.supportInfoTemplate || `App: com.whatsapp.w5b
Device: {{MODEL}}
Manufacturer: {{MFG}}
OS: {{OS}}
Phone: {{PHONE}}
Carrier: {{CARRIER}}
MCC/MNC: {{MCC_MNC}}
Timestamp: {{ISO_DATE}}
User-Agent: {{USER_AGENT}}`;
  
  // Replacement logic
  const replacements: Record<string, string> = {
      '{{PHONE}}': cleanPhone,
      '{{MODEL}}': modelIdUpper,
      '{{BOARD}}': board.toLowerCase(),
      '{{BUILD}}': build,
      '{{CARRIER}}': carrier,
      '{{MCC_MNC}}': mccMnc,
      '{{OS}}': osVersion.toString(),
      '{{USER_AGENT}}': userAgent,
      '{{UUID}}': crypto.randomUUID ? crypto.randomUUID() : '5ee6f5ae-7a1a-4989-96ce-a2a627d1d556',
      '{{RANDOM_ID}}': Math.floor(Math.random() * 1000).toString(),
      '{{ISO_DATE}}': dateStr,
      '{{MFG}}': mfgUpper
  };

  Object.entries(replacements).forEach(([key, val]) => {
      template = template.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val);
  });

  return `\n\n--Support Info--\n${template}`;
}
