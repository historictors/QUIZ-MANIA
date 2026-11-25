import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="bg-[#FFDE59] border-[3px] border-black rounded p-5 shadow-[4px_4px_0_#000000] flex items-center gap-3">
        <Loader2 className="animate-spin text-black" size={24} />
        <span className="font-label font-bold text-sm sm:text-base uppercase tracking-wider text-black">
          {message}
        </span>
      </div>
    </div>
  );
};

export default Loader;
