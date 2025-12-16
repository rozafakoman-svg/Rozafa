
import React, { useState } from 'react';
import { BlogPost, Language } from '../types';
import { Calendar, User, Clock, ArrowUpRight, ArrowLeft, FileText } from './Icons';

interface BlogPageProps {
  lang: Language;
}

const MOCK_POSTS_GEG: BlogPost[] = [
  {
    id: 'gjuha_ruhet_1',
    title: 'Gjuha Ruhet Aty Ku Shkruhet',
    excerpt: 'Fjala e folun e merr era, fjala e shkrueme mbetet. Pse duhet me fillue me shkrue në dialekt sot, ma shumë se kurrë.',
    content: `
      <p class="font-serif text-xl italic text-gray-500 mb-6">"Verba volant, scripta manent" – Fjalët fluturojnë, shkrimet mbesin.</p>
      
      <p>Shpesh dëgjojmë se gjuha është e gjallë vetëm kur flitet. Por historia na mëson ndryshe. Latinishtja mbijetoi shekuj përmes shkrimit, edhe kur nuk flitej ma në rrugë. Gegënishtja, e pasun me nji traditë të jashtëzakonshme nga Buzuku te Fishta, rrezikon me u zbehë nëse mbetet vetëm në biseda kafenesh dhe shtëpi.</p>
      <br/>
      <h3 class="text-xl font-bold mb-2">Fuqia e Tastierës</h3>
      <p>Sot, teknologjia na jep nji mundësi të artë. Çdo status në Facebook, çdo mesazh në WhatsApp, çdo email asht nji akt dokumentimi. Kur shkruani <strong>"me ba"</strong> në vend të "bëj", ju nuk po bëni gabim drejtshkrimor; ju po ruani nji formë historike të foljes qi ka mijëra vjet në këto troje.</p>
      <br/>
      <p>Gjuha ruhet aty ku shkruhet. Nëse nuk e shkruejmë dialektin tonë, ne e dënojmë atë me harrim. Le ta kthejmë tastierën në nji mjet ruajtjeje.</p>
    `,
    author: 'Redaksia',
    date: 'Sot',
    readTime: '3 min',
    tags: ['Kulturë', 'Opinion', 'Digjitalizim'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Meshari.jpg/640px-Meshari.jpg'
  },
  {
    id: 'strategy_1',
    title: 'Gjuha para 1972: çfarë na bashkonte para standardit',
    excerpt: 'Na bashkon nji gjuhë, siç ka thanë Ndre Mjeda. Po cila asht kjo gjuhë?',
    content: `
      <p class="font-serif text-xl italic text-gray-500 mb-6">"Na bashkon nji gjuhë, siç ka thanë Ndre Mjeda. Po cila asht kjo gjuhë?"</p>
      
      <p>Para vitit 1972 nuk ka pasë nji gjuhë standarde shtetnore. Ka pasë <strong>shqipen</strong>, të jetueme e të shkrueme në dy krahë kryesorë: gegënishtën në Veri dhe toskërishten në Jug. Gegënishtja nuk ka qenë thjesht e folun, por <strong>gjuhë e plotë shkrimi, kulture dhe mendimi</strong>, me letërsi, gramatikë dhe normë të qëndrueshme.</p>
      <br/>
      <h3 class="text-xl font-bold mb-2">Një Zgjedhje Politike</h3>
      <p>Standardi i vitit 1972 nuk e krijoi shqipen; ai përzgjodhi <strong>nji normë të vetme</strong>, kryesisht mbi bazë të toskërishtes, dhe e bani atë zyrtare. Kjo zgjedhje ishte institucionale dhe politike, jo përfundim shkencor që e zhvlerëson gegënishten.</p>
      <br/>
      <p>Gegënishtja nuk asht kundër shqipes. Gegënishtja <strong>asht shqip</strong>. Toskërishtja <strong>asht shqip</strong>. Shqiptarët nuk bashkohen tue fshi njanin krah, por tue i njohë të dy.</p>
      <br/>
      <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border-l-4 border-indigo-500 my-6">
        <p class="font-bold text-indigo-900 dark:text-indigo-200">Shënim për lexuesin:</p>
        <p class="text-sm mt-2 text-gray-700 dark:text-gray-300">Ky shkrim shoqërohet me një <strong>Manifest Kulturor</strong> dhe një <strong>Kornizë Akademike</strong>, të cilat janë publikuar për diskutim të hapur në Forumin tonë.</p>
      </div>
    `,
    author: 'Redaksia Gegenisht',
    date: 'Dje',
    readTime: '4 min',
    tags: ['Gjuhësi', 'Histori', 'Editorial'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Ndre_Mjeda.jpg'
  },
  {
    id: '1',
    title: 'Paskajorja: Shpirti i Gegenishtes',
    excerpt: 'Pse forma "me punue" âsht ma shumë se gramatikë—âsht nji mënyrë mendimi qi u hoq padrejtësisht nga standardi.',
    content: `
      <p>Gjuha nuk âsht thjesht mjet komunikimi, por pasqyrë e shpirtit të nji populli. Nji nga humbjet ma të mëdha gjatë standardizimit të vitit 1972 ishte <strong>Paskajorja (Infinitivi)</strong> e tipit <em>me + pjesore</em> (p.sh., "me punue", "me kândue").</p>
      <br/>
      <h3 class="text-xl font-bold mb-2">Çka humbëm?</h3>
      <p>Në Standardin e sotëm, kjo formë zëvendësohet shpesh me lidhoren "për të punuar" ose "që të punojë". Por për folësit e Gegnishtes, kjo tingëllon e stërzgjatun dhe e panatyrshme. Paskajorja ofron nji precizion dhe nji rrjedhshmëri qi lidhorja nuk e ka.</p>
      <br/>
      <p>Mendoni frazën e famshme të Hamletit: <em>"Me qenë a mos me qenë"</em>. Në Standard: "Të jesh apo të mos jesh". Fuqia e paskajores qëndron te thjeshtësia e saj filozofike.</p>
    `,
    author: 'Prof. Agim V.',
    date: '12 Janar 2024',
    readTime: '5 min',
    tags: ['Gjuhësi', 'Gramatikë', 'Histori'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Shkodra_marubi.jpg/640px-Shkodra_marubi.jpg' 
  },
  {
    id: '2',
    title: 'Arkivat Digjitale: Ruajtja e Fjalëve',
    excerpt: 'Si inteligjenca artificiale po ndihmon në deshifrimin e dorëshkrimeve të vjetra të etërve françeskanë.',
    content: `
      <p>Në bodrumet e bibliotekave tona flejnë mijëra faqe dorëshkrimesh qi nuk e panë kurrë dritën e botimit. Sot, teknologjia na jep nji mundësi të dytë.</p>
      <br/>
      <h3 class="text-xl font-bold mb-2">Roli i AI</h3>
      <p>Përmes modeleve gjuhësore si Gemini, ne po krijojmë nji bazë të dhanash qi jo vetëm i digjitalizon këto tekste, por edhe i kupton ato. Kjo na lejon me rindërtue fjalorë të tërë dialektorë qi rrezikonin me u harrue.</p>
      <br/>
      <p>Projekti "Gegenisht" synon me bâ këto thesare të qasshme për çdo shqiptar, kudo qi ndodhet.</p>
    `,
    author: 'Dritan K.',
    date: '28 Shkurt 2024',
    readTime: '3 min',
    tags: ['Teknologji', 'Arkiva'],
  },
  {
    id: '3',
    title: 'Kanga e Djepit',
    excerpt: 'Tradita e ninullave në Malësi dhe randsia e tyne në transmetimin e kodit kulturor te fëmijët.',
    content: `
      <p>Ninullat nuk janë thjesht këngë për me vumë fëmijët në gjumë. Në kulturën Gege, ato janë mësimet e para rreth nderit, besës dhe historisë së fisit.</p>
      <br/>
      <p>Meloditë e tyne melankolike, shpesh të shoqërueme vetëm nga zâni i nanës, mbartin peshën e shekujve të mbijetesës në male. Sot, kjo traditë po zbehet përballë ekraneve, por mbetet nji nga format ma të pastra të poezisë sonë popullore.</p>
    `,
    author: 'Luljeta M.',
    date: '05 Mars 2024',
    readTime: '4 min',
    tags: ['Kulturë', 'Muzikë', 'Traditë'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/High_Albania_02.jpg/640px-High_Albania_02.jpg'
  }
];

const MOCK_POSTS_ENG: BlogPost[] = [
  {
    id: 'strategy_1',
    title: 'Language Before 1972: What United Us',
    excerpt: 'Before 1972, there was no single state standard language. There was Albanian, lived and written in two main branches.',
    content: `
      <p class="font-serif text-xl italic text-gray-500 mb-6">"One language unites us, as Ndre Mjeda said. But what is this language?"</p>
      
      <p>Before 1972, there was no single state standard language. There was <strong>Albanian</strong>, lived and written in two main branches: Geg in the North and Tosk in the South. Geg was not merely spoken, but a <strong>complete language of writing, culture, and thought</strong>, with literature, grammar, and a stable norm.</p>
      <br/>
      <h3 class="text-xl font-bold mb-2">A Political Choice</h3>
      <p>The 1972 Standard did not create Albanian; it selected <strong>a single norm</strong>, primarily based on Tosk, and made it official. This choice was institutional and political, not a scientific conclusion that devalues Geg.</p>
      <br/>
      <p>Geg is not against Albanian. Geg <strong>is Albanian</strong>. Tosk <strong>is Albanian</strong>. Albanians unite not by erasing one branch, but by acknowledging both.</p>
      <br/>
      <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border-l-4 border-indigo-500 my-6">
        <p class="font-bold text-indigo-900 dark:text-indigo-200">Editor's Note:</p>
        <p class="text-sm mt-2 text-gray-700 dark:text-gray-300">This article is accompanied by a <strong>Cultural Manifesto</strong> and an <strong>Academic Framework</strong>, published for open discussion in our Forum.</p>
      </div>
    `,
    author: 'Gegenisht Team',
    date: 'Today',
    readTime: '4 min',
    tags: ['Linguistics', 'History', 'Editorial'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Ndre_Mjeda.jpg'
  },
  {
    id: '1',
    title: 'The Infinitive: The Soul of Geg',
    excerpt: 'Why the form "me punue" is more than just grammar—it is a mode of thought unjustly removed from the standard.',
    content: `
      <p>Language is not merely a tool for communication, but a mirror of a people's soul. One of the greatest losses during the 1972 standardization was the <strong>Infinitive (Paskajorja)</strong> of the type <em>me + participle</em> (e.g., "me punue" - to work).</p>
      <br/>
      <h3 class="text-xl font-bold mb-2">What did we lose?</h3>
      <p>In today's Standard, this form is often replaced by the subjunctive "për të punuar" or "që të punojë". But for Geg speakers, this sounds elongated and unnatural. The infinitive offers a precision and flow that the subjunctive lacks.</p>
      <br/>
      <p>Consider Hamlet's famous line: <em>"Me qenë a mos me qenë"</em>. In Standard: "Të jesh apo të mos jesh". The power of the infinitive lies in its philosophical simplicity.</p>
    `,
    author: 'Prof. Agim V.',
    date: 'Jan 12, 2024',
    readTime: '5 min',
    tags: ['Linguistics', 'Grammar', 'History'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Shkodra_marubi.jpg/640px-Shkodra_marubi.jpg'
  },
  {
    id: '2',
    title: 'Digital Archives: Preserving Words',
    excerpt: 'How artificial intelligence is helping decipher old manuscripts of the Franciscan fathers.',
    content: `
      <p>In the basements of our libraries sleep thousands of pages of manuscripts that never saw the light of publication. Today, technology gives us a second chance.</p>
      <br/>
      <h3 class="text-xl font-bold mb-2">The Role of AI</h3>
      <p>Through language models like Gemini, we are creating a database that not only digitizes these texts but understands them. This allows us to reconstruct entire dialect dictionaries that were at risk of being forgotten.</p>
      <br/>
      <p>The "Gegenisht" project aims to make these treasures accessible to every Albanian, wherever they are.</p>
    `,
    author: 'Dritan K.',
    date: 'Feb 28, 2024',
    readTime: '3 min',
    tags: ['Technology', 'Archives'],
  },
  {
    id: '3',
    title: 'The Cradle Song',
    excerpt: 'The tradition of lullabies in the Highlands and their importance in transmitting cultural codes to children.',
    content: `
      <p>Lullabies are not just songs to put children to sleep. In Geg culture, they are the first lessons about honor, faith, and clan history.</p>
      <br/>
      <p>Their melancholic melodies, often accompanied only by the mother's voice, carry the weight of centuries of survival in the mountains. Today, this tradition is fading in the face of screens, but remains one of the purest forms of our folk poetry.</p>
    `,
    author: 'Luljeta M.',
    date: 'Mar 05, 2024',
    readTime: '4 min',
    tags: ['Culture', 'Music', 'Tradition'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/High_Albania_02.jpg/640px-High_Albania_02.jpg'
  }
];

const BlogPage: React.FC<BlogPageProps> = ({ lang }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  const posts = lang === 'geg' ? MOCK_POSTS_GEG : MOCK_POSTS_ENG;

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pt-6 pb-20">
         <button 
           onClick={() => setSelectedPost(null)}
           className="mb-8 group flex items-center gap-2 text-gray-500 hover:text-albanian-red transition-colors"
         >
           <div className="p-2 bg-white rounded-full border border-gray-200 group-hover:border-red-200 transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </div>
           <span className="font-medium">{lang === 'geg' ? 'Kthehu te Blogu' : 'Back to Blog'}</span>
         </button>

         <article className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm">
            {selectedPost.imageUrl && (
              <div className="w-full h-64 sm:h-96 mb-10 rounded-2xl overflow-hidden">
                <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400 mb-6">
               <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-gray-600 font-medium">
                 <User className="w-4 h-4" /> {selectedPost.author}
               </span>
               <span className="flex items-center gap-1.5">
                 <Calendar className="w-4 h-4" /> {selectedPost.date}
               </span>
               <span className="flex items-center gap-1.5">
                 <Clock className="w-4 h-4" /> {selectedPost.readTime}
               </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 mb-8 leading-tight">
               {selectedPost.title}
            </h1>

            <div 
              className="prose prose-lg text-gray-700 leading-relaxed max-w-none font-serif"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />

            <div className="mt-10 pt-10 border-t border-gray-100">
               <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
               </div>
            </div>
         </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-20">
       <div className="text-center mb-16">
         <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-3xl mb-6 transform rotate-3">
             <FileText className="w-10 h-10 text-emerald-600" />
         </div>
         <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 mb-4">
            {lang === 'geg' ? 'Blogu i Gegenishtes' : 'Gegenisht Blog'}
         </h1>
         <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
             {lang === 'geg' 
               ? 'Artikuj, analiza dhe tregime rreth gjuhës, kulturës dhe historisë së Veriut.' 
               : 'Articles, analysis, and stories about the language, culture, and history of the North.'}
         </p>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
             <div 
               key={post.id}
               onClick={() => setSelectedPost(post)}
               className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
             >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                   {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50/50">
                         <FileText className="w-16 h-16 text-emerald-100" />
                      </div>
                   )}
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                      {post.tags[0]}
                   </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                   <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {post.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {post.readTime}</span>
                   </div>
                   
                   <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif group-hover:text-emerald-700 transition-colors leading-tight">
                      {post.title}
                   </h3>
                   
                   <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3 flex-grow">
                      {post.excerpt}
                   </p>

                   <div className="flex items-center text-emerald-600 font-bold uppercase text-sm tracking-wider group-hover:underline decoration-2 underline-offset-4">
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
