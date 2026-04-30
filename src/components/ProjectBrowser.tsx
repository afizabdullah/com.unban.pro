import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Code, Play, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Copy, BookOpen } from 'lucide-react';
import { projects, Project } from '../ProjectData';

export default function ProjectBrowser() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <Terminal className="w-5 h-5 text-[var(--neon)]" />
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">دليل المشاريع التعليمية</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <motion.button
            key={project.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedProject(project)}
            className="card p-5 text-right flex flex-col gap-2 border border-neutral-800 hover:border-[var(--neon-dim)] transition-all bg-neutral-900/40"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--neon-dim)] text-[var(--neon)] font-bold uppercase">
                {project.category}
              </span>
              <h3 className="text-sm font-bold text-white">{project.name}</h3>
            </div>
            <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
              {project.explanation}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[var(--neon)] text-[10px] font-bold">
              <span>عرض الخطوات والكود</span>
              <ChevronLeft className="w-3 h-3" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ProjectDetail({ project, onBack }: { project: Project, onBack: () => void }) {
  const [activeStep, setActiveStep] = useState(0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم نسخ الكود بنجاح!');
  };

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="space-y-6 pb-20"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4"
      >
        <ChevronRight className="w-5 h-5" />
        <span className="text-xs font-bold">العودة للقائمة</span>
      </button>

      <div className="card p-6 border-b-4 border-b-[var(--neon)]">
        <h2 className="text-xl font-bold text-white mb-4">{project.name}</h2>
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <p className="text-xs text-gray-300 leading-relaxed italic">
             "{project.explanation}"
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Play className="w-4 h-4 text-[var(--neon)]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">خطوات التنفيذ (AIDE Plus)</h3>
        </div>
        <div className="space-y-3">
          {project.steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/50">
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-[var(--neon)] shrink-0">
                {idx + 1}
              </div>
              <p className="text-[11px] text-gray-400">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Code className="w-4 h-4 text-[var(--neon)]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">الأكواد البرمجية</h3>
        </div>
        <div className="space-y-6">
          {project.codeFiles.map((file, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <button 
                  onClick={() => copyToClipboard(file.content)}
                  className="p-1 px-2 rounded bg-neutral-900 hover:bg-neutral-800 text-gray-500 hover:text-[var(--neon)] transition-all flex items-center gap-2 border border-neutral-800"
                >
                  <Copy className="w-3 h-3" />
                  <span className="text-[9px] font-bold">نسخ</span>
                </button>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[var(--neon)] block">{file.name}</span>
                  <span className="text-[9px] text-gray-500">{file.explanation}</span>
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 overflow-x-auto text-[10px] font-mono text-blue-400 text-left ltr">
                <code>{file.content}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 bg-green-900/10 border-green-500/30">
        <div className="flex items-center gap-3 mb-3 text-green-400">
          <BookOpen className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">كيف نشغل المشروع؟</h3>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          {project.howToRun}
        </p>
      </section>

      <section className="card p-5 bg-red-900/10 border-red-500/30">
        <div className="flex items-center gap-3 mb-3 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">أخطاء شائعة وحلها</h3>
        </div>
        <div className="space-y-3">
          {project.commonErrors.map((err, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[11px] font-bold text-red-300">❌ {err.error}</p>
              <p className="text-[10px] text-gray-500">✅ الحل: {err.fix}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="p-6 rounded-2xl bg-[var(--neon-dim)] border border-[var(--neon)]/30 text-center">
        <CheckCircle className="w-10 h-10 text-[var(--neon)] mx-auto mb-3" />
        <h4 className="text-sm font-bold text-white mb-1">النتيجة المتوقعة</h4>
        <p className="text-[10px] text-gray-400">{project.resultDescription}</p>
      </div>
    </motion.div>
  );
}
