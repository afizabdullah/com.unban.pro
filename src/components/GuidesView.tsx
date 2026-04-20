import React, { useState } from 'react';
import { BookOpen, Terminal, ShieldAlert, Zap, Search, ChevronRight, FileText, Lock, Globe, Flag, MessageSquare, Smartphone, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Guide {
  id: string;
  type: 'tutorial' | 'exploit' | 'technical';
  title: string;
  description: string;
  content: string;
  tags: string[];
}

const guides: Guide[] = [
  {
    id: '1',
    type: 'exploit',
    title: 'ثغرة الرد التلقائي (Auto-Response Exploit)',
    description: 'استغلال نظام الرد الآلي في دعم واتساب لتخطي الفلترة البشرية.',
    content: `تعتمد هذه الثغرة على إرسال رسائل في توقيت محدد (عادةً بين الساعة 3:00 و 4:00 صباحاً بتوقيت GMT) عندما يكون ضغط العمل على المراجعة البشرية في أقله.
    
الخطوات:
1. قم بتهيئة البريد الإلكتروني بعنوان يحتوي على "Critical System Error" ورقم الهاتف.
2. استخدم لغة تقنية معقدة (Technical Jargon) في بداية الرسالة.
3. أرفق البيانات الفنية المستخرجة من أداة UNBAN PRO.
4. سيقوم النظام الآلي بتصنيف الطلب كخطأ فني (Bug Report) بدلاً من مخالفة سياسات، مما يرفع احتمالية فك الحظر بنسبة 60%.`,
    tags: ['ثغرة', 'دعم فني', 'Automated']
  },
  {
    id: '2',
    type: 'tutorial',
    title: 'طريقة "التظلم القانوني" الفعالة',
    description: 'كيفية كتابة رسالة تظلم تجبر القسم القانوني على مراجعة حسابك.',
    content: `عند كتابة التظلم، يجب التركيز على الحقوق القانونية وشروط الخدمة.
    
النصائح:
- ابدأ بذكر أنك قرأت شروط الخدمة (ToS) ولم تنتهك أي بند.
- اذكر أن الرقم يستخدم لأغراض حيوية (عمل، دراسة، تواصل عائلي طارئ).
- اطلب "مراجعة يدوية" (Manual Review) بالاسم.
- استخدم اللغة الإنجليزية أو البرتغالية (دعم البرازيل سريع جداً).`,
    tags: ['شرح', 'تظلم', 'قانوني']
  },
  {
    id: '3',
    type: 'technical',
    title: 'تغيير المعرف الرقمي للجهاز (Device ID Spoofing)',
    description: 'لماذا يجب عليك تغيير بيانات جهازك المحاكي في كل طلب.',
    content: `تقوم شركة واتساب بتتبع المعرفات الفريدة للأجهزة (IMEI, Device ID). إذا أرسلت 10 طلبات لنفس الرقم من نفس الجهاز، سيتم حظر "الجهاز" نفسه من إرسال الطلبات.
    
الحل:
- استخدم أداة UNBAN PRO لتوليد "دعم فني" لجهاز مختلف في كل مرة.
- تأكد من أن إصدار الأندرويد متوافق مع نوع الجهاز المختار.
- يفضل استخدام أجهزة من فئة Google Pixel لأنها تمنح صلاحيات وصول أسرع في الأنظمة البرمجية.`,
    tags: ['تقني', 'أمان', 'Device ID']
  },
  {
    id: '4',
    type: 'exploit',
    title: 'ثغرة "النطاق الجغرافي" (Geo-Location Bypass)',
    description: 'استخدام بروكسيات معينة لتوجيه طلبك لأسرع مراكز الدعم.',
    content: `توجد مراكز دعم واتساب في مناطق مختلفة (دبلن، سنغافورة، ساوباولو).
    
الاستغلال:
- استخدام بروكسي "البرازيل" يوجهك لدعم ساوباولو وهو الأسرع في الرد على قضايا "الحظر المشدد".
- استخدام بروكسي "ألمانيا" يوجهك لدعم دبلن (أكثر صرامة ولكن أكثر دقة).
- تجنب إرسال الطلبات عبر IP محلي إذا كان مزود الخدمة لديك عليه حظر "Spam".`,
    tags: ['بروكسي', 'ثغرة', 'Geography']
  },
  {
    id: '5',
    type: 'tutorial',
    title: 'حل مشكلة "رقم هاتفك هذا محظور من استخدام واتساب"',
    description: 'الشرح الشامل للتعامل مع الحظر الرسمي النهائي.',
    content: `هناك نوعان من الحظر: مؤقت (Timer) ودائم (Permanent).
    
إذا ظهرت لك رسالة الحظر الدائم:
1. لا تحاول تسجيل الدخول بشكل متكرر (هذا يضيفك للقائمة السوداء).
2. انتظر 12 ساعة كاملة بدون محاولة واحدة.
3. قم بتوليد كود من "قسم الـ VIP" في أداة UNBAN PRO.
4. أرسل الرسالة عبر بريد إلكتروني "جديد" لم يسبق استخدامه في مراسلة الدعم.`,
    tags: ['شرح', 'مبتدئين', 'حلول']
  },
  {
    id: '6',
    type: 'technical',
    title: 'شرح أكواد الاستجابة (Diagnostic Codes)',
    description: 'ماذا تعني الأكواد مثل FE-GDE التي تظهر في الدعم الفني.',
    content: `هذه الأكواد هي مفاتيح تشخيصية يستخدمها مهندسو واتساب.
    
- FE-GDE: تعني خطأ في مزامنة البيانات الجغرافية.
- FE-VIDC: تعني وجود خلل في تعريف الجهاز (Video/Identity Device Code).
- FE-GDC: تعني خلل في قناة الاتصال المشفرة.
إدراج هذه الأكواد في رسالتك يوهم النظام أنك "مطور" أو "مستخدم متقدم" يواجه مشكلة برمجية حقيقية وليس مجرد مستخدم محظور.`,
    tags: ['تقني', 'أكواد', 'Diagnostics']
  }
];

export default function GuidesView() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'tutorial' | 'exploit' | 'technical'>('all');

  const filteredGuides = guides.filter(g => {
    const matchesSearch = g.title.includes(searchTerm) || g.content.includes(searchTerm) || g.tags.some(t => t.includes(searchTerm));
    const matchesFilter = activeFilter === 'all' || g.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6 flex-1 w-full pb-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--neon-dim)] rounded-xl border border-[var(--neon)]/30">
            <BookOpen className="w-6 h-6 text-[var(--neon)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">مخابئ البيانات : شروحات وثغرات</h2>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-[0.2em]">Intel Database Access v7.4</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <input 
              type="text" 
              placeholder="ابحث عن ثغرة أو شرح محدد..."
              className="input-styled pr-12 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1 bg-black/40 border border-[var(--glass-border)] rounded-xl overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'exploit', label: 'ثغرات' },
              { id: 'tutorial', label: 'شروحات' },
              { id: 'technical', label: 'تقني' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeFilter === f.id ? 'bg-[var(--neon)] text-black' : 'text-neutral-500 hover:text-white'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredGuides.map((guide) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="card p-5 group cursor-pointer border-r-4 border-r-neutral-800 hover:border-r-[var(--neon)] transition-all bg-neutral-900/40 relative overflow-hidden"
            >
              {guide.type === 'exploit' && <div className="absolute top-0 left-0 w-12 h-12 bg-red-500/10 rounded-br-full blur-xl pointer-events-none"></div>}
              {guide.type === 'technical' && <div className="absolute top-0 left-0 w-12 h-12 bg-blue-500/10 rounded-br-full blur-xl pointer-events-none"></div>}
              
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    guide.type === 'exploit' ? 'bg-red-500/10 text-red-500' :
                    guide.type === 'technical' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-[var(--neon-dim)] text-[var(--neon)]'
                  }`}>
                    {guide.type === 'exploit' ? <ShieldAlert className="w-4 h-4" /> :
                     guide.type === 'technical' ? <Code className="w-4 h-4" /> :
                     <FileText className="w-4 h-4" />}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[var(--neon)] transition-colors">{guide.title}</h3>
                </div>
                <div className="flex gap-2">
                  {guide.tags.map(tag => (
                    <span key={tag} className="text-[8px] px-2 py-0.5 bg-neutral-800 text-neutral-500 rounded uppercase font-mono">{tag}</span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed pr-1">
                {guide.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[var(--neon)] font-bold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:gap-4">
                <span>عرض التفاصيل والتعليمات البرمجية</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredGuides.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
            <Lock className="w-12 h-12 text-neutral-600" />
            <p className="text-xs font-mono uppercase tracking-[0.3em]">No classified intel found</p>
          </div>
        )}
      </div>

      {/* Guide Detail Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGuide(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            ></motion.div>
            
            <motion.div
              layoutId={selectedGuide.id}
              className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden relative z-10 p-8 border-b-4 border-b-[var(--neon)] flex flex-col styled-scrollbar"
            >
              <button 
                onClick={() => setSelectedGuide(null)}
                className="absolute left-6 top-6 p-2 bg-neutral-900 rounded-xl text-neutral-500 hover:text-white transition-colors"
              >
                إغلاق
              </button>

              <div className="flex items-center gap-4 mb-8">
                 <div className={`p-3 rounded-2xl ${
                    selectedGuide.type === 'exploit' ? 'bg-red-500 text-black' :
                    selectedGuide.type === 'technical' ? 'bg-blue-500 text-black' :
                    'bg-[var(--neon)] text-black'
                  }`}>
                    {selectedGuide.type === 'exploit' ? <Zap className="w-6 h-6" /> :
                     selectedGuide.type === 'technical' ? <Terminal className="w-6 h-6" /> :
                     <BookOpen className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">{selectedGuide.type} Report</span>
                    <h2 className="text-xl font-bold text-white">{selectedGuide.title}</h2>
                  </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="bg-neutral-950 p-6 rounded-2xl border border-[var(--glass-border)] font-sans text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {selectedGuide.content}
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Target Intel & Metadata</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-900 rounded-xl flex items-center gap-4">
                     <ShieldAlert className="w-5 h-5 text-neutral-600" />
                     <div className="flex flex-col">
                        <span className="text-[9px] text-neutral-500 uppercase">Risk Level</span>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">
                          {selectedGuide.type === 'exploit' ? 'Critical' : 'Standard'}
                        </span>
                     </div>
                  </div>
                  <div className="p-4 bg-neutral-900 rounded-xl flex items-center gap-4">
                     <Globe className="w-5 h-5 text-neutral-600" />
                     <div className="flex flex-col">
                        <span className="text-[9px] text-neutral-500 uppercase">Global Success</span>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">High</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-neutral-900 flex justify-between items-center">
                 <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Ref_ID: {selectedGuide.id}_SEC_CLR_4</p>
                 <div className="flex gap-2">
                    {selectedGuide.tags.map(t => (
                      <span key={t} className="text-[9px] font-bold text-[var(--neon)] px-3 py-1 bg-[var(--neon-dim)] rounded-full">#{t}</span>
                    ))}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
