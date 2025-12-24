
import React from 'react';
import { Language, View } from '../types';
import { 
  BookOpen, Github, Twitter, Instagram, ArrowRight, Heart, Globe, Mail, MapPin 
} from './Icons';
import ConnectionStatus from './ConnectionStatus';

interface FooterProps {
  lang: Language;
  onNavigate: (view: View) => void;
}

const translations = {
  eng: {
    desc: "A digital sanctuary for the preservation and promotion of the Geg people's language, culture, and history.",
    col1_title: "EXPLORE",
    col1_links: ["Dictionary", "Thesaurus", "Linguistic Map", "Alphabet", "Glossary"],
    col2_title: "COMMUNITY",
    col2_links: ["Community", "Forum", "Games", "Podcasts", "Blog"],
    col3_title: "PROJECT",
    col3_links: ["About Us", "Support", "Shop", "FAQ"],
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
    col3_links: ["Rreth Nesh", "Mbështetje", "Dyqani", "Pyetje"],
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

  const mapLinkToView = (label: string): View => {
    const l = label.toLowerCase();
    if (l === 'fjalori' || l === 'dictionary' || l === 'thesari' || l === 'thesaurus') return 'dictionary';
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
    if (l === 'faq' || l === 'pyetje') return 'faq';
    return 'dictionary';
  };

  const handleLinkClick = (link: string) => {
    onNavigate(mapLinkToView(link));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 mb-16">
          <div className="space-y-6 text-center sm:text-left flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-3">
              <div className="bg-albanian-red text-white p-2.5 rounded-xl shadow-lg transform transition-transform hover:rotate-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-3xl font-serif font-black tracking-tighter">Gegenisht</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              {t.desc}
            </p>
            <div className="flex items-center gap-5 pt-2">
              <Github className="w-5 h-5 text-slate-500 hover:text-white transition-all cursor-pointer hover:scale-110" />
              <Twitter className="w-5 h-5 text-slate-500 hover:text-white transition-all cursor-pointer hover:scale-110" />
              <Instagram className="w-5 h-5 text-slate-500 hover:text-white transition-all cursor-pointer hover:scale-110" />
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-8 sm:mb-10">{t.col1_title}</h4>
            <ul className="space-y-4 sm:space-y-5">
              {t.col1_links.map(link => (
                <li key={link}>
                  <button 
                    onClick={() => handleLinkClick(link)} 
                    className="text-base sm:text-sm text-slate-400 hover:text-white transition-all flex items-center justify-center sm:justify-start gap-2 group w-full sm:w-auto"
                  >
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0 text-albanian-red hidden sm:block" />
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-8 sm:mb-10">{t.col2_title}</h4>
            <ul className="space-y-4 sm:space-y-5">
              {t.col2_links.map(link => (
                <li key={link}>
                  <button 
                    onClick={() => handleLinkClick(link)} 
                    className="text-base sm:text-sm text-slate-400 hover:text-white transition-all flex items-center justify-center sm:justify-start gap-2 group w-full sm:w-auto"
                  >
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0 text-albanian-red hidden sm:block" />
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-8 sm:mb-10">{t.col3_title}</h4>
            <ul className="space-y-4 sm:space-y-5">
              {t.col3_links.map(link => (
                <li key={link}>
                  <button 
                    onClick={() => handleLinkClick(link)} 
                    className="text-base sm:text-sm text-slate-400 hover:text-white transition-all flex items-center justify-center sm:justify-start gap-2 group w-full sm:w-auto"
                  >
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0 text-albanian-red hidden sm:block" />
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-900 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="text-slate-500 text-[11px] font-black uppercase tracking-widest text-center lg:text-left">
              <p>{t.copy} {t.rights}</p>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-1">
              <span className="text-[10px] font-black tracking-widest text-slate-600 hover:text-white transition-colors cursor-pointer">{t.privacy}</span>
              <span className="text-[10px] font-black tracking-widest text-slate-600 hover:text-white transition-colors cursor-pointer">{t.terms}</span>
              <span className="text-[10px] font-black tracking-widest text-slate-600 hover:text-white transition-colors cursor-pointer">{t.contact}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <div className="flex items-center justify-center gap-4 bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-800 w-full sm:w-auto">
              <ConnectionStatus />
              <div className="w-px h-4 bg-slate-800 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-albanian-red fill-current animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Archive Custodian</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 right-0 p-10 opacity-5 pointer-events-none translate-x-1/4 translate-y-1/4">
        <Globe className="w-96 h-96 text-white" />
      </div>
    </footer>
  );
};

export default Footer;
