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
        primary: {
          DEFAULT: '#2F80ED',
          hover: '#2C51B0',
          deep: '#0F1C2D',
        },
        alert: {
          DEFAULT: '#EA0F0F',
          vibrant: '#E5677D',
          dark: '#A50A06',
          fire: '#F42B01',
          success: '#EB5B5B',
        },
        neutral: {
          black: '#000000',
          dark: '#333333',
          medium: '#666666',
          light: '#EBEBEB',
          offwhite: '#F5F5F5',
          border: 'rgba(0, 0, 0, 0.08)',
          input: '#363636',
          inputLight: '#CED4DA',
        },
      },
      boxShadow: {
        flat: 'none',
        raised: '0px 5px 8px 0px rgba(0, 0, 0, 0.06)',
        floating: '0px 0px 5px 1px rgba(0, 0, 0, 0.4)',
        lifted: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        modal: '0px 0px 5px 0px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        subtle: '2px',
        standard: '4px',
        btn: '5px',
        card: '8px',
        full: '9999px',
        circle: '100%',
      },
      maxWidth: {
        'container': '1230px',
      },
      fontFamily: {
        sans: ['Mulish', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
