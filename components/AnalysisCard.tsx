import React from 'react';
import { AiGuessResponse } from '../types';
import { MapPin, Search, CheckCircle2, Globe } from 'lucide-react';

interface AnalysisCardProps {
  data: AiGuessResponse;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl border border-teal-100 w-full max-w-md animate-fade-in-up">
      <div className="mb-4">
        <h3 className="text-teal-700 font-bold flex items-center gap-2 mb-2">
          <Search size={18} />
          Visual Clues
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.clues.map((clue, idx) => (
            <span key={idx} className="bg-teal-50 text-teal-800 text-xs px-2 py-1 rounded-full border border-teal-200">
              {clue}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <h3 className="text-gray-700 font-bold text-sm uppercase tracking-wide">Possibilities</h3>
        {data.possibilities.map((p, idx) => (
          <div key={idx} className="relative pt-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-gray-800">{p.country}</span>
              <span className="text-gray-500">{p.confidence}%</span>
            </div>
            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-100">
              <div 
                style={{ width: `${p.confidence}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  idx === 0 ? 'bg-gradient-to-r from-teal-400 to-teal-500' : 'bg-gray-300'
                }`}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white text-center shadow-lg transform transition hover:scale-[1.02]">
        <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider mb-1">My Final Guess</p>
        <div className="flex items-center justify-center gap-2">
          <MapPin className="text-yellow-400" />
          <span className="text-2xl font-black">{data.finalGuess}</span>
        </div>
        <p className="text-indigo-200 text-sm mt-1">{data.confidenceScore}% confident</p>
        
        {data.coordinates && (
          <div className="mt-3 pt-3 border-t border-indigo-500/30 flex items-center justify-center gap-2">
            <Globe size={14} className="text-indigo-300" />
            <p className="text-xs text-indigo-300 font-mono tracking-wider">
              {data.coordinates.lat.toFixed(4)}, {data.coordinates.lng.toFixed(4)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};