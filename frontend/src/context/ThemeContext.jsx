import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode) {
  const root = document.documentElement;
  const effective = mode === 'system' ? getSystemPreference() : mode;
  if (effective === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider(props) {
  const [mode, setMode] = useState(function () {
    const saved = localStorage.getItem('themeMode');
    return saved || 'system';
  });

  useEffect(function () {
    applyTheme(mode);
    localStorage.setItem('themeMode', mode);

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = function () {
        applyTheme('system');
      };
      mq.addEventListener('change', handler);
      return function () {
        mq.removeEventListener('change', handler);
      };
    }
  }, [mode]);

  function cycleTheme() {
    setMode(function (prev) {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }

  return (
    <ThemeContext.Provider value={{ mode: mode, setMode: setMode, cycleTheme: cycleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}