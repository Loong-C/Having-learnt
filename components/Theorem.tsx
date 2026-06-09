import React from 'react';

interface TheoremProps {
  title?: string;
  children: React.ReactNode;
}

export function Theorem({ title, children }: TheoremProps) {
  return (
    <div className="my-4 p-4 rounded-lg border border-purple-200 bg-purple-50">
      <div className="font-semibold text-purple-900 mb-2">
        {title || '定理'}
      </div>
      <div className="text-purple-900/80">{children}</div>
    </div>
  );
}

export function Proof({ children }: { children: React.ReactNode }) {
  return (
    <details className="my-3 group">
      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium select-none">
        📝 证明
      </summary>
      <div className="mt-2 pl-4 border-l-2 border-gray-200 text-sm text-gray-600">
        {children}
      </div>
    </details>
  );
}
