import React, { useState, useEffect, useRef } from 'react';
import { Send, User, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase-setup';
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
    // Generate or retrieve a local device UUID for chat representation
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
    if (!isJoined || !uid) return;

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
  }, [isJoined, uid]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    
    // Save to local storage
    localStorage.setItem('chatUserName', tempName.trim());
    localStorage.setItem('chatAvatarSeed', tempAvatar);
    
    // Set to state
    setUserName(tempName.trim());
    setAvatarSeed(tempAvatar);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !uid || !userName) return;

    const text = newMessage;
    setNewMessage(''); // optimistic clear

    try {
      await addDoc(collection(db, 'chat_messages'), {
        text: text.slice(0, 500),
        senderName: userName.slice(0, 50),
        avatarSeed: avatarSeed,
        uid,
        visibility: 'public',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
      notify("حدث خطأ أثناء إرسال الرسالة. الرجاء التأكد من اتصالك.", "error");
    }
  };

  const refreshAvatar = () => {
    setTempAvatar(Math.random().toString(36).substring(2, 8));
  };

  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card max-w-sm w-full text-center"
        >
          <div className="w-24 h-24 bg-[var(--neon)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--neon)] relative overflow-hidden group">
            {tempAvatar ? (
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${tempAvatar}&backgroundColor=050505`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-[var(--neon)]" />
            )}
            <button 
              type="button"
              onClick={refreshAvatar}
              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="تغيير الصورة الرمزية"
            >
              <RefreshCw className="w-8 h-8 text-[var(--neon)]" />
            </button>
          </div>
          <h2 className="text-xl font-bold mb-2">غرفة الدردشة العامة</h2>
          <p className="text-sm opacity-70 mb-6">يرجى إدخال اسمك لدخول الغرفة والتواصل مع باقي المستخدمين.</p>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <input 
              type="text" 
              className="input-styled text-center text-lg" 
              placeholder="اكتب اسمك هنا..." 
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              autoFocus
              maxLength={20}
            />
            <button type="submit" className="btn-styled w-full flex justify-center items-center gap-2 text-lg disabled:opacity-50" disabled={!tempName.trim()}>
              دخول الغرفة
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
      className="flex flex-col flex-1 max-w-4xl mx-auto w-full h-[calc(100vh-120px)] card p-0 overflow-hidden"
    >
      <div className="bg-[var(--dark-bg)] border-b border-[var(--neon)] p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--neon)] status-pulse"></div>
          <h3 className="font-bold">غرفة الدردشة المباشرة</h3>
        </div>
        <div className="text-sm border border-[var(--grid-line)] px-3 py-1 rounded bg-[var(--dim-green)]/10 text-[var(--neon)] flex items-center gap-2">
          {avatarSeed ? (
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=050505`} alt="my avatar" className="w-6 h-6 rounded-full border border-[var(--neon)]" />
          ) : (
            <User className="w-4 h-4" />
          )}
          {userName}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--dark-bg)]/30 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center opacity-50 mt-10 text-sm">
            لا توجد رسائل بعد.. كن أول من يكتب!
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.uid === uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className="w-8 h-8 rounded-full border border-[var(--grid-line)] overflow-hidden shrink-0 bg-gray-900 object-cover">
                 {msg.avatarSeed ? (
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.avatarSeed}&backgroundColor=050505`} alt="avatar" className="w-full h-full" />
                 ) : (
                    <User className="w-full h-full p-1 text-gray-500" />
                 )}
              </div>
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div className="text-xs opacity-50 mb-1 px-1 flex gap-2">
                  <span>{msg.senderName}</span>
                  {msg.timestamp && (
                    <span className="opacity-50">
                      {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  )}
                </div>
                <div className={`p-3 rounded-lg text-sm leading-relaxed ${isMe ? 'bg-[var(--dim-green)] border border-[var(--neon)]/50 text-[var(--neon)] rounded-br-none' : 'bg-gray-800/80 border border-gray-700 text-gray-200 rounded-bl-none'}`} dir="auto">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[var(--dark-bg)] border-t border-[var(--neon)]">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text"
            className="input-styled flex-1"
            placeholder="اكتب رسالتك..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={400}
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-styled px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 rtl:-scale-x-100" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
