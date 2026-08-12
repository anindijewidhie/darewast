import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, Cell 
} from 'recharts';
import { User, UserProgress, SubjectProgress, Subject } from '../types';
import { SUBJECTS } from '../constants';

interface Props {
  user: User;
  progress: UserProgress;
  quotaLimit: number;
  dynamicSubjects?: Subject[];
  onUpdateUser?: (data: Partial<User>) => void;
}

const BAR_COLORS = [
  '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', 
  '#3b82f6', '#10b981', '#f97316', '#6366f1'
];

export const DailyGoalChart: React.FC<Props> = ({
  user,
  progress,
  quotaLimit,
  dynamicSubjects = [],
  onUpdateUser
}) => {
  const [editingGoal, setEditingGoal] = useState(false);

  // Calculate total spent today across subjects
  const totalSpentFromProgress = (Object.values(progress) as SubjectProgress[]).reduce(
    (acc: number, curr: SubjectProgress) => acc + (curr.dailyMinutesSpent || 0), 0
  );
  const spentMinutes = Math.max(user.timeSpentToday || 0, Math.round(totalSpentFromProgress));
  const goalMinutes = user.dailyGoal || 30;
  
  const percentAchieved = Math.min(100, Math.round((spentMinutes / goalMinutes) * 100));
  const isGoalReached = spentMinutes >= goalMinutes;
  const remainingMinutes = Math.max(0, goalMinutes - spentMinutes);

  // Single horizontal stacked bar data for Goal Progress
  const progressBarData = [
    {
      name: 'Daily Progress',
      Completed: Math.min(spentMinutes, goalMinutes),
      Excess: Math.max(0, spentMinutes - goalMinutes),
      Remaining: Math.max(0, goalMinutes - spentMinutes),
      Goal: goalMinutes,
      Spent: spentMinutes
    }
  ];

  // Subject breakdown data for BarChart
  const subjectBreakdown = (Object.entries(progress) as [string, SubjectProgress][])
    .map(([id, prog]) => {
      const sub = SUBJECTS.find(s => s.id === id) || dynamicSubjects.find(s => s.id === id);
      return {
        name: sub ? sub.name : id,
        shortName: sub ? sub.name.slice(0, 10) : id,
        icon: sub ? sub.icon : '📚',
        minutes: Math.round(prog.dailyMinutesSpent || 0)
      };
    })
    .filter(item => item.minutes > 0);

  const goalOptions = [15, 20, 30, 45, 60, 90, 120];

  return (
    <div className="p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-[3rem] sm:rounded-[4.5rem] border-4 border-white/10 shadow-2xl space-y-8 relative overflow-hidden group">
      {/* Background Subtle Label */}
      <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 text-[8rem] sm:text-[12rem] font-black pointer-events-none select-none font-display">
        GOAL
      </div>

      {/* Header & Goal Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-dare-teal/20 text-dare-teal rounded-full text-[9px] font-black uppercase tracking-widest border border-dare-teal/30">
            <span>⏱️ Recharts Goal Monitor</span>
            <span>•</span>
            <span>{isGoalReached ? '🎉 Target Met!' : 'In Progress'}</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-black uppercase font-display tracking-tight text-white">
            Daily Study Progress
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Visual tracking towards your daily target limit of <strong className="text-dare-teal">{goalMinutes} minutes</strong>
          </p>
        </div>

        {/* Goal Quick Switcher */}
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">
            Target:
          </span>
          {editingGoal ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {goalOptions.map(min => (
                <button
                  key={min}
                  onClick={() => {
                    if (onUpdateUser) onUpdateUser({ dailyGoal: min });
                    setEditingGoal(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    goalMinutes === min 
                      ? 'bg-dare-teal text-slate-950 shadow-md' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {min}m
                </button>
              ))}
              <button
                onClick={() => setEditingGoal(false)}
                className="px-2.5 py-1.5 bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-500/30"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingGoal(true)}
              className="px-4 py-2 bg-dare-teal text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
              <span>{goalMinutes} Mins / Day</span>
              <span className="text-[10px] opacity-70">✏️</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Time Spent
          </span>
          <p className="text-2xl sm:text-4xl font-black text-white font-display">
            {spentMinutes} <span className="text-xs text-slate-400 font-sans font-bold">MINS</span>
          </p>
        </div>

        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Daily Goal
          </span>
          <p className="text-2xl sm:text-4xl font-black text-dare-teal font-display">
            {goalMinutes} <span className="text-xs text-slate-400 font-sans font-bold">MINS</span>
          </p>
        </div>

        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Goal Completion
          </span>
          <p className={`text-2xl sm:text-4xl font-black font-display ${isGoalReached ? 'text-emerald-400' : 'text-dare-gold'}`}>
            {percentAchieved}%
          </p>
        </div>

        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            {isGoalReached ? 'Surplus' : 'Remaining'}
          </span>
          <p className="text-2xl sm:text-4xl font-black text-purple-400 font-display">
            {isGoalReached ? spentMinutes - goalMinutes : remainingMinutes} <span className="text-xs text-slate-400 font-sans font-bold">MINS</span>
          </p>
        </div>
      </div>

      {/* Recharts Visual Stacked Progress Bar */}
      <div className="space-y-3 relative z-10 bg-black/30 p-6 sm:p-8 rounded-3xl border border-white/10">
        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-300">
          <span className="flex items-center gap-2">
            <span>📊 Overall Goal Progress Bar</span>
            <span className="text-[10px] text-dare-teal font-medium">({spentMinutes} / {goalMinutes} Mins)</span>
          </span>
          <span className={isGoalReached ? 'text-emerald-400' : 'text-dare-gold'}>
            {isGoalReached ? '🎉 Goal Reached!' : `${remainingMinutes} mins to goal`}
          </span>
        </div>

        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={progressBarData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, Math.max(goalMinutes, spentMinutes)]} hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-white/20 p-4 rounded-2xl shadow-2xl text-xs space-y-1 text-white">
                        <p className="font-black text-dare-teal uppercase tracking-widest">Daily Progress</p>
                        <p className="font-bold">Total Spent: <span className="text-white">{data.Spent} mins</span></p>
                        <p className="font-bold">Target Goal: <span className="text-dare-gold">{data.Goal} mins</span></p>
                        <p className="text-[10px] text-slate-400 pt-1">
                          {data.Spent >= data.Goal ? '✅ Daily goal target met!' : `${data.Goal - data.Spent} mins remaining.`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Reference line for Daily Goal Limit */}
              <ReferenceLine x={goalMinutes} stroke="#2dd4bf" strokeDasharray="4 4" strokeWidth={3} />
              
              <Bar dataKey="Completed" stackId="a" fill="#0d9488" radius={[12, 0, 0, 12]} barSize={28} />
              <Bar dataKey="Excess" stackId="a" fill="#8b5cf6" radius={[0, 12, 12, 0]} barSize={28} />
              <Bar dataKey="Remaining" stackId="a" fill="rgba(255,255,255,0.1)" radius={[0, 12, 12, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-teal-600 rounded-md"></span>
            <span>Completed ({Math.min(spentMinutes, goalMinutes)}m)</span>
          </div>
          {spentMinutes > goalMinutes && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-md"></span>
              <span>Goal Surplus ({spentMinutes - goalMinutes}m)</span>
            </div>
          )}
          {spentMinutes < goalMinutes && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-white/10 rounded-md border border-white/20"></span>
              <span>Remaining Goal ({goalMinutes - spentMinutes}m)</span>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto text-dare-teal">
            <span className="w-4 h-0.5 bg-dare-teal border border-dashed"></span>
            <span>Target Line ({goalMinutes}m)</span>
          </div>
        </div>
      </div>

      {/* Subject Minutes Breakdown (if active subjects exist) */}
      {subjectBreakdown.length > 0 && (
        <div className="space-y-4 relative z-10 pt-2 border-t border-white/10">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">
              📚 Subject Minute Allocation
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {subjectBreakdown.length} Active Nodes Today
            </span>
          </div>

          <div className="h-44 w-full bg-black/20 p-4 rounded-3xl border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="shortName" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-white/20 p-3 rounded-xl text-xs text-white">
                          <p className="font-black text-dare-teal flex items-center gap-1">
                            <span>{item.icon}</span> <span>{item.name}</span>
                          </p>
                          <p className="font-bold text-white mt-1">{item.minutes} minutes spent today</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="minutes" radius={[8, 8, 0, 0]} barSize={24}>
                  {subjectBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyGoalChart;
