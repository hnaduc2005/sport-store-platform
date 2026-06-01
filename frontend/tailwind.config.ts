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
        ink: '#101317',
        court: '#1f8a70',
        track: '#f4b942',
        pulse: '#e23d28',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(16, 19, 23, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;

