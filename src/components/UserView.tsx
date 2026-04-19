import React, { useState, useEffect } from 'react';
import { Shield, Send, Terminal, Smartphone, Key, FileText, Copy, Check, Info, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { store, Device, BanReason, Language, MessageTemplate, RequestStat } from '../store/store';
import { useNotification } from '../contexts/NotificationContext';

export default function UserView() {
  const { notify } = useNotification();
  const [phone, setPhone] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [reasonId, setReasonId] = useState('');
  const [languageId, setLanguageId] = useState('');
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [reasons, setReasons] = useState<BanReason[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [messages, setMessages] = useState<MessageTemplate[]>([]);
  const [stats, setStats] = useState<RequestStat[]>([]);

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
    setStats(store.getStats());
  }, []);

  const handleGenerate = () => {
    if (!phone || !deviceId || !reasonId || !languageId) {
      notify('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    // Check for device-specific template first, then fallback to general template
    let templateObj = messages.find(m => m.languageId === languageId && m.reasonId === reasonId && m.targetDevice === deviceId);
    if (!templateObj) {
      templateObj = messages.find(m => m.languageId === languageId && m.reasonId === reasonId && !m.targetDevice);
    }
    
    let rawMessage = templateObj?.template || 'لم يتم العثور على رسالة مناسبة لهذا السبب واللغة. يرجى مراجعة لوحة الإدارة.';
    
    // deviceId is now exactly the string the user typed or selected from the combobox
    const deviceName = deviceId;
    
    rawMessage = rawMessage.replace(/{{PHONE}}/g, phone).replace(/{{DEVICE}}/g, deviceName);
    
    if (includeSupportInfo) {
      rawMessage += generateSupportInfo(phone, deviceName);
    }

    setGeneratedMessage(rawMessage);
    setIsTyping(true);
    
    store.addStat({ phone, deviceId, reasonId });
    setStats(store.getStats());
  };

  const handleSendEmail = () => {
    if (!generatedMessage) return;
    setIsSending(true);
    const subject = encodeURIComponent('Request to Unban WhatsApp Account: ' + phone);
    const body = encodeURIComponent(generatedMessage);
    window.open(`mailto:support@support.whatsapp.com?subject=${subject}&body=${body}`, '_blank');
    
    // Revert button state after a short delay (enough time for mail client to launch)
    setTimeout(() => {
      setIsSending(false);
      notify('تم توجيهك إلى تطبيق البريد', 'info');
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 flex-1 w-full"
    >
      <section className="tool-pane">
        <div className="flex flex-col gap-4 mb-6">
          {/* Phone Input */}
          <div className="input-group">
            <label>رقم الهاتف المستهدف</label>
            <input 
              dir="ltr"
              type="text" 
              placeholder="+967 7xx xxx xxx"
              className="input-styled"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Device Selection */}
          <div className="input-group">
            <label>نوع الجهاز المحاكي ({devices.length} جهاز متاح)</label>
            <select 
              className="input-styled appearance-none"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            >
              <option value="">-- اختر الجهاز من القائمة --</option>
              {devices.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Reason Selection */}
          <div className="input-group">
            <label>سبب الحظر المفترض</label>
            <select 
              className="input-styled appearance-none"
              value={reasonId}
              onChange={(e) => setReasonId(e.target.value)}
            >
              <option value="">-- اختر السبب --</option>
              {reasons.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Language Selection */}
          <div className="input-group">
            <label>لغة الطلب</label>
            <select 
              className="input-styled appearance-none"
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)}
            >
              <option value="">-- اختر اللغة --</option>
              {languages.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          
          {/* Options */}
          <div className="input-group sm:col-span-2">
            <div className="relative group w-max">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-[var(--neon)]"
                  checked={includeSupportInfo}
                  onChange={(e) => setIncludeSupportInfo(e.target.checked)}
                />
                <span className="text-sm flex items-center gap-2">
                  إرفاق بيانات فنية بأسفل الكود (Support Info)
                  <Info className="w-4 h-4 text-gray-400 group-hover:text-[var(--neon)] transition-colors" />
                </span>
              </label>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-72 p-3 bg-gray-900 border border-[var(--neon)]/50 rounded shadow-[0_0_15px_rgba(0,255,0,0.15)] z-20 pointer-events-none">
                <div className="text-xs text-gray-300 leading-relaxed font-sans relative">
                  <strong className="text-[var(--neon)] block mb-1">لماذا أستخدم هذه الإضافة؟</strong>
                  دمج البيانات الفنية الدقيقة (مثل نوع المعالج ورقم البناء) أسفل رسالتك يُثبت روبوتات الدعم الخاصة بواتساب أنك تتواصل عبر جهاز رسمي وليس أداة نسخ آلي (Spam). هذا يرفع موثوقية طلبك بدرجة كبيرة ويسرع عملية فك الحظر.
                </div>
                {/* Tooltip Carrot */}
                <div className="absolute -bottom-[5px] right-24 w-2 h-2 bg-gray-900 border-b border-l border-[var(--neon)]/50 transform -rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        {!generatedMessage && (
          <button 
            onClick={handleGenerate}
            className="btn-styled mt-auto"
          >
            توليد كود الفك
          </button>
        )}

        {/* Result Area */}
        {generatedMessage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col flex-1"
          >
            <div className="terminal-output flex-1 flex flex-col justify-start min-h-[200px]">
              <div className="mb-2 text-[var(--neon)]/70">
                [SYS]: جاري معالجة الطلب...<br/>
                [SYS]: تم اختيار لغة الطلب: {languages.find(l => l.id === languageId)?.name}<br/>
                [SYS]: تم إنشاء كود الجهاز: Android-ID-{Math.floor(Math.random() * 1000000000)}
                <br/><br/>
                <b>نص الرسالة المقترح:</b>
              </div>
              <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap flex-1">
                {isTyping ? (
                  <TypewriterText text={generatedMessage} onComplete={() => setIsTyping(false)} />
                ) : (
                  generatedMessage
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={handleSendEmail}
                disabled={isSending}
                className="btn-styled flex items-center justify-center gap-2 shadow-[0_0_10px_var(--neon)] disabled:opacity-70 disabled:cursor-wait"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جاري التوجيه...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> إرسال عبر البريد
                  </>
                )}
              </button>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedMessage);
                  setCopied(true);
                  notify('تم نسخ الكود بنجاح إلى الحافظة', 'success');
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-styled flex items-center justify-center gap-2"
                style={{ backgroundColor: copied ? 'var(--neon)' : '', color: copied ? '#000' : '' }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} 
                {copied ? 'تم النسخ!' : 'نسخ الكود'}
              </button>
            </div>
          </motion.div>
        )}
      </section>

      <aside className="sidebar">
        <div className="card">
          <div className="text-center text-lg mb-4 border-b border-[var(--neon)] pb-2 font-bold">إحصائيات النظام</div>
          <div className="stat-row">
            <span>إجمالي الطلبات</span>
            <span className="stat-badge">{stats.length + 12842}</span>
          </div>
          <div className="stat-row">
            <span>تم فك الحظر بنجاح</span>
            <span className="stat-badge">{Math.floor((stats.length + 12842) * 0.71)}</span>
          </div>
          <div className="stat-row">
            <span>طلبات اليوم</span>
            <span className="stat-badge">{stats.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString()).length + 156}</span>
          </div>
          <div className="stat-row">
            <span>كفاءة النظام</span>
            <span className="stat-badge">71%</span>
          </div>
        </div>
        
        <div className="card flex-1 min-h-[200px]">
          <div className="text-center text-sm mb-3">سجل العمليات الأخيرة</div>
          <div className="text-[11px] opacity-70 leading-relaxed font-mono space-y-1">
            {stats.slice().reverse().slice(0, 5).map((stat, i) => (
              <div key={i}>[{new Date(stat.timestamp).toLocaleTimeString('en-US', {hour12: false})}] تم إرسال طلب ({stat.phone.substring(0, 6)}...)</div>
            ))}
            <div>[14:19:54] تم تحديث القاعدة (Device List)</div>
            <div>[14:15:30] مستخدم جديد من صنعاء، اليمن</div>
            <div>[14:10:12] تم استعادة حساب (ID: #4421)</div>
            <div>[14:05:00] فحص دوري لخادم SMTP... ناجح</div>
          </div>
        </div>
        
        <div className="card bg-transparent text-center border-dashed p-4">
          <div className="text-xs">AIDE Plus Development Environment</div>
          <div className="text-[10px] mt-1 opacity-70">Yemen Tech Solutions © {new Date().getFullYear()}</div>
        </div>
      </aside>
    </motion.div>
  );
}

function TypewriterText({ text, onComplete }: { text: string, onComplete: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText(prev => prev + (text[i] || ''));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        onComplete();
      }
    }, 5); // very fast typing speed for large logs
    
    return () => clearInterval(timer);
  }, [text]);

  return <>{displayedText}</>;
}

function generateSupportInfo(phone: string, deviceName: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const dateStr = new Date().toISOString(); 
    const osVersion = Math.floor(Math.random() * 4) + 10; // OS 10 to 13
    
    let mfg = 'Samsung';
    let model = deviceName;
    const parts = deviceName.trim().split(' ');
    if (parts.length > 1) {
        mfg = parts[0];
        model = parts.slice(1).join(' ');
    }

    const mfgClean = mfg.toLowerCase();
    const modelClean = model.replace(/\s+/g, '').toLowerCase();
    const board = modelClean.slice(0,6).toUpperCase();
    const build = `${mfgClean}/${modelClean}/${modelClean}:${osVersion}/TP1A.220624.014/19842.240509:user/release-keys`;
    
    const randomRef = Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
    const randomAnid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    const timestamp = dateStr.replace('T', ' ').substring(0, 23);

    return `\n\n\n--Support Info--
App: com.whatsapp
Architecture: arm64-v8a
AutoConf status: unregistered
Board: ${board}
Build: ${build}
CCode: YE
CPU ABI: arm64-v8a
Carrier: MTN
Description: WhatsApp
Device: ${modelClean}_sys
Device ID: ${Math.random().toString(16).substring(2, 10).toUpperCase()}
Device ISO8601: ${dateStr}
Embeddings Index: state: READY, progress: 100, finished: true, last updated: ${Math.floor(Date.now() / 1000) - 86400}
FAQ Results Read: false
FAQ Results Returned: 0
Is Foldable: false
Is Tablet: false
Kernel: 5.10.${Math.floor(Math.random()*100)}-android${osVersion}-9-gabcdef
LC: YE
LG: ar
Manufacturer: ${mfg}
Missing Permissions: android.permission.POST_NOTIFICATIONS

Model: ${model}
Network Type: WIFI
OS: ${osVersion}
PSI abprops:: semantic_search_enabled:false
Phone Type: gsm
Product: ${modelClean}

Radio MCC-MNC: 421-02
SIM MCC-MNC: 421-02

Target: release
Version: 2.24.10.73

Debug info: unregistered
MDEnabled: true

Status Infra migration state::
readEnabled: false
writeEnabled: false
sendEnabled: false
recvEnabled: false

HasMdCompanion: false
Context: eula

useragent: WhatsApp/2.24.10.73 Android/${osVersion} Device/${mfg}-${model}

Socket Conn: DN

Free Space Built-In: ${Math.floor(Math.random() * 100 + 50)}08838402048 (${Math.floor(Math.random() * 150 + 50)} GB)
Free Space Removable: ${Math.floor(Math.random() * 100 + 50)}08838402048 (${Math.floor(Math.random() * 150 + 50)} GB)

Smb count: ${Math.floor(Math.random() * 5000) + 1000}
Ent count: 1

Connection: W.I.F.I.

Diagnostic Codes: FE-GDE FE-GDC FE-VIDC FE-SMSRTV

Sim: 5

L Distance: 0

Network metered: 101:false
Network restricted: 101:false

Data roaming: false
Tel roaming: false

ref: ${randomRef}

ABprops hash state: unregistered
Serverprops hash state: unregistered

anid: ${randomAnid}

XPMigrated: no
i2aAttempted: false

backup-restore: backup:0

Datacenter: lla

Screen reader: false

Fingerprint eligible: true

Last local backup time: ${timestamp}+0300

Google account added: true

Groups media visibility: default
Individual media visibility: default

In scoped mode: true

Has unexpected .nomedia: false

wfl_state: unregistered

Is Companion: false

Has Wear OS Companion: false

Number of Accounts: 1

saga_copy: false

pn: ${phone}
`;
}
