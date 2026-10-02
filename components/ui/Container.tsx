import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ children, className = '', ...props }: ContainerProps) {
  // Uses a spacious desktop width (max-w-7xl) with comfortable padding that scales down
  return (
    <div 
      className={`w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
