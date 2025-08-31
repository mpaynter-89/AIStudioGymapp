import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

const baseClasses = "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-secondary text-white hover:bg-secondary-hover',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-border text-text-secondary hover:bg-surface',
};

const sizeClasses = {
    md: 'px-4 py-2 text-sm',
    sm: 'px-2 py-1 text-xs',
}

export const Button = ({ children, className, variant = 'primary', size = 'md', ...props }: ButtonProps) => {
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
