import React from 'react';
import { Logo } from './icons/Logo';
import { NavLinks } from './NavLinks';

interface FooterProps {
    currentPath: string;
}

const Footer: React.FC<FooterProps> = ({ currentPath }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden md:block bg-[#0B0B0F] border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <a href="#/" aria-label="Go to Home page">
              <Logo className="h-7 text-white" />
            </a>
            <NavLinks className="flex items-center space-x-6 text-sm" currentPath={currentPath} />
          </div>
          <p className="text-sm text-gray-500">
            &copy; {currentYear} VOR. All Rights Reserved.
          </p>
        </div>
        <p className="text-xs text-gray-600 mt-6 text-center">
          This site is a non-commercial project and is not affiliated with any of the anime studios or streaming services. All content belongs to their respective owners.
        </p>
      </div>
    </footer>
  );
};

export default Footer;