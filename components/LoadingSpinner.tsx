
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', className }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className || ''}`}>
      <div className={`${sizeClasses[size]} border-theme border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;