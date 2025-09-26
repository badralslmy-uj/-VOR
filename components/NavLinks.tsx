import React from 'react';

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
  e.preventDefault();
  window.location.hash = path;
};

interface NavLinkProps {
  path: string;
  currentPath: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ path, currentPath, children }) => {
  const isActive = path === currentPath;
  
  return (
    <a
      href={`#${path}`}
      onClick={(e) => handleNavClick(e, path)}
      className={`transition-colors duration-200 font-semibold relative py-2 px-2 ${isActive ? 'text-white active-nav-link' : 'text-gray-300 hover:text-white'}`}
    >
      {children}
    </a>
  );
};

interface NavLinksProps {
  className?: string;
  currentPath: string;
}

export const NavLinks: React.FC<NavLinksProps> = ({ className, currentPath }) => (
  <nav className={className}>
    <NavLink path="/" currentPath={currentPath}>Home</NavLink>
    <NavLink path="/schedule" currentPath={currentPath}>Schedule</NavLink>
    <NavLink path="/my-list" currentPath={currentPath}>My List</NavLink>
  </nav>
);