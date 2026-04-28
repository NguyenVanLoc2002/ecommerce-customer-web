/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        'surface-soft': 'rgb(var(--color-surface-soft) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        outline: 'rgb(var(--color-outline) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'brand-primary': 'rgb(var(--color-brand-primary) / <alpha-value>)',
        'brand-hover': 'rgb(var(--color-brand-hover) / <alpha-value>)',
        'brand-active': 'rgb(var(--color-brand-active) / <alpha-value>)',
        'brand-subtle': 'rgb(var(--color-brand-subtle) / <alpha-value>)',
        'sale-accent': 'rgb(var(--color-sale-accent) / <alpha-value>)',
        'promo-dark': 'rgb(var(--color-promo-dark) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif']
      },
      maxWidth: {
        layout: '1440px'
      },
      borderRadius: {
        chip: 'var(--radius-chip)',
        input: 'var(--radius-input)',
        button: 'var(--radius-button)',
        card: 'var(--radius-card)',
        feature: 'var(--radius-feature)'
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        modal: 'var(--shadow-modal)',
        sticky: 'var(--shadow-sticky)'
      },
      spacing: {
        page: 'var(--space-page)',
        section: 'var(--space-section)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite'
      }
    }
  },
  plugins: []
};
