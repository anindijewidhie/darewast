import React from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';

interface Props {
  selected: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="relative group">
      {/* Custom Icon Overlay */}
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-40 group-hover:opacity-100 group-hover:text-dare-teal transition-all duration-300">
        <svg 
          className="w-3 h-3 md:w-4 md:h-4 transform group-hover:translate-y-0.5 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value as Language)}
        className="appearance-none bg-white/5 border border-white/10 dark:border-white/5 hover:border-dare-teal/50 rounded-xl px-3 py-2 md:px-5 md:py-2.5 pr-10 md:pr-12 text-[9px] md:text-xs font-black uppercase tracking-widest outline-none cursor-pointer transition-all focus:ring-4 focus:ring-dare-teal/10 hover:bg-white/10 backdrop-blur-md"
        aria-label="Select Language"
      >
        {LANGUAGES.map((lang) => (
          <option 
            key={lang} 
            value={lang} 
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-2"
          >
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;