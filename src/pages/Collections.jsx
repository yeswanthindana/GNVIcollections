import React, { useState, useEffect } from 'react';
import {
    Search, Instagram,
    Facebook, Twitter, ChevronDown, Filter, Sliders, ChevronRight,
    Sparkles, Star, ArrowRight, Eye, Percent
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Collections() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [currency, setCurrency] = useState('₹');
    const [storeName, setStoreName] = useState('GNVI Collections');

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(2000000);
    const [sortBy, setSortBy] = useState('Newest');

    const { cartCount, setIsCartOpen, addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
        const saved = localStorage.getItem('gnvi_store_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.currency) setCurrency(settings.currency);
            if (settings.storeName) setStoreName(settings.storeName);
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
            {/* --- NAVIGATION --- */}
            <Navbar storeName={storeName} isFixed={true}>
                <div className="flex-1 max-w-sm relative group hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Find a masterpiece..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-slate-900/10 transition-all font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Navbar>

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
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-slate-800"
                                                >
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
            <Footer storeName={storeName} />
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
