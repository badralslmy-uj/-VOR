import React from 'react';

export const SleepingFace: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M8.5 11C9 10.5 10 10 11 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M13.5 11C14 10.5 15 10 16 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
