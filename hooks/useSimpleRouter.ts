import { useState, useEffect } from 'react';

const getCurrentPath = () => window.location.hash.slice(1) || '/';

export const useSimpleRouter = () => {
  const [path, setPath] = useState(getCurrentPath());

  useEffect(() => {
    const onHashChange = () => {
      setPath(getCurrentPath());
      window.scrollTo(0, 0); // Scroll to top on page change
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  return path;
};
