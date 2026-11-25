import React from 'react';

export const Card = ({
  children,
  className = '',
  bg = 'bg-[#FFFFFF]',
  ...props
}) => {
  return (
    <div
      className={`nb-card ${bg} p-4 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
