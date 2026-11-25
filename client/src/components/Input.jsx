import React from 'react';

export const Input = ({
  label,
  error,
  id,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="font-label text-sm uppercase font-bold text-black flex items-center gap-1"
        >
          {label} {required && <span className="text-[#FF6B6B]">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`nb-input px-3.5 py-2.5 text-sm w-full font-body placeholder:text-neutral-500 ${
          error ? 'border-[#FF6B6B] bg-[#FFD6D6]' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="font-label text-xs uppercase font-bold text-[#FF6B6B] mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
