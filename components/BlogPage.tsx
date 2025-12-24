
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
    id: 'gjergj_fishta_bibliografia_komplete',
    title: "At Gjergj Fishta: Shpirti i Kombit n'Gegënisht",
    excerpt: "Nji hulumtim i thellë mbi jetën dhe bibliografinë e plotë të At Gjergj Fishtës, 'Homerit Shqiptar' qi naltue gjuhën gege.",
    content: `
      <p class="font-serif text-xl italic text-gray-500 mb-6 text-center">"Edhe hânës do t'i thuej: 'Pa u ndalë knduej, se kjo âsht gjuha e t'parve tanë!'"</p>
      
      <p>Nuk ka figurë në historinë e letërsisë shqipe qi e mishëron ma mirë fuqinë dhe muzikalitetin e Gegënishtes sesa <strong>At Gjergj Fishta (1871–1940)</strong>. Frati françeskan nga Zadrimja nuk ishte thjesht nji poet; ai ishte arkitekti i nji identiteti të tanë kombëtar përmes fjalës së shkrueme.</p>
      
      <br/>
      <h3 class="text-2xl font-serif font-black mb-4">Mjeshtria e Diftongut 'ue'</h3>
      <p>Në vargjet e Fishtës, rregulli i elongation (zgjatjes) qi po hulumtojmë vjen në formën ma t'pastër. Kur ai shkruen <em>'me kndue'</em> (/knduː/) apo <em>'me fluturue'</em> (/flutu'ruː/), ritmi i vargut tetërrokësh bazohet pikërisht te zgjatja e asaj 'u'-je, tuj e lânë 'e'-në si nji hije fonetike.</p>
      
      <br/>
      <h3 class="text-2xl font-serif font-black mb-4">Katalogu i Veprave Kryesore</h3>
      <p>Fishta lëuroi në çdo gjini, tuj dëshmue se Gegënishtja asht e aftë <em>me shprehë</em> epikën heroike, lirikën e hollë dhe satirën thumbuese:</p>
      
      <div class="bg-gray-50 dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 my-8">
        <ul class="space-y-4">
          <li><strong>1. Lahuta e Malcís (1937):</strong> Kryevepra e tij epike, e quajtun 'Iliada' shqiptare. Me 30 këngë dhe mbi 15,000 vargje, ajo <em>përshkruan</em> qëndresën e malësorëve kundër pushtuesve.</li>
          <li><strong>2. Anzat e Parnasit (1907):</strong> Satira e tij e parë, ku me nji gjuhë të rreptë <em>godet</em> veset e shoqnisë dhe politikanët e kohës.</li>
          <li><strong>3. Mrizi i Zânavet (1913):</strong> Përmbledhje poetike lirike ku naltësohet natyra e Gegnisë dhe bukuria e zanave t'maleve.</li>
          <li><strong>4. Gomari i Babatasit (1923):</strong> Nji nga veprat satirike ma gjeniale, ku përdor humorin për <em>me kritue</em> mbetjet e mentalitetit osman.</li>
          <li><strong>5. Vallja e Parrizit (1925):</strong> Poeme me karakter fetar dhe filozofik qi <em>eksploron</em> randsinë e shpirtit.</li>
          <li><strong>6. Juda Makabé:</strong> Tragjedi ku Fishta <em>analizon</em> tradhtinë ndaj atdheut.</li>
        </ul>
      </div>

      <br/>
      <h3 class="text-2xl font-serif font-black mb-4">Pse duhet me e lexue Fishtën sot?</h3>
      <p>Fishta nuk asht thjesht histori. Ai asht nji shkollë e t'folunit. Përmes tij, na mësojmë se si <em>me e rruajtë</em> rranjën e fjalës, si <em>me i përdorë</em> zanoret hundore për <em>me i dhânë</em> forcë fjalimit dhe si <em>me u ndier</em> krenarë për trashëgiminë tonë veriore.</p>
      <p>Mbrojtja e veprës së tij nga harresa asht detyra jonë kryesore në këtë arkivë digjitale.</p>
    `,
    author: 'Redaksia',
    date: '28 Mars 2024',
    timestamp: 1711584000000,
    readTime: '15 min',
    tags: ['Letërsi', 'Fishta', 'Lahuta e Malcis', 'Gjuhësi'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Gjergj_Fishta_portrait.jpg/640px-Gjergj_Fishta_portrait.jpg'
  },
  {
    id: 'kanuni_lek_dukagjinit',
    title: "Kanuni i Lekë Dukagjinit: Kushtetuta e Pashkrueme e Maleve",
    excerpt: "Nji hulumtim i thellë mbi ligjin shekullor qi rregulloi jetën e Gegëve. Nga mbrojtja e nderit te kodi i mikpritjes.",
    content: `<p>Kanuni i Lekë Dukagjinit nuk âsht thjesht nji përmbledhje ligjesh; ai âsht nji traktat filozofik e shoqnor...</p>`,
    author: 'Dr. Gjuhësori',
    date: '25 Mars 2024',
    timestamp: 1711324800000,
    readTime: '12 min',
    tags: ['Kanuni', 'Histori', 'Lekë Dukagjini', 'Kulturë'],
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'diftongjet_shpirte',
    title: "Muzikaliteti i Gegënishtes: Diftongjet 'ue' dhe 'ie'",
    excerpt: "Sekreti i shqiptimit verior: zgjatja e zanores së parë. Pse 'ue' tingëllon si nji 'U' e gjatë dhe 'ie' si 'I' e gjatë.",
    content: `<p>Nji nga karakteristikat ma t'bukura t'Gegënishtes âsht rruajtja e diftongjeve t'vjetra...</p>`,
    author: 'Redaksia',
    date: '20 Mars 2024',
    timestamp: 1710979200000,
    readTime: '6 min',
    tags: ['Gjuhësi', 'Kulturë', 'Diftongjet'],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'paskajorja_shtylla',
    title: "Paskajorja: Shtylla e Gjuhës Gege",
    excerpt: "Pse trajta 'me + folje' asht ma shumë se thjesht gramatikë? Historia e nji forme qi i mbijetoi censurës.",
    content: `<p>Nëse zanoret hundore janë shpirti i Gegënishtes, Paskajorja âsht shtylla e saj kurrizore...</p>`,
    author: 'Dr. Gjuhësori',
    date: '10 Mars 2024',
    timestamp: 1710028800000,
    readTime: '5 min',
    tags: ['Gramatikë', 'Histori', 'Paskajorja'],
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'besa_kodi_nderit',
    title: 'Besa: Ligji i Pashkruem i Maleve',
    excerpt: 'Zbuloni filozofinë e besës, institucionin qi mbajti gjallë shoqninë gege në kohët ma t\'vështira.',
    content: `<p>Për nji Geg, fjala e dhanun nuk asht thjesht premtim. Asht Besa...</p>`,
    author: 'Baca Gjoni',
    date: '15 Shkurt 2024',
    timestamp: 1707955200000,
    readTime: '8 min',
    tags: ['Kulturë', 'Etikë', 'Kanuni'],
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
  }
];

const BlogPage: React.FC<BlogPageProps> = ({ lang, isEditing = false }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isGeg = lang === 'geg';

  useEffect(() => {
    loadPosts();
  }, [lang]);

  const loadPosts = async () => {
    setLoading(true);
    try {
        const stored = await db.getAll<BlogPost>(Stores.Blog);
        let reconciledMap = new Map<string, BlogPost>();
        stored.forEach(p => reconciledMap.set(p.id, p));
        MOCK_POSTS_GEG.forEach(mock => {
            reconciledMap.set(mock.id, mock);
        });
        const finalPosts = Array.from(reconciledMap.values());
        for (const post of finalPosts) {
            await db.put(Stores.Blog, post);
        }
        setPosts(finalPosts.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
        setPosts(MOCK_POSTS_GEG.sort((a, b) => b.timestamp - a.timestamp));
    } finally {
        setLoading(false);
    }
  };

  const handleUpdatePost = async (field: keyof BlogPost, value: any) => {
    if (!selectedPost) return;
    const updatedPost = { ...selectedPost, [field]: value };
    setSelectedPost(updatedPost);
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
        timestamp: Date.now(),
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
                onClick={() => setSelectedPost(null)}
                className="group flex items-center gap-3 text-gray-500 hover:text-albanian-red dark:text-gray-400 dark:hover:text-red-400 transition-all font-bold"
                >
                <div className="p-2.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group-hover:border-red-200 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <span>{isGeg ? 'Kthehu' : 'Back'}</span>
            </button>
            {isEditing && (
                <button 
                    onClick={() => setSelectedPost(null)}
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
            </div>
            <div className="flex flex-wrap gap-6 items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-10">
               <span className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700"><User className="w-3.5 h-3.5" /> {selectedPost.author}</span>
               <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {selectedPost.date}</span>
               <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {selectedPost.readTime}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-black text-gray-900 dark:text-white mb-12 leading-tight text-center tracking-tight">{selectedPost.title}</h1>
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
                    <span key={idx} className="px-5 py-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-gray-100 dark:border-gray-700">#{tag}</span>
                  ))}
            </div>
         </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20">
       <div className="text-center mb-20 px-4">
         <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-gray-900 rounded-[2.5rem] mb-8 shadow-2xl border border-gray-100 dark:border-gray-800 transform rotate-3"><FileText className="w-12 h-12 text-indigo-600 dark:text-indigo-400" /></div>
         <h1 className="text-5xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white mb-6 tracking-tight">{isGeg ? 'Blogu i ' : 'The '}<span className="text-indigo-600">Gegenishtes</span></h1>
         <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">{isGeg ? 'Artikuj, analiza dhe hulumtime mbi kulturën dhe traditën e papërsëritshme të popullit Geg.' : 'Articles, analysis, and research on the unique culture and traditions of the Geg people.'}</p>
         {isEditing && (
            <button onClick={handleCreatePost} className="mt-10 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl active:scale-95 flex items-center gap-3 mx-auto"><PlusCircle className="w-5 h-5" /> {isGeg ? 'Shkruaj nji Artikull' : 'Compose New Article'}</button>
         )}
       </div>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
          {posts.map((post) => (
             <div 
               key={post.id}
               onClick={() => setSelectedPost(post)}
               className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col h-full relative"
             >
                {isEditing && (
                    <button onClick={(e) => handleDeletePost(e, post.id)} className="absolute top-4 right-4 z-20 p-3 bg-white/95 dark:bg-gray-800/95 text-red-500 rounded-2xl shadow-xl border border-red-50 hover:scale-110 transition-transform"><Trash2 className="w-5 h-5" /></button>
                )}
                <div className="h-60 bg-gray-50 dark:bg-gray-800 relative overflow-hidden shadow-inner">
                   {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center"><FileText className="w-16 h-16 text-gray-200 dark:text-gray-700" /></div>
                   )}
                </div>
                <div className="p-10 flex flex-col flex-grow">
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span>{post.readTime}</span>
                   </div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 font-serif group-hover:text-indigo-600 transition-colors leading-tight">{post.title}</h3>
                   <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-10 line-clamp-3 flex-grow font-medium">{post.excerpt}</p>
                   <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] tracking-[0.25em] group-hover:translate-x-2 transition-transform duration-500">{isGeg ? 'Lexo ma shumë' : 'Read Article'} <ArrowUpRight className="w-4 h-4 ml-2" /></div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default BlogPage;
