import React from 'react';

export const StatCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  bg = 'bg-[#FFFFFF]',
  className = ''
}) => {
  return (
    <div
      className={`nb-card ${bg} p-5 flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex flex-col gap-1">
        <span className="font-label text-xs uppercase tracking-wider font-bold text-neutral-800">
          {label}
        </span>
        <span className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-black">
          {value}
        </span>
        {sublabel && (
          <span className="font-body text-xs font-medium text-neutral-600 mt-1">
            {sublabel}
          </span>
        )}
      </div>
      {Icon && (
        <div className="w-12 h-12 bg-white border-2 border-black rounded flex items-center justify-center shadow-[3px_3px_0_#000000] shrink-0">
          <Icon size={24} className="text-black" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
