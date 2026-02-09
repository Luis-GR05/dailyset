/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
<<<<<<< HEAD
        brand: {
          blue: '#2F31F5',
          yellow: '#DBF059',
=======
        // Mapeo directo a las variables CSS
        black: 'var(--color-black)',
        white: 'var(--color-white)',
        
        // La paleta de grises oscuros
        neutral: {
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
          1000: 'var(--color-neutral-1000)',
          2000: 'var(--color-neutral-2000)',
          3000: 'var(--color-neutral-3000)',
        },
        
        // La paleta azul/violeta (Primary)
        primary: {
          DEFAULT: 'var(--color-primary-700)', // El azul estándar
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          1000: 'var(--color-primary-1000)',
        },
        
        // El color Verde Lima (Accent)
        accent: {
          DEFAULT: 'var(--color-accent-500)',
          hover: 'var(--color-accent-hover)',
>>>>>>> 9e3abd4cde766766c1e3c04d4dcfb76e5a0ab021
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'], // Usar para títulos grandes
      },
      borderRadius: {
        'pill': 'var(--radius-pill)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
