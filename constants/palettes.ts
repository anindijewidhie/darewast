import { DashboardPalette } from '../types';

export interface PaletteConfig {
  id: DashboardPalette;
  name: string;
  tagline: string;
  icon: string;
  previewColors: [string, string, string];
  primaryHex: string;
  secondaryHex: string;
  bannerBg: string;
  bannerBorder: string;
  primaryBadgeBg: string;
  primaryBadgeText: string;
  accentText: string;
  accentBg: string;
  cardGlow: string;
  cardBorder: string;
  quickActionBg: string;
}

export const DASHBOARD_PALETTES: Record<DashboardPalette, PaletteConfig> = {
  default: {
    id: 'default',
    name: 'Dare Classic',
    tagline: 'Signature Teal & Gold with Onyx accents',
    icon: '✨',
    previewColors: ['#53CDBA', '#CCB953', '#B953CC'],
    primaryHex: '#53CDBA',
    secondaryHex: '#CCB953',
    bannerBg: 'bg-dare-teal',
    bannerBorder: 'border-white/30',
    primaryBadgeBg: 'bg-dare-teal',
    primaryBadgeText: 'text-slate-950',
    accentText: 'text-dare-teal',
    accentBg: 'bg-dare-teal/20',
    cardGlow: 'hover:border-dare-teal/50 hover:shadow-dare-teal/10',
    cardBorder: 'border-dare-teal/30',
    quickActionBg: 'bg-dare-teal'
  },
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    tagline: 'High-tech Jade, Mint & Cyber Neon Green',
    icon: '🌿',
    previewColors: ['#10b981', '#34d399', '#064e3b'],
    primaryHex: '#10b981',
    secondaryHex: '#34d399',
    bannerBg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700',
    bannerBorder: 'border-emerald-300/40',
    primaryBadgeBg: 'bg-emerald-400',
    primaryBadgeText: 'text-slate-950',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500/20',
    cardGlow: 'hover:border-emerald-400/50 hover:shadow-emerald-500/10',
    cardBorder: 'border-emerald-500/30',
    quickActionBg: 'bg-emerald-500'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Crimson',
    tagline: 'Fiery Crimson Flame, Amber & Warm Coral',
    icon: '🌅',
    previewColors: ['#f43f5e', '#fb923c', '#881337'],
    primaryHex: '#f43f5e',
    secondaryHex: '#fb923c',
    bannerBg: 'bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600',
    bannerBorder: 'border-rose-300/40',
    primaryBadgeBg: 'bg-rose-400',
    primaryBadgeText: 'text-slate-950',
    accentText: 'text-rose-400',
    accentBg: 'bg-rose-500/20',
    cardGlow: 'hover:border-rose-400/50 hover:shadow-rose-500/10',
    cardBorder: 'border-rose-500/30',
    quickActionBg: 'bg-rose-500'
  },
  violet: {
    id: 'violet',
    name: 'Cosmic Violet',
    tagline: 'Deep Nebula Purple, Fuchsia & Indigo',
    icon: '🌌',
    previewColors: ['#8b5cf6', '#ec4899', '#312e81'],
    primaryHex: '#8b5cf6',
    secondaryHex: '#ec4899',
    bannerBg: 'bg-gradient-to-r from-purple-700 via-violet-700 to-fuchsia-700',
    bannerBorder: 'border-purple-300/40',
    primaryBadgeBg: 'bg-violet-400',
    primaryBadgeText: 'text-slate-950',
    accentText: 'text-violet-400',
    accentBg: 'bg-violet-500/20',
    cardGlow: 'hover:border-violet-400/50 hover:shadow-violet-500/10',
    cardBorder: 'border-violet-500/30',
    quickActionBg: 'bg-violet-600'
  },
  ocean: {
    id: 'ocean',
    name: 'Sapphire Ocean',
    tagline: 'Deep Aqua Marine, Azure & Royal Blue',
    icon: '🌊',
    previewColors: ['#3b82f6', '#06b6d4', '#1e3a8a'],
    primaryHex: '#3b82f6',
    secondaryHex: '#06b6d4',
    bannerBg: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-700',
    bannerBorder: 'border-blue-300/40',
    primaryBadgeBg: 'bg-cyan-400',
    primaryBadgeText: 'text-slate-950',
    accentText: 'text-cyan-400',
    accentBg: 'bg-blue-500/20',
    cardGlow: 'hover:border-blue-400/50 hover:shadow-blue-500/10',
    cardBorder: 'border-blue-500/30',
    quickActionBg: 'bg-blue-600'
  },
  monochrome: {
    id: 'monochrome',
    name: 'Titanium Slate',
    tagline: 'High-contrast Ultra-Clean Platinum & Charcoal',
    icon: '⚙️',
    previewColors: ['#e2e8f0', '#94a3b8', '#0f172a'],
    primaryHex: '#e2e8f0',
    secondaryHex: '#94a3b8',
    bannerBg: 'bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-900',
    bannerBorder: 'border-slate-400/40',
    primaryBadgeBg: 'bg-slate-200',
    primaryBadgeText: 'text-slate-950',
    accentText: 'text-slate-200',
    accentBg: 'bg-slate-400/20',
    cardGlow: 'hover:border-slate-300/50 hover:shadow-white/5',
    cardBorder: 'border-slate-400/30',
    quickActionBg: 'bg-slate-200'
  },
  electric: {
    id: 'electric',
    name: 'Electric Lime',
    tagline: 'High-contrast Cyber Lime & Vibrant Amber',
    icon: '⚡',
    previewColors: ['#84cc16', '#eab308', '#1a2e05'],
    primaryHex: '#84cc16',
    secondaryHex: '#eab308',
    bannerBg: 'bg-gradient-to-r from-lime-600 via-yellow-600 to-emerald-600',
    bannerBorder: 'border-lime-300/40',
    primaryBadgeBg: 'bg-lime-400',
    primaryBadgeText: 'text-slate-950',
    accentText: 'text-lime-400',
    accentBg: 'bg-lime-500/20',
    cardGlow: 'hover:border-lime-400/50 hover:shadow-lime-500/10',
    cardBorder: 'border-lime-500/30',
    quickActionBg: 'bg-lime-500'
  }
};

export const getPalette = (paletteKey?: DashboardPalette): PaletteConfig => {
  return DASHBOARD_PALETTES[paletteKey || 'default'] || DASHBOARD_PALETTES.default;
};
