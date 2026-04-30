import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal, BookOpen, Clock, ShieldCheck, Zap, Info } from 'lucide-react';

export default function WelcomeView() {
  const [displayText, setDisplayText] = useState('');
  const fullText = "أهلاً بك يا بطل! أنا معلمك الأسطوري في AIDE Plus. هل أنت مستعد لتبدأ رحلتك في عالم برمجة الأندرويد؟";

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
            className="text-lg font-bold mb-4 font-display min-h-[5rem] flex items-center justify-center px-4 leading-relaxed"
            style={{
              background: 'linear-gradient(to right, #00ff66, #00ccff, #ff00ff, #ffcc00, #00ff66)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'rainbow-text 3s linear infinite'
            }}
          >
            {displayText}
            <span className="animate-pulse w-1 h-6 bg-[var(--neon)] ml-1"></span>
          </motion.h1>
          
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
            Mentor Online // Ready to Teach
          </p>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-5 h-5 text-[var(--neon)]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">كيف نبدأ التعلم؟</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <InstructionCard 
            icon={<BookOpen className="w-4 h-4" />}
            title="دليل المشاريع"
            desc="توجه إلى قسم 'دليل المشاريع' حيث ستجد قائمة بكل ما ترغب في تعلمه، من التطبيقات البسيطة إلى الـ Mod Menu المعقد."
          />
          <InstructionCard 
            icon={<ShieldCheck className="w-4 h-4" />}
            title="خطوة بخطوة"
            desc="كل مشروع مشروح باللغة العربية البسيطة مع الكود الكامل وخطوات التنفيذ داخل تطبيق AIDE Plus."
          />
          <InstructionCard 
            icon={<Zap className="w-4 h-4" />}
            title="الأكواد جاهزة"
            desc="يمكنك نسخ الأكواد مباشرة ولصقها في ملفات مشروعك داخل AIDE Plus لترى النتيجة فوراً."
          />
        </div>
      </div>

      <div className="card p-5 bg-blue-900/10 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-3 text-blue-400">
          <Info className="w-5 h-5" />
          <h3 className="text-xs font-bold uppercase tracking-wider">نصيحة المعلم</h3>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed text-right">
          لا تخف من الأخطاء! البرمجة هي فن حل المشاكل. إذا ظهر لك خطأ أحمر، اقرأه جيداً أو راجع قسم 'أخطاء شائعة' في المشروع. أنت هنا لتتعلم وتصبح محترفاً.
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
