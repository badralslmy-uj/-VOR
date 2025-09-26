import React from 'react';

export const SurprisedFace: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="16" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9.5" cy="10.5" r="1.5" fill="currentColor"/>
    <circle cx="14.5" cy="10.5" r="1.5" fill="currentColor"/>
  </svg>
);
