import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF2E54', // Reference red/pink
          hover: '#E02447',
          light: '#FFF1F3',
          dark: '#380B14',
        },
        darkBg: {
          DEFAULT: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
        },
      },
    },
  },
  plugins: [],
};

export default config;