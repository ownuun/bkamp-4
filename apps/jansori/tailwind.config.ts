import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Brutalism Orange Theme
        'nb-orange': '#f97316',
        'nb-orange-light': '#fdba74',
        'nb-orange-dark': '#ea580c',
        'nb-yellow': '#fbbf24',
        'nb-cream': '#fff7ed',
        'nb-black': '#000000',
        'nb-white': '#ffffff',
      },
      boxShadow: {
        // Neo-Brutalism shadows
        'nb': '4px 4px 0px 0px rgba(0,0,0,1)',
        'nb-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'nb-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'nb-hover': '6px 6px 0px 0px rgba(0,0,0,1)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
