import React from 'react';

interface SectionLabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function SectionLabel({ children, className = '', ...props }: SectionLabelProps) {
  return (
    <p 
      className={`font-sans text-xs uppercase tracking-widest text-bio-cyan font-medium mb-4 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
