import React from 'react';

interface MetaTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function MetaText({ children, className = '', ...props }: MetaTextProps) {
  return (
    <span 
      className={`font-sans text-xs text-muted-white tracking-wide uppercase ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
