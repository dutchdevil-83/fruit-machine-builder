import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import '../themes/default-dark.css';
import '../themes/default-light.css';

type ThemeId = 'default-dark' | 'default-light' | string;

interface WcagResult {
  passed: boolean;
  issues: string[];
}

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  availableThemes: { id: ThemeId; name: string }[];
  wcagCheck: (element?: HTMLElement) => WcagResult;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

const BUILT_IN_THEMES: { id: ThemeId; name: string }[] = [
  { id: 'default-dark', name: '🌙 Dark' },
  { id: 'default-light', name: '☀️ Light' },
];

/** Calculate relative luminance per WCAG formula */
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
}

/** Parse CSS color string to RGB */
function parseColor(color: string): [number, number, number] | null {
  // Handle hex
  const hex = color.replace('#', '');
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ];
  }
  // Handle rgb()
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [parseInt(match[1]!), parseInt(match[2]!), parseInt(match[3]!)];
  }
  return null;
}

/** Calculate WCAG contrast ratio */
function contrastRatio(color1: string, color2: string): number {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  if (!c1 || !c2) return 0;
  const l1 = luminance(...c1);
  const l2 = luminance(...c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Check WCAG AA compliance for a set of CSS variables */
export function checkWcagCompliance(element?: HTMLElement): WcagResult {
  const el = element ?? document.documentElement;
  const styles = getComputedStyle(el);
  const issues: string[] = [];

  const pairs: [string, string, string, number][] = [
    ['--text-primary', '--bg-primary', 'Primary text on background', 4.5],
    ['--text-primary', '--bg-panel', 'Primary text on panel', 4.5],
    ['--text-secondary', '--bg-primary', 'Secondary text on background', 4.5],
    ['--text-secondary', '--bg-panel', 'Secondary text on panel', 4.5],
    ['--text-muted', '--bg-primary', 'Muted text on background', 3.0],
  ];

  for (const [fg, bg, label, minRatio] of pairs) {
    const fgColor = styles.getPropertyValue(fg).trim();
    const bgColor = styles.getPropertyValue(bg).trim();
    if (!fgColor || !bgColor) continue;
    const ratio = contrastRatio(fgColor, bgColor);
    if (ratio < minRatio) {
      issues.push(`${label}: ${ratio.toFixed(1)}:1 (needs ${minRatio}:1)`);
    }
  }

  return { passed: issues.length === 0, issues };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return localStorage.getItem('fmb_theme') || 'default-dark';
  });

  const setTheme = useCallback((newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem('fmb_theme', newTheme);
  }, []);

  // Apply theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const wcagCheck = useCallback((element?: HTMLElement) => {
    return checkWcagCompliance(element);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      availableThemes: BUILT_IN_THEMES,
      wcagCheck,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
