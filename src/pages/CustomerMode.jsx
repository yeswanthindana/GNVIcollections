import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    ShoppingBag, Search, Tag, CheckCircle2, XCircle, ArrowLeft,
    Filter, ChevronRight, Star, Heart, Info, ShoppingCart, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerMode() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Wearables', 'Monitoring', 'Sensors', 'Accessory'];

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setProducts(data || []);
        setLoading(false);
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            {/* VinCense Header */}
            <nav className="navbar">
                <div className="max-container nav-container">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <Activity size={18} />
                        </div>
                        <span className="text-xl font-black text-secondary tracking-tight">VinCense Store</span>
                    </Link>

                    <div className="flex-grow max-w-xl mx-12 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search medical equipment..."
                                className="w-full pl-12 pr-4 h-11 bg-light border border-border-color rounded-full outline-none focus:border-primary transition-colors text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-sm font-bold text-secondary hover:text-primary transition-colors">Home</Link>
                        <div className="relative cursor-pointer text-secondary hover:text-primary transition-colors">
                            <ShoppingCart size={22} />
                            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">0</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-container py-12 flex flex-col lg:flex-row gap-12">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-color sticky top-32">
                        <h4 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-8">Classification</h4>
                        <div className="space-y-4">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:bg-light'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-border-color">
                            <h4 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-6">Device Status</h4>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="h-4 w-4 rounded border-border-color text-primary focus:ring-primary" defaultChecked />
                                    <span className="text-sm font-medium text-text-muted group-hover:text-secondary">Certified In-Stock</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="h-4 w-4 rounded border-border-color text-primary focus:ring-primary" />
                                    <span className="text-sm font-medium text-text-muted group-hover:text-secondary">Clearance Deals</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid Area */}
                <div className="grow">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-secondary">Medical Solutions</h1>
                            <p className="text-text-muted text-sm mt-1">Found {filteredProducts.length} high-precision instruments</p>
                        </div>

                        <select className="bg-white border border-border-color px-4 py-2 rounded-lg text-sm font-bold text-secondary outline-none focus:border-primary">
                            <option>Newest Technology</option>
                            <option>Clinical Accuracy</option>
                            <option>Price: Low to High</option>
                        </select>
                    </header>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="card h-96 animate-pulse">
                                    <div className="bg-light h-48 rounded-lg mb-6"></div>
                                    <div className="h-6 bg-light w-3/4 rounded mb-4"></div>
                                    <div className="h-4 bg-light w-full rounded mb-10"></div>
                                    <div className="h-10 bg-light w-full rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence>
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                            >
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="card group border-none shadow-sm flex flex-col h-full"
                                    >
                                        <div className="relative h-64 bg-light rounded-xl overflow-hidden mb-6">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary/20">
                                                    <Activity size={80} strokeWidth={1} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                {product.available ? (
                                                    <span className="bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Active</span>
                                                ) : (
                                                    <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Reserved</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-grow flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{product.category}</p>
                                                    <h3 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors">{product.name}</h3>
                                                </div>
                                                <div className="text-2xl font-black text-primary font-mono">${product.price}</div>
                                            </div>
                                            <p className="text-text-muted text-xs leading-relaxed mb-8 line-clamp-3">
                                                {product.description || 'Professional grade med-tech device designed for the most demanding clinical applications.'}
                                            </p>
                                            <button className="btn btn-primary w-full py-4 mt-auto rounded-xl">
                                                Request Technical Spec
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {!loading && filteredProducts.length === 0 && (
                        <div className="py-32 text-center bg-white rounded-3xl border-2 border-dashed border-border-color">
                            <div className="h-20 w-20 bg-light rounded-full flex items-center justify-center mx-auto mb-8">
                                <Search size={32} className="text-secondary opacity-20" />
                            </div>
                            <h3 className="text-2xl font-bold text-secondary mb-4">No results match your query</h3>
                            <p className="text-text-muted mb-8 max-w-sm mx-auto">We couldn't find any medical instruments matching your filters. Try clearing all classifications.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                                className="text-primary font-bold hover:underline"
                            >
                                Reset Inventory View
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
