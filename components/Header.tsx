import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { Logo } from './icons/Logo';
import { NavLinks } from './NavLinks';
import { useAuth } from '../hooks/useAuth';
import { LogoutIcon } from './icons/LogoutIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SelectableAvatar } from './SelectableAvatar';
import { UserIcon } from './UserIcon';

interface HeaderProps {
  currentPath: string;
}

const AuthSection: React.FC<{isMobile?: boolean}> = ({ isMobile = false }) => {
    const { user, profile, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
        setIsMenuOpen(false);
    };

    if (!user || !profile) {
        return (
            <a href="#/account" onClick={(e) => handleNavClick(e, '/account')} className="bg-theme hover-bg-theme-dark text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                Login
            </a>
        );
    }
    
    if (isMobile) {
        return (
             <a href="#/account" onClick={(e) => handleNavClick(e, '/account')} aria-label="Go to Account page" className="interactive-glow-outline rounded-lg text-gray-300 hover:text-white">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg overflow-hidden">
                    <SelectableAvatar avatarId={profile.avatar} />
                </div>
              </a>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 interactive-glow-outline p-1 rounded-lg">
                <div className="w-9 h-9 flex items-center justify-center bg-gray-800/50 rounded-lg overflow-hidden">
                    <SelectableAvatar avatarId={profile.avatar} />
                </div>
                <span className="text-white font-semibold text-sm hidden lg:inline">{profile.displayName || profile.username}</span>
                 <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform hidden lg:inline ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMenuOpen && (
                 <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900/80 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl p-2 z-20 animate-fade-in">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                        <p className="font-bold text-white truncate">{profile.displayName || profile.username}</p>
                        <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
                    </div>
                    <a href="#/account" onClick={(e) => handleNavClick(e, '/account')} className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-white hover:bg-theme transition-colors">
                        <UserIcon className="w-5 h-5" />
                        <span>Account Settings</span>
                    </a>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-white hover:bg-theme transition-colors mt-1">
                       <LogoutIcon className="w-5 h-5" />
                       <span>Logout</span>
                    </button>
                 </div>
            )}
        </div>
    );
}

const Header: React.FC<HeaderProps> = ({ currentPath }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300`;
  const scrolledClasses = isScrolled ? 'bg-black/50 backdrop-blur-xl border-b border-white/10' : 'bg-gradient-to-b from-black/60 to-transparent';

  return (
    <>
      {/* Mobile Header */}
       <header className={`${headerClasses} md:hidden ${scrolledClasses}`}>
         <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <a href="#/" onClick={(e) => handleNavClick(e, '/')} aria-label="Go to Home page">
              <Logo className="h-7 text-white" />
            </a>
            <AuthSection isMobile />
        </div>
      </header>

      {/* Desktop Header */}
       <header className={`${headerClasses} hidden md:block ${scrolledClasses}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-8">
              <a href="#/" onClick={(e) => handleNavClick(e, '/')} aria-label="Go to Home page">
                <Logo className="h-8 text-white" />
              </a>
              <NavLinks className="hidden md:flex items-center space-x-6 text-sm" currentPath={currentPath} />
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="#/search"
                onClick={(e) => handleNavClick(e, '/search')}
                className="group interactive-glow-outline flex items-center w-48 bg-gray-800/50 text-gray-400 px-3 py-1.5 rounded-lg transition-colors duration-200 hover:text-white hover:bg-gray-800"
                aria-label="Search for anime"
              >
                <SearchIcon />
                <span className="ml-2 text-sm">Search...</span>
              </a>
              <AuthSection />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
