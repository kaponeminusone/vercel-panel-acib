// components/ui/alert.tsx
import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  className?: string;
}

export const Alert = ({ children, className = '' }: AlertProps) => {
  return (
    <div className={`border-l-4 p-4 bg-yellow-50 text-yellow-800 border-yellow-400 ${className}`}>
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  children: ReactNode;
}

export const AlertDescription = ({ children }: AlertDescriptionProps) => {
  return <div>{children}</div>;
};
