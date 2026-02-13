
import React from 'react';
import { User, AccessibilitySettings, Language, ColorBlindMode } from '../types';
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
    iddSupport: false,
    focusMode: false,
    voiceNavigation: false,
    colorBlindMode: 'none'
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    onUpdate({
      accessibility: {
        ...currentSettings,
        [key]: value
      }
    });
  };

  const colorModes: { id: ColorBlindMode; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'protanopia', label: 'Protanopia (Red-Blind)' },
    { id: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
    { id: 'tritanopia', label: 'Tritanopia (Blue-Blind)' }
  ];

  const Toggle = ({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc: string }) => (
    <section className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl gap-4 border-2 border-transparent hover:border-dare-teal/20 transition-all">
      <div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{label}</h3>
        <p className="text-sm text-gray-500 font-medium italic">{desc}</p>
      </div>
      <button 
        onClick={onClick}
        className={`w-14 h-8 rounded-full transition-all relative ${active ? 'bg-dare-teal' : 'bg-gray-300 dark:bg-slate-700'}`}
        aria-pressed={active}
      >
        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${active ? 'left-7' : 'left-1'}`}></div>
      </button>
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-teal flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dare-teal to-dare-purple"></div>
        
        <header className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{t('accessibilityTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Universal features for visual, auditory, motor, and cognitive support.</p>
        </header>

        <div className="space-y-6">
          <Toggle 
            active={currentSettings.iddSupport} 
            onClick={() => updateSetting('iddSupport', !currentSettings.iddSupport)} 
            label="Intellectual & Developmental Support" 
            desc="Forces Supported Rigor (<50 skill points) logic for hyper-incremental concepts." 
          />

          <Toggle 
            active={currentSettings.focusMode} 
            onClick={() => updateSetting('focusMode', !currentSettings.focusMode)} 
            label="Focus Mode (ADHD Support)" 
            desc="Hides sidebars and non-essential UI to minimize distractions." 
          />

          <Toggle 
            active={currentSettings.voiceNavigation} 
            onClick={() => updateSetting('voiceNavigation', !currentSettings.voiceNavigation)} 
            label="Voice Navigation (Motor Support)" 
            desc="Control the learning grid using vocal commands via Gemini Live." 
          />

          <Toggle 
            active={currentSettings.dyslexicFont} 
            onClick={() => updateSetting('dyslexicFont', !currentSettings.dyslexicFont)} 
            label={t('dyslexicFont')} 
            desc="Uses Lexend, a high-readability typeface designed for dyslexia." 
          />

          <Toggle 
            active={currentSettings.highContrast} 
            onClick={() => updateSetting('highContrast', !currentSettings.highContrast)} 
            label={t('highContrast')} 
            desc="Pure black/white contrast with bold interactive targets." 
          />

          <section className="p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl space-y-4">
             <h3 className="text-xl font-black text-gray-900 dark:text-white">Color Blindness Filters</h3>
             <div className="grid grid-cols-2 gap-2">
                {colorModes.map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => updateSetting('colorBlindMode', mode.id)}
                    className={`py-3 px-4 rounded-xl text-xs font-black uppercase transition-all ${currentSettings.colorBlindMode === mode.id ? 'bg-dare-teal text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-700'}`}
                  >
                    {mode.label}
                  </button>
                ))}
             </div>
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
          </section>
          
          <div className="pt-6 text-center">
            <button onClick={onBack} className="px-10 py-4 bg-dare-teal text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all">Apply Mastery Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityView;
