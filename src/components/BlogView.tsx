import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, User, ArrowRight, Share2, MessageCircle, ExternalLink, Plus, Camera, Send, Heart, Trash2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase-setup';

interface BlogComment {
  id: string;
  uid: string;
  userName: string;
  text: string;
  timestamp: any;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorEmail: string;
  category: string;
  image: string;
  likesCount: number;
  timestamp: any;
  comments?: BlogComment[];
}

export default function BlogView() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Security', image: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  const isAdmin = currentUser?.email === 'a716023560@gmail.com';

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    const q = query(collection(db, 'blog_posts'), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(postsData);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Listen Error [blog_posts]:", err);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'blog_posts'), {
        ...newPost,
        author: 'Admin',
        authorEmail: currentUser?.email,
        likesCount: 0,
        timestamp: serverTimestamp(),
      });
      setShowAddModal(false);
      setNewPost({ title: '', content: '', category: 'Security', image: '' });
    } catch (error) {
      console.error("Error adding post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const postRef = doc(db, 'blog_posts', postId);
      await updateDoc(postRef, {
        likesCount: increment(1)
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAdmin) return;
    if (window.confirm("هل أنت متأكد من حذف هذا المقال؟")) {
      try {
        await deleteDoc(doc(db, 'blog_posts', postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-2 pb-10 max-w-2xl mx-auto w-full px-1">
      <header className="mb-8 pb-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Newspaper className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">مدونة Øᵘᶰʷᵃ PRO</h2>
            <p className="text-[10px] text-purple-500 font-mono uppercase tracking-widest text-right">Latest Security Updates & Fixes</p>
          </div>
        </div>

        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-purple-600 rounded-xl text-white hover:bg-purple-500 transition-all flex items-center gap-2 text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            <Plus className="w-4 h-4" />
            نشر مقال
          </button>
        )}
      </header>

      <div className="space-y-8 h-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
             <p className="text-xs text-neutral-500 font-mono">FETCHING_CORE_DATA...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 opacity-40">
             <p className="text-sm font-mono uppercase">No articles found in database</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card overflow-hidden group hover:border-purple-500/50 transition-all relative"
            >
              {isAdmin && (
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-red-500/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.image || `https://picsum.photos/seed/${post.id}/800/400`} 
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-purple-600 text-white text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  {post.category}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 text-[10px] text-neutral-500 font-mono mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.timestamp?.toDate().toLocaleDateString('ar-EG') || 'جاري التحميل...'}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-mono opacity-80 whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="flex items-center gap-3">
                     <button 
                       onClick={() => handleLike(post.id)}
                       className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${currentUser ? 'bg-neutral-900 hover:text-red-500' : 'opacity-30 cursor-not-allowed'}`}
                     >
                        <Heart className={`w-4 h-4 ${post.likesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                        <span className="text-[10px] font-bold">{post.likesCount}</span>
                     </button>
                     <button className="p-2 bg-neutral-900 rounded-lg hover:text-purple-500 transition-colors flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-[10px] font-bold">تعليقات</span>
                     </button>
                   </div>

                   <button className="flex items-center gap-2 text-xs font-bold text-purple-400 group-hover:gap-4 transition-all">
                      إقرأ المزيد
                      <ArrowRight className="w-4 h-4 rotate-180" />
                   </button>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-neutral-950 border border-white/10 rounded-3xl p-6 relative z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-500" />
                  إنشاء مقال جديد
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPost} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">العنوان</label>
                  <input 
                    required
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                    placeholder="مثلاً: ثغرة جديدة في نظام الحظر..."
                    className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm focus:border-purple-500/50 outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">التصنيف</label>
                    <select 
                      value={newPost.category}
                      onChange={e => setNewPost({...newPost, category: e.target.value})}
                      className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm focus:border-purple-500/50 outline-none transition-all"
                    >
                      <option>Security</option>
                      <option>Updates</option>
                      <option>Safety</option>
                      <option>Tech</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">رابط الصورة (اختياري)</label>
                    <input 
                      value={newPost.image}
                      onChange={e => setNewPost({...newPost, image: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm focus:border-purple-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">المحتوى</label>
                  <textarea 
                    required
                    rows={6}
                    value={newPost.content}
                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                    placeholder="اكتب تفاصيل المقال هنا..."
                    className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm focus:border-purple-500/50 outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-500 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? 'جاري النشر...' : 'نشر المقال الآن'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-auto pt-10 text-center opacity-30 select-none pointer-events-none">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.5em]">KNOWLEDGE // POWER</p>
      </footer>
    </div>
  );
}
