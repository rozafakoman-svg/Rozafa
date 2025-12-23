import React, { useState, useEffect } from 'react';
import { BlogPost, Language } from '../types';
import { Calendar, User, Clock, ArrowUpRight, ArrowLeft, FileText, PlusCircle, Trash2, Save, X, Image as ImageIcon, Edit3, Eye } from './Icons';

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
      <p class="font-serif text-xl italic text-gray-500 mb-6">"Me vdekjen e nji gjuhe, vdes nji botë e tanë."</p>
      
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
      <p>Pa paskajoren, gegënishtja humb nji pjesë të shpirtit të saj. Mbrojtja e kësaj forme asht mbrojtja e lirisë së shprehjes.</p>
    `,
    author: 'Redaksia',
    date: '05 Mars 2024',
    readTime: '4 min',
    tags: ['Grammar', 'Research'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Meshari.jpg/640px-Meshari.jpg'
  },
  {
    id: 'fishta_homeri',
    title: 'Fishta dhe Homeri i Shqiptarëve',
    excerpt: 'Si "Lahuta e Malcís" e ktheu dialektin në nji monument kombëtar.',
    content: `
      <p>At Gjergj Fishta nuk ishte thjesht poet. Ai ishte arkitekti i vetëdijes veriore. Përmes kryeveprës së tij, ai vërtetoi se Gegënishtja asht nji gjuhë e aftë me mbajtë mbi supe peshën e nji epoke të tanë.</p>
      <br/>
      <p>Gjuha e Fishtës asht gjuha e malit, e besës dhe e trimnisë. Ai nuk i kërkoi falje askujt për përdorimin e zanoreve hundore apo fjalëve të randa të Veriut. Përkundrazi, ai i ktheu ato në ar dhe argjend të letërsisë botnore.</p>
    `,
    author: 'Historiani',
    date: '28 Shkurt 2024',
    readTime: '6 min',
    tags: ['Letërsi', 'Fishta', 'Malësi'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Gjergj_Fishta.jpg'
  },
  {
    id: 'tiktok_geg',
    title: 'Gegënishtja në epokën e TikTok-ut',
    excerpt: 'Rinia po e thyen barrierën e standardit përmes kreativitetit digjital.',
    content: `
      <p>Për dekada, Gegënishtja u pa si nji gjuhë "fshatare" apo "jo-zyrtare". Por sot po shohim nji fenomen interesant: Rilindjen Digjitale.</p>
      <br/>
      <p>Në TikTok, Instagram dhe WhatsApp, rinia shqiptare po i kthehet rranjëve. Ata po shkruajnë ashtu siç flasin, pa frikën e nji note të keqe në hartim. Ky komunikim "i papërpunuem" po e mban gjallë gjuhën ma shumë se çdo institucion akademik.</p>
      <br/>
      <p>Teknologjia, qi dikur shihej si kërcënim për traditën, po bëhet shpëtimtarja e saj.</p>
    `,
    author: 'Klevi Admin',
    date: '20 Shkurt 2024',
    readTime: '3 min',
    tags: ['Modern', 'Digital', 'Youth'],
    imageUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'rranjet_latine',
    title: 'Rranjët Latine në Veri: Gjurmët e Romës',
    excerpt: 'Nji hulumtim mbi fjalët qi i kanë mbijetue dy mijë vjetëve histori.',
    content: `
      <p>A e keni mendue ndonjiherë se sa afër latinishtes asht e folmja e nji gjyshi në Mirditë apo Shkodër? Gegënishtja ruan nji shtresë latine qi asht unike në Ballkan.</p>
      <br/>
      <p>Fjalë si <strong>"mik"</strong> (amicus), <strong>"mbret"</strong> (imperator), apo <strong>"qytet"</strong> (civitas) kanë nji rezonancë të veçantë në Veri. Ky hulumtim tregon se Gegënishtja nuk asht thjesht nji dialekt, por nji dëshmitar i nji qytetnimi qi nuk vdiq kurrë plotësisht në malet tona.</p>
    `,
    author: 'Hulumtuesi',
    date: '15 Shkurt 2024',
    readTime: '7 min',
    tags: ['Latin', 'Etymologji', 'Rome'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Rozafa_Castle_Shkodra.jpg/640px-Rozafa_Castle_Shkodra.jpg'
  }
];

const MOCK_POSTS_ENG = MOCK_POSTS_GEG;

const CACHE_KEY_PREFIX = 'gegenisht_blog_posts_';

const BlogPage: React.FC<BlogPageProps> = ({ lang, isEditing = false }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const cacheKey = CACHE_KEY_PREFIX + lang;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        setPosts(JSON.parse(cached));
    } else {
        const initialPosts = lang === 'geg' ? MOCK_POSTS_GEG : MOCK_POSTS_ENG;
        setPosts(initialPosts);
        localStorage.setItem(cacheKey, JSON.stringify(initialPosts));
    }
  }, [lang]);

  const savePosts = (newPosts: BlogPost[]) => {
      setPosts(newPosts);
      localStorage.setItem(CACHE_KEY_PREFIX + lang, JSON.stringify(newPosts));
  };

  const handleUpdatePost = (field: keyof BlogPost, value: any) => {
    if (!selectedPost) return;
    const updatedPost = { ...selectedPost, [field]: value };
    setSelectedPost(updatedPost);
    
    const newPosts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    savePosts(newPosts);
  };

  const handleCreatePost = () => {
    const newPost: BlogPost = {
        id: `new_${Date.now()}`,
        title: lang === 'geg' ? 'Artikull i Ri' : 'New Article',
        excerpt: lang === 'geg' ? 'Përmbledhje...' : 'Summary...',
        content: '<p>Content...</p>',
        author: 'Admin',
        date: new Date().toLocaleDateString(),
        readTime: '1 min',
        tags: ['New'],
        imageUrl: ''
    };
    const newPosts = [newPost, ...posts];
    savePosts(newPosts);
    setSelectedPost(newPost);
  };

  const handleDeletePost = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm('Delete this post?')) {
          const newPosts = posts.filter(p => p.id !== id);
          savePosts(newPosts);
          if (selectedPost?.id === id) setSelectedPost(null);
      }
  };

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pt-6 pb-20">
         <div className="flex justify-between items-center mb-8">
            <button 
                onClick={() => { setSelectedPost(null); setShowPreview(false); }}
                className="group flex items-center gap-2 text-gray-500 hover:text-albanian-red dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                >
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-red-200 dark:group-hover:border-red-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-medium">{lang === 'geg' ? 'Kthehu te Blogu' : 'Back to Blog'}</span>
            </button>
            
            {isEditing && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => { setSelectedPost(null); setShowPreview(false); }}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                    >
                        <Save className="w-4 h-4" /> Save & Close
                    </button>
                </div>
            )}
         </div>

         <article className={`bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 border shadow-sm ${isEditing ? 'border-red-300 ring-2 ring-red-100 dark:border-red-900 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="w-full mb-10 rounded-2xl overflow-hidden relative bg-gray-100 dark:bg-gray-900">
                {selectedPost.imageUrl ? (
                    <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-64 sm:h-96 object-cover" />
                ) : (
                    <div className="w-full h-64 sm:h-96 flex items-center justify-center text-gray-300 dark:text-gray-700">
                        <FileText className="w-20 h-20" />
                    </div>
                )}
                {isEditing && (
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <div className="relative">
                            <input 
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                placeholder="Image URL"
                                value={selectedPost.imageUrl || ''}
                                onChange={(e) => handleUpdatePost('imageUrl', e.target.value)}
                            />
                            <button className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-blue-600 shadow-md pointer-events-none">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400 dark:text-gray-500 mb-6">
               <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-600 dark:text-gray-400 font-medium">
                 <User className="w-4 h-4" /> 
                 {isEditing ? (
                     <input 
                        value={selectedPost.author}
                        onChange={(e) => handleUpdatePost('author', e.target.value)}
                        className="bg-transparent border-b border-red-200 dark:border-red-900 focus:outline-none w-24 text-gray-900 dark:text-white"
                     />
                 ) : selectedPost.author}
               </span>
               <span className="flex items-center gap-1.5">
                 <Calendar className="w-4 h-4" /> 
                 {isEditing ? (
                     <input 
                        value={selectedPost.date}
                        onChange={(e) => handleUpdatePost('date', e.target.value)}
                        className="bg-transparent border-b border-red-200 dark:border-red-900 focus:outline-none w-24 text-gray-900 dark:text-white"
                     />
                 ) : selectedPost.date}
               </span>
               <span className="flex items-center gap-1.5">
                 <Clock className="w-4 h-4" /> 
                 {isEditing ? (
                     <input 
                        value={selectedPost.readTime}
                        onChange={(e) => handleUpdatePost('readTime', e.target.value)}
                        className="bg-transparent border-b border-red-200 dark:border-red-900 focus:outline-none w-16 text-gray-900 dark:text-white"
                     />
                 ) : selectedPost.readTime}
               </span>
            </div>

            {isEditing ? (
                <input 
                    value={selectedPost.title}
                    onChange={(e) => handleUpdatePost('title', e.target.value)}
                    className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-8 leading-tight w-full border-b-2 border-red-200 dark:border-red-900 focus:border-red-500 outline-none bg-red-50/20 dark:bg-red-900/10"
                />
            ) : (
                <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                    {selectedPost.title}
                </h1>
            )}

            {isEditing ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-red-500 uppercase">HTML Content Editor</label>
                        <button 
                            onClick={() => setShowPreview(!showPreview)}
                            className="text-xs font-bold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                        >
                            {showPreview ? <><Edit3 className="w-3 h-3"/> Edit Source</> : <><Eye className="w-3 h-3"/> Preview</>}
                        </button>
                    </div>
                    
                    {showPreview ? (
                         <div 
                            className="prose prose-lg dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed max-w-none font-serif p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50"
                            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                        />
                    ) : (
                        <textarea 
                            value={selectedPost.content}
                            onChange={(e) => handleUpdatePost('content', e.target.value)}
                            className="w-full p-4 border-2 border-red-200 dark:border-red-900 rounded-xl bg-gray-50 dark:bg-gray-900 font-mono text-sm h-[400px] focus:border-red-500 dark:focus:border-red-700 outline-none text-gray-900 dark:text-white"
                            placeholder="<p>Write your article HTML here...</p>"
                        />
                    )}
                </div>
            ) : (
                <div 
                className="prose prose-lg dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed max-w-none font-serif"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
            )}

            <div className="mt-10 pt-10 border-t border-gray-100 dark:border-gray-700">
               <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                  {isEditing && (
                      <button className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50">
                          + Edit Tags
                      </button>
                  )}
               </div>
            </div>
         </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-20">
       <div className="text-center mb-16 px-4">
         <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl mb-6 transform rotate-3 relative group">
             <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
             {isEditing && (
                 <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
                     EDIT MODE
                 </div>
             )}
         </div>
         <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            {lang === 'geg' ? 'Blogu i Gegenishtes' : 'Gegenisht Blog'}
         </h1>
         <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
             {lang === 'geg' 
               ? 'Artikuj, analiza dhe tregime rreth gjuhës, kulturës dhe historisë së Veriut.' 
               : 'Articles, analysis, and stories about the language, culture, and history of the North.'}
         </p>
         
         {isEditing && (
             <button 
                onClick={handleCreatePost}
                className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2 mx-auto"
             >
                 <PlusCircle className="w-5 h-5" /> {lang === 'geg' ? 'Krijo Artikull' : 'Create Article'}
             </button>
         )}
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {posts.map((post) => (
             <div 
               key={post.id}
               onClick={() => setSelectedPost(post)}
               className={`bg-white dark:bg-gray-800 rounded-3xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full relative ${isEditing ? 'border-red-200 dark:border-red-900 hover:border-red-400' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700'}`}
             >
                {isEditing && (
                    <button 
                        onClick={(e) => handleDeletePost(e, post.id)}
                        className="absolute top-2 right-2 z-20 p-2 bg-white/90 dark:bg-gray-800/90 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900 shadow-sm border border-red-100 dark:border-red-900/50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                <div className="h-48 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                   {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/20">
                         <FileText className="w-16 h-16 text-emerald-100 dark:text-emerald-900" />
                      </div>
                   )}
                   <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 shadow-sm">
                      {post.tags[0]}
                   </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                   <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-4 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {post.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {post.readTime}</span>
                   </div>
                   
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-serif group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                      {post.title}
                   </h3>
                   
                   <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3 flex-grow">
                      {post.excerpt}
                   </p>

                   <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold uppercase text-sm tracking-wider group-hover:underline decoration-2 underline-offset-4">
                      {lang === 'geg' ? 'Lexo ma shumë' : 'Read Article'} <ArrowUpRight className="w-4 h-4 ml-1" />
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default BlogPage;
