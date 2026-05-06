'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type BackgroundType = {
  url: string;
  name: string;
};

const backgrounds: BackgroundType[] = [
  { name: 'Default', url: '/background/default.jpg' },
  {
    name: 'Mountains',
    url: '/background/moutain.jpg',
  },
  {
    name: 'Ocean',
    url: '/background/ocean.jpg',
  },
  {
    name: 'Forest',
    url: '/background/forest.jpg',
  },
  {
    name: 'Abstract',
    url: '/background/abstract.jpg',
  },
  {
    name: 'Dark Space',
    url: '/background/dark-space.jpg',
  },
];

interface BackgroundContextType {
  currentBackground: string;
  setBackground: (url: string) => void;
  availableBackgrounds: BackgroundType[];
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(
  undefined,
);

export function BackgroundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentBackground, setCurrentBackground] = useState<string>('');

  useEffect(() => {
    const savedBg = localStorage.getItem('admin_background');
    if (savedBg) {
      setCurrentBackground(savedBg);
    }
  }, []);

  const setBackground = (url: string) => {
    setCurrentBackground(url);
    localStorage.setItem('admin_background', url);
  };

  return (
    <BackgroundContext.Provider
      value={{
        currentBackground,
        setBackground,
        availableBackgrounds: backgrounds,
      }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
