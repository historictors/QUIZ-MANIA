import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full ${maxWidth} bg-[#FFF8E7] nb-card relative animate-in fade-in zoom-in-95 duration-100 ${className}`}
      >
        <div className="flex items-center justify-between p-4 border-b-[3px] border-black bg-[#FFDE59]">
          <h3 className="font-headline text-lg sm:text-xl uppercase font-bold tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center shadow-[2px_2px_0_#000000] hover:bg-[#FF6B6B] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
