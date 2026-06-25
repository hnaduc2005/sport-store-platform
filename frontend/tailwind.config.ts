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
        /* --- Brand palette --- */
        brand: {
          black:    '#0A0A0A',
          charcoal: '#1C1C1E',
          dark:     '#2C2C2E',
          mid:      '#3A3A3C',
          muted:    '#636366',
          subtle:   '#AEAEB2',
          light:    '#E5E5EA',
          offwhite: '#F2F2F7',
          white:    '#FFFFFF',
        },
        /* --- Accent: Electric Orange --- */
        accent: {
          DEFAULT: '#F97316',
          light:   '#FED7AA',
          dark:    '#C2410C',
          hover:   '#EA6C0A',
          bg:      '#FFF7ED',
        },
        /* --- Legacy primary (keep for backwards compat) --- */
        primary: {
          DEFAULT: '#F97316',
          hover:   '#EA6C0A',
          deep:    '#0A0A0A',
        },
        /* --- Status / semantic --- */
        success: { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#14532D' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7', dark: '#92400E' },
        danger:  { DEFAULT: '#DC2626', light: '#FEE2E2', dark: '#991B1B' },
        info:    { DEFAULT: '#2563EB', light: '#DBEAFE', dark: '#1E3A8A' },
        /* --- Legacy neutral (keep for backwards compat) --- */
        alert: {
          DEFAULT: '#EA0F0F',
          vibrant: '#F97316',
          dark:    '#DC2626',
          fire:    '#F42B01',
          success: '#16A34A',
        },
        neutral: {
          black:     '#0A0A0A',
          dark:      '#2C2C2E',
          medium:    '#636366',
          light:     '#E5E5EA',
          offwhite:  '#F2F2F7',
          border:    'rgba(0,0,0,0.08)',
          input:     '#3A3A3C',
          inputLight:'#D1D5DB',
        },
      },
      boxShadow: {
        flat:     'none',
        sm:       '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        DEFAULT:  '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        md:       '0 8px 24px -4px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
        lg:       '0 16px 40px -8px rgb(0 0 0 / 0.14)',
        raised:   '0px 5px 8px 0px rgba(0, 0, 0, 0.06)',
        floating: '0px 0px 5px 1px rgba(0, 0, 0, 0.4)',
        lifted:   '0 8px 24px rgba(0,0,0,0.12)',
        modal:    '0 20px 60px -10px rgba(0,0,0,0.3)',
        card:     '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        subtle:   '2px',
        standard: '4px',
        btn:      '8px',
        card:     '12px',
        xl:       '16px',
        '2xl':    '20px',
        full:     '9999px',
        circle:   '100%',
      },
      maxWidth: {
        container: '1280px',
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs:    ['12px', '16px'],
        sm:    ['13px', '20px'],
        base:  ['14px', '22px'],
        md:    ['15px', '22px'],
        lg:    ['16px', '24px'],
        xl:    ['18px', '28px'],
        '2xl': ['20px', '30px'],
        '3xl': ['24px', '32px'],
        '4xl': ['30px', '38px'],
        '5xl': ['36px', '44px'],
        '6xl': ['48px', '56px'],
        '7xl': ['60px', '68px'],
      },
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
        '22':  '88px',
        '26':  '104px',
        '30':  '120px',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '120ms',
        slow: '350ms',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bar-grow': {
          '0%':   { transform: 'scaleY(0)', 'transform-origin': 'bottom' },
          '100%': { transform: 'scaleY(1)', 'transform-origin': 'bottom' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.25s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
        'scale-in':      'scale-in 0.2s ease-out',
        'bar-grow':      'bar-grow 0.6s ease-out',
        pulse:           'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
