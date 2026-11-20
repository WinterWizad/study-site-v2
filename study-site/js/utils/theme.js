/**
 * Theme Utility
 * Handles light/dark theme switching with localStorage persistence
 */

const THEME_KEY = 'study-site-theme';
const DARK_CLASS = 'dark';

export function initTheme() {
  // Check for saved theme or system preference
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Initialize theme toggle buttons
  initThemeToggles();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  // Update toggle buttons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    const icon = btn.querySelector('wa-icon');
    if (icon) {
      icon.name = theme === 'dark' ? 'sun' : 'moon';
    }
  });
}

function initThemeToggles() {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  });
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

export function setTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    applyTheme(theme);
  }
}