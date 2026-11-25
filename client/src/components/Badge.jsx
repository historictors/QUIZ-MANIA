import React from 'react';

/**
 * Neo-Brutalist Badge
 * Variants: upcoming (orange), live (green), closed (red), completed (lavender)
 */
export const Badge = ({
  status = 'upcoming',
  className = '',
  children
}) => {
  const norm = (status || '').toLowerCase();

  const styles = {
    upcoming: 'bg-[#FFA94D] text-black',
    live: 'bg-[#6BCB77] text-black',
    closed: 'bg-[#FF6B6B] text-black',
    completed: 'bg-[#C9B6FF] text-black',
    'auto-submitted': 'bg-[#C9B6FF] text-black',
    'in-progress': 'bg-[#FFDE59] text-black'
  };

  const labels = {
    upcoming: 'UPCOMING',
    live: 'LIVE',
    closed: 'CLOSED',
    completed: 'COMPLETED',
    'auto-submitted': 'AUTO-SUBMITTED',
    'in-progress': 'IN-PROGRESS'
  };

  const chosenStyle = styles[norm] || 'bg-[#E5E5E5] text-black';
  const labelText = children || labels[norm] || norm.toUpperCase();

  return (
    <span
      className={`nb-badge px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-[2px_2px_0_#000000] ${chosenStyle} ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-black inline-block"></span>
      {labelText}
    </span>
  );
};

export default Badge;
