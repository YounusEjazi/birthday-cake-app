import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'retro': ['var(--font-retro)', 'monospace'],
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0,0,0,0.3)',
        'pixel-sm': '2px 2px 0px 0px rgba(0,0,0,0.3)',
        'pixel-lg': '6px 6px 0px 0px rgba(0,0,0,0.3)',
        'retro': '4px 4px 0px 0px #000',
        'retro-white': '4px 4px 0px 0px #fff',
      }
    },
  },
  plugins: [],
}
export default config

