
import React, { useState, useEffect, useRef } from 'react';
import { BlogPost, Language } from '../types';
import { db, Stores } from '../services/db';
import { fetchBlogVisual } from '../services/geminiService';
import { 
  Calendar, User, Clock, ArrowUpRight, ArrowLeft, BlogB, PlusCircle, Trash2, 
  Save, X, Image as ImageIcon, Edit3, Eye, Bold, Italic, List, Type, Link, Sparkles, Loader2, CloudRain, Zap, Flame
} from './Icons';

interface BlogPageProps {
  lang: Language;
  isEditing?: boolean;
}

const MOCK_POSTS_GEG: BlogPost[] = [
  {
    id: 'buzmi_tradita_gege_2024',
    title: "Buzmi i Kershendellave: Rilindja e Diellit n'Votrën tonë",
    excerpt: "Nji hulumtim mbi ritin ma t'vjetër t'dimnit: Buzmin. Si e ndezin Gegët zjarrin e shpresës.",
    content: `
      <p class="font-serif text-xl italic text-gray-500 mb-6 text-center">"Hini Buzëm! — Bujrum, o Buzëm!"</p>
      <p>Sonte, në prag të Kershendellave, në votrat e malësisë sonë fillon riti i <strong>Buzmit</strong>. Ky nuk âsht thjesht nji cung qi digjet në oxhak; âsht nji mbetje gjeniale e nji mitologjie qi i ka mbijetue mijëvjeçarëve.</p>
    `,
    author: 'Redaksia e Gegenishtes',
    date: '24 Dhetor 2024',
    timestamp: 1735046400000,
    readTime: '8 min',
    tags: ['Kulturë', 'Mite', 'Buzmi'],
    imagePrompt: "A traditional Albanian stone fireplace (votër) with a thick wooden log burning, warm glowing embers, dark mystical atmosphere, heritage aesthetic."
  },
  {
    id: 'kanuni_leke_dukagjinit_research',
    title: "Kanuni: Kushtetuta e Pashkrueme e Maleve",
    excerpt: "Nji analizë e thellë mbi ligjin shekullor qi rregulloi jetën në Gegni.",
    content: `
      <p class="font-serif text-xl italic text-gray-500 mb-6 text-center">"Shpija e Shqyptarit asht e Zotit dhe e Mikut."</p>
      <p>Për shekuj me rradhë, populli Geg u qeveris nga nji sistem gjenial: <strong>Kanuni i Lekë Dukagjinit</strong>.</p>
    `,
    author: 'Arkiva e Gegenishtes',
    date: '15 Nandor 2024',
    timestamp: 1731628800000,
    readTime: '12 min',
    tags: ['Histori', 'Kanuni'],
    imagePrompt: "An old weathered parchment scroll next to an eagle-headed silver sword, dim warm light, Albanian heritage style."
  },
  {
    id: 'xhubleta_ancient_garment',
    title: "Xhubleta: Mrekullia 4000 Vjeçare e Maleve",
    excerpt: "E vërteta mbi veshjen ma t'vjetër n'Europë. Si u ruajt kodi i fshehtë i simboleve.",
    content: `
      <p>Xhubleta nuk asht thjesht veshje, por nji monument i gjallë i historisë sonë, pjesë e UNESCO-s.</p>
    `,
    author: 'Arkiva e Gegenishtes',
    date: '10 Nandor 2024',
    timestamp: 1731225600000,
    readTime: '12 min',
    tags: ['Etnografi', 'UNESCO', 'Kulturë'],
    imagePrompt: "A close-up photography of a traditional Albanian Xhubleta, black felt with intricate heavy gold embroidery, museum lighting."
  },
  {
    id: 'kenget_e_kreshnikeve_epic',
    title: "Këngët e Kreshnikëve: Epika qi Gjimoi",
    excerpt: "Muji dhe Halili: Heronjtë qi mbrojtën rranjën e Gegnisë.",
    content: `
      <p>Nëse grekët kanë Iliadën, Gegët kanë <strong>Këngët e Kreshnikëve</strong>.</p>
    `,
    author: 'Redaksia',
    date: '02 Tetor 2024',
    timestamp: 1727856000000,
    readTime: '15 min',
    tags: ['Epikë', 'Lahuta', 'Mite'],
    imagePrompt: "A majestic illustration of a kreshnik warrior (Muji) with a thick mustache standing on a misty mountain peak, epic fantasy."
  },
  {
    id: 'oda_e_burrve_parliament',
    title: "Oda e Burrve: Parlamenti i Vogël",
    excerpt: "Si funksionoi oda si shkollë, gjykatë dhe shtëpi.",
    content: `
      <p>Në <strong>Odën e Burrve</strong>, gjuha ishte arma ma e fortë.</p>
    `,
    author: 'Arkiva',
    date: '15 Shtator 2024',
    timestamp: 1726387200000,
    readTime: '10 min',
    tags: ['Sociologji', 'Kulturë', 'Oda'],
    imagePrompt: "Interior of a traditional Northern Albanian 'Oda e Burrve', stone walls, low wooden tables, dim oil lamp light."
  },
  {
    id: 'beselidhja_e_lezhes_history',
    title: "1444: Besëlidhja qi Bashkoi Gegët",
    excerpt: "Si Gjergj Kastrioti i bani bashkë prijësit e veriut.",
    content: `
      <p>Më 2 Mars 1444, princat gegë lidhën <strong>Besën</strong> për nji qëllim t'përbashkët.</p>
    `,
    author: 'Histori',
    date: '20 Gusht 2024',
    timestamp: 1724140800000,
    readTime: '14 min',
    tags: ['Histori', 'Skënderbeu', 'Lezha'],
    imagePrompt: "A historical painting style scene of medieval Albanian lords meeting in a stone cathedral, Gjergj Kastrioti standing in the center."
  },
  {
    id: 'gjergj_fishta_bibliografia_komplete',
    title: "At Gjergj Fishta: Shpirti i Kombit n'Gegënisht",
    excerpt: "Nji hulumtim i thellë mbi jetën dhe veprën e 'Homerit Shqiptar'.",
    content: `
      <p>Nuk ka figurë qi e mishëron ma mirë fuqinë e Gegënishtes sesa <strong>At Gjergj Fishta</strong>.</p>
    `,
    author: 'Redaksia',
    date: '28 Mars 2024',
    timestamp: 1711584000000,
    readTime: '15 min',
    tags: ['Letërsi', 'Fishta', 'Gjuhësi'],
    imagePrompt: "An evocative oil painting of At Gjergj Fishta wearing a Franciscan robe, holding a book, Albanian mountain peaks backdrop."
  },
  {
    id: 'lahuta_malcis_epika_research',
    title: "Lahuta e Malcís: Epika e fundit e Europës",
    excerpt: "Pse vepra e Fishtës konsiderohet 'Iliada Shqiptare'.",
    content: `
      <p>Fishta e përdori Gegënishten si nji instrument qi mund <em>me kndue</em> amël si zâna.</p>
    `,
    author: 'Gjuhësi',
    date: '10 Tetor 2024',
    timestamp: 1728518400000,
    readTime: '15 min',
    tags: ['Letërsi', 'Lahuta'],
    imagePrompt: "A traditional wooden Lahuta leaning against a stone wall of a Kulla, dramatic light."
  },
  {
    id: 'paskajorja_gege_identiteti',
    title: "Paskajorja: Shpirti i lirisë n'Gegënisht",
    excerpt: "Pse forma 'me + folje' âsht ma shumë se gramatikë.",
    content: `
      <p>Nji nga dallimet ma t'mëdha mes Gegënishtes dhe Standardit âsht <strong>Paskajorja</strong>.</p>
    `,
    author: 'Gjuhësi',
    date: '05 Shtator 2024',
    timestamp: 1725494400000,
    readTime: '10 min',
    tags: ['Gjuhësi', 'Gramatikë'],
    imagePrompt: "An open old book with hand-written calligraphy in Albanian Geg language, scholarly aesthetic."
  },
  {
    id: 'zanat_e_maleve_myth_research',
    title: "Zanat dhe Orët: Mitologjia e maleve tona",
    excerpt: "Eksplorimi i botës mistike t'Gegnisë.",
    content: `
      <p>Në rranxët e Maleve t'Namuna, <strong>Zanat e Maleve</strong> janë rojtaret e fiseve.</p>
    `,
    author: 'Mite',
    date: '20 Gusht 2024',
    timestamp: 1724112000000,
    readTime: '11 min',
    tags: ['Mite', 'Zanat'],
    imagePrompt: "A mystical ethereal scene in the Albanian mountains, a glowing female figure standing by a spring at night."
  },
  {
    id: 'kulla_shqyptare_architecture',
    title: "Kulla: Simboli i qëndresës",
    excerpt: "Si arkitektura e guri reflektoi mënyrën e jetesës në veri.",
    content: `
      <p><strong>Kulla</strong> prej guri asht dëshmitarja ma e madhe e historisë sonë.</p>
    `,
    author: 'Arkitekturë',
    date: '12 Korrik 2024',
    timestamp: 1720742400000,
    readTime: '9 min',
    tags: ['Histori', 'Kulla'],
    imagePrompt: "A majestic traditional stone tower (Kulla) perched on a rugged cliff in Northern Albania, cinematic light."
  }
];

const BlogPage: React.FC<BlogPageProps> = ({ lang, isEditing = false }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
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
            if (!reconciledMap.has(mock.id)) {
                reconciledMap.set(mock.id, mock);
            }
        });
        
        const finalPosts = Array.from(reconciledMap.values());
        
        for (const post of finalPosts) {
            if (!stored.find(s => s.id === post.id)) {
                await db.put(Stores.Blog, post);
            }
        }
        
        setPosts(finalPosts.sort((a, b) => b.timestamp - a.timestamp));

        const missingVisuals = finalPosts.filter(p => !p.imageUrl && p.imagePrompt);
        if (missingVisuals.length > 0) {
            generateMissingVisuals(missingVisuals);
        }
    } catch (e) {
        setPosts(MOCK_POSTS_GEG.sort((a, b) => b.timestamp - a.timestamp));
    } finally {
        setLoading(false);
    }
  };

  const generateMissingVisuals = async (targetPosts: BlogPost[]) => {
      setIsGeneratingVisuals(true);
      for (const post of targetPosts) {
          try {
              if (post.imagePrompt && !post.imageUrl) {
                  const url = await fetchBlogVisual(post.imagePrompt);
                  const updatedPost = { ...post, imageUrl: url };
                  await db.put(Stores.Blog, updatedPost);
                  setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
                  await new Promise(r => setTimeout(r, 2000));
              }
          } catch (e) {
              console.warn(`Visual generation failed for post ${post.id}`, e);
          }
      }
      setIsGeneratingVisuals(false);
  };

  const handleUpdatePost = async (field: keyof BlogPost, value: any) => {
    if (!selectedPost) return;
    const updatedPost = { ...selectedPost, [field]: value };
    setSelectedPost(updatedPost);
    try {
        await db.put(Stores.Blog, updatedPost);
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    } catch (e) { console.error(e); }
  };

  const handleCreatePost = async () => {
    const newPost: BlogPost = {
        id: `blog_${Date.now()}`,
        title: isGeg ? 'Titull i Ri' : 'New Post',
        excerpt: 'Përmbledhje...',
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
    } catch (e) { console.error(e); }
  };

  const handleDeletePost = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm('A jeni i sigurtë?')) {
          try {
              await db.delete(Stores.Blog, id);
              setPosts(prev => prev.filter(p => p.id !== id));
              if (selectedPost?.id === id) setSelectedPost(null);
          } catch (e) { console.error(e); }
      }
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Tuj ngarkue arkivën...</p>
          </div>
      );
  }

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pt-6 pb-20 px-4">
         <div className="flex justify-between items-center mb-10">
            <button onClick={() => setSelectedPost(null)} className="flex items-center gap-3 text-gray-500 font-bold"><ArrowLeft className="w-5 h-5" /> <span>{isGeg ? 'Kthehu' : 'Back'}</span></button>
            {isEditing && <button onClick={() => setSelectedPost(null)} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Finish</button>}
         </div>
         <article className={`bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border shadow-2xl overflow-hidden ${isEditing ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'}`}>
            <div className="w-full mb-12 rounded-3xl overflow-hidden relative bg-gray-50 dark:bg-gray-800 h-80">
                {selectedPost.imageUrl ? <img src={selectedPost.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><BlogB className="w-20 h-20" /></div>}
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-gray-900 dark:text-white mb-12 text-center">{selectedPost.title}</h1>
            {isEditing ? <textarea ref={textareaRef} value={selectedPost.content} onChange={(e) => handleUpdatePost('content', e.target.value)} className="w-full p-8 border rounded-[2rem] bg-gray-50 dark:bg-gray-950 font-mono h-[500px]" /> : <div className="prose prose-xl dark:prose-invert max-w-none font-serif" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />}
         </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20">
       <div className="text-center mb-20 px-4">
         <div className="inline-flex items-center justify-center w-28 h-28 bg-white dark:bg-gray-900 rounded-[3rem] mb-8 shadow-2xl border-4 border-gray-50 dark:border-gray-800"><BlogB className="w-16 h-16 text-indigo-600" /></div>
         <h1 className="text-6xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white mb-6 tracking-tight">Blogu i <span className="text-indigo-600">Gegenishtes</span></h1>
         <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">{isGeg ? 'Artikuj dhe hulumtime mbi kulturën e popullit Geg.' : 'Articles and research on Geg culture.'}</p>
         {isEditing && <button onClick={handleCreatePost} className="mt-10 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 mx-auto"><PlusCircle className="w-5 h-5" /> New Article</button>}
         {isGeneratingVisuals && <div className="mt-6 flex items-center justify-center gap-2 text-indigo-500 animate-pulse"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[10px] font-black uppercase">Restoring Manuscript Visuals...</span></div>}
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
          {posts.map((post, index) => {
             // Editorial Masonry Logic: Every 4th post is wide
             const isWide = index % 4 === 0;
             return (
                <div 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)} 
                  className={`bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-3xl transition-all cursor-pointer group flex flex-col h-full relative ${isWide ? 'md:col-span-2' : ''}`}
                >
                    {isEditing && <button onClick={(e) => handleDeletePost(e, post.id)} className="absolute top-6 right-6 z-20 p-3 bg-white text-red-500 rounded-2xl shadow-xl"><Trash2 className="w-5 h-5" /></button>}
                    <div className={`${isWide ? 'h-96' : 'h-64'} bg-gray-50 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center`}>
                       {post.imageUrl ? <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" /> : <div className="opacity-20 flex flex-col items-center gap-3"><BlogB className="w-16 h-16" /> {isGeneratingVisuals && <Loader2 className="w-6 h-6 animate-spin" />}</div>}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="p-12 flex flex-col flex-grow">
                       <div className="flex items-center gap-3 mb-6">
                          {post.tags.map(tag => (
                             <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">{tag}</span>
                          ))}
                       </div>
                       <h3 className={`${isWide ? 'text-4xl' : 'text-2xl'} font-black text-gray-900 dark:text-white mb-6 font-serif group-hover:text-indigo-600 transition-colors leading-tight`}>{post.title}</h3>
                       <p className="text-gray-500 dark:text-gray-400 line-clamp-3 mb-12 font-medium text-lg leading-relaxed">{post.excerpt}</p>
                       <div className="flex items-center justify-between mt-auto border-t border-gray-50 dark:border-gray-800 pt-8">
                          <div className="flex items-center gap-3 text-gray-400 font-bold text-xs">
                             <Clock className="w-4 h-4" /> {post.readTime}
                          </div>
                          <div className="flex items-center text-indigo-600 font-black uppercase text-[10px] tracking-widest group-hover:translate-x-2 transition-transform">Read Analysis <ArrowUpRight className="w-4 h-4 ml-2" /></div>
                       </div>
                    </div>
                </div>
             );
          })}
       </div>
    </div>
  );
};

export default BlogPage;
