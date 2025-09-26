import React from 'react';
import { Logo } from './icons/Logo';

const ConfigurationPage: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0B0F] animate-fade-in" aria-label="Loading application" aria-live="polite">
      <Logo className="h-16 text-white animate-pulse-glow" />
    </div>
  );
};

export default ConfigurationPage;
