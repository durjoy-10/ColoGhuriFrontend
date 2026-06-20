/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                    950: '#083344',
                },
                secondary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                dark: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                soft: '0 18px 45px rgba(15, 23, 42, 0.08)',
                glow: '0 20px 60px rgba(8, 145, 178, 0.25)',
                card: '0 14px 40px rgba(15, 23, 42, 0.10)',
            },
            backgroundImage: {
                'travel-gradient': 'linear-gradient(135deg, #083344 0%, #0e7490 45%, #f97316 100%)',
                'soft-gradient': 'radial-gradient(circle at top left, rgba(34, 211, 238, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.16), transparent 35%)',
                'mesh': 'radial-gradient(circle at 20% 20%, rgba(34,211,238,.22), transparent 25%), radial-gradient(circle at 80% 0%, rgba(249,115,22,.18), transparent 28%), radial-gradient(circle at 40% 90%, rgba(14,116,144,.15), transparent 30%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.45s ease-out',
                'slide-up': 'slideUp 0.45s ease-out',
                'slide-down': 'slideDown 0.35s ease-out',
                'scale-in': 'scaleIn 0.25s ease-out',
                'float': 'float 5s ease-in-out infinite',
                'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
                'shimmer': 'shimmer 2.2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                slideUp: {
                    '0%': { opacity: 0, transform: 'translateY(18px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: 0, transform: 'translateY(-12px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: 0, transform: 'scale(.96)' },
                    '100%': { opacity: 1, transform: 'scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-14px)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: .75, transform: 'scale(1)' },
                    '50%': { opacity: 1, transform: 'scale(1.03)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-700px 0' },
                    '100%': { backgroundPosition: '700px 0' },
                },
            },
        },
    },
    plugins: [],
};