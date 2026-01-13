import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'nb-cyan': '#67e8f9',
        'nb-cyan-dark': '#0ea5e9',
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
