import type { Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border) / var(--tw-border-opacity, var(--ui-border-opacity)))',
        input: 'hsl(var(--input) / var(--tw-border-opacity, var(--ui-border-opacity)))',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        lafftale: {
          gold: 'rgb(var(--lafftale-gold) / <alpha-value>)',
          bronze: 'rgb(var(--lafftale-bronze) / <alpha-value>)',
          darkred: '#8B0000',
          beige: '#F5F5DC',
          dark: 'rgb(var(--lafftale-dark) / <alpha-value>)',
          darkgray: 'rgb(var(--lafftale-darkgray) / <alpha-value>)',
        },
        // Dynamic Theme Colors - Set by ThemeContext via CSS variables
        theme: {
          primary: 'var(--theme-primary)',
          'primary-hover': 'var(--theme-primary-hover)',
          background: 'var(--theme-background)',
          surface: 'var(--theme-surface)',
          border: 'var(--theme-border)',
          text: 'var(--theme-text)',
          'text-on-primary': 'var(--theme-text-on-primary)',
          'text-muted': 'var(--theme-text-muted)',
          accent: 'var(--theme-accent)',
          secondary: 'var(--theme-secondary)',
          highlight: 'var(--theme-highlight)',
        },
      },
      borderWidth: {
        DEFAULT: 'var(--ui-border-width)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        glow: {
          '0%, 100%': {
            textShadow: '0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.5)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        glow: 'glow 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern':
          "linear-gradient(to bottom, rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 0.9)), url('/image/Web/Login.png');",
        'login-bg':
          "linear-gradient(to bottom, rgba(18, 18, 18, 0.8), rgba(18, 18, 18, 0.9)), url('/image/Web/Background.png')",
        'register-bg':
          "linear-gradient(to bottom, rgba(18, 18, 18, 0.8), rgba(18, 18, 18, 0.9)), url('/image/Web/header.png')",
        'header-bg':
          "linear-gradient(to bottom, rgba(18, 18, 18, 0.8), rgba(18, 18, 18, 0.9)), url('/image/Web/header2.png')",
        'header2-bg':
          "linear-gradient(to bottom, rgba(18, 18, 18, 0.8), rgba(18, 18, 18, 0.9)), url('/image/Web/header3.png')",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
