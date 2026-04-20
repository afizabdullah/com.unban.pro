import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Send, Mail, Phone, ChevronDown, ChevronUp, AlertCircle, ShieldCheck, Zap, Info, ExternalLink, LifeBuoy, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "كم تستغرق عملية فك الحظر؟",
    answer: "تختلف المدة حسب نوع الحظر. الحظر المؤقت غالباً ما يفك خلال 12-24 ساعة. أما الحظر الدائم فقد يتطلب من 48 ساعة إلى 7 أيام عمل حسب الثغرة المستخدمة."
  },
  {
    question: "هل استخدام الأداة آمن؟",
    answer: "نعم، الأداة مصممة لتعمل عبر نظام طلبات الدعم الرسمي. نحن لا نطلب الوصول إلى بياناتك الشخصية أو ملفات الوسائط الخاصة بك."
  },
  {
    question: "لماذا يظهر فشل في إرسال الطلب أحياناً؟",
    answer: "قد يكون السبب هو ضغط السيرفر أو أن الرقم أدخل بشكل خاطئ. تأكد من إدراج رمز الدولة (مثل +967) قبل الرقم."
  },
  {
    question: "ما هو الفرق بين النسخة العادية والـ VIP؟",
    answer: "النسخة العادية تستخدم ثغرات عامة، بينما الـ VIP توفر وصولاً إلى خوادم بروكسي خاصة وطلبات 'أولوية قصوى' لضمان رد أسرع من الدعم الفني."
  },
  {
    question: "هل يمكن فك حظر أرقام الدول الأجنبية؟",
    answer: "تطبيق UNBAN PRO يدعم جميع دول العالم، ولكن فرص النجاح تزداد عند استخدام لغة تتناسب مع دولة الرقم (مثلاً البرتغالية للأرقام البرازيلية)."
  },
  {
    question: "ماذا أفعل إذا تم رفض طلبي؟",
    answer: "لا تقلق، الرفض الأول شائع. انتظر 24 ساعة ثم حاول مرة أخرى باستخدام ‘ثغرة’ مختلفة من قسم الشروحات."
  }
];

export default function HelpSupportView() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6 flex-1 w-full pb-10">
      <header className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/30">
          <HelpCircle className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">مركز المساعدة والدعم</h2>
          <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-[0.2em]">Customer Support Portal v2.0</p>
        </div>
      </header>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a 
          href="https://t.me/CYBBEEAGLE" 
          target="_blank" 
          rel="noopener noreferrer"
          className="card p-6 bg-blue-950/20 border-blue-500/30 hover:border-blue-500 transition-all group flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-blue-500 text-black shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">المطور - تليجرام</h3>
            <p className="text-[10px] text-blue-400 font-mono">@CYBBEEAGLE</p>
          </div>
          <ExternalLink className="w-4 h-4 text-neutral-600 mr-auto" />
        </a>

        <a 
          href="https://wa.me/967783799137" 
          target="_blank" 
          rel="noopener noreferrer"
          className="card p-6 bg-green-950/20 border-green-500/30 hover:border-green-500 transition-all group flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] group-hover:scale-110 transition-transform">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">الدعم الفني - واتساب</h3>
            <p className="text-[10px] text-green-400 font-mono">+967 783799137</p>
          </div>
          <ExternalLink className="w-4 h-4 text-neutral-600 mr-auto" />
        </a>
      </div>

      {/* Common Problems / Quick Help Tips */}
      <div className="card p-6 border-amber-500/20 bg-amber-950/5">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">نصائح لزيادة فرص فك الحظر</h3>
        </div>
        <div className="space-y-3">
          {[
            { icon: Zap, text: "حاول إرسال الطلب في أوقات الفجر لتقليل ضغط المراجعة." },
            { icon: ShieldCheck, text: "استخدم دائماً بريداً إلكترونياً رسمياً (Gmail/Outlook) لم يسبق حظره." },
            { icon: Globe, text: "تفعيل 'البروكسي' من الإعدادات يحسن من جودة الاتصال بسيرفرات الدعم." },
            { icon: Info, text: "لا تكرر الطلب أكثر من مرتين في الـ 24 ساعة لتجنب تجميد المراجعة." }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-3 bg-black/30 rounded-xl border border-neutral-800">
               <item.icon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
               <p className="text-[11px] text-neutral-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <LifeBuoy className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">الأسئلة الشائعة (FAQ)</h3>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-neutral-900 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 bg-neutral-900/50 hover:bg-neutral-900 transition-colors text-right"
              >
                <span className="text-xs font-bold text-neutral-200">{faq.question}</span>
                {openFaq === index ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-neutral-600" />}
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-neutral-950/50"
                  >
                    <div className="p-4 text-[11px] text-neutral-500 leading-relaxed border-t border-neutral-900">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <div className="mt-10 pt-6 border-t border-neutral-900 text-center">
        <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-[0.2em]">UNBAN PRO - Support Division</p>
        <p className="text-[8px] text-neutral-700 mt-1 uppercase">Encrypting support data for your privacy</p>
      </div>
    </div>
  );
}
