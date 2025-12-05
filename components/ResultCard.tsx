import React from 'react';
import { AiRevealResponse } from '../types';
import { Map, Star, Compass, Lightbulb } from 'lucide-react';

interface ResultCardProps {
  data: AiRevealResponse;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  const isCorrect = data.isCorrect;

  return (
    <div className={`rounded-2xl p-6 shadow-xl w-full max-w-md animate-fade-in-up border-2 ${
      isCorrect 
        ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-400' 
        : 'bg-gradient-to-br from-orange-50 to-amber-100 border-amber-400'
    }`}>
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-full ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
          <Map size={24} />
        </div>
        <div>
          <p className={`text-xs uppercase font-bold ${isCorrect ? 'text-emerald-700' : 'text-amber-800'}`}>
            {isCorrect ? "Location Confirmed" : "Actual Location"}
          </p>
          <h2 className="text-2xl font-extrabold text-gray-800 leading-none">{data.locationName}</h2>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/60 rounded-xl p-4 border border-white/50">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
             <Star className="text-yellow-500 fill-yellow-500" size={16} />
             Fun Facts
           </h3>
           <ul className="space-y-2">
             {data.funFacts.map((fact, i) => (
               <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                 <span className="mt-1 block min-w-[4px] h-[4px] rounded-full bg-gray-400" />
                 {fact}
               </li>
             ))}
           </ul>
        </div>

        {data.learningNote && (
          <div className={`${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} rounded-xl p-4 border`}>
            <h3 className={`font-bold flex items-center gap-2 mb-2 ${isCorrect ? 'text-emerald-800' : 'text-amber-800'}`}>
              {isCorrect ? <Compass size={16} /> : <Lightbulb size={16} />}
              {isCorrect ? "Traveler's Note" : "What Tricked Me"}
            </h3>
            <p className={`text-sm leading-relaxed ${isCorrect ? 'text-emerald-900' : 'text-amber-900'}`}>
              {data.learningNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};