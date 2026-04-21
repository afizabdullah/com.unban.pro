import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal, BookOpen, Clock, ShieldCheck, Zap, Info } from 'lucide-react';

export default function WelcomeView() {
  const [displayText, setDisplayText] = useState('');
  const fullText = "أهلاً بك في نظام Øᵘᶰʷᵃ ᵖʳᵒ࿐ - رفيقك المتكامل لفك الحظر وحل مشاكل الواتساب";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(interval);
      }
    }, 70);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col flex-1 w-full space-y-6"
    >
      {/* Typing Animated Welcome Text */}
      <div className="card p-6 text-center border-b-4 border-b-[var(--neon)] relative overflow-hidden">
        <div className="matrix-overlay opacity-10"></div>
        <div className="relative z-10">
          <motion.h1 
            className="text-xl font-bold mb-4 font-display min-h-[5rem] flex items-center justify-center px-4"
            style={{
              background: 'linear-gradient(to right, #00ff66, #00ccff, #ff00ff, #ffcc00, #00ff66)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'rainbow-text 3s linear infinite'
            }}
          >
            {displayText}
            <span className="animate-pulse w-1 h-8 bg-[var(--neon)] ml-1"></span>
          </motion.h1>
          
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
            Secure Terminal Connection Established // Root_Access_Granted
          </p>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-5 h-5 text-[var(--neon)]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">تعليمات الاستخدام البسيطة</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <InstructionCard 
            icon={<ShieldCheck className="w-4 h-4" />}
            title="فك الحظر (الخيار الثاني)"
            desc="إذا كان رقمك محظوراً، توجه لقسم 'طلب فك حظر' واملأ البيانات بدقة ليقوم النظام بإرسال طلب فك التشفير."
          />
          <InstructionCard 
            icon={<Clock className="w-4 h-4" />}
            title="مشكلة تأخير الكود"
            desc="إذا ظهرت لك رسالة (لا يمكنك طلب الكود إلا بعد 8 أو 24 ساعة)، توجه لقسم 'حل مشكلة التأخير' واتبع التعليمات البرمجية لتجاوز العداد."
          />
          <InstructionCard 
            icon={<Zap className="w-4 h-4" />}
            title="خوادم البروكسي"
            desc="استخدم البروكسيات المتاحة لتغيير هويتك الرقمية (IP) مما يساعد في تسريع قبول طلبات فك الحظر."
          />
          <InstructionCard 
            icon={<Info className="w-4 h-4" />}
            title="الدعم الفني"
            desc="إذا واجهت أي مشكلة، تواصل معنا فوراً عبر تلجرام أو واتساب من واجهة الدخول."
          />
        </div>
      </div>

      {/* Code Delay Explanation - Crucial Part requested by user */}
      <div className="card p-5 bg-blue-900/10 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-3 text-blue-400">
          <BookOpen className="w-5 h-5" />
          <h3 className="text-xs font-bold uppercase tracking-wider">شرح مشكلة تأخير الكود</h3>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed text-right">
          هذه المشكلة تظهر عندما تطلب الكود عدة مرات بشكل خاطئ أو من جهاز مشبوه. يقوم واتساب بفرض "عداد زمني" يمنعك من طلب الكود عبر SMS لمدة تصل إلى 24 ساعة. 
          <br /><br />
          <span className="text-white font-bold">الحل المدمج:</span> نقوم باستخدام ثغرة برمجية تطلب الكود عبر "الاتصال الصوتي" بدلاً من SMS، مع تنظيف ذاكرة الكاش الخاصة بالتطبيق وإيهام الواتساب بأنك تستخدم جهازاً جديداً كلياً.
        </p>
      </div>

      <style>{`
        @keyframes rainbow-text {
          to { background-position: 200% center; }
        }
      `}</style>
    </motion.div>
  );
}

function InstructionCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-4 rounded-2xl bg-neutral-900/50 border border-[var(--glass-border)] flex items-start gap-4 hover:border-[var(--neon-dim)] transition-all">
      <div className="p-2 rounded-xl bg-neutral-900 text-[var(--neon)]">
        {icon}
      </div>
      <div>
        <h4 className="text-[12px] font-bold text-white mb-1">{title}</h4>
        <p className="text-[10px] text-neutral-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
