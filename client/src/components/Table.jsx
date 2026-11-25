import React from 'react';

export const Table = ({
  headers = [],
  children,
  className = ''
}) => {
  return (
    <div className={`overflow-x-auto nb-border rounded bg-white shadow-[4px_4px_0_#000000] ${className}`}>
      <table className="w-full text-left border-collapse font-body text-sm">
        {headers.length > 0 && (
          <thead>
            <tr className="bg-[#FFDE59] border-b-[3px] border-black font-label uppercase text-xs sm:text-sm font-bold tracking-wider">
              {headers.map((h, i) => (
                <th key={i} className="p-3.5 border-r-2 border-black last:border-r-0 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y-2 divide-black">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
