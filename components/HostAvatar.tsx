import React from 'react';
import { Plane } from 'lucide-react';

export const HostAvatar = () => {
  return (
    <div className="relative">
      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-white">
        <span className="text-2xl" role="img" aria-label="host">🧑‍✈️</span>
      </div>
      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-gray-100 shadow-sm">
        <Plane size={10} className="text-sky-600 transform -rotate-45" />
      </div>
    </div>
  );
};