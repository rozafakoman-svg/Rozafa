
import React, { useState } from 'react';
import { ForumPost, ForumComment, UserProfile, Language } from '../types';
import { 
  ArrowBigUp, ArrowBigDown, MessageSquare, Clock, User, PlusCircle, Pin, 
  MoreHorizontal, ArrowLeft, Send, X, Search, Filter, Shield, Flame, 
  Hash, TrendingUp, Info, Zap 
} from './Icons';

interface ForumPageProps {
  lang: Language;
  user: UserProfile | null;
  onReqAuth: () => void;
}

const MOCK_POSTS: ForumPost[] = [
  {
    id: 'buzmi_night_discussion_2024',
    title: "Sonte asht Nata e Buzmit: A e rrueni këtë doke?",
    content: "Përshëndetje t'gjithëve!\n\nSonte âsht nji prej netëve ma t'randsishme t'vjetit në traditën tonë gege. Në shpinë time, Baca e ka sjellë Buzmin te dera para nji ore. Kemi kênë t'gjithë familja tuj pritë me urimin: 'Hini Buzëm!'.\n\nNë kohën e sotme, shumë nga na qi jetojmë në qytet apo në diasporë e kemi t'vështirë me e ndezë nji cung t'vërtetë n'votër. Unë sivjet kam gjetë nji cung të vogël dekorativ veç për me e mbajtë gjallë simbolikën.\n\nPyetja ime asht: Si e festoni ju sonte? A keni dëgjue tregime nga gjyshet tueja për 'ushqimin' e Buzmit apo për fallin qi bëhej me kërshënditë? Ndani me ne format e ndryshme qi ka ky rit në zonat tueja (Shkodër, Mirditë, Kosovë, etj.)!",
    author: 'Geg_Warrior_92',
    authorRole: 'user',
    date: 'Just now',
    upvotes: 88,
    downvotes: 0,
    tags: ['Buzmi', 'Traditë', 'Solstici', 'Malësia'],
    comments: [
        { id: 'bz1', postId: 'buzmi_night_discussion_2024', author: 'Baca_Gjoni', content: "Lum na qi po kthejmë sytë kah vjetërsia! Buzmi nuk do me u fikë kurrë sa t'këtë Gegë gjallë. Sonte bëni gajret dhe urojeni nji tjetrin me gjuhën tonë t'amël.", date: '2 min ago', upvotes: 25 }
    ],
    viewCount: 312,
    pinned: false
  },
  {
    id: 'gjergj_fishta_biblioteka_diskutim',
    title: "Veprat e Fishtës: Cila ka lânë ma shumë gjurmë te ju?",
    content: "Sot, po rishikoja bibliografinë e At Gjergj Fishtës dhe m'u mbush zemra me nji ndjenjë të jashtëzakonshme. \n\nShumë njerëz e njohin veç për 'Lahutën e Malcís', por a e keni lexue 'Gomarin e Babatasit'? Aty ai dëshmon nji satirë qi nuk vdes kurrë. \n\nPo 'Anzat e Parnasit'? Mënyra se si ai e përdor Gegënishten për me thumbue veset e kohës âsht nji mrekulli gjuhësore. \n\nCila prej librave të tij ju bân me u ndier ma krenarë për t'folmen tonë? Dhe cili varg ju rrin në mendje çdo ditë?",
    author: 'Malësí_Legacy',
    authorRole: 'user',
    date: '10 minutes ago',
    upvotes: 45,
    downvotes: 1,
    tags: ['Letërsi', 'Fishta', 'ue/ua', 'Traditë'],
    comments: [
        { id: 'f1', postId: 'gjergj_fishta_biblioteka_diskutim', author: 'Baca_Gjoni', content: "Për mu, 'Lahuta' asht bashi i vendit. Vargjet për Oso Kukën i mban mend çdo fëmijë n'veri. Faleminderit qi e hapët këtë temë!", date: '5 min ago', upvotes: 12 }
    ],
    viewCount: 150,
    pinned: false
  },
  {
    id: 'diftongjet_debati_1',
    title: "Pse 'ue' tingëllon ma amël se 'ua'?",
    content: "Kisha pasë qejf me diskutue nji fenomen qi më bân përshtypje çdo ditë: diftongun 'ue'.\n\nKur shkoj n'katund dhe ndigjoj njerëzit tuj thonë 'me punue', 'me kndue', 'me shkrue' - m'duket sikur fjala ka nji peshë tjetër. 'Ua'-ja e standardit m'duket ma e rrafshët, ma pak 'shpirtnore'.\n\nNji plak i urtë m'tha se sekreti i vërtetë asht te shqiptimi: na nuk i thojmë të dyja shkronjat. Na thojmë veç shkronjën e parë, por e bajmë ma t'gjatë. Pra, 'ue' thuhet si nji 'u:' e gjatë dhe 'ie' si nji 'i:' e gjatë.\n\nA âsht kjo zgjatje e zanores së parë ajo qi e bân 'ue'-në ma t'përshtatshme për poezi dhe kangë kreshnikësh?\n\nNdani mendimet tuaja dhe fjalët qi ju pëlqejnë ma shumë me këtë diftong!",
    author: 'Geg_Master',
    authorRole: 'user',
    date: '2 hours ago',
    upvotes: 215,
    downvotes: 4,
    tags: ['Linguistics', 'Aesthetics', 'ue/ua'],
    comments: [
        { id: 'd1', postId: 'diftongjet_debati_1', author: 'Leka_88', content: "Për mu 'ue' asht zemra e t'folmit tonë. S'muj me e paramendue Lahutën e Malcisë pa diftongun 'ue'. Dhe po, ajo zgjatja e 'u'-së asht çka i jep melodinë qi na bân me kênë Gegë.", date: '1 hour ago', upvotes: 42 },
        { id: 'd2', postId: 'diftongjet_debati_1', author: 'Dr. Gjuhësori', content: "Fonetikisht, kjo zgjatje e zanores së parë (u: ose i:) asht nji relikt i randsishëm fonetik qi e bân Gegënishten nji sistem unik. Standardizimi e humbi këtë amëlsi tuj i rrafshue diftongjet.", date: '30 min ago', upvotes: 12 }
    ],
    viewCount: 1200,
    pinned: false
  },
  {
    id: 'gjuha_ruhet_forum_1',
    title: 'Gjuha Ruhet Aty Ku Shkruhet',
    content: 'Hapim këtë temë për me diskutue randsinë e të shkruemit në gegënisht në epokën digjitale. Na besojmë qi gegënishtja nuk asht veç nji dialekt, por nji vlerë qi duhet rruejtë me krenari.',
    author: 'Redaksia',
    authorRole: 'admin',
    date: 'Pinned',
    upvotes: 95,
    downvotes: 0,
    tags: ['Shkrim', 'Diskutim', 'Kulturë'],
    comments: [],
    viewCount: 450,
    pinned: true
  },
  {
    id: 'manifesto_2024',
    title: 'Manifest për barazinë historike të gegënishtes',
    content: 'Ne besojmë se:\n\n• Gegënishtja asht pasuni kulturore e shqipes.\n• Paskajorja (me + folje) asht forma ma organike e shprehjes.\n• Rruajtja e diftongjeve (ue/ie) asht mbrojtja e muzikalitetit tonë.',
    author: 'Redaksia',
    authorRole: 'admin',
    date: 'Pinned',
    upvotes: 1205,
    downvotes: 0,
    tags: ['Manifest', 'Kulturë', 'Histori'],
    comments: [],
    viewCount: 8500,
    pinned: true
  }
];

const ForumPage: React.FC<ForumPageProps> = ({ lang, user, onReqAuth }) => {
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_POSTS);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState('');

  const isGeg = lang === 'geg';

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleVote = (e: React.MouseEvent, postId: string, type: 'up' | 'down') => {
    e.stopPropagation();
    if (!user) { onReqAuth(); return; }
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            if (type === 'up') return { ...p, upvotes: p.upvotes + 1 };
            return { ...p, downvotes: p.downvotes + 1 };
        }
        return p;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onReqAuth(); return; }
    const post: ForumPost = {
        id: Date.now().toString(),
        title: newPostTitle,
        content: newPostContent,
        author: user.name,
        authorRole: user.role === 'admin' ? 'admin' : 'user',
        date: 'Just now',
        upvotes: 1,
        downvotes: 0,
        tags: ['New'],
        comments: [],
        viewCount: 0
    };
    setPosts([post, ...posts]);
    setIsCreating(false);
    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onReqAuth(); return; }
    if (!selectedPost) return;
    const comment: ForumComment = {
        id: Date.now().toString(),
        postId: selectedPost.id,
        author: user.name,
        role: user.role === 'admin' ? 'admin' : 'user',
        content: newComment,
        date: 'Just now',
        upvotes: 0
    };
    const updatedPost = { ...selectedPost, comments: [...selectedPost.comments, comment] };
    setSelectedPost(updatedPost);
    setPosts(prev => prev.map(p => p.id === selectedPost.id ? updatedPost : p));
    setNewComment('');
  };

  if (selectedPost) {
    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-20 pt-8 px-4">
            <button onClick={() => setSelectedPost(null)} className="mb-8 flex items-center gap-3 text-gray-500 hover:text-indigo-600 transition-all font-bold">
                <div className="p-2.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group-hover:border-indigo-200 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <span>{isGeg ? 'Kthehu te Forumi' : 'Back to Forum'}</span>
            </button>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
                <div className="hidden md:flex w-20 bg-gray-50 dark:bg-gray-950/50 border-r border-gray-100 dark:border-gray-800 flex-col items-center py-10 gap-3">
                    <button onClick={(e) => handleVote(e, selectedPost.id, 'up')} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-orange-500 transition-all"><ArrowBigUp className="w-10 h-10" /></button>
                    <span className="font-black text-gray-900 dark:text-white text-xl">{selectedPost.upvotes - selectedPost.downvotes}</span>
                    <button onClick={(e) => handleVote(e, selectedPost.id, 'down')} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-blue-500 transition-all"><ArrowBigDown className="w-10 h-10" /></button>
                </div>

                <div className="flex-grow p-8 sm:p-12">
                    <div className="flex flex-wrap items-center gap-4 mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {selectedPost.pinned && <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800"><Pin className="w-3.5 h-3.5 fill-current" /> Pinned</span>}
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center font-black">{selectedPost.author.charAt(0)}</div>
                           <span className={selectedPost.authorRole === 'admin' ? 'text-red-600' : 'text-gray-900 dark:text-white'}>{selectedPost.author}</span>
                           {selectedPost.authorRole === 'admin' && <Shield className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <span>•</span>
                        <span>{selectedPost.date}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-serif font-black text-gray-900 dark:text-white mb-8 leading-tight">{selectedPost.title}</h1>
                    <div className="prose prose-xl dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed mb-12 whitespace-pre-line font-serif">{selectedPost.content}</div>

                    <div className="bg-gray-50 dark:bg-gray-950 p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-inner">
                        <h3 className="font-black text-gray-900 dark:text-white mb-10 flex items-center gap-3 text-sm uppercase tracking-[0.2em] border-b border-gray-200 dark:border-gray-800 pb-4">
                           <MessageSquare className="w-5 h-5 text-indigo-500" />
                           {isGeg ? 'Diskutimi i Komunitetit' : 'Community Discussion'}
                        </h3>

                        <form onSubmit={handleCreateComment} className="mb-12 relative group">
                            <textarea 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)} 
                                placeholder={isGeg ? 'Shto mendimin tuej n\'këtë debat...' : 'Add your perspective to the debate...'} 
                                className="w-full p-6 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-3xl outline-none focus:border-indigo-500 transition-all text-sm min-h-[120px] dark:text-white shadow-sm"
                            />
                            <div className="flex justify-end mt-4">
                                <button type="submit" disabled={!newComment.trim()} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">Post Response</button>
                            </div>
                        </form>

                        <div className="space-y-8">
                            {selectedPost.comments.length === 0 ? (
                                <div className="text-center py-10 opacity-30">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-black uppercase text-[10px] tracking-widest">No responses yet.</p>
                                </div>
                            ) : (
                                selectedPost.comments.map(comment => (
                                    <div key={comment.id} className="flex gap-5 group">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">{comment.author.charAt(0)}</div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-2 text-[10px] font-black uppercase tracking-widest">
                                                <span className={comment.role === 'admin' ? 'text-red-600' : 'text-gray-900 dark:text-white'}>{comment.author}</span>
                                                <span className="text-gray-400">• {comment.date}</span>
                                            </div>
                                            <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed bg-white dark:bg-gray-900 p-5 rounded-3xl rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24 px-4 sm:px-6">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pt-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800 text-[10px] font-black uppercase tracking-widest mb-4">
               <Zap className="w-3.5 h-3.5 fill-current" /> Archive Discussion Hub
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-black text-gray-900 dark:text-white mb-3 tracking-tight">
               {isGeg ? 'Forumi i Komunitetit' : 'Community Forum'}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-xl">
               Diskutoni rreth kërkimeve gjuhësore, veprave të Fishtës dhe trashëgimisë tonë gege.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                   type="text" 
                   placeholder="Lyp n'debat..." 
                   value={searchQuery} 
                   onChange={(e) => setSearchQuery(e.target.value)} 
                   className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-indigo-500 shadow-sm transition-all" 
                />
             </div>
             <button 
                onClick={() => user ? setIsCreating(true) : onReqAuth()} 
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                <PlusCircle className="w-5 h-5" /> New Post
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
           <div className="hidden lg:block space-y-6">
               <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
                     <Filter className="w-4 h-4" /> Filter Feeds
                  </h3>
                  <div className="space-y-2">
                     {['hot', 'new', 'top'].map(t => (
                        <button key={t} className="w-full text-left px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all flex items-center justify-between group">
                           {t}
                           <div className="w-1.5 h-1.5 bg-gray-200 rounded-full group-hover:bg-indigo-400"></div>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                  <h4 className="text-xl font-serif font-black mb-4 relative z-10">Community Rules</h4>
                  <p className="text-xs text-indigo-200 leading-relaxed relative z-10 font-bold italic">
                     Fjalë e dhanun, Besë e lidhun. Ruani rreptësinë e gjuhës dhe butësinë e bisedës.
                  </p>
               </div>
           </div>

           <div className="lg:col-span-3 space-y-6">
               {isCreating && (
                   <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border-2 border-indigo-500 shadow-2xl animate-scale-in mb-10">
                      <h3 className="text-2xl font-serif font-black dark:text-white mb-6">Create Discussion Node</h3>
                      <div className="space-y-4">
                        <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-indigo-500 dark:text-white font-bold" placeholder="Subject Title" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} />
                        <textarea className="w-full p-6 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-[2rem] min-h-[180px] outline-none focus:border-indigo-500 dark:text-white font-serif" placeholder="Provide depth to your topic..." value={newPostContent} onChange={e => setNewPostContent(e.target.value)} />
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setIsCreating(false)} className="px-6 py-3 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-600">Cancel</button>
                            <button onClick={handleCreatePost} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">Broadcast Thread</button>
                        </div>
                      </div>
                   </div>
               )}

               {filteredPosts.length === 0 ? (
                  <div className="text-center py-40 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                     <MessageSquare className="w-16 h-16 mx-auto mb-6 text-gray-200" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No matching discussions found.</p>
                  </div>
               ) : filteredPosts.map(post => (
                   <div 
                      key={post.id} 
                      onClick={() => setSelectedPost(post)} 
                      className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer shadow-sm transition-all duration-300 group"
                   >
                       <div className="hidden sm:flex w-14 flex-col items-center border-r border-gray-50 dark:border-gray-800 mr-8 pr-8 gap-1">
                          <button onClick={(e) => handleVote(e, post.id, 'up')} className="text-gray-300 hover:text-orange-500 transition-colors"><ArrowBigUp className="w-8 h-8"/></button>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{post.upvotes - post.downvotes}</span>
                          <button onClick={(e) => handleVote(e, post.id, 'down')} className="text-gray-300 hover:text-blue-500 transition-colors"><ArrowBigDown className="w-8 h-8"/></button>
                       </div>
                       
                       <div className="flex-grow">
                           <div className="flex flex-wrap items-center gap-3 mb-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                               {post.pinned && <Pin className="w-3.5 h-3.5 fill-current text-emerald-500"/>}
                               <span className={post.authorRole === 'admin' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}>{post.author}</span>
                               <span>•</span>
                               <span>{post.date}</span>
                               <span className="flex items-center gap-1 ml-auto bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[8px] font-black">
                                  <MessageSquare className="w-3 h-3" /> {post.comments.length} RESPONSES
                               </span>
                           </div>
                           
                           <h3 className="text-2xl font-serif font-black text-gray-900 dark:text-white mb-4 group-hover:text-indigo-600 transition-colors leading-tight">{post.title}</h3>
                           <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium mb-6">{post.content}</p>
                           
                           <div className="flex flex-wrap gap-2">
                              {post.tags.map(tag => (
                                 <span key={tag} className="text-[8px] font-black px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-lg uppercase tracking-tighter">#{tag}</span>
                              ))}
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};

export default ForumPage;
