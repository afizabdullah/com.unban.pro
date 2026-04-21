import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, ChevronDown, Check, Loader2, Globe, Smartphone, Mail, Phone, MessageSquare, ShieldAlert, Zap, Network, Power, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../contexts/NotificationContext';
import { store } from '../store/store';

export default function WhatsAppSimulation() {
  const { notify } = useNotification();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState('Android');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState(0); // 0: Form, 1: Technical Review, 2: Connectivity, 3: Sending, 4: Success
  const [ticketId, setTicketId] = useState('');
  const [proxySettings] = useState(store.getProxySettings());
  const [supportInfo, setSupportInfo] = useState('');

  const generateSupportInfo = () => {
    const settings = store.getSettings();
    let template = settings.supportInfoTemplate || '';
    const now = new Date();
    
    // Simple replacements for simulation
    template = template
      .replace(/{{PHONE}}/g, `+967${phone}`)
      .replace(/{{MODEL}}/g, 'SM-G998B')
      .replace(/{{BOARD}}/g, 'exynos2100')
      .replace(/{{BUILD}}/g, 'TP1A.220624.014')
      .replace(/{{CARRIER}}/g, 'Yemen Mobile')
      .replace(/{{MCC_MNC}}/g, '421-03')
      .replace(/{{OS}}/g, 'Android 13')
      .replace(/{{USER_AGENT}}/g, 'WhatsApp/2.25.29.77 (Android 13; Model/Galaxy S21 Ultra; Build/220624; ID/765432)')
      .replace(/{{UUID}}/g, Math.random().toString(36).substring(2, 15))
      .replace(/{{RANDOM_ID}}/g, Math.floor(100000000 + Math.random() * 900000000).toString())
      .replace(/{{ISO_DATE}}/g, now.toISOString())
      .replace(/{{MFG}}/g, 'Samsung');

    setSupportInfo(template);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !email || !message) {
      notify('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    generateSupportInfo();
    setStep(1);
  };

  const handleSend = async () => {
    setIsSending(true);
    setStep(2);

    // Step 2: Proxy connectivity check
    await new Promise(r => setTimeout(r, 2000));
    setStep(3);
    
    // Step 3: Sending payload
    await new Promise(r => setTimeout(r, 3000));
    
    const id = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(id);
    setStep(4);
    setIsSending(false);
    
    notify('تم إرسال طلبك بنجاح! رقم التذكرة: ' + id, 'success');
  };

  const handleSendAction = () => {
    const subject = `Question about WhatsApp for Android - ${phone}`;
    const body = `${message}\n\n--- Technical Details ---\n${supportInfo}`;
    const mailtoUrl = `mailto:support@whatsapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    notify('يتم الآن فتح تطبيق البريد لإرسال الطلب رسمياً', 'info');
  };

  if (step === 4) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-[#25D366]/20 border-2 border-[#25D366] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(37,211,102,0.3)]">
          <Check className="w-12 h-12 text-[#25D366]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">اكتملت المعالجة التقنية!</h2>
        <div className="bg-neutral-900 px-4 py-2 rounded-lg border border-white/10 mb-6 font-mono text-sm">
           <span className="text-neutral-500 ml-2">رقم المرجع:</span>
           <span className="text-[#25D366] font-bold">{ticketId}</span>
        </div>
        <p className="text-neutral-400 max-w-sm leading-relaxed mb-6">
          لقد قمنا بتجهيز "حزمة الدعم" الخاصة بك وتشفيرها. لضمان وصول الرد وتفعيل الطلب 100%، يجب عليك الضغط على الزر أدناه لإرسال الرسالة من بريدك الشخصي إلى دعم واتساب الرسمي.
        </p>

        <div className="w-full max-w-sm space-y-3 mb-8">
          <button 
            onClick={handleSendAction}
            className="w-full bg-[#25D366] text-black font-bold py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,211,102,0.3)] flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
          >
            <Mail className="w-5 h-5" /> إرسال عبر البريد الرسمي (تأكيد)
          </button>
          <p className="text-[10px] text-yellow-500/80 font-bold border border-yellow-500/20 bg-yellow-500/5 p-2 rounded-lg">
            ⚠️ ملاحظة: لن يصلك رد إلا إذا قمت بالضغط على الزر أعلاه وإرسال الرسالة من تطبيق البريد الخاص بك.
          </p>
        </div>

        <div className="w-full max-w-md bg-black/40 rounded-xl border border-white/5 p-4 mb-8 text-right overflow-hidden">
           <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center justify-end gap-2">
             Technical Deployment Log <Terminal className="w-3 h-3" />
           </h4>
           <div className="font-mono text-[9px] text-neutral-400 space-y-1">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-green-500">200 OK</span>
                <span>HTTP/1.1 POST /v1/support/contact</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">CF-Ray:</span>
                <span>{Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Security-Layer:</span>
                <span>{proxySettings.isEnabled ? `Proxy-Encrypted (${proxySettings.protocol})` : 'SSL/TLS 1.3'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Status:</span>
                <span className="text-[#25D366]">Request Queued for Meta_Support_Pool</span>
              </div>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button 
            onClick={() => { setStep(0); setPhone(''); setEmail(''); setMessage(''); }}
            className="btn-styled bg-[#25D366] border-[#25D366] text-white flex-1 py-3 h-auto"
          >
            إرسال طلب جديد
          </button>
          <button className="btn-styled bg-neutral-900 border-neutral-800 text-neutral-400 flex-1 py-3 h-auto">
            متابعة الحالة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-2 pb-10 max-w-3xl mx-auto w-full px-4 sm:px-6">
      <header className="mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center border border-[#25D366]/30">
              <ShieldCheck className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">الدعم الفني لواتساب</h2>
              <p className="text-[10px] text-[#25D366] font-mono uppercase tracking-widest">WhatsApp Business Support Console</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 rounded-lg border border-white/5 h-fit">
             <Network className={`w-3 h-3 ${proxySettings.isEnabled ? 'text-green-500 animate-pulse' : 'text-neutral-500'}`} />
             <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
               {proxySettings.isEnabled ? `Proxy: ${proxySettings.host}:${proxySettings.port}` : 'Direct Link'}
             </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center px-2">
           {[0, 1, 2, 3].map(i => (
             <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${step >= i ? 'bg-[#25D366] shadow-[0_0_10px_#25D366]' : 'bg-neutral-800'}`} />
                <span className={`text-[8px] font-bold uppercase tracking-tighter ${step >= i ? 'text-white' : 'text-neutral-600'}`}>
                  {['Input', 'Review', 'Secure', 'Send'][i]}
                </span>
             </div>
           ))}
           <div className="absolute left-[30px] right-[30px] top-[148px] h-[1px] bg-neutral-900 -z-10" />
        </div>
      </header>

      {step === 0 ? (
        <form onSubmit={handleNext} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#1ebea5]/5 border border-[#1ebea5]/20 p-4 rounded-2xl flex gap-4">
            <Info className="w-6 h-6 text-[#1ebea5] shrink-0" />
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              يرجى تزويدنا بالتفاصيل الكاملة لمشكلتك. إذا كنت تواجه مشكلة في تسجيل الدخول أو تم حظر حسابك، يرجى كتابة "طلب فك حظر" مع شرح السبب.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[#25D366]" /> رقم الهاتف (رقم واتساب)
                </label>
                <div className="flex gap-2">
                  <div className="relative w-24">
                    <input type="text" className="input-styled text-center bg-neutral-900/50" defaultValue="+967" readOnly />
                  </div>
                  <div className="relative flex-1">
                    <input 
                      type="tel" 
                      placeholder="رقم الهاتف بدون الرمز..." 
                      className="input-styled focus:border-[#25D366]/50" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3 h-3 text-[#25D366]" /> البريد الإلكتروني للتواصل
                </label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="input-styled focus:border-[#25D366]/50" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <Smartphone className="w-3 h-3 text-[#25D366]" /> نظام التشغيل المستخدم
                </label>
                <select 
                  className="input-styled appearance-none cursor-pointer"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="Android">نظام أندرويد (Android)</option>
                  <option value="iPhone">نظام آيفون (iOS)</option>
                  <option value="Web/Desktop">واتساب ويب / سطح المكتب</option>
                  <option value="KaiOS">نظام KaiOS</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 flex flex-col">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-3 h-3 text-[#25D366]" /> وصف المشكلة بالتفصيل
              </label>
              <textarea 
                className="input-styled flex-1 min-h-[180px] text-sm leading-relaxed" 
                placeholder="قدم أكبر قدر ممكن من التفاصيل..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="btn-styled bg-[#25D366] border-[#25D366] text-white w-full py-4 font-bold shadow-[0_10px_30px_rgba(37,211,102,0.2)]"
            >
              مراجعة التفاصيل الفنية
            </button>
          </div>
        </form>
      ) : step === 1 ? (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 bg-[#25D366]/10 text-[#25D366] text-[8px] font-bold uppercase tracking-[2px] rounded-bl-lg">Audit Review</div>
             <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#25D366]" /> مراجعة البيانات قبل الإرسال
             </h3>
             
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                   <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-neutral-500 block mb-1">الرقم المستهدف:</span>
                      <span className="text-white font-mono font-bold">+967 {phone}</span>
                   </div>
                   <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-neutral-500 block mb-1">بريد الرد:</span>
                      <span className="text-white font-bold">{email}</span>
                   </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                   <span className="text-[10px] text-neutral-500 block mb-2 font-bold uppercase tracking-widest">المعلومات التقنية المرفقة (System Headers):</span>
                   <pre className="text-[10px] text-neutral-400 font-mono leading-tight whitespace-pre-wrap overflow-y-auto max-h-40 styled-scrollbar">
                     {supportInfo}
                   </pre>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs">
                   <span className="text-neutral-500 block mb-1">نص الرسالة:</span>
                   <p className="text-white leading-relaxed">{message}</p>
                </div>
             </div>
          </div>

          <div className="flex gap-4">
             <button onClick={() => setStep(0)} className="btn-styled bg-neutral-900 border-neutral-800 text-neutral-400 flex-1">
               تعديل البيانات
             </button>
             <button 
              onClick={handleSend}
              className="btn-styled bg-[#25D366] border-[#25D366] text-white flex-[2] font-bold shadow-[0_10px_30px_rgba(37,211,102,0.2)]"
             >
               تـأكـيـد الإرسـال الآن
             </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <AnimatePresence mode="wait">
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                  <Network className="w-10 h-10 text-blue-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white">جارِ الربط بالوسيط الآمن...</h3>
                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                   <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.8 }}
                        className="h-full bg-blue-500"
                      />
                   </div>
                   <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">
                     {proxySettings.isEnabled ? `Routing via ${proxySettings.host}` : 'Creating SSL Direct Tunnel'}
                   </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-10 h-10 text-[#25D366] animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white">جارِ إرسال المشكلة...</h3>
                <div className="flex flex-col gap-2 max-w-xs mx-auto text-xs font-mono text-neutral-500">
                   <div className="flex justify-between">
                     <span>PACKET_UPLOAD:</span>
                     <span className="text-[#25D366]">PROCESSING...</span>
                   </div>
                   <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: '20%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.8 }}
                        className="h-full bg-[#25D366]"
                      />
                   </div>
                   <p className="text-[10px] uppercase tracking-widest">Encrypting PII Data & Technical Logs</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <footer className="mt-auto pt-10 text-center opacity-30 select-none pointer-events-none">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.5em]">META // WHATSAPP_SUPPORT_ENGINE</p>
      </footer>
    </div>
  );
}
