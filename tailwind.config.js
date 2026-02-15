/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'luxury-gold': '#D4AF37',
                'luxury-cream': '#F9F6F0',
                'luxury-black': '#1A1A1A',
            },
            fontFamily: {
                'playfair': ['"Playfair Display"', 'serif'],
                'inter': ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
