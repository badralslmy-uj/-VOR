import React from 'react';

export const LaughingFace: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M8 15C8 15 9.5 18 12 18C14.5 18 16 15 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.5 10.5L8.5 9.5M9.5 10.5L10.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14.5 10.5L13.5 9.5M14.5 10.5L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
