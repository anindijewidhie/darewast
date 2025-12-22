
import React from 'react';
import { User, AccessibilitySettings, Language } from '../types';
import { translations } from '../translations';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
  onUpdate: (data: Partial<User>) => void;
}

const AccessibilityView: React.FC<Props> = ({ user, language, onBack, onUpdate }) => {
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const currentSettings: AccessibilitySettings = user.accessibility || {
    dyslexicFont: false,
    highContrast: false,
    reducedMotion: false,
    textScale: 1,
    screenReaderHints: true,
    iddSupport: false
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    onUpdate({
      accessibility: {
        ...currentSettings,
        [key]: value
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-teal flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dare-teal to-dare-purple"></div>
        
        <header className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{t('accessibilityTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('accessibilitySubtitle')}</p>
        </header>

        <div className="space-y-10">
          <section className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl gap-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{t('dyslexicFont')}</h3>
              <p className="text-sm text-gray-500 font-medium italic">Uses Lexend, a high-readability typeface.</p>
            </div>
            <button 
              onClick={() => updateSetting('dyslexicFont', !currentSettings.dyslexicFont)}
              className={`w-14 h-8 rounded-full transition-all relative ${currentSettings.dyslexicFont ? 'bg-dare-teal' : 'bg-gray-300 dark:bg-slate-700'}`}
              aria-pressed={currentSettings.dyslexicFont}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${currentSettings.dyslexicFont ? 'left-7' : 'left-1'}`}></div>
            </button>
          </section>

          <section className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl gap-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Intellectual & Developmental Support</h3>
              <p className="text-sm text-gray-500 font-medium italic">Adapts lessons with literal language, visual support, and hyper-incremental steps.</p>
            </div>
            <button 
              onClick={() => updateSetting('iddSupport', !currentSettings.iddSupport)}
              className={`w-14 h-8 rounded-full transition-all relative ${currentSettings.iddSupport ? 'bg-dare-teal' : 'bg-gray-300 dark:bg-slate-700'}`}
              aria-pressed={currentSettings.iddSupport}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${currentSettings.iddSupport ? 'left-7' : 'left-1'}`}></div>
            </button>
          </section>

          <section className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl gap-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{t('highContrast')}</h3>
              <p className="text-sm text-gray-500 font-medium italic">Pure black and white interface for maximum clarity.</p>
            </div>
            <button 
              onClick={() => updateSetting('highContrast', !currentSettings.highContrast)}
              className={`w-14 h-8 rounded-full transition-all relative ${currentSettings.highContrast ? 'bg-dare-teal' : 'bg-gray-300 dark:bg-slate-700'}`}
              aria-pressed={currentSettings.highContrast}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${currentSettings.highContrast ? 'left-7' : 'left-1'}`}></div>
            </button>
          </section>

          <section className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl gap-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{t('reducedMotion')}</h3>
              <p className="text-sm text-gray-500 font-medium italic">Disables decorative animations and transitions.</p>
            </div>
            <button 
              onClick={() => updateSetting('reducedMotion', !currentSettings.reducedMotion)}
              className={`w-14 h-8 rounded-full transition-all relative ${currentSettings.reducedMotion ? 'bg-dare-teal' : 'bg-gray-300 dark:bg-slate-700'}`}
              aria-pressed={currentSettings.reducedMotion}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${currentSettings.reducedMotion ? 'left-7' : 'left-1'}`}></div>
            </button>
          </section>

          <section className="p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">{t('textScale')}</h3>
              <span className="text-dare-teal font-black text-xl">{Math.round(currentSettings.textScale * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="1.5" 
              step="0.05" 
              value={currentSettings.textScale}
              onChange={(e) => updateSetting('textScale', parseFloat(e.target.value))}
              className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-dare-teal"
              aria-label="Adjust font size multiplier"
            />
            <div className="flex justify-between mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Standard (100%)</span>
              <span>Extra Large (150%)</span>
            </div>
          </section>
          
          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
            <button 
              onClick={onBack}
              className="px-10 py-4 bg-dare-teal text-white rounded-2xl font-black text-lg shadow-xl shadow-dare-teal/20 hover:scale-[1.02] transition-all"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityView;
