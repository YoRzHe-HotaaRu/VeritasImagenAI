import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { AnalysisMetrics } from '../types';

interface StatsChartsProps {
  metrics: AnalysisMetrics;
}

export const StatsCharts: React.FC<StatsChartsProps> = ({ metrics }) => {
  const radarData = [
    { subject: 'Texture', A: metrics.textureCoherence, fullMark: 100 },
    { subject: 'Lighting', A: metrics.lightingConsistency, fullMark: 100 },
    { subject: 'Geometry', A: metrics.geometryScore, fullMark: 100 },
    { subject: 'Background', A: metrics.backgroundBlur, fullMark: 100 },
    { subject: 'Compression', A: metrics.compressionArtifacts, fullMark: 100 },
  ];

  const confidenceData = [
    { name: 'Real', value: 100 - metrics.aiProbability },
    { name: 'AI', value: metrics.aiProbability },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Radar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Forensic Signature</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#6366f1"
                strokeWidth={2}
                fill="#6366f1"
                fillOpacity={0.2}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Probability Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Confidence Analysis</h3>
        <div className="h-64 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 14, fontWeight: 600, fill: '#475569'}} width={50} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                        {confidenceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'AI' ? '#ef4444' : '#10b981'} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
        </div>
        <div className="text-center mt-2">
            <span className="text-3xl font-bold text-slate-800">{metrics.aiProbability}%</span>
            <p className="text-sm text-slate-500">Probability of AI Origin</p>
        </div>
      </div>
    </div>
  );
};