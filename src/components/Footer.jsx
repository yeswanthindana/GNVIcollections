import React from 'react';

export default function Footer({ storeName = 'GNVI Collections' }) {
    return (
        <footer className="py-12 border-t border-slate-100 text-center bg-white text-slate-900">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
                <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Feedback</a>
                </div>
                <p className="text-[10px] text-slate-300 font-bold tracking-[0.2em] uppercase">
                    © {new Date().getFullYear()} {storeName.toUpperCase()}. Crafted with Love.
                </p>
            </div>
        </footer>
    );
}
