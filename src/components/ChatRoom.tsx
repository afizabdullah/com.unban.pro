import React, { useState, useEffect, useRef } from 'react';
import { Send, User, RefreshCw, MessageSquare, Terminal, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { db, auth } from '../firebase-setup';
import { useNotification } from '../contexts/NotificationContext';

interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  avatarSeed?: string;
  uid: string;
  timestamp: any;
  visibility: string;
}

export default function ChatRoom() {
  const { notify } = useNotification();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [userName, setUserName] = useState(() => localStorage.getItem('chatUserName') || '');
  const [avatarSeed, setAvatarSeed] = useState(() => localStorage.getItem('chatAvatarSeed') || '');
  
  const [isJoined, setIsJoined] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');
  
  const [uid, setUid] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let storedUid = localStorage.getItem('chat_uid');
    if (!storedUid) {
      storedUid = 'user_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('chat_uid', storedUid);
    }
    setUid(storedUid);
    
    if (!localStorage.getItem('chatAvatarSeed')) {
      setTempAvatar(Math.random().toString(36).substring(2, 8));
    } else {
      setTempAvatar(localStorage.getItem('chatAvatarSeed')!);
    }
  }, []);

  useEffect(() => {
    if (userName && uid && avatarSeed) {
      setIsJoined(true);
    }
  }, [userName, uid, avatarSeed]);

  useEffect(() => {
    if (!isJoined || !auth.currentUser) return;

    const q = query(
      collection(db, 'chat_messages'),
      where('visibility', '==', 'public'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
    });

    return () => unsubscribe();
  }, [isJoined, auth.currentUser]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    
    localStorage.setItem('chatUserName', tempName.trim());
    localStorage.setItem('chatAvatarSeed', tempAvatar);
    
    setUserName(tempName.trim());
    setAvatarSeed(tempAvatar);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !uid || !userName) return;

    const text = newMessage;
    setNewMessage(''); 

    try {
      await addDoc(collection(db, 'chat_messages'), {
        text: text.slice(0, 500),
        senderName: userName.slice(0, 50),
        avatarSeed: avatarSeed,
        uid: auth.currentUser?.uid || uid,
        visibility: 'public',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
      notify("حدث خطأ أثناء إرسال الرسالة.", "error");
    }
  };

  const refreshAvatar = () => {
    setTempAvatar(Math.random().toString(36).substring(2, 8));
  };

  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full pt-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-sm w-full p-8 text-center border-b-4 border-b-[var(--neon)]"
        >
          <div className="w-24 h-24 rounded-2xl border-2 border-[var(--neon)] flex items-center justify-center mx-auto mb-6 bg-neutral-900/50 shadow-[0_0_30px_rgba(0,255,102,0.2)] relative overflow-hidden group">
            {tempAvatar ? (
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${tempAvatar}&backgroundColor=050505`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-[var(--neon)]" />
            )}
            <button 
              type="button"
              onClick={refreshAvatar}
              className="absolute inset-0 bg-neutral-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RefreshCw className="w-8 h-8 text-[var(--neon)]" />
            </button>
          </div>

          <h2 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-widest">محطة تواصل عامة</h2>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-8">قم بتعريف هويتك لدخول الشبكة المشتركة</p>
          
          <form onSubmit={handleJoin} className="space-y-5">
            <div className="space-y-2">
              <input 
                type="text" 
                className="input-styled text-center" 
                placeholder="NICKNAME" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                maxLength={20}
              />
            </div>
            <button type="submit" className="btn-styled btn-primary w-full disabled:opacity-50" disabled={!tempName.trim()}>
              دخول النظام
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col flex-1 max-w-4xl mx-auto w-full h-[calc(100vh-120px)] card p-0 overflow-hidden relative"
    >
      <div className="matrix-overlay opacity-20"></div>
      
      <div className="header-glass relative z-10 px-6 py-4 flex justify-between items-center bg-neutral-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--neon-dim)] rounded-lg">
            <MessageSquare className="w-4 h-4 text-[var(--neon)]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">الدردشة العامة</h3>
            <p className="text-[9px] text-[var(--neon)] font-mono uppercase">Node: Global_1</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-neutral-950/50 border border-[var(--glass-border)] pr-1 pl-4 py-1 rounded-full">
          {avatarSeed && (
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=050505`} alt="my avatar" className="w-7 h-7 rounded-full border border-[var(--neon)]/30" />
          )}
          <span className="text-[10px] font-mono text-white font-bold">{userName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 relative z-10 styled-scrollbar bg-black/20">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
            <Terminal className="w-12 h-12 text-neutral-600 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-mono">No decryption logs available...</span>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.uid === uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 px-2`}>
              <div className="w-9 h-9 rounded-xl border border-[var(--glass-border)] overflow-hidden shrink-0 bg-neutral-900 shadow-lg">
                 {msg.avatarSeed ? (
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.avatarSeed}&backgroundColor=050505`} alt="avatar" className="w-full h-full" />
                 ) : (
                    <User className="w-full h-full p-1.5 text-neutral-600" />
                 )}
              </div>
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[10px] font-bold ${isMe ? 'text-[var(--neon)]' : 'text-neutral-400'} uppercase tracking-tight`}>{msg.senderName}</span>
                  {msg.timestamp && (
                    <span className="text-[8px] font-mono text-neutral-600">
                      {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : ''}
                    </span>
                  )}
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm font-sans ${isMe ? 'bg-[var(--neon)] text-black font-medium rounded-tr-none' : 'bg-neutral-800/80 border border-[var(--glass-border)] text-gray-200 rounded-tl-none backdrop-blur-sm'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-neutral-900/80 backdrop-blur-md border-t border-[var(--glass-border)] relative z-10 transition-all duration-300">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text"
            className="input-styled flex-1"
            placeholder="اكتب رسالتك لجميع الرواد..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={400}
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-styled btn-primary px-4 w-14 shrink-0 transition-all active:scale-110"
          >
            <Send className="w-5 h-5 rtl:-scale-x-100" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
