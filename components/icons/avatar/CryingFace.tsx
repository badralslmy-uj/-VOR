import React from 'react';

export const CryingFace: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M8 17C8 17 9.5 15 12 15C14.5 15 16 17 16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="9.5" cy="10.5" r="1.5" fill="currentColor"/>
    <circle cx="14.5" cy="10.5" r="1.5" fill="currentColor"/>
    <path d="M9.5 13V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14.5 13V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
