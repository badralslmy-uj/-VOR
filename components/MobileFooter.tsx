import React, { useMemo } from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ListIcon } from './icons/ListIcon';

interface MobileFooterProps {
  currentPath: string;
}

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; href: string; isActive: boolean }> = ({ icon, label, href, isActive }) => {
  const className = `relative flex flex-1 flex-col items-center justify-center pt-2 pb-1 space-y-1 transition-colors duration-300 z-10 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`;
  
  const path = href.startsWith('#') ? href.substring(1) : href;

  return (
    <a href={href} onClick={(e) => handleNavClick(e, path)} className={className} aria-label={label}>
      <div className="relative">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </a>
  );
};

const MobileFooter: React.FC<MobileFooterProps> = ({ currentPath }) => {
  const navItems = useMemo(() => [
    { path: '/', icon: <HomeIcon />, label: 'Home' },
    { path: '/search', icon: <SearchIcon />, label: 'Search' },
    { path: '/schedule', icon: <CalendarIcon />, label: 'Schedule' },
    { path: '/my-list', icon: <ListIcon />, label: 'My List' },
  ], []);

  const activeIndex = useMemo(() => {
    const index = navItems.findIndex(item => item.path === currentPath);
    return index > -1 ? index : 0;
  }, [currentPath, navItems]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/25 backdrop-blur-xl md:hidden">
      <div className="container mx-auto px-4">
        <div className="relative flex h-16">
          <div
            className="absolute top-0 h-full w-1/4 transition-transform duration-300 ease-in-out pointer-events-none"
            style={{ 
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 40%, rgba(var(--theme-color-rgb), 0.45) 0%, transparent 70%)`
              }}
            />
          </div>

          {navItems.map((item) => (
            <NavItem
              key={item.path}
              href={`#${item.path}`}
              icon={item.icon}
              label={item.label}
              isActive={currentPath === item.path}
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;