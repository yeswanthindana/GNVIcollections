import React, { useState, useEffect } from 'react';
import {
    Menu, X, Search, ShoppingBag, User, Instagram,
    Facebook, Twitter, ChevronDown, Filter, Sliders, ChevronRight,
    Sparkles, Star, ArrowRight, Eye, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export default function Collections() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currency, setCurrency] = useState('₹');

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(2000000);
    const [sortBy, setSortBy] = useState('Newest');

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
        const saved = localStorage.getItem('gnvi_store_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.currency) setCurrency(settings.currency);
        }
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const { data: catData } = await supabase.from('categories').select('*');
            if (catData) setCategories(catData);

            const categoryMap = (catData || []).reduce((acc, cat) => {
                acc[cat.id] = cat.name;
                return acc;
            }, {});

            let { data: prodData, error: prodErr } = await supabase
                .from('products')
                .select('*, categories:category_id(name)')
                .order('created_at', { ascending: false });

            if (prodErr) {
                const { data: rawData, error: rawErr } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (!rawErr) {
                    prodData = rawData.map(p => ({
                        ...p,
                        categories: { name: categoryMap[p.category_id] || 'Jewelry' }
                    }));
                }
            }

            if (prodData) setProducts(prodData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = products.filter(p => {
        const catName = p.categories?.name || 'Jewelry';
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            catName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || catName === selectedCategory;
        const matchesPrice = p.current_price <= priceRange;
        return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
        if (sortBy === 'Price Low-High') return a.current_price - b.current_price;
        if (sortBy === 'Price High-Low') return b.current_price - a.current_price;
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const imageFallback = "https://images.unsplash.com/photo-1599643478123-dc9109059083?auto=format&fit=crop&q=80&w=600";

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all">
                            <Menu size={22} />
                        </button>
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="GNVI Logo" className="w-9 h-9 object-contain" />
                            <h1 className="text-xl font-bold tracking-tight">GNVI</h1>
                        </Link>
                    </div>

                    <div className="flex-1 max-w-sm mx-12 relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find a masterpiece..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-slate-900/10 transition-all font-sans"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="relative p-2 hover:bg-slate-50 rounded-full cursor-pointer transition-all">
                            <ShoppingBag size={20} />
                            <span className="absolute top-1 right-1 bg-slate-900 text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">0</span>
                        </div>
                        <button onClick={() => navigate('/login')} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                            <User size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <header className="pt-40 pb-16 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">The Collection</h1>
                    <p className="text-slate-500 text-sm max-w-xl">Curated varieties of ethical jewelry, with every piece meeting our rigorous 1995-standard for excellence.</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Filters */}
                    <aside className="w-full lg:w-64 shrink-0 space-y-12">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Classification</h3>
                            <div className="flex flex-wrap lg:flex-col gap-2">
                                <FilterButton active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')}>All Masterpieces</FilterButton>
                                {categories.map(cat => (
                                    <FilterButton key={cat.id} active={selectedCategory === cat.name} onClick={() => setSelectedCategory(cat.name)}>{cat.name}</FilterButton>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Valuation Limit</h3>
                            <input
                                type="range"
                                min="0"
                                max="2000000"
                                step="5000"
                                className="w-full accent-slate-900 cursor-pointer"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                            />
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-4 uppercase">
                                <span>{currency}0</span>
                                <span className="text-slate-900">Up To {currency}{Number(priceRange).toLocaleString()}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Sort Archive</h3>
                            <select
                                className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-slate-900/10"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="Newest">Recently Added</option>
                                <option value="Price Low-High">Price: Low to High</option>
                                <option value="Price High-Low">Price: High to Low</option>
                            </select>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="grow">
                        <div className="mb-10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
                            <span>{filteredProducts.length} varieties listed</span>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                                {Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse space-y-4 shadow-sm p-4 bg-white rounded-2xl"><div className="aspect-[4/5] bg-slate-50 rounded-xl"></div><div className="h-4 bg-slate-50 rounded-full w-1/2"></div><div className="h-4 bg-slate-50 rounded-full w-full"></div></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                                {filteredProducts.map((p) => (
                                    <div key={p.id} className="group cursor-pointer">
                                        <div className="relative aspect-[4/5] bg-slate-50 rounded-[2rem] overflow-hidden mb-6 border border-slate-50 transition-all hover:shadow-2xl duration-700">
                                            <img
                                                src={p.image_url || imageFallback}
                                                alt={p.name}
                                                className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-[1.5s]"
                                                onError={(e) => e.target.src = imageFallback}
                                            />
                                            {p.discount_percent > 0 && (
                                                <div className="absolute top-6 left-6 bg-slate-900 text-white text-[9px] font-bold px-3 py-1.5 rounded-full">{p.discount_percent.toFixed(0)}% OFF</div>
                                            )}
                                            <div className="absolute inset-x-6 bottom-6 translate-y-20 group-hover:translate-y-0 transition-all duration-500">
                                                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">
                                                    Quick Add
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-center px-4">
                                            <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-1">{p.name}</h3>
                                            <div className="flex items-center justify-center gap-4">
                                                <span className="font-bold text-slate-900 text-sm">{currency}{p.current_price?.toLocaleString()}</span>
                                                {p.original_price > p.current_price && (
                                                    <span className="text-[10px] text-slate-300 line-through">{currency}{p.original_price?.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full py-40 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching variety found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- NEW SHORT MENU DRAWER --- */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[300px] bg-white z-[60] shadow-2xl flex flex-col p-10"
                        >
                            <div className="flex justify-between items-center mb-16">
                                <img src="/logo.png" className="w-8 h-8" />
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={24} /></button>
                            </div>
                            <nav className="flex flex-col gap-8 text-xl font-bold tracking-tight">
                                <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:translate-x-2 transition-transform">Home</Link>
                                <Link to="/collections" onClick={() => setIsMenuOpen(false)} className="hover:translate-x-2 transition-transform">The Catalog</Link>
                                <a href="/#about" onClick={() => setIsMenuOpen(false)} className="hover:translate-x-2 transition-transform">Our Heritage</a>
                                <a href="/#contact" onClick={() => setIsMenuOpen(false)} className="hover:translate-x-2 transition-transform">Concierge</a>
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-3 text-slate-400 group hover:text-slate-900">
                                    <User size={18} /> <span className="text-sm">Admin Console</span>
                                </Link>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function FilterButton({ active, children, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`text-left px-5 py-3 rounded-xl text-xs font-bold transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
        >
            {children}
        </button>
    );
}
