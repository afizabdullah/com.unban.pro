import React, { useState, useEffect, useRef } from 'react';
import { Send, User, RefreshCw, MessageSquare, Terminal, Loader2, Image as ImageIcon, Paperclip, X, Trash2, Shield, Lock as LockIcon, Globe, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, where, deleteDoc, doc, or } from 'firebase/firestore';
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
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  recipientId?: string;
}

export default function ChatRoom() {
  const { notify } = useNotification();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<{data: string, type: string, name: string} | null>(null);
  
  const [userName, setUserName] = useState(() => localStorage.getItem('chatUserName') || '');
  const [avatarSeed, setAvatarSeed] = useState(() => localStorage.getItem('chatAvatarSeed') || '');
  
  const [isJoined, setIsJoined] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');
  
  const [uid, setUid] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'public' | 'private'>('public');
  const [activeRecipient, setActiveRecipient] = useState<{uid: string, name: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    let q;
    if (chatMode === 'public') {
      q = query(
        collection(db, 'chat_messages'),
        where('visibility', '==', 'public'),
        orderBy('timestamp', 'asc'),
        limit(100)
      );
    } else {
      // In private mode, we need to see messages where:
      // (uid == me AND recipientId == them) OR (uid == them AND recipientId == me)
      q = query(
        collection(db, 'chat_messages'),
        where('visibility', '==', 'private'),
        orderBy('timestamp', 'asc'),
        limit(100)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as ChatMessage;
        // Client side filtering for security + rule enforcement
        if (chatMode === 'public') {
          msgs.push({ id: doc.id, ...data });
        } else {
          const myUid = auth.currentUser?.uid;
          if (
            (data.uid === myUid && data.recipientId === activeRecipient?.uid) ||
            (data.uid === activeRecipient?.uid && data.recipientId === myUid)
          ) {
            msgs.push({ id: doc.id, ...data });
          }
        }
      });
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error("Firestore Listen Error [chat_messages]:", error);
    });

    return () => unsubscribe();
  }, [isJoined, auth.currentUser, chatMode, activeRecipient]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    
    localStorage.setItem('chatUserName', tempName.trim());
    localStorage.setItem('chatAvatarSeed', tempAvatar);
    
    setUserName(tempName.trim());
    setAvatarSeed(tempAvatar);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // Limit to ~800KB due to firestore doc limit (1MB total)
      notify("الملف كبير جداً. الحد الأقصى 800 كيلوبايت لضمان الأداء.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        data: event.target?.result as string,
        type: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, 'chat_messages', msgId));
      notify("تم حذف الرسالة بنجاح.", "success");
    } catch (error) {
      console.error("Error deleting message:", error);
      notify("فشل حذف الرسالة.", "error");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !uid || !userName) return;

    const text = newMessage;
    const file = selectedFile;
    setNewMessage(''); 
    setSelectedFile(null);

    try {
      const payload: any = {
        text: text.slice(0, 500),
        senderName: userName.slice(0, 50),
        avatarSeed: avatarSeed,
        uid: auth.currentUser?.uid || uid,
        visibility: chatMode,
        timestamp: serverTimestamp()
      };

      if (file) {
        payload.fileUrl = file.data;
        payload.fileType = file.type;
        payload.fileName = file.name;
      }

      if (chatMode === 'private' && activeRecipient) {
        payload.recipientId = activeRecipient.uid;
      }

      await addDoc(collection(db, 'chat_messages'), payload);
    } catch (error: any) {
      console.error("Error sending message:", error);
      notify("حدث خطأ أثناء إرسال الرسالة: " + (error.message || ""), "error");
    }
  };

  const startPrivateChat = (msg: ChatMessage) => {
    if (msg.uid === (auth.currentUser?.uid || uid)) return;
    setActiveRecipient({ uid: msg.uid, name: msg.senderName });
    setChatMode('private');
    notify(`بدأت دردشة خاصة مع ${msg.senderName}`, 'info');
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
      
      <div className="header-glass relative z-10 px-4 py-3 flex justify-between items-center bg-neutral-900/60 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${chatMode === 'public' ? 'bg-[var(--neon-dim)] text-[var(--neon)]' : 'bg-blue-500/20 text-blue-400'}`}>
            {chatMode === 'public' ? <Globe className="w-4 h-4" /> : <LockIcon className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">
                 {chatMode === 'public' ? 'الدردشة العامة' : `دردشة خاصة: ${activeRecipient?.name}`}
               </h3>
               {chatMode === 'private' && (
                 <button onClick={() => setChatMode('public')} className="text-[8px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400 hover:text-white">
                   عودة للعامة
                 </button>
               )}
            </div>
            <p className="text-[8px] text-[var(--neon)] font-mono uppercase">
              {chatMode === 'public' ? 'Node: Global_Shared' : `Encrypted_Session_${activeRecipient?.uid?.slice(0, 8)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-neutral-950/50 border border-[var(--glass-border)] pr-1 pl-3 py-1 rounded-full">
          {avatarSeed && (
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=050505`} alt="my avatar" className="w-6 h-6 rounded-full border border-[var(--neon)]/30" />
          )}
          <span className="text-[9px] font-mono text-white font-bold">{userName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 styled-scrollbar bg-black/40">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
            <Terminal className="w-10 h-10 text-neutral-600 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-mono">No communication signals detected...</span>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.uid === (auth.currentUser?.uid || uid);
          const isImage = msg.fileType?.startsWith('image/');
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 px-1 group`}>
              <button 
                onClick={() => !isMe && startPrivateChat(msg)}
                className="w-8 h-8 rounded-lg border border-[var(--glass-border)] overflow-hidden shrink-0 bg-neutral-900 shadow-lg hover:scale-110 transition-transform"
                title={isMe ? "أنت" : "بدء دردشة خاصة"}
              >
                 {msg.avatarSeed ? (
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.avatarSeed}&backgroundColor=050505`} alt="avatar" className="w-full h-full" />
                 ) : (
                    <User className="w-full h-full p-1 text-neutral-600" />
                 )}
              </button>
              
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[9px] font-bold ${isMe ? 'text-[var(--neon)]' : 'text-neutral-400'} uppercase tracking-tight`}>{msg.senderName}</span>
                  {msg.timestamp && (
                    <span className="text-[7px] font-mono text-neutral-600">
                      {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : ''}
                    </span>
                  )}
                  {isMe && (
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-opacity p-0.5"
                      title="حذف الرسالة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                   )}
                </div>

                <div className={`px-3 py-2 rounded-xl text-[12px] leading-relaxed shadow-sm relative ${isMe ? 'bg-[var(--neon)] text-black font-medium rounded-tr-none' : 'bg-neutral-800/80 border border-[var(--glass-border)] text-gray-200 rounded-tl-none backdrop-blur-sm'}`}>
                  {msg.fileUrl && (
                    <div className="mb-2 overflow-hidden rounded-lg bg-black/20">
                      {isImage ? (
                        <img 
                          src={msg.fileUrl} 
                          alt="shared" 
                          className="max-w-full max-h-60 object-contain cursor-pointer hover:scale-[1.02] transition-transform"
                          onClick={() => window.open(msg.fileUrl, '_blank')}
                        />
                      ) : (
                        <div className="p-3 flex items-center gap-3 bg-neutral-900/50">
                          <Paperclip className="w-4 h-4 text-blue-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] truncate font-mono text-neutral-300">{msg.fileName}</p>
                            <p className="text-[8px] text-neutral-500 uppercase">{msg.fileType}</p>
                          </div>
                          <a 
                            href={msg.fileUrl} 
                            download={msg.fileName}
                            className="bg-neutral-800 p-1.5 rounded hover:bg-neutral-700 transition-colors"
                          >
                            <Download className="w-3 h-3 text-white" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-neutral-900/90 backdrop-blur-xl border-t border-[var(--glass-border)] relative z-10">
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 bg-neutral-950/80 rounded-xl border border-[var(--neon)]/30 overflow-hidden flex items-center p-2 gap-3"
            >
              {selectedFile.type.startsWith('image/') ? (
                <div className="w-12 h-12 rounded bg-black flex-shrink-0 overflow-hidden border border-white/10">
                  <img src={selectedFile.data} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <Paperclip className="w-5 h-5 text-neutral-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-white truncate">{selectedFile.name}</p>
                <p className="text-[8px] text-[var(--neon)] uppercase tracking-wider">Ready to secure transmit...</p>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex gap-1">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-styled bg-neutral-800 hover:bg-neutral-700 px-3 border-neutral-700"
              title="إرفاق ملف أو صورة"
            >
              <Paperclip className="w-4 h-4 text-neutral-400" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect}
              accept="image/*, .pdf, .txt, .json"
            />
          </div>

          <input 
            type="text"
            className="input-styled flex-1"
            placeholder={chatMode === 'public' ? "بث رسالة عامة للجميع..." : `رسالة خاصة مشفرة إلى ${activeRecipient?.name}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={400}
          />
          
          <button 
            type="submit"
            disabled={!newMessage.trim() && !selectedFile}
            className={`btn-styled px-4 w-12 shrink-0 transition-all active:scale-95 ${chatMode === 'public' ? 'btn-primary' : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'}`}
          >
            <Send className="w-4 h-4 rtl:-scale-x-100" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
