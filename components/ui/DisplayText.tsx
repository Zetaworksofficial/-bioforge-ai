import React from 'react';

interface DisplayTextProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

export function DisplayText({ as: Component = 'h1', children, className = '', ...props }: DisplayTextProps) {
  return (
    <Component 
      className={`font-sans font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-off-white leading-[1.05] ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
