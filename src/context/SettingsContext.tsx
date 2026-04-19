import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type UnitSystem = 'si' | 'standard'; // standard: cm, eV; si: m, MeV

interface SettingsContextType {
  theme: Theme;
  toggleTheme: () => void;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [units, setUnits] = useState<UnitSystem>('standard');

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    // Apply theme to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, units, setUnits }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
