import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-sans text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-1 focus-visible:ring-bio-cyan focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 px-6 py-2.5 rounded-sm";
  
  const variants = {
    primary: "bg-off-white text-background hover:bg-muted-white hover:scale-[0.98]",
    secondary: "bg-transparent border border-soft-graphite text-off-white hover:border-muted-white hover:bg-graphite"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
