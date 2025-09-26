import React from 'react';

export const CoolFace: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.5 12.5H9.5V9.5H5.5V12.5Z" fill="currentColor" />
    <path d="M14.5 12.5H18.5V9.5H14.5V12.5Z" fill="currentColor" />
    <path d="M9.5 11H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
