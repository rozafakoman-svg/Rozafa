
import React, { useState, useEffect, useRef } from 'react';
import { BlogPost, Language } from '../types';
import { db, Stores } from '../services/db';
import { 
  Calendar, User, Clock, ArrowUpRight, ArrowLeft, FileText, PlusCircle, Trash2, 
  Save, X, Image as ImageIcon, Edit3, Eye, Bold, Italic, List, Type, Link, Sparkles, Loader2, CloudRain, Zap
} from './Icons';

interface BlogPageProps {
  lang: Language;
  isEditing?: boolean;
}

const MOCK_POSTS_GEG: BlogPost[] = [
  {
    id: 'arkiva_historise',
    title: 'Gjuha âsht arkiva e historisë të popullit',
    excerpt: 'Gjuha nuk asht thjesht mjet komunikimi, por nji dëshmi e gjallë e shekujve qi kemi kalue.',
    content: `
      <p class="font-serif text-xl italic text-gray-500 mb-6 text-center">"Me vdekjen e nji gjuhe, vdes nji botë e tanë."</p>
      
      <p>Kur analizojmë Gegënishten, na nuk po shohim thjesht nji variant gjuhësor. Na po shohim nji arkivë. Çdo zanore hundore, çdo folje në paskajore dhe çdo fjalë arkaike asht nji "fosile" e gjallë qi tregon se si jetuan të parët tanë.</p>
      <br/>
      <h3 class="text-xl font-bold mb-2">Pse Gegënishtja asht Arkivë?</h3>
      <p>Ndryshe nga variantet qi pësuen ndryshime të rrebta administrative, Gegënishtja ruajti trajta qi gjuhëtarët i quajnë "paleo-ballkanike". Për shembull, rruajtja e tingullit 'n' (qi në jug u kthye në 'r') tregon nji fazë shumë të hershme të shqipes, nji urë lidhëse me latinishten dhe greqishten e vjetër.</p>
      <br/>
      <p>Kur nji malësor thotë <strong>"me kênë"</strong>, ai po përdor nji formë qi i ka mbijetue rrethimeve, pushtimeve dhe censurës. Ruajtja e kësaj gjuhe asht ruajtja e kujtesës sonë kolektive. Pa këtë arkivë, historia jonë mbetet e cungueme.</p>
    `,
    author: 'Dr. Gjuhësori',
    date: '10 Mars 2024',
    readTime: '5 min',
    tags: ['Histori', 'Gjuhësi', 'Identitet'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ancient_Albanian_Manuscript.jpg/640px-Ancient_Albanian_Manuscript.jpg'
  },
  {
    id: 'paskajorja_shtylla',
    title: 'Paskajorja: Shtylla kurrizore e mendimit Geg',
    excerpt: 'Pse forma "me + folje" asht mjeti ma i fuqishëm i shprehjes sonë dhe pse duhet ta mbrojmë.',
    content: `
      <p>Nji nga humbjet ma të mëdha të standardizimit të vitit 1972 ishte mënjanimi i paskajores së tipit <strong>"me punue"</strong>. Në Gegënisht, kjo formë nuk asht thjesht nji rregull gramatikor, por nji mënyrë e të menduemit.</p>
      <br/>
      <h3 class="text-xl font-bold mb-2">Saktësia vs. Përshkrimi</h3>
      <p>Paskajorja lejon nji saktësi filozofike qi trajta "për të punuar" shpesh e humb. Ajo shpreh nji veprim në tërësinë e tij, nji vullnet të qartë. Shkrimtarët tanë të mëdhenj, nga Buzuku te Migjeni, e përdorën paskajoren për me i dhanë teksteve nji forcë dhe nji muzikalitet qi rrallë gjendet diku tjetër.</p>
      <br/>
      <p>Pa paskajoren, gegënishtja humb nji pjesë të shpirtit della saj. Mbrojtja e kësaj forme asht mbrojtja e lirisë së shprehjes.</p>
    `,
    author: 'Redaksia',
    date: '05 Mars 2024',
    readTime: '4 min',
    tags: ['Grammar', 'Research'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Meshari.jpg/640px-Meshari.jpg'
  }
];

const BlogPage: React.FC<BlogPageProps> = ({ lang, isEditing = false }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isGeg = lang === 'geg';

  useEffect(() => {
    loadPosts();
  }, [lang]);

  const loadPosts = async () => {
    setLoading(true);
    try {
        const stored = await db.getAll<BlogPost>(Stores.Blog);
        if (stored && stored.length > 0) {
            setPosts(stored);
        } else {
            // Initial Seed
            setPosts(MOCK_POSTS_GEG);
            for (const post of MOCK_POSTS_GEG) {
                await db.put(Stores.Blog, post);
            }
        }
    } catch (e) {
        setPosts(MOCK_POSTS_GEG);
    } finally {
        setLoading(false);
    }
  };

  const handleUpdatePost = async (field: keyof BlogPost, value: any) => {
    if (!selectedPost) return;
    const updatedPost = { ...selectedPost, [field]: value };
    setSelectedPost(updatedPost);
    
    // Save to Persistent Store (IndexedDB + Supabase)
    try {
        await db.put(Stores.Blog, updatedPost);
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    } catch (e) {
        console.error("Failed to persist blog update:", e);
    }
  };

  const handleCreatePost = async () => {
    const newPost: BlogPost = {
        id: `blog_${Date.now()}`,
        title: isGeg ? 'Titull i Ri' : 'New Post Title',
        excerpt: isGeg ? 'Përmbledhje...' : 'Short excerpt...',
        content: '<p>Content...</p>',
        author: 'Admin',
        date: new Date().toLocaleDateString(),
        readTime: '1 min',
        tags: ['New'],
        imageUrl: ''
    };
    
    try {
        await db.put(Stores.Blog, newPost);
        setPosts([newPost, ...posts]);
        setSelectedPost(newPost);
    } catch (e) {
        console.error("Failed to create blog post:", e);
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm(isGeg ? 'A jeni i sigurtë?' : 'Are you sure?')) {
          try {
              await db.delete(Stores.Blog, id);
              setPosts(prev => prev.filter(p => p.id !== id));
              if (selectedPost?.id === id) setSelectedPost(null);
          } catch (e) {
              console.error("Failed to delete post:", e);
          }
      }
  };

  const wrapSelection = (tag: string, className: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea || !selectedPost) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const openTag = className ? `<${tag} class="${className}">` : `<${tag}>`;
    const closeTag = `</${tag}>`;
    
    const replacement = `${openTag}${selectedText}${closeTag}`;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    handleUpdatePost('content', newValue);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
    }, 0);
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">{isGeg ? 'Tuj ngarkue arkivën...' : 'Accessing Archive...'}</p>
          </div>
      );
  }

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pt-6 pb-20 px-4">
         <div className="flex justify-between items-center mb-10">
            <button 
                onClick={() => { setSelectedPost(null); setShowPreview(false); }}
                className="group flex items-center gap-3 text-gray-500 hover:text-albanian-red dark:text-gray-400 dark:hover:text-red-400 transition-all font-bold"
                >
                <div className="p-2.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group-hover:border-red-200 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <span>{isGeg ? 'Kthehu' : 'Back'}</span>
            </button>
            
            {isEditing && (
                <button 
                    onClick={() => { setSelectedPost(null); setShowPreview(false); }}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl active:scale-95"
                >
                    <Save className="w-4 h-4" /> Finish & Archive
                </button>
            )}
         </div>

         <article className={`bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 sm:p-16 border shadow-2xl overflow-hidden transition-all duration-500 ${isEditing ? 'border-red-500 ring-4 ring-red-500/10' : 'border-gray-100 dark:border-gray-800'}`}>
            <div className="w-full mb-12 rounded-3xl overflow-hidden relative bg-gray-50 dark:bg-gray-800 shadow-inner group/hero">
                {selectedPost.imageUrl ? (
                    <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-[400px] object-cover transition-transform duration-700 group-hover/hero:scale-105" />
                ) : (
                    <div className="w-full h-80 flex items-center justify-center text-gray-200 dark:text-gray-700">
                        <FileText className="w-24 h-24" />
                    </div>
                )}
                {isEditing && (
                    <div className="absolute bottom-6 right-6">
                        <input 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            placeholder="Image URL"
                            value={selectedPost.imageUrl || ''}
                            onChange={(e) => handleUpdatePost('imageUrl', e.target.value)}
                        />
                        <button className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl text-gray-700 dark:text-gray-300 shadow-2xl border border-white/20">
                            <ImageIcon className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>
            
            <div className="flex flex-wrap gap-6 items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-10">
               <span className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                 <User className="w-3.5 h-3.5" /> 
                 {selectedPost.author}
               </span>
               <span className="flex items-center gap-2">
                 <Calendar className="w-3.5 h-3.5" /> 
                 {selectedPost.date}
               </span>
               <span className="flex items-center gap-2">
                 <Clock className="w-3.5 h-3.5" /> 
                 {selectedPost.readTime}
               </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-black text-gray-900 dark:text-white mb-12 leading-tight text-center tracking-tight">
                {selectedPost.title}
            </h1>

            {isEditing && (
                <div className="mb-10 p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                   <div className="flex items-center gap-1 flex-wrap justify-center">
                        <button onClick={() => wrapSelection('strong')} className="p-3 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"><Bold className="w-5 h-5"/></button>
                        <button onClick={() => wrapSelection('em')} className="p-3 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"><Italic className="w-5 h-5"/></button>
                        <button onClick={() => wrapSelection('h3', 'text-2xl font-serif font-bold mb-4 mt-8')} className="p-3 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"><Type className="w-5 h-5"/></button>
                        <button onClick={() => wrapSelection('p', 'mb-6 leading-relaxed')} className="p-3 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"><FileText className="w-5 h-5"/></button>
                        <button onClick={() => wrapSelection('a', 'text-indigo-600 underline font-bold')} className="p-3 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"><Link className="w-5 h-5"/></button>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-3"></div>
                        <button 
                            onClick={() => wrapSelection('p', 'font-serif text-2xl italic text-gray-400 my-12 text-center px-8')} 
                            className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-all"
                        >
                            <Sparkles className="w-3.5 h-3.5" /> Heritage Quote
                        </button>
                    </div>
                </div>
            )}

            <div className="relative group">
                {isEditing ? (
                    <textarea 
                        ref={textareaRef}
                        value={selectedPost.content}
                        onChange={(e) => handleUpdatePost('content', e.target.value)}
                        className="w-full p-8 border-2 border-red-100 dark:border-red-900/50 rounded-[2.5rem] bg-gray-50 dark:bg-gray-950 font-mono text-sm h-[600px] focus:border-red-500 outline-none text-gray-800 dark:text-gray-200 transition-all shadow-inner"
                    />
                ) : (
                    <div 
                        className="prose prose-xl dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed max-w-none font-serif"
                        dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                    />
                )}
            </div>

            <div className="mt-16 pt-12 border-t border-gray-50 dark:border-gray-800 flex justify-center flex-wrap gap-3">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="px-5 py-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-gray-100 dark:border-gray-700">
                      #{tag}
                    </span>
                  ))}
            </div>
         </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20">
       <div className="text-center mb-20 px-4">
         <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-gray-900 rounded-[2.5rem] mb-8 shadow-2xl border border-gray-100 dark:border-gray-800 transform rotate-3">
             <FileText className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
         </div>
         <h1 className="text-5xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            {isGeg ? 'Blogu i ' : 'The '}<span className="text-indigo-600">Gegenishtes</span>
         </h1>
         <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
             {isGeg 
               ? 'Artikuj, analiza dhe hulumtime mbi kulturën dhe traditën e papërsëritshme të popullit Geg.' 
               : 'Articles, analysis, and research on the unique culture and traditions of the Geg people.'}
         </p>
         
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            {isEditing && (
                <button 
                    onClick={handleCreatePost}
                    className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl active:scale-95 flex items-center gap-3"
                >
                    <PlusCircle className="w-5 h-5" /> {isGeg ? 'Shkruaj nji Artikull' : 'Compose New Article'}
                </button>
            )}
            <div className="flex items-center gap-2 px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                <Zap className="w-4 h-4 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-widest">{isGeg ? 'Arkivë Lokale Aktive' : 'Local Archive Sync Active'}</span>
            </div>
         </div>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
          {posts.map((post) => (
             <div 
               key={post.id}
               onClick={() => setSelectedPost(post)}
               className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col h-full relative"
             >
                {isEditing && (
                    <button 
                        onClick={(e) => handleDeletePost(e, post.id)}
                        className="absolute top-4 right-4 z-20 p-3 bg-white/95 dark:bg-gray-800/95 text-red-500 rounded-2xl shadow-xl border border-red-50 hover:scale-110 transition-transform"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}

                <div className="h-60 bg-gray-50 dark:bg-gray-800 relative overflow-hidden shadow-inner">
                   {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center">
                         <FileText className="w-16 h-16 text-gray-200 dark:text-gray-700" />
                      </div>
                   )}
                   <div className="absolute top-6 left-6 bg-white/95 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100 shadow-xl">
                      {post.tags[0]}
                   </div>
                </div>

                <div className="p-10 flex flex-col flex-grow">
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                      <span className="flex items-center gap-1.5">{post.date}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span className="flex items-center gap-1.5">{post.readTime}</span>
                   </div>
                   
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 font-serif group-hover:text-indigo-600 transition-colors leading-tight">
                      {post.title}
                   </h3>
                   
                   <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-10 line-clamp-3 flex-grow font-medium">
                      {post.excerpt}
                   </p>

                   <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] tracking-[0.25em] group-hover:translate-x-2 transition-transform duration-500">
                      {isGeg ? 'Lexo ma shumë' : 'Read Article'} <ArrowUpRight className="w-4 h-4 ml-2" />
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default BlogPage;
