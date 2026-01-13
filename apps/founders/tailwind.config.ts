import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'nb-indigo': '#a5b4fc',
        'nb-indigo-dark': '#6366f1',
      },
      boxShadow: {
        'nb': '4px 4px 0px 0px rgba(0,0,0,1)',
        'nb-hover': '6px 6px 0px 0px rgba(0,0,0,1)',
      },
    },
  },
  plugins: [],
};
export default config;
