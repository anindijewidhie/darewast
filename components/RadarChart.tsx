
import React, { useMemo } from 'react';
import { UserProgress, Subject, MasteryLevel } from '../types';
import { MASTERY_LEVEL_ORDER } from '../constants';

interface RadarChartProps {
  progress: UserProgress;
  subjects: Subject[];
}

export const RadarChart: React.FC<RadarChartProps> = React.memo(({ progress, subjects }) => {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / subjects.length;

  const pIndex = MASTERY_LEVEL_ORDER.indexOf('P');
  const maxIndex = MASTERY_LEVEL_ORDER.length - 1;
  const pThresholdValue = pIndex / maxIndex;

  const points = useMemo(() => {
    return subjects.map((sub, i) => {
      const subProg = progress[sub.id] || { level: 'A', lessonNumber: 1 };
      const level = subProg.level;
      const levelIndex = MASTERY_LEVEL_ORDER.indexOf(level as any);
      // Incorporate lesson progress into the visualization (0 to 1 scale within the level)
      const lessonFactor = (subProg.lessonNumber - 1) / 12;
      const effectiveIndex = levelIndex + lessonFactor;
      
      const normalizedValue = Math.max(0.1, effectiveIndex / maxIndex);
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * normalizedValue * Math.cos(angle);
      const y = center + radius * normalizedValue * Math.sin(angle);
      const isHighMastery = levelIndex >= pIndex;
      
      return { x, y, label: sub.icon, name: sub.name, value: normalizedValue, isHighMastery, angle, index: i };
    });
  }, [progress, subjects, center, radius, angleStep, pIndex, maxIndex]);

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  const polygonPath = useMemo(() => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z', [points]);

  // Path for the Level P threshold
  const pThresholdPoints = useMemo(() => subjects.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = center + radius * pThresholdValue * Math.cos(angle);
    const y = center + radius * pThresholdValue * Math.sin(angle);
    return `${x},${y}`;
  }).join(' '), [subjects, angleStep, center, radius, pThresholdValue]);

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto overflow-visible">
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#53CDBA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#B953CC" stopOpacity="0.2" />
          </radialGradient>
          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="masterySliceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CCB953" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#CCB953" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Mastery Slices - Highlight the whole sector for Level P+ subjects */}
        {points.map((p, i) => {
          if (!p.isHighMastery) return null;
          
          const angleStart = p.angle - (angleStep / 2);
          const angleEnd = p.angle + (angleStep / 2);
          
          const xStart = center + radius * Math.cos(angleStart);
          const yStart = center + radius * Math.sin(angleStart);
          const xEnd = center + radius * Math.cos(angleEnd);
          const yEnd = center + radius * Math.sin(angleEnd);
          
          return (
            <path 
              key={`slice-${i}`}
              d={`M ${center} ${center} L ${xStart} ${yStart} A ${radius} ${radius} 0 0 1 ${xEnd} ${yEnd} Z`}
              fill="url(#masterySliceGradient)"
              className="animate-pulse opacity-40"
            />
          );
        })}

        {/* Regular Grid */}
        {gridLevels.map((lvl) => {
          const gridPoints = subjects.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return `${center + radius * lvl * Math.cos(angle)},${center + radius * lvl * Math.sin(angle)}`;
          }).join(' ');
          return <polygon key={lvl} points={gridPoints} fill="none" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeWidth="1" />;
        })}

        {/* Elite Threshold Line (Level P) */}
        <polygon 
          points={pThresholdPoints} 
          fill="none" 
          stroke="#CCB953" 
          strokeWidth="2" 
          strokeDasharray="4 2" 
          className="opacity-60"
        />

        {/* Axes */}
        {points.map((p, i) => (
          <line 
            key={i} 
            x1={center} 
            y1={center} 
            x2={center + radius * Math.cos(p.angle)} 
            y2={center + radius * Math.sin(p.angle)} 
            stroke={p.isHighMastery ? "#CCB953" : "currentColor"} 
            className={p.isHighMastery ? "opacity-60" : "text-gray-100 dark:text-slate-800 opacity-50"} 
            strokeWidth={p.isHighMastery ? "3" : "1"} 
          />
        ))}

        {/* Main Data Shape */}
        <path d={polygonPath} fill="url(#radarGradient)" stroke="#53CDBA" strokeWidth="2.5" strokeLinejoin="round" className="transition-all duration-700" />

        {/* Data Points and High Mastery Markers */}
        {points.map((p, i) => (
          <g key={i}>
            {/* Standard Point */}
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={p.isHighMastery ? "5.5" : "3"} 
              fill={p.isHighMastery ? "#CCB953" : "#53CDBA"} 
              stroke={p.isHighMastery ? "#fff" : "none"}
              strokeWidth="1.5"
            />
            
            {/* High Mastery Halo */}
            {p.isHighMastery && (
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="9" 
                fill="none" 
                stroke="#CCB953" 
                strokeWidth="2" 
                filter="url(#goldGlow)"
                className="animate-pulse"
              />
            )}

            {/* Icons / Labels */}
            <text
              x={center + (radius + 28) * Math.cos(p.angle)}
              y={center + (radius + 28) * Math.sin(p.angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xl select-none transition-all duration-300 font-black ${p.isHighMastery ? 'fill-[#CCB953] scale-125 filter drop-shadow-md' : 'fill-gray-400 opacity-60'}`}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Legend for Mastered Subjects */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-dare-gold shadow-lg shadow-dare-gold/20"></div>
          <span className="text-[10px] font-black text-dare-gold uppercase tracking-widest">Level P+ Elite</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-dare-teal opacity-50"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Study</span>
        </div>
      </div>
    </div>
  );
});
