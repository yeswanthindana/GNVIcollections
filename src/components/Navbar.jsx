import React, { useState } from 'react';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar({ storeName = 'GNVI', children, isFixed = false }) {
    const { cartCount, setIsCartOpen } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <nav className={`${isFixed ? 'fixed' : 'sticky'} top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-100`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all lg:hidden">
                            <Menu size={22} />
                        </button>
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt={`${storeName} Logo`} className="w-9 h-9 object-contain" />
                            <h1 className="text-xl font-bold tracking-tight">{storeName.split(' ')[0]}</h1>
                        </Link>
                    </div>

                    {/* Center Desktop Links / Search */}
                    <div className="flex flex-1 mx-4 lg:mx-8 justify-center items-center">
                        {children}
                    </div>

                    <div className="flex items-center gap-5">
                        <div onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-slate-50 rounded-full cursor-pointer transition-all">
                            <ShoppingBag size={20} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-slate-900 text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                            )}
                        </div>
                        <button onClick={() => navigate('/login')} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                            <User size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-y-0 left-0 w-[300px] bg-white shadow-2xl flex flex-col p-10 h-full"
                        >
                            <div className="flex justify-between items-center mb-16">
                                <img src="/logo.png" className="w-8 h-8 object-contain" alt="Logo" />
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-8 text-xl font-bold tracking-tight">
                                <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-slate-500 transition-colors">Home</Link>
                                <Link to="/collections" onClick={() => setIsMenuOpen(false)} className="hover:text-slate-500 transition-colors">The Catalog</Link>
                                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-3 text-slate-400">
                                    <User size={18} />
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium hover:text-slate-900">Admin Console</Link>
                                </div>
                            </nav>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
