import React from 'react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'check';
  children: React.ReactNode;
}

const styles = {
  info: {
    bg: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'ℹ️',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: '⚠️',
  },
  check: {
    bg: 'bg-green-50 border-green-200 text-green-900',
    icon: '✅',
  },
};

export function Callout({ type = 'info', children }: CalloutProps) {
  const style = styles[type];
  return (
    <div className={`my-4 p-4 rounded-lg border ${style.bg}`}>
      <div className="flex gap-2">
        <span className="text-lg">{style.icon}</span>
        <div>{children}</div>
      </div>
    </div>
  );
}
