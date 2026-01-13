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
        // Neo-Brutalism 색상 팔레트
        'nb-pink': '#ff8fab',
        'nb-yellow': '#ffc971',
        'nb-green': '#a7f3d0',
        'nb-blue': '#93c5fd',
        'nb-purple': '#c4b5fd',
        'nb-orange': '#fdba74',
        'nb-red': '#fca5a5',
        'nb-cyan': '#67e8f9',
      },
      boxShadow: {
        // Neo-Brutalism 그림자
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
