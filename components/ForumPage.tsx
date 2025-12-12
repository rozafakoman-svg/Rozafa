import React, { useState } from 'react';
import { Language } from '../App';
import { ForumPost, ForumComment, UserProfile } from '../types';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Clock, User, PlusCircle, Pin, MoreHorizontal, ArrowLeft, Send, X, Search, Filter, Shield, Flame, Hash, TrendingUp, Info } from './Icons';

interface ForumPageProps {
  lang: Language;
  user: UserProfile | null;
  onReqAuth: () => void;
}

const MOCK_POSTS: ForumPost[] = [
  {
    id: '1',
    title: 'Welcome to the Gegenisht Community Forum!',
    content: 'This is a place to discuss the Geg dialect, ask questions about grammar, or share your favorite archaic words. Please be respectful and keep the conversation focused on language preservation.\n\nWe encourage you to:\n1. Search before posting.\n2. Be kind to learners.\n3. Cite sources when discussing history.',
    author: 'Admin',
    authorRole: 'admin',
    date: '1 hour ago',
    upvotes: 142,
    downvotes: 2,
    tags: ['Announcement', 'Rules'],
    comments: [],
    viewCount: 1205,
    pinned: true
  },
  {
    id: '2',
    title: 'Is "tuj" strictly Geg or used in Standard too?',
    content: 'I noticed in the dictionary that "tuj" (duke) is marked as Geg. However, I hear people in Tirana use it often in casual speech. Is this a case of dialect bleeding into the standard informal register? I find it fascinating how the gerund form has evolved.',
    author: 'Linguist_99',
    authorRole: 'user',
    date: '3 hours ago',
    upvotes: 45,
    downvotes: 1,
    tags: ['Grammar', 'Question'],
    comments: [
      { id: 'c1', postId: '2', author: 'ShkodraBoy', content: 'It is definitely Geg origin (participle format), but yes, slang in Tirana has adopted it because "duke" feels too formal for street talk.', date: '2 hours ago', upvotes: 12 },
      { id: 'c2', postId: '2', author: 'Ana_M', content: 'Agreed. Language evolves! Even Standard Albanian is slowly absorbing Geg elements naturally.', date: '1 hour ago', upvotes: 5 }
    ],
    viewCount: 340
  },
  {
    id: '3',
    title: 'Resource: Old Franciscan Manuscripts Digitized',
    content: 'Just found this amazing archive of Father Zef Pllumi\'s early writings. The link is below. The vocabulary is incredibly rich compared to modern standard textbooks. It really shows what we lost in 1972.',
    author: 'HistoryBuff',
    authorRole: 'moderator',
    date: '1 day ago',
    upvotes: 89,
    downvotes: 0,
    tags: ['Resources', 'History'],
    comments: [],
    viewCount: 890
  },
  {
    id: '4',
    title: 'Difference between "Cuca" and "Çika"?',
    content: 'Are these purely regional variations for "girl", or is there a semantic difference? My grandmother from Mirdita says "Cuca" but my cousins in Pristina say "Çika".',
    author: 'DiasporaKid',
    date: '2 days ago',
    upvotes: 34,
    downvotes: 2,
    tags: ['Vocabulary', 'Dialects'],
    comments: [
        { id: 'c3', postId: '4', author: 'Geg_Master', content: 'Mirdita and Mat tend to use Cuca. Kosova and Malesia e Madhe tend to use Çika. Same meaning.', date: '1 day ago', upvotes: 20 }
    ],
    viewCount: 600
  }
];

const POPULAR_TAGS = ['Grammar', 'History', 'Vocabulary', 'Resources', 'Dialects', 'Translation'];

const ForumPage: React.FC<ForumPageProps> = ({ lang, user, onReqAuth }) => {
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_POSTS);
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'top'>('hot');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState('');

  const isGeg = lang === 'geg';

  // Filter posts based on search
  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleVote = (e: React.MouseEvent, postId: string, type: 'up' | 'down') => {
    e.stopPropagation();
    if (!user) {
        onReqAuth();
        return;
    }
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
    if (!user) {
        onReqAuth();
        return;
    }
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
    if (!user) {
        onReqAuth();
        return;
    }
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

  // DETAIL VIEW
  if (selectedPost) {
    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-20">
            <button 
                onClick={() => setSelectedPost(null)}
                className="mb-6 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium px-4 sm:px-0"
            >
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span>{isGeg ? 'Kthehu te Forumi' : 'Back to Forum'}</span>
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col md:flex-row">
                {/* Voting Sidebar (Desktop) */}
                <div className="hidden md:flex w-16 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-700 flex-col items-center py-6 gap-2 flex-shrink-0">
                    <button onClick={(e) => handleVote(e, selectedPost.id, 'up')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-orange-500 transition-colors">
                        <ArrowBigUp className="w-8 h-8" />
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {selectedPost.upvotes - selectedPost.downvotes}
                    </span>
                    <button onClick={(e) => handleVote(e, selectedPost.id, 'down')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-blue-500 transition-colors">
                        <ArrowBigDown className="w-8 h-8" />
                    </button>
                </div>

                <div className="flex-grow p-6 sm:p-8">
                    {/* Header Info */}
                    <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
                        {selectedPost.pinned && (
                           <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                             <Pin className="w-3 h-3 fill-current" /> Pinned
                           </span>
                        )}
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
                              {selectedPost.author.charAt(0)}
                           </div>
                           <span className={`font-bold ${selectedPost.authorRole === 'admin' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                              {selectedPost.author}
                           </span>
                           {selectedPost.authorRole === 'admin' && <Shield className="w-3 h-3 text-red-500" />}
                        </div>
                        <span>•</span>
                        <span>{selectedPost.date}</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight">{selectedPost.title}</h1>
                    
                    <div className="prose prose-lg dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed mb-8 whitespace-pre-line">
                        {selectedPost.content}
                    </div>

                    {/* Mobile Vote & Action Bar */}
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6 mb-8">
                        <div className="flex md:hidden items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                           <button onClick={(e) => handleVote(e, selectedPost.id, 'up')}><ArrowBigUp className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-orange-500" /></button>
                           <span className="font-bold text-gray-900 dark:text-white">{selectedPost.upvotes - selectedPost.downvotes}</span>
                           <button onClick={(e) => handleVote(e, selectedPost.id, 'down')}><ArrowBigDown className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-blue-500" /></button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 ml-auto">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                {selectedPost.comments.length} {isGeg ? 'Komente' : 'Comments'}
                            </div>
                            <div className="flex gap-2">
                                 {selectedPost.tags.map(tag => (
                                     <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">#{tag}</span>
                                 ))}
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                           <MessageSquare className="w-4 h-4 text-indigo-500" />
                           {isGeg ? 'Diskutimi' : 'Discussion'}
                        </h3>
                        
                        {/* New Comment Input */}
                        <form onSubmit={handleCreateComment} className="mb-8 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold flex-shrink-0 hidden sm:flex">
                                {user ? user.name.charAt(0) : '?'}
                            </div>
                            <div className="flex-grow">
                                <textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={isGeg ? 'Shkruani mendimin tuej...' : 'What are your thoughts?'}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    rows={2}
                                />
                                <div className="flex justify-end mt-2">
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                                        <Send className="w-3 h-3" />
                                        {isGeg ? 'Komento' : 'Comment'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {selectedPost.comments.length === 0 && (
                                <p className="text-gray-400 italic text-center py-4">{isGeg ? 'Asnji koment ende. Bâhu i pari!' : 'No comments yet. Be the first!'}</p>
                            )}
                            {selectedPost.comments.map(comment => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs flex-shrink-0 mt-1">
                                        {comment.author.charAt(0)}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 text-xs mb-1">
                                            <span className={`font-bold ${comment.role === 'admin' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{comment.author}</span>
                                            <span className="text-gray-400">• {comment.date}</span>
                                        </div>
                                        <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-2">
                                            {comment.content}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 font-bold">
                                                <ArrowBigUp className="w-4 h-4" /> {comment.upvotes || 0}
                                            </button>
                                            <button className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // MAIN FEED VIEW
  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20">
       
       {/* Hero / Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
               <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                 <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
               </div>
               {isGeg ? 'Forumi i Komunitetit' : 'Community Forum'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg">
               {isGeg ? 'Diskutoni, pyesni dhe ndani njohuni rreth gjuhës.' : 'Discuss, ask questions, and share knowledge about the language.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-grow md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={isGeg ? 'Kërko diskutime...' : 'Search discussions...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm dark:text-white"
                />
             </div>
             <button 
               onClick={() => user ? setIsCreating(true) : onReqAuth()}
               className="hidden md:flex px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none whitespace-nowrap"
             >
                <PlusCircle className="w-5 h-5" />
                {isGeg ? 'Postim i Ri' : 'New Post'}
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4">
           
           {/* LEFT SIDEBAR - Tags & Filters (Desktop) */}
           <div className="hidden lg:block space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider px-2">Feeds</h3>
                 <div className="space-y-1">
                    {['hot', 'new', 'top'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === tab ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            {tab === 'hot' && <Flame className="w-4 h-4" />}
                            {tab === 'new' && <Clock className="w-4 h-4" />}
                            {tab === 'top' && <TrendingUp className="w-4 h-4" />}
                            <span className="capitalize">{isGeg && tab === 'new' ? 'Të Reja' : tab}</span>
                        </button>
                    ))}
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider px-2">Popular Tags</h3>
                 <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map(tag => (
                       <button key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          #{tag}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* CENTER - Feed */}
           <div className="lg:col-span-3 space-y-6">
               
               {/* Mobile Filter Tabs */}
               <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 no-scrollbar">
                  {['hot', 'new', 'top'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap border ${activeTab === tab ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
                      >
                          {isGeg && tab === 'new' ? 'Të Reja' : tab}
                      </button>
                  ))}
               </div>

               {/* Create Post Form (Inline) */}
               {isCreating && (
                   <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-900 shadow-lg mb-8 animate-scale-in">
                       <div className="flex justify-between items-center mb-4">
                           <h3 className="font-bold text-gray-900 dark:text-white">{isGeg ? 'Krijo Postim' : 'Create Post'}</h3>
                           <button onClick={() => setIsCreating(false)}><X className="w-5 h-5 text-gray-400" /></button>
                       </div>
                       <form onSubmit={handleCreatePost} className="space-y-4">
                           <input 
                             className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-serif font-bold text-lg outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                             placeholder={isGeg ? 'Titulli' : 'Title'}
                             value={newPostTitle}
                             onChange={(e) => setNewPostTitle(e.target.value)}
                             required
                           />
                           <textarea 
                             className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 min-h-[120px] text-gray-900 dark:text-white"
                             placeholder={isGeg ? 'Përmbajtja...' : 'Content...'}
                             value={newPostContent}
                             onChange={(e) => setNewPostContent(e.target.value)}
                             required
                           />
                           <div className="flex justify-end">
                               <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
                                   {isGeg ? 'Posto' : 'Post'}
                               </button>
                           </div>
                       </form>
                   </div>
               )}

               {/* Posts List */}
               <div className="space-y-4">
                   {filteredPosts.map((post) => (
                       <div 
                         key={post.id}
                         onClick={() => setSelectedPost(post)}
                         className={`bg-white dark:bg-gray-800 rounded-2xl border flex overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group shadow-sm ${post.pinned ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}
                       >
                           {/* Vote Column (Desktop) */}
                           <div className="hidden sm:flex w-12 bg-gray-50/50 dark:bg-gray-900/30 border-r border-gray-100 dark:border-gray-700 flex-col items-center py-4 gap-1 flex-shrink-0">
                               <button onClick={(e) => handleVote(e, post.id, 'up')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-orange-500">
                                   <ArrowBigUp className="w-6 h-6" />
                               </button>
                               <span className={`font-bold text-xs ${post.upvotes - post.downvotes > 50 ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                   {post.upvotes - post.downvotes}
                               </span>
                               <button onClick={(e) => handleVote(e, post.id, 'down')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-blue-500">
                                   <ArrowBigDown className="w-6 h-6" />
                               </button>
                           </div>

                           {/* Content */}
                           <div className="p-5 flex-grow">
                               <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                                   {post.pinned && <Pin className="w-3 h-3 text-green-600 fill-green-600" />}
                                   <span className={`font-bold hover:underline ${post.authorRole === 'admin' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{post.author}</span>
                                   <span>•</span>
                                   <span>{post.date}</span>
                               </div>
                               
                               <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                   {post.title}
                               </h3>
                               <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                                   {post.content}
                               </p>

                               <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                       <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors">
                                           <MessageSquare className="w-4 h-4" />
                                           {post.comments.length} <span className="hidden sm:inline">{isGeg ? 'Komente' : 'Comments'}</span>
                                       </div>
                                       <div className="flex gap-2">
                                           {post.tags.map(tag => (
                                               <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-[10px] font-medium text-gray-600 dark:text-gray-300">
                                                   #{tag}
                                               </span>
                                           ))}
                                       </div>
                                   </div>
                                   
                                   {/* Mobile Vote Count Display */}
                                   <div className="sm:hidden flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                      <ArrowBigUp className="w-4 h-4" /> {post.upvotes - post.downvotes}
                                   </div>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </div>

       {/* Mobile Floating Action Button */}
       <button 
          onClick={() => user ? setIsCreating(true) : onReqAuth()}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
       >
          <PlusCircle className="w-8 h-8" />
       </button>
    </div>
  );
};

export default ForumPage;