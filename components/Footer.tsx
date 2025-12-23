import React from 'react';
import { Language } from '../types';
import { 
  BookOpen, Github, Twitter, Instagram, ArrowRight, Heart, Globe, Mail, MapPin 
} from './Icons';

interface FooterProps {
  lang: Language;
  onNavigate: (view: any) => void;
}

const translations = {
  eng: {
    desc: "A digital sanctuary for the preservation and promotion of the Geg people's language, culture, and history.",
    col1_title: "EXPLORE",
    col1_links: ["Dictionary", "Thesaurus", "Linguistic Map", "Alphabet", "Glossary"],
    col2_title: "COMMUNITY",
    col2_links: ["Community", "Forum", "Games", "Podcasts", "Blog"],
    col3_title: "PROJECT",
    col3_links: ["About Us", "Support", "Shop", "History"],
    quote: "Language is the only homeland that survives every exile.",
    copy: "© 2025 Gegenisht Project.",
    rights: "All rights reserved.",
    privacy: "PRIVACY",
    terms: "TERMS",
    contact: "CONTACT"
  },
  geg: {
    desc: "Nji vend i shenjtë digjital për ruajtjen dhe promovimin e gjuhës, kulturës dhe historisë së popullit Geg.",
    col1_title: "EKSPLORO",
    col1_links: ["Fjalori", "Thesari", "Harta", "Alfabeti", "Fjalorthi"],
    col2_title: "KOMUNITETI",
    col2_links: ["Komuniteti", "Forumi", "Lojëra", "Podkaste", "Blogu"],
    col3_title: "PROJEKTI",
    col3_links: ["Rreth Nesh", "Mbështetje", "Dyqani", "Historia"],
    quote: "Gjuha âsht e vetmja atdhe qi i mbijeton çdo mbretnisë.",
    copy: "© 2025 Projekti Gegenisht.",
    rights: "Të gjitha të drejtat e rezervueme.",
    privacy: "PRIVATËSIA",
    terms: "KUSHTET",
    contact: "KONTAKTI"
  }
};

const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  const t = translations[lang];
  const isGeg = lang === 'geg';

  const mapLinkToView = (label: string): any => {
    const l = label.toLowerCase();
    if (l === 'fjalori' || l === 'dictionary') return 'dictionary';
    if (l === 'thesari' || l === 'thesaurus') return 'thesaurus';
    if (l === 'alfabeti' || l === 'alphabet') return 'alphabet';
    if (l === 'fjalorthi' || l === 'glossary') return 'glossary';
    if (l === 'harta' || l === 'linguistic map') return 'map';
    if (l === 'komuniteti' || l === 'community') return 'community';
    if (l === 'forumi' || l === 'forum') return 'forum';
    if (l === 'podkaste' || l === 'podcasts' || l === 'podcast') return 'podcast';
    if (l === 'blogu' || l === 'blog') return 'blog';
    if (l === 'historia' || l === 'history') return 'history';
    if (l === 'mbështetje' || l === 'support' || l === 'donate') return 'support';
    if (l === 'dyqani' || l === 'shop') return 'shop';
    if (l === 'rreth nesh' || l === 'about us') return 'blog';
    return 'dictionary';
  };

  const handleLinkClick = (link: string) => {
    onNavigate(mapLinkToView(link));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative z-10">
        
        {/* Top Section: Brand & Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Column 1: Brand (Spans 4/12 on large) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex flex-col items-center md:items-start">
              <button 
                onClick={() => handleLinkClick('dictionary')}
                className="flex items-center gap-3 group transition-transform active:scale-95 mb-6"
              >
                <div className="bg-albanian-red text-white p-3 rounded-2xl shadow-2xl group-hover:rotate-6 transition-all duration-300 ring-4 ring-red-900/20">
                  <BookOpen className="w-8 h-8" />
                </div>
                <span className="text-4xl font-serif font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Gegenisht
                </span>
              </button>
              <p className="text-slate-400 leading-relaxed text-base max-w-sm text-center md:text-left font-medium">
                {t.desc}
              </p>
            </div>
            
            {/* Social Icons */}
            <div className="flex justify-center md:justify-start gap-4">
              {[
                { Icon: Github, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Globe, href: "#" }
              ].map(({ Icon, href }, i) => (
                <a 
                  key={i}
                  href={href} 
                  className="w-12 h-12 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-albanian-red hover:border-albanian-red/50 hover:bg-red-900/10 transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation Grid (Spans 8/12 on large) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Explore List */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-albanian-red rounded-full"></div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400">{t.col1_title}</h3>
              </div>
              <ul className="space-y-3">
                {t.col1_links.map(link => (
                  <li key={link}>
                    <button 
                      onClick={() => handleLinkClick(link)}
                      className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-1 text-sm font-semibold"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-albanian-red transition-all duration-300"></span>
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community List */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400">{t.col2_title}</h3>
              </div>
              <ul className="space-y-3">
                {t.col2_links.map(link => (
                  <li key={link}>
                    <button 
                      onClick={() => handleLinkClick(link)}
                      className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-1 text-sm font-semibold"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-indigo-500 transition-all duration-300"></span>
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Project List (Mobile: Takes full width or 3rd column) */}
            <div className="space-y-6 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400">{t.col3_title}</h3>
              </div>
              <ul className="space-y-3">
                {t.col3_links.map(link => (
                  <li key={link}>
                    <button 
                      onClick={() => handleLinkClick(link)}
                      className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-1 text-sm font-semibold"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-emerald-500 transition-all duration-300"></span>
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Middle Section: Newsletter / Quick Contact (Mobile-friendly row) */}
        <div className="border-y border-slate-900 py-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 text-slate-300">
             <div className="p-3 bg-slate-900 rounded-full border border-slate-800">
                <Heart className="w-6 h-6 text-red-500 fill-red-500/20" />
             </div>
             <div>
                <p className="font-bold text-sm leading-none mb-1">{isGeg ? 'Mbështetni Gjuhën' : 'Support the Language'}</p>
                <p className="text-xs text-slate-500">{isGeg ? 'Bâhu nji sponsor i kulturës sonë.' : 'Become a sponsor of our culture.'}</p>
             </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs font-black tracking-widest text-slate-500 uppercase">
             <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Mail className="w-4 h-4" /> contact@gegenisht.al
             </div>
             <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <MapPin className="w-4 h-4" /> Shkodër / Tirana
             </div>
          </div>
        </div>

        {/* Bottom Section: Quote & Copyright */}
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="space-y-4 max-w-3xl">
            <p className="text-xl md:text-2xl italic font-serif text-slate-200 leading-snug px-4">
              "{t.quote}"
            </p>
            <div className="flex items-center justify-center gap-2">
               <div className="h-px w-8 bg-slate-800"></div>
               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">Historical Archive</span>
               <div className="h-px w-8 bg-slate-800"></div>
            </div>
          </div>

          {/* Legal and Final Copyright */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-900/50">
            <div className="flex items-center gap-6 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              <a href="#" className="hover:text-white transition-colors">{t.privacy}</a>
              <a href="#" className="hover:text-white transition-colors">{t.terms}</a>
              <a href="#" className="hover:text-white transition-colors">{t.contact}</a>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.15em] uppercase">
                {t.copy}
              </p>
              <p className="text-[9px] font-medium text-slate-700 uppercase tracking-widest">
                {t.rights}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Red Accent Bottom Bar */}
      <div className="h-1.5 w-full bg-albanian-red shadow-[0_-4px_10px_rgba(152,0,0,0.3)]"></div>
    </footer>
  );
};

export default Footer;