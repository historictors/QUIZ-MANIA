import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
  className = ''
}) => {
  return (
    <div className={`nb-card bg-white p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-16 h-16 bg-[#FFF8E7] border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_#000000] mb-2">
        <Icon size={32} className="text-black" />
      </div>
      <h4 className="font-headline text-lg sm:text-xl uppercase font-bold text-black">
        {title}
      </h4>
      <p className="font-body text-sm text-neutral-600 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md" className="mt-3">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
