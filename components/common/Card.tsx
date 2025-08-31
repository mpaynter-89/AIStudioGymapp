
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = ({ children, className, ...props }: CardProps) => (
  <div className={`bg-surface border border-border rounded-lg shadow-lg overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 sm:p-6 border-b border-border ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold text-text-primary ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-text-secondary ${className}`} {...props}>
    {children}
  </p>
);

const CardBody = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 sm:p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 sm:p-6 bg-background/50 border-t border-border ${className}`} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };
