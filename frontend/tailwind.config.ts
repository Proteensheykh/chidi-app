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
        // Primary Colors
        'chidi-forest': '#1A4A3A',
        'pure-white': '#FFFFFF',
        
        // Secondary Colors
        'soft-sage': '#E8F2ED',
        'tech-gray': '#F8F9FA',
        
        // Accent Colors - Nature Palette
        'fresh-mint': '#10D9A0',
        'sky-blue': '#0EA5E9',
        'sunset-orange': '#F59E0B',
        'coral-pink': '#F472B6',
        
        // Functional Colors
        'alert-red': '#EF4444',
        'charcoal': '#1F2937',
        'slate-gray': '#64748B',
        'light-border': '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'bounce': 'bounce 1.4s infinite ease-in-out',
      },
      keyframes: {
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-5px)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
