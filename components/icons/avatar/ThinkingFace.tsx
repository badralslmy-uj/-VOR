import React from 'react';

export const ThinkingFace: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 16L15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="9.5" cy="11.5" r="1.5" fill="currentColor"/>
    <circle cx="14.5" cy="11.5" r="1.5" fill="currentColor"/>
    <path d="M13 9C13.6667 8.33333 14.8 8 16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
