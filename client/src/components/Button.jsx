import React from 'react';

/**
 * Neo-Brutalist Button
 * Variants: primary (yellow), secondary (white), danger (red), success (green), info (blue)
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-[#FFDE59] text-black hover:bg-[#FFE885]',
    secondary: 'bg-[#FFFFFF] text-black hover:bg-[#F5ECD7]',
    danger: 'bg-[#FF6B6B] text-black hover:bg-[#FF8E8E]',
    success: 'bg-[#6BCB77] text-black hover:bg-[#85DC8F]',
    info: 'bg-[#4D96FF] text-black hover:bg-[#70ACFF]'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`nb-btn font-label uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
