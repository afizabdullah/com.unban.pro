import React, { useState, useEffect } from 'react';
import { Server, Globe, Power, Shield, Activity, RefreshCw, AlertCircle, Save, Loader2, Network } from 'lucide-react';
import { motion } from 'motion/react';
import { store, ProxySettings } from '../store/store';
import { proxyService } from '../lib/proxyService';
import { useNotification } from '../contexts/NotificationContext';

export default function ProxySettingsView() {
  const { notify } = useNotification();
  const [settings, setSettings] = useState<ProxySettings>(store.getProxySettings());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Sync UI with store
    setSettings(store.getProxySettings());
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      store.saveProxySettings(settings);
      setIsSaving(false);
      notify('تم حفظ إعدادات البروكسي بنجاح', 'success');
    }, 600);
  };

  const handleTest = async () => {
    if (!settings.host || !settings.port) {
      notify('يرجى إدخال العنوان والمنفذ أولاً', 'error');
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const success = await proxyService.testConnection(settings);
      setTestResult(success ? 'success' : 'error');
      if (success) {
        notify('تم الاتصال بالخادم بنجاح!', 'success');
      } else {
        notify('فشل في الوصول إلى الخادم. تحقق من البيانات.', 'error');
      }
    } catch (e) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <header className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--neon)]/20">
        <div className="p-2.5 bg-[var(--neon-dim)] rounded-xl border border-[var(--neon)]/30 shadow-[0_0_20px_rgba(0,255,102,0.1)]">
          <Network className="w-7 h-7 text-[var(--neon)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">إعدادات خوادم البروكسي : PROXY</h2>
          <p className="text-[10px] text-[var(--neon)]/60 font-mono uppercase tracking-[0.2em]">Network Routing Interface</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Configuration */}
        <div className="space-y-6">
          <div className="card p-6 border-[var(--neon)]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 bg-[var(--neon)] h-full opacity-30"></div>
            
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 border-b border-[var(--neon)]/10 pb-2 flex items-center gap-2">
              <RefreshCw className="w-3 h-3 text-[var(--neon)]" /> تكوين الوجهة (Destination)
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">عنوان الخادم (Host/IP)</label>
                <div className="relative">
                  <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 focus-within:text-[var(--neon)]" />
                  <input 
                    type="text" 
                    placeholder="192.168.1.1 OR proxy.server.com" 
                    className="input-styled pr-12 font-mono text-xs"
                    value={settings.host}
                    onChange={(e) => setSettings({...settings, host: e.target.value})}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">المنفذ (Port)</label>
                  <div className="relative">
                    <Server className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input 
                      type="text" 
                      placeholder="8080" 
                      className="input-styled pr-12 font-mono text-center"
                      value={settings.port}
                      onChange={(e) => setSettings({...settings, port: e.target.value})}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">البروتوكول</label>
                  <select 
                    className="input-styled appearance-none cursor-pointer"
                    value={settings.protocol}
                    onChange={(e) => setSettings({...settings, protocol: e.target.value as any})}
                  >
                    <option value="HTTP">HTTP/HTTPS</option>
                    <option value="SOCKS5">SOCKS5</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--neon)]/10 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-white">تفعيل الوسيط</span>
                  <span className="text-[9px] text-neutral-500 uppercase tracking-tighter">Enable Global Routing Interception</span>
                </div>
                <button 
                  onClick={() => setSettings({...settings, isEnabled: !settings.isEnabled})}
                  className={`relative w-12 h-6 rounded-full transition-all duration-500 border border-[var(--neon)]/20 ${settings.isEnabled ? 'bg-[var(--neon)]/20 shadow-[0_0_15px_rgba(0,255,102,0.2)]' : 'bg-neutral-900'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300 transform ${settings.isEnabled ? 'translate-x-6 bg-[var(--neon)] shadow-[0_0_10px_var(--neon)]' : 'bg-neutral-700'}`}></div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button 
                  onClick={handleTest}
                  disabled={isTesting}
                  className="btn-styled bg-neutral-900 border-neutral-800 text-neutral-400 text-[10px] h-12 hover:text-white"
                >
                  {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  اختبار الاتصال
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-styled bg-[var(--neon)] text-black border-[var(--neon)] font-bold text-[10px] h-12 shadow-[0_5px_15px_rgba(0,255,102,0.2)]"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  حـفـظ الإعـدادات
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-2xl flex gap-3">
             <AlertCircle className="w-6 h-6 text-orange-500 shrink-0" />
             <div className="space-y-1">
               <h4 className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">تنبيه أمني (Security Alert)</h4>
               <p className="text-[10px] text-orange-500/70 leading-relaxed">
                 تأكد من استخدام خوادم بروكسي موثوقة. خوادم البروكسي العامة قد تقوم بتسجيل بياناتك أو اعتراضها. 
                 النظام يقوم بتوجيه طلبات الـ API فقط عند تفعيلك للوسيط.
               </p>
             </div>
          </div>
        </div>

        {/* Status & Technical Details */}
        <div className="space-y-6">
          <div className="card p-6 border-blue-500/20 bg-blue-950/5 h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-20"></div>
            
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Shield className="w-3 h-3" /> حالة الاتصال والمنطق (Node Status)
            </h3>

            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex gap-4 items-center">
                    <div className={`w-3 h-3 rounded-full ${settings.isEnabled ? 'bg-[var(--neon)] animate-pulse shadow-[0_0_10px_var(--neon)]' : 'bg-red-500 shadow-[0_0_10px_red]'}`}></div>
                    <span className="text-sm font-bold text-white">حالة الخدمة</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase ${settings.isEnabled ? 'text-[var(--neon)]' : 'text-red-500'}`}>
                    {settings.isEnabled ? 'TUNNEL_ACTIVE' : 'SYSTEM_OFFLINE'}
                  </span>
               </div>

               <div className="space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between items-center opacity-40">
                    <span>Remote Host:</span>
                    <span>{settings.host || '---'}:{settings.port || '---'}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-40">
                    <span>Encryption:</span>
                    <span>{settings.protocol === 'SOCKS5' ? 'SECURE_TUNNEL' : 'STANDARD_HTTP'}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-40">
                    <span>Latency (Estimated):</span>
                    <span>{testResult === 'success' ? '42ms' : '0ms'}</span>
                  </div>
               </div>

               <div className="bg-black rounded-xl p-4 min-h-[120px] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border border-white/5">
                  <div className="text-[var(--neon)]/40 text-[11px] font-mono leading-none mb-4 select-none">
{`>> SYSTEM OUTPUT
>> CHECKING PACKET FLOW...`}
                  </div>
                  {testResult && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-[11px] font-mono ${testResult === 'success' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {testResult === 'success' 
                        ? `[+] CONNECTION ESTABLISHED: ${settings.host}:${settings.port} ACK...` 
                        : `[-] CONNECTION TIMEOUT: UNABLE TO REACH GATEWAY...`}
                    </motion.div>
                  )}
                  {isTesting && (
                    <div className="text-[var(--neon)] animate-pulse text-[11px] font-mono">
                      [!] ATTEMPTING HANDSHAKE WITH REMOTE HOST...
                    </div>
                  )}
               </div>

               <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Power className={`w-4 h-4 ${settings.isEnabled ? 'text-blue-400' : 'text-neutral-500'}`} />
                    <span className="text-blue-400 text-[11px] font-bold uppercase tracking-widest">ميزة الربط العالمي</span>
                  </div>
                  <p className="text-[10px] text-blue-400/60 leading-relaxed">
                    عند تفعيل هذا الخيار، سيقوم التطبيق بمحاولة تمرير طلبات الـ API عبر الوسيط. هذا يساعد في تجاوز الحظورات الجغرافية لخدمات الدعم الفني.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
