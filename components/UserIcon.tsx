import React from 'react';

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="24" height="24" rx="4" fill="currentColor" />
    {/* The face elements are filled/stroked with the app's dark background color to create a "cutout" effect */}
    <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="#0B0B0F" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="9.5" cy="10.5" r="1.5" fill="#0B0B0F"/>
    <circle cx="14.5" cy="10.5" r="1.5" fill="#0B0B0F"/>
  </svg>
);