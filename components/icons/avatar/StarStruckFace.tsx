import React from 'react';

export const StarStruckFace: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.5 12.8L8.11 13.8L8.6 12.1L7.2 11L8.9 10.9L9.5 9.2L10.1 10.9L11.8 11L10.4 12.1L10.9 13.8L9.5 12.8Z" fill="currentColor" />
    <path d="M14.5 12.8L13.11 13.8L13.6 12.1L12.2 11L13.9 10.9L14.5 9.2L15.1 10.9L16.8 11L15.4 12.1L15.9 13.8L14.5 12.8Z" fill="currentColor" />
  </svg>
);
