import React from 'react';

export const Select = ({
  label,
  error,
  id,
  options = [],
  children,
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
      <select
        id={id}
        className={`nb-input px-3.5 py-2.5 text-sm w-full font-body cursor-pointer ${
          error ? 'border-[#FF6B6B] bg-[#FFD6D6]' : ''
        } ${className}`}
        {...props}
      >
        {children ? children : (
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        )}
      </select>
      {error && (
        <span className="font-label text-xs uppercase font-bold text-[#FF6B6B] mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;
