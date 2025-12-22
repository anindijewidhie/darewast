
import React from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';

interface Props {
  selected: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="relative inline-block text-left">
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value as Language)}
        className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-dare-teal transition-all"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
