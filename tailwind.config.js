/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        psr: {
          dark: '#1e2229',
          body: '#2b303c',
          panel: '#1f242e',
          lcd: '#8ea862',
          lcdDark: '#1a2410',
          lcdBacklight: '#9bb868',
          ledRed: '#ff2a2a',
          ledGreen: '#2aff5a',
          ledYellow: '#ffd02a',
          btnDefault: '#3c4352',
          btnActive: '#ff5533',
          cream: '#e9e4d4',
          accent: '#00a3ff',
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
      },
      boxShadow: {
        'psr-panel': 'inset 0 2px 4px rgba(255, 255, 255, 0.08), inset 0 -2px 6px rgba(0, 0, 0, 0.6), 0 10px 25px rgba(0, 0, 0, 0.7)',
        'psr-lcd': 'inset 0 4px 8px rgba(0, 0, 0, 0.8), inset 0 -2px 4px rgba(255, 255, 255, 0.1)',
        'psr-btn': '0 3px 0 #181c24, 0 4px 6px rgba(0, 0, 0, 0.4)',
        'psr-btn-active': 'inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 0 #181c24',
        'key-white': 'inset 0 -1px 0 #e5e5e5, inset 0 -4px 0 #d4d4d4, 0 3px 5px rgba(0,0,0,0.3)',
        'key-black': 'inset 0 1px 2px rgba(255,255,255,0.2), 0 4px 6px rgba(0,0,0,0.6)',
      }
    },
  },
  plugins: [],
}
