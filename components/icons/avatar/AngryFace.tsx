import React from 'react';

export const AngryFace: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M8 17C8 17 9.5 15 12 15C14.5 15 16 17 16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 9L10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 9L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
