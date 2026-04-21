import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, RefreshCw, Smartphone, ShieldCheck, AlertCircle, Zap } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function CodeDelayView() {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  const handleFix = () => {
    if (!phone.trim()) {
      notify("يرجى إدخال رقم الهاتف أولاً", "error");
      return;
    }
    setLoading(true);
    // Simulate complex background operation
    setTimeout(() => {
      setLoading(false);
      notify("تم تنفيذ تعليمات تخطي عداد الوقت بنجاح. يرجى المحاولة الآن.", "success");
    }, 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col space-y-6"
    >
      <div className="card p-6 border-b-2 border-blue-500/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
            <Clock className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">حل مشكلة تأخير الكود</h2>
            <p className="text-[10px] text-blue-400 font-mono">Bypass_Cooldown_v1.0</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-100 leading-relaxed">
                هذا القسم مخصص للحالات التي يظهر فيها تنبيه: "لا يمكنك طلب رسالة نصية إلا بعد 8 ساعات أو 24 ساعة".
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mr-1">رقم الهاتف المستهدف</label>
            <div className="relative group">
              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="tel"
                placeholder="+967 7xx xxx xxx"
                className="input-styled pr-12 focus:border-blue-500 shadow-[0_0_0_rgba(59,130,246,0)] focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleFix}
            disabled={loading}
            className="btn-styled w-full bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-[0_10px_20px_rgba(37,99,235,0.2)] disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                تخطي عداد الانتظار الآن
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card p-5 bg-neutral-900 overflow-hidden relative">
        <div className="matrix-overlay opacity-5"></div>
        <h3 className="text-xs font-bold text-[var(--neon)] mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> تعليمات هامة للمحترفين
        </h3>
        <ul className="space-y-3">
          <Step num="1" text="قم بمسح بيانات تطبيق واتساب (Clear Data) من إعدادات الهاتف." />
          <Step num="2" text="قم بتشغيل وضع الطيران لمدة 30 ثانية ثم أوقفه." />
          <Step num="3" text="استخدم رقم الهاتف أعلاه واضغط على زر التخطي في تطبيقنا." />
          <Step num="4" text="افتح واتساب واطلب الكود عبر 'اتصال' (Call Me) وليس رسالة نصية." />
        </ul>
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
      <span className="w-5 h-5 rounded-full bg-[var(--neon-dim)] border border-[var(--neon)] flex items-center justify-center text-[10px] font-bold text-[var(--neon)] shrink-0">{num}</span>
      <p className="text-[11px] text-gray-400">{text}</p>
    </li>
  );
}
