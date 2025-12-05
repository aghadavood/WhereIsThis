import React from 'react';
import { AiFlightResponse } from '../types';
import { MapPin, Plane } from 'lucide-react';

interface DestinationCardProps {
  data: AiFlightResponse;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden border-4 border-white transform transition-all hover:scale-[1.02]">
      
      {/* Generated Image Section */}
      <div className="relative h-64 bg-gray-200 w-full">
        {data.imageUrl ? (
          <img 
            src={data.imageUrl} 
            alt={data.locationName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-sky-100 text-sky-400">
            <Plane size={48} className="animate-pulse" />
            <span className="text-xs font-bold mt-2 uppercase tracking-widest">No Image Signal</span>
          </div>
        )}
        
        {/* Overlay Badge */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
          Arrival Confirmed
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 text-center">
        
        {/* Main Location Title */}
        <h2 className="text-3xl font-black text-slate-800 leading-none mb-1 font-fredoka">
          {data.locationName}
        </h2>
        
        {/* Subtitle with Country */}
        <div className="flex items-center justify-center gap-1 text-sky-600 font-bold uppercase tracking-wide text-sm mb-4">
          <MapPin size={14} />
          <span>{data.city}, {data.country}</span>
        </div>

        {/* Decorative Divider */}
        <div className="w-16 h-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full mx-auto mb-4"></div>

        {/* Description Text */}
        <p className="text-lg text-slate-600 font-medium leading-relaxed font-nunito">
          "{data.description}"
        </p>

      </div>
    </div>
  );
};