import React from 'react';
import { ScrollText, ShieldAlert, BookOpen, GraduationCap, ArrowRight, Shield, Anchor } from './Icons';
import { Language } from '../types';

interface HistoryPageProps {
  lang: Language;
}

const translations = {
// ... existing code ...
  eng: {
    hero_badge: "The Silent Years (1944–1990)",
    hero_title: "The Suppression of a Voice",
    hero_desc: "How a totalitarian regime tried to silence the Geg literary tradition and impose a unified standard for political control.",
    sec_1_title: "The Iron Curtain Falls",
    sec_1_p1: "On <strong>November 29, 1944</strong>, the communist partisans took control of Albania, initiating one of the most isolationist and repressive totalitarian regimes in modern history. Under the leadership of Enver Hoxha, the country was sealed off from the world.",
    sec_1_p2: "This date marked the beginning of a systematic persecution of intellectuals, clergy, and writers—particularly those from the Catholic North (Geg region)—who were seen as threats to the new ideology. The rich literary tradition of Shkodra and the north was immediately targeted.",
    sec_2_title: "The Congress of Orthography",
    sec_2_p1: "In 1972, the regime convened the \"Congress of Orthography\" in Tirana to establish a unified \"Standard Albanian\" language.",
    sec_2_p2: "While officially presented as a unifying national project, the standardization was heavily biased towards the <strong>Tosk dialect</strong> (spoken in the south, the leader's region). The <strong>Geg language</strong>—spoken by the majority of Albanians—was effectively demoted to a \"dialect\" and banned from official use, schools, and media.",
    sec_2_li1: "<strong>Literary Erasure:</strong> Works by Geg masters like Gjergj Fishta (the \"Albanian Homer\") were banned.",
    sec_2_li2: "<strong>Forced Assimilation:</strong> Northern writers were forced to write in Standard Tosk or face censorship.",
    sec_2_li3: "<strong>Political Tool:</strong> Language became a tool of control, stripping the north of its cultural identity and political power.",
    sec_2_p3: "This was not merely a linguistic reform but a calculated political act to consolidate power and erase the cultural memory of the north, which historically held strong anti-communist sentiments.",
    sec_3_title: "Prisons of the Mind and Body",
    sec_3_p1: "The suppression of language went hand-in-hand with physical atrocities. Notorious prisons like <strong>Spaç</strong> and <strong>Burrel</strong> became the graveyards of the nation's intelligentsia.",
    sec_3_p2: "Writers like <strong>At Zef Pllumi</strong> (author of <em>Live to Tell</em>) spent decades in labor camps merely for their religious and cultural beliefs. Others were executed without trial. The regime sought to create a \"New Man\" stripped of past, religion, and regional identity.",
    sec_3_quote: "\"They wanted to kill our words so we could not speak, but they forgot that roots grow deepest in the dark.\"",
    sec_4_title: "The Fall and Rebirth",
    sec_4_p1: "With the fall of the regime in the early 1990s, the \"forbidden works\" began to resurface. The Geg literary tradition, preserved in secret manuscripts and oral memory, exploded back into life.",
    sec_4_p2: "Today, we acknowledge Standard Albanian as the official language of the state, but we honor <strong>Geg</strong> as a distinct, vibrant, and equal language of the Albanian people—one that survived half a century of silence."
  },
  geg: {
    hero_badge: "Vitet e Heshtjes (1944–1990)",
    hero_title: "Shtypja e nji Zâni",
    hero_desc: "Si regjimi totalitar u mundue me heshtë traditën letrare Gege dhe me imponue nji standard për kontroll politik dhe me shketerrue Gjuhen Shqipe.",
    sec_1_title: "Perdja e Hekurt Bie",
    sec_1_p1: "Më <strong>29 Nandor 1944</strong>, partizanët komunistë morën kontrollin e Shqipnisë, tuj fillue nji nga regjimet totalitare ma izoluese dhe shtypëse në historinë moderne. Nën udhëheqjen e Enver Hoxhës, vendi u mbyll nga bota.",
    sec_1_p2: "Kjo datë shënoi fillimin e nji persekutimi sistematik të intelektualëve, klerit dhe shkrimtarëve—veçanërisht atyne nga Veriu Katolik (krahina Gege)—qi shiheshin si kërcënim për ideologjinë e re. Tradita e pasun letrare e Shkodrës dhe e veriut u shënjestrua menjiherë.",
    sec_2_title: "Kongresi i Drejtshkrimit",
    sec_2_p1: "Në 1972, regjimi mblodhi \"Kongresin e Drejtshkrimit\" në Tiranë për me vendosë nji gjuhë të unifikueme \"Standarde Shqipe\".",
    sec_2_p2: "Ndërsa zyrtarisht u paraqit si nji projekt kombëtar bashkues, standardizimi ishte randë i anshëm drejt <strong>dialektit toskë</strong> (i folun në jug, krahina e udhëheqësit). <strong>Gjuha Gege</strong>—e folun nga shumica e shqiptarëve—u zhvlerësue efektivisht në nji \"dialekt\" dhe u ndalue nga përdorimi zyrtar, shkollat dhe mediat.",
    sec_2_li1: "<strong>Fshirja Letrare:</strong> Veprat e mjeshtrave Gegë si Gjergj Fishta (\"Homeri Shqiptar\") u ndaluen.",
    sec_2_li2: "<strong>Asimilimi i Detyruem:</strong> Shkrimtarët e veriut u detyruen me shkrue në Standardin Tosk ose përballeshin me censurë.",
    sec_2_li3: "<strong>Mjet Politik:</strong> Gjuha u bâ mjet kontrolli, tuj zhveshë veriun nga identiteti i tij kulturor dhe fuqia politike.",
    sec_2_p3: "Kjo nuk ishte thjesht nji reformë gjuhësore, por nji akt politik i llogaritun për me konsolidue pushtetin dhe me fshi kujtesën kulturore të veriut, i cili historikisht kishte ndjenja të forta antikomuniste.",
    sec_3_title: "Burgjet e Mendjes dhe Trupit",
    sec_3_p1: "Shtypja e gjuhës shkoi dorë për dore me mizoritë fizike. Burgjet famëkeqe si <strong>Spaç</strong> dhe <strong>Burrel</strong> u bânë varrezat e inteligjencës së kombit.",
    sec_3_p2: "Shkrimtarë si <strong>At Zef Pllumi</strong> (autori i <em>Rrno vetëm për me tregue</em>) kaluen dekada në kampe pune thjesht për besimet e tyne fetare dhe kulturore. Të tjerë u ekzekutuen pa gjyq. Regjimi kërkonte me krijue \"Njeriun e Ri\" të zhveshun nga e kaluemja, feja dhe identiteti rajonal.",
    sec_3_quote: "\"Deshtën me na vra fjalët qi mos me mujtë me folë, por harruen qi rranjët rriten ma thellë në terr.\"",
    sec_4_title: "Randa dhe Rilindja",
    sec_4_p1: "Me rënien e regjimit në fillim të viteve 1990, \"veprat e ndalueme\" filluen me dalë në dritë. Tradita letrare Gege, e ruajtun në dorëshkrime të fshehta dhe kujtesën gojore, shpërtheu përsëri në jetë.",
    sec_4_p2: "Sot, na e njohim Shqipen Standarde si gjuhën zyrtare të shtetit, por e nderojmë <strong>Gegenishten</strong> si nji gjuhë të veçantë, të gjallë dhe të barabartë të popullit shqiptar—nji gjuhë qi i mbijetoi gjysëm shekulli heshtje."
  }
};

const HistoryPage: React.FC<HistoryPageProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-20 px-4">
      
      {/* Hero Section */}
      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-albanian-red dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-red-100 dark:border-red-900">
           <ShieldAlert className="w-4 h-4" /> {t.hero_badge}
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight">
           {lang === 'geg' ? <>Shtypja e nji <span className="text-albanian-red">Zâni</span></> : <>The Suppression of a <span className="text-albanian-red">Voice</span></>}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto font-light">
           {t.hero_desc}
        </p>
      </div>

      <div className="relative border-l-4 border-gray-200 dark:border-gray-800 ml-4 md:ml-8 space-y-16 pl-8 md:pl-16">
         
         {/* 1944 Section */}
         <div className="relative">
            <div className="absolute -left-[42px] md:-left-[74px] top-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-200 text-white dark:text-black font-bold text-xs ring-4 ring-white dark:ring-gray-900">
                1
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
               <span className="text-7xl font-black text-gray-100 dark:text-gray-700 absolute -top-4 -right-4 select-none opacity-50 group-hover:opacity-100 transition-opacity">1944</span>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-serif relative z-10">
                  {t.sec_1_title}
               </h2>
               <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300 relative z-10">
                  <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.sec_1_p1 }}></p>
                  <p dangerouslySetInnerHTML={{ __html: t.sec_1_p2 }}></p>
               </div>
            </div>
         </div>

         {/* 1972 Congress Section - Highlighted */}
         <div className="relative">
            <div className="absolute -left-[44px] md:-left-[76px] top-0 flex items-center justify-center w-10 h-10 rounded-full bg-albanian-red text-white font-bold text-sm ring-4 ring-red-100 dark:ring-red-900">
                !
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-8 border border-red-100 dark:border-red-900 shadow-lg relative overflow-hidden">
               <span className="text-7xl font-black text-red-100 dark:text-red-900/30 absolute -top-4 -right-4 select-none">1972</span>

               <h2 className="text-3xl font-bold text-albanian-red dark:text-red-400 mb-6 font-serif flex items-center gap-3 relative z-10">
                  {t.sec_2_title}
               </h2>
               <div className="prose prose-lg dark:prose-invert text-gray-800 dark:text-gray-200 leading-relaxed relative z-10">
                  <p className="mb-6 font-medium" dangerouslySetInnerHTML={{ __html: t.sec_2_p1 }}></p>
                  <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.sec_2_p2 }}></p>
                  <ul className="list-none space-y-3 my-6">
                     <li className="flex items-start gap-3 bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                        <span className="text-red-500 mt-1"><ShieldAlert className="w-4 h-4"/></span>
                        <span className="text-sm" dangerouslySetInnerHTML={{ __html: t.sec_2_li1 }}></span>
                     </li>
                     <li className="flex items-start gap-3 bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                        <span className="text-red-500 mt-1"><ShieldAlert className="w-4 h-4"/></span>
                        <span className="text-sm" dangerouslySetInnerHTML={{ __html: t.sec_2_li2 }}></span>
                     </li>
                     <li className="flex items-start gap-3 bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                        <span className="text-red-500 mt-1"><ShieldAlert className="w-4 h-4"/></span>
                        <span className="text-sm" dangerouslySetInnerHTML={{ __html: t.sec_2_li3 }}></span>
                     </li>
                  </ul>
                  <p dangerouslySetInnerHTML={{ __html: t.sec_2_p3 }}></p>
               </div>
            </div>
         </div>

         {/* The Atrocities */}
         <div className="relative">
             <div className="absolute -left-[42px] md:-left-[74px] top-0 w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 border-4 border-white dark:border-gray-900"></div>
             
             <div className="bg-gray-900 dark:bg-black text-gray-300 rounded-3xl p-8 sm:p-12 border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-500 via-gray-900 to-black pointer-events-none"></div>
                
                <h2 className="text-2xl font-bold text-white mb-6 font-serif flex items-center gap-3 relative z-10">
                    <Shield className="w-6 h-6 text-gray-500" />
                    {t.sec_3_title}
                </h2>
                <div className="prose prose-lg dark:prose-invert text-gray-400 relative z-10">
                    <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.sec_3_p1 }}></p>
                    <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.sec_3_p2 }}></p>
                    <div className="flex items-start gap-4 p-6 border-l-2 border-gray-700 bg-gray-800/50 mt-8 rounded-r-xl italic font-serif">
                       <ScrollText className="w-8 h-8 text-gray-500 flex-shrink-0 mt-1" />
                       <p className="text-lg text-gray-300">
                          {t.sec_3_quote}
                       </p>
                    </div>
                </div>
             </div>
         </div>

         {/* 1990s Rebirth */}
         <div className="relative">
            <div className="absolute -left-[42px] md:-left-[74px] top-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs ring-4 ring-white dark:ring-gray-900">
                <Anchor className="w-4 h-4" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-blue-100 dark:border-blue-900 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
               <span className="text-7xl font-black text-blue-50 dark:text-blue-900/30 absolute -top-4 -right-4 select-none">1991</span>
               
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-serif flex items-center gap-3 relative z-10">
                  {t.sec_4_title}
               </h2>
               <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300 relative z-10">
                  <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.sec_4_p1 }}></p>
                  <p dangerouslySetInnerHTML={{ __html: t.sec_4_p2 }}></p>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default HistoryPage;