import React, { useState, useEffect } from 'react';
import {
    Menu, X, Search, ShoppingBag, User, Instagram,
    Facebook, Twitter, ChevronDown, Filter, Sliders, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(500000);
    const [availability, setAvailability] = useState('All');
    const [sortBy, setSortBy] = useState('Newest');

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        let { data: prodData, error: prodErr } = await supabase
            .from('products')
            .select('*, categories:category_id(name)');

        if (prodErr) {
            const { data: flatProds, error: flatErr } = await supabase
                .from('products')
                .select('*');
            if (!flatErr) prodData = flatProds;
        }

        const { data: catData } = await supabase.from('categories').select('*');
        if (prodData) setProducts(prodData);
        if (catData) setCategories(catData);
        setLoading(false);
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.categories?.name === selectedCategory;
        const matchesPrice = p.current_price <= priceRange;
        const matchesAvailability = availability === 'All' || p.stock_status === availability;
        return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
    }).sort((a, b) => {
        if (sortBy === 'Price Low-High') return a.current_price - b.current_price;
        if (sortBy === 'Price High-Low') return b.current_price - a.current_price;
        return new Date(b.created_at) - new Date(a.created_at);
    });

    return (
        <div className="min-h-screen bg-white font-inter">
            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    {/* Logo on Left */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Menu size={24} />
                        </button>
                        <Link to="/" className="text-2xl font-playfair font-black tracking-tighter uppercase">
                            GNVI<span className="text-luxury-gold">.</span>
                        </Link>
                    </div>

                    {/* Search Bar Center */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search our collection..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full focus:ring-1 focus:ring-luxury-gold outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Icons Right */}
                    <div className="flex items-center gap-2 sm:gap-6">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                            <ShoppingBag size={22} className="text-gray-700" />
                            <span className="absolute top-1 right-1 bg-luxury-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden sm:flex items-center gap-2 py-2 px-4 border border-gray-200 rounded-full hover:border-luxury-gold transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            <User size={16} /> Admin
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HAMBURGER MENU --- */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="fixed inset-0 z-[100] bg-white lg:hidden flex flex-col p-8"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-2xl font-playfair font-black tracking-tight">GNVI.</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={28} /></button>
                        </div>
                        <nav className="flex flex-col gap-8">
                            {['About Us', 'Blog', 'Location', 'Contact Us', 'Customer Care', 'Reviews'].map(item => (
                                <a key={item} href="#" className="text-2xl font-playfair font-bold text-gray-800 hover:text-luxury-gold transition-colors">{item}</a>
                            ))}
                        </nav>
                        <div className="mt-auto flex gap-6">
                            <Instagram className="text-gray-400 hover:text-luxury-gold cursor-pointer" />
                            <Facebook className="text-gray-400 hover:text-luxury-gold cursor-pointer" />
                            <Twitter className="text-gray-400 hover:text-luxury-gold cursor-pointer" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- HERO SECTION --- */}
            <header className="pt-32 pb-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-luxury-cream via-white to-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-luxury-gold/5 blur-[120px] rounded-full"></div>
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-20 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-luxury-gold/10 rounded-full border border-luxury-gold/20"
                        >
                            <span className="w-2 h-2 rounded-full bg-luxury-gold animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-gold">New 2026 Collection</span>
                        </motion.div>
                        <h1 className="text-6xl lg:text-8xl font-playfair font-black text-luxury-black mb-8 leading-[0.9]">
                            Legacy of <br /> <span className="luxury-text-gradient italic relative inline-block">
                                Radiance.
                                <motion.span
                                    className="absolute bottom-0 left-0 h-[2px] bg-luxury-gold"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ delay: 1, duration: 1.5 }}
                                />
                            </span>
                        </h1>
                        <p className="text-gray-500 text-lg mb-10 max-w-md leading-relaxed">
                            Step into the world of GNVI—where every piece tells a story of artisanal perfection and timeless brilliance.
                        </p>
                        <div className="flex items-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-luxury-black text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-luxury-gold transition-colors shadow-2xl shadow-luxury-gold/20"
                            >
                                Explore Collection
                            </motion.button>
                            <button className="text-luxury-black font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group">
                                Our Heritage <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative"
                    >
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 2, 0]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative z-10"
                        >
                            <div className="absolute -inset-4 bg-luxury-gold/20 blur-2xl rounded-[40px] -z-10 opacity-30"></div>
                            <img
                                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000"
                                alt="Jewelry"
                                className="rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white/50 backdrop-blur-sm grayscale-[0.5] hover:grayscale-0 transition-all duration-1000"
                            />
                        </motion.div>
                    </motion.div>
                </div>

                <div className="mt-24 border-y border-gray-100 py-10 bg-white/50 backdrop-blur-sm relative overflow-hidden">
                    <div className="animate-marquee">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-20 items-center pr-20">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Handcrafted Excellence</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Pure Gold Plated</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Diamond Certified</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Ethically Sourced</span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* --- BRAND STORY --- */}
            <section className="py-32 bg-white relative">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-luxury-gold mb-10 block">Our Philosophy</span>
                        <h2 className="text-4xl lg:text-6xl font-playfair italic text-luxury-black mb-12 leading-tight">
                            "Jewelry is more than an ornament; it's a silent <span className="luxury-text-gradient">declaration</span> of who you are."
                        </h2>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">— G.N. Varma, Founder</p>
                    </motion.div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full"></div>
            </section>

            {/* --- FILTERS & GRID --- */}
            <main className="max-w-7xl mx-auto px-4 py-24">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-12">
                        <div>
                            <h3 className="font-playfair font-bold text-xl mb-6">Explore Collections</h3>
                            <div className="flex flex-col gap-3">
                                <FilterButton active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')}>All Products</FilterButton>
                                {categories.map(cat => (
                                    <FilterButton key={cat.id} active={selectedCategory === cat.name} onClick={() => setSelectedCategory(cat.name)}>{cat.name}</FilterButton>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-playfair font-bold text-xl mb-6">Price Range</h3>
                            <input
                                type="range"
                                min="0"
                                max="1000000"
                                step="1000"
                                className="w-full accent-luxury-gold"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                            />
                            <div className="flex justify-between text-xs font-bold text-gray-500 mt-2 uppercase tracking-tighter">
                                <span>₹0</span>
                                <span>Max: ₹{priceRange}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-playfair font-bold text-xl mb-6">Stock Status</h3>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                                value={availability}
                                onChange={(e) => setAvailability(e.target.value)}
                            >
                                <option value="All">All Items</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>

                        <div>
                            <h3 className="font-playfair font-bold text-xl mb-6">Sort By</h3>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option>Newest</option>
                                <option>Price Low-High</option>
                                <option>Price High-Low</option>
                            </select>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="grow">
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                                {filteredProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full py-40 text-center">
                                        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
                                        <h3 className="text-2xl font-playfair font-black text-gray-400">No treasures found...</h3>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-luxury-black text-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div>
                        <h2 className="text-2xl font-playfair font-black mb-8">GNVI COLLECTIONS</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Exquisite jewelry pieces designed for those who demand excellence and radiant elegance.
                        </p>
                        <div className="flex gap-4">
                            <div className="p-2 bg-white/5 rounded-full hover:bg-luxury-gold transition-all cursor-pointer"><Instagram size={18} /></div>
                            <div className="p-2 bg-white/5 rounded-full hover:bg-luxury-gold transition-all cursor-pointer"><Facebook size={18} /></div>
                            <div className="p-2 bg-white/5 rounded-full hover:bg-luxury-gold transition-all cursor-pointer"><Twitter size={18} /></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-luxury-gold uppercase tracking-widest mb-8">Collection</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="hover:text-white cursor-pointer transition-colors">Engagement Rings</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Wedding Bands</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Statement Necklaces</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Limited Editions</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-luxury-gold uppercase tracking-widest mb-8">Boutique</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="hover:text-white cursor-pointer transition-colors">About GNVI</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Visit Our Workshop</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Sustainability</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Ethics</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-luxury-gold uppercase tracking-widest mb-8">Inner Circle</h4>
                        <p className="text-sm text-gray-400 mb-6">Join for exclusive arrivals and private events.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Royal Email" className="bg-white/5 border border-white/10 rounded px-4 py-2 w-full outline-none focus:border-luxury-gold text-sm" />
                            <button className="bg-luxury-gold text-white px-4 py-2 rounded font-bold text-xs uppercase">Sign</button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 pt-12 border-t border-white/5 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    © 2026 GNVI Collections. All rights reserved. Crafting brilliance globally.
                </div>
            </footer>
        </div>
    );
}

function ProductCard({ product }) {
    const discount = Math.round(((product.original_price - product.current_price) / product.original_price) * 100);

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="group"
        >
            <div className="relative overflow-hidden mb-6 aspect-[4/5] bg-gray-50 rounded-2xl border border-gray-100">
                <img
                    src={product.image_url || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                />

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                        -{discount}%
                    </div>
                )}

                {/* Stock Label */}
                <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded shadow-sm ${product.stock_status === 'In Stock' ? 'bg-luxury-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {product.stock_status}
                </div>

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                    <button className="bg-white text-luxury-black w-full py-4 text-xs font-black uppercase tracking-widest shadow-2xl translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                        Quick View
                    </button>
                </div>
            </div>

            <div className="text-center">
                <p className="text-[10px] font-black uppercase text-luxury-gold tracking-[0.2em] mb-2">
                    {product.categories?.name || 'GNVI Selection'}
                </p>
                <h3 className="font-playfair font-bold text-lg mb-2 text-luxury-black truncate group-hover:text-luxury-gold transition-colors">{product.name}</h3>
                <div className="flex justify-center items-center gap-3">
                    <span className="text-gray-400 line-through text-xs">₹{product.original_price}</span>
                    <span className="text-xl font-bold text-luxury-black">₹{product.current_price}</span>
                </div>
            </div>
        </motion.div>
    );
}

function FilterButton({ active, children, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`text-left text-sm font-bold uppercase tracking-widest transition-all ${active ? 'text-luxury-gold ml-2 scale-105' : 'text-gray-400 hover:text-luxury-black'}`}
        >
            {active && <span className="mr-2">•</span>}{children}
        </button>
    );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl mb-6"></div>
            <div className="h-4 bg-gray-100 w-1/4 mx-auto mb-3 rounded"></div>
            <div className="h-6 bg-gray-100 w-3/4 mx-auto mb-3 rounded"></div>
            <div className="h-8 bg-gray-100 w-1/2 mx-auto rounded"></div>
        </div>
    );
}
