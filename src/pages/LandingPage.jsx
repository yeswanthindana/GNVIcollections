import React, { useState, useEffect } from 'react';
import {
    Instagram,
    Facebook, Twitter, ChevronRight, Star, Heart,
    Sparkles, Eye, ShieldCheck, Globe, ArrowRight, Percent, Award, Phone, Mail, MapPin, Truck, Headphones, RotateCcw, HeartHandshake, Quote
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function LandingPage() {
    const [products, setProducts] = useState([]);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const [currency, setCurrency] = useState('₹');
    const [storeInfo, setStoreInfo] = useState({
        storeName: 'GNVI Collections',
        supportEmail: 'hello@gnvi.com',
        phone: '+91 98765 43210',
        address: 'Visakhapatnam, Andhra Pradesh, India'
    });

    const { cartCount, setIsCartOpen, addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
        const saved = localStorage.getItem('gnvi_store_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.currency) setCurrency(settings.currency);
            setStoreInfo({
                storeName: settings.storeName || 'GNVI Collections',
                supportEmail: settings.supportEmail || 'hello@gnvi.com',
                phone: settings.phone || '+91 98765 43210',
                address: settings.address || 'Visakhapatnam, Andhra Pradesh, India'
            });
        }
    }, []);

    // Featured rotation
    useEffect(() => {
        const featured = products.filter(p => p.featured);
        if (featured.length > 0) {
            const timer = setInterval(() => {
                setFeaturedIndex((prev) => (prev + 1) % featured.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [products]);

    async function fetchData() {
        setLoading(true);
        try {
            const { data: catData } = await supabase.from('categories').select('*');
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
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }

    const featuredProducts = products.filter(p => p.featured);
    const currentFeatured = featuredProducts[featuredIndex] || products[0];
    const shopAll = products.slice(0, 8);

    const heroImage = "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=80&w=1200"; // Suit-clad dynamic lady focusing on bracelets
    const placeholderJewelry = "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800";

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white relative">
            {/* --- TOP BAR --- */}
            <div className="bg-slate-900 text-white py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-center px-4 relative z-50">
                A New Standard in Transparent & Ethical Jewelry
            </div>

            {/* --- NAVIGATION --- */}
            {/* --- NAVIGATION --- */}
            <Navbar storeName={storeInfo.storeName}>
                <div className="hidden lg:flex gap-10 font-bold text-[10px] uppercase tracking-widest text-slate-500">
                    <Link to="/collections" className="hover:text-slate-900 transition-colors">The Catalog</Link>
                    <a href="#purpose" className="hover:text-slate-900 transition-colors">Our Values</a>
                    <a href="#founder" className="hover:text-slate-900 transition-colors">Founder's Note</a>
                    <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
                </div>
            </Navbar>

            {/* --- HERO --- */}
            <section className="relative py-20 lg:py-40 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-10 relative z-10">
                        <div className="flex items-center gap-3 text-slate-400">
                            <div className="w-12 h-[1px] bg-slate-200"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Exquisite Fashion Jewelry</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-slate-900">
                            Shine in <br />
                            <span className="text-amber-500 italic font-serif font-normal">Elegance.</span>
                        </h1>
                        <p className="text-slate-500 max-w-lg text-lg leading-relaxed font-medium">
                            Step into the spotlight with GNVI's latest collection. Our jewelry is designed to complement your grace and make every moment a celebration.
                        </p>
                        <div className="flex items-center gap-8 pt-4">
                            <button onClick={() => navigate('/collections')} className="bg-slate-900 text-white px-12 py-5 rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 active:scale-95">Explore Catalog</button>
                            <Link to="/collections" className="text-xs font-bold flex items-center gap-3 group">
                                New Arrivals <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className="relative"
                    >
                        <div className="absolute -inset-20 bg-amber-100/30 blur-[120px] rounded-full animate-pulse"></div>
                        <div className="relative aspect-[3/4] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white ring-1 ring-slate-100">
                            <img
                                src={heroImage}
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-[3s]"
                                alt="GNVI Model in Lehenga"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            <div className="absolute bottom-10 left-10 text-white">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Featured Look</p>
                                <h4 className="text-2xl font-bold">The Royal Collection</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section id="founder" className="py-32 bg-slate-50 relative overflow-hidden">
                <div className="hidden lg:block absolute top-0 right-0 w-1/3 h-full bg-slate-100/50 skew-x-12 translate-x-20"></div>
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-12">
                        <div className="p-4 bg-white rounded-3xl shadow-xl shadow-slate-200/50">
                            <Quote size={40} className="text-amber-500" fill="currentColor" fillOpacity={0.1} />
                        </div>
                        <motion.blockquote
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl lg:text-5xl font-serif italic text-slate-800 leading-tight tracking-tight"
                        >
                            "Jewelry isn't just about the stones or the gold; it's about the <span className="text-amber-600">confidence</span> it brings and the story it helps you tell. At GNVI, we create pieces that don't just sparkle, they resonate with your inner light."
                        </motion.blockquote>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black tracking-widest uppercase text-slate-900">Sowjanya Rajam</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">Founder & Creative Visionary</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TRUST SIGNALS --- */}
            <section className="py-20 border-y border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <TrustBadge icon={<Award className="text-amber-500" />} title="Honest Pricing" desc="Direct-to-you value" />
                    <TrustBadge icon={<ShieldCheck className="text-green-500" />} title="Certified Trust" desc="100% Secure & Verified" />
                    <TrustBadge icon={<Heart className="text-red-500" />} title="Made for You" desc="Designed for your happiness" />
                    <TrustBadge icon={<RotateCcw className="text-slate-500" />} title="Easy Returns" desc="15-Day Hassle-Free" />
                </div>
            </section>

            {/* --- VARIETY GRID --- */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight">The Opening Catalog</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Explore our initial selection of masterfully crafted jewelry, designed with a focus on timeless elegance and pure values.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-slate-50 aspect-[4/5] rounded-2xl" />) :
                        shopAll.map((p) => (
                            <div key={p.id} className="group cursor-pointer" onClick={() => navigate('/collections')}>
                                <div className="relative aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden mb-5 transition-all group-hover:shadow-xl border border-slate-50">
                                    <img src={p.image_url || placeholderJewelry} className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700" onError={(e) => e.target.src = placeholderJewelry} />
                                    {p.discount_percent > 0 && <span className="absolute top-4 right-4 bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded-full">{p.discount_percent.toFixed(0)}% OFF</span>}
                                </div>
                                <h3 className="font-bold text-sm text-slate-900 truncate">{p.name}</h3>
                                <p className="font-bold text-xs mt-1">{currency}{p.current_price?.toLocaleString()}</p>
                            </div>
                        ))
                    }
                </div>
            </section>

            {/* --- PURPOSE SECTION --- */}
            <section id="purpose" className="py-32 bg-slate-900 text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8 relative z-10">
                        <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">A New Vision</span>
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">New Journey, <span className="text-amber-500">Pure Integrity.</span></h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            We are starting this journey with a heartbeat focused entirely on you. GNVI is built on a foundation of absolute transparency and honesty. We don't rely on history because we believe in earning your trust today, through every masterpiece and every smile. Your happiness is our only milestone.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2">
                                <h4 className="text-3xl font-bold">100%</h4>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Commitment to Quality</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-3xl font-bold">Priority</h4>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Customer Happiness</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-10 bg-amber-500/10 blur-[100px] rounded-full"></div>
                        <img src="https://images.unsplash.com/photo-1541216970279-affbfdd55aa8?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover rounded-[3rem] shadow-2xl relative z-10 hover:scale-105 transition-all duration-1000" alt="Trend-focused Korean fashion jewelry on youthful model" />
                    </div>
                </div>
            </section>

            {/* --- CONTACT & CONCIERGE --- */}
            <section id="contact" className="py-24 max-w-7xl mx-auto px-6">
                <div className="bg-slate-50 rounded-[3rem] p-12 lg:p-20 grid lg:grid-cols-3 gap-16 items-center border border-slate-100">
                    <div className="lg:col-span-1 space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Personal Concierge</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">As a boutique brand, we provide personalized attention to every customer. Reach out to us for any custom requirements or assistance.</p>
                        <div className="space-y-4 pt-4">
                            <ContactItem icon={<Phone size={18} />} title="Direct Line" detail={storeInfo.phone} />
                            <ContactItem icon={<Mail size={18} />} title="Support" detail={storeInfo.supportEmail} />
                            <ContactItem icon={<MapPin size={18} />} title="Atelier" detail={storeInfo.address} />
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-xl border border-slate-100">
                        <form className="grid grid-cols-2 gap-6" onSubmit={async (e) => {
                            e.preventDefault();
                            const btn = e.target.querySelector('button');
                            const originalText = btn.innerText;
                            try {
                                btn.disabled = true;
                                btn.innerText = 'Sending...';
                                const formData = new FormData(e.target);
                                const { error } = await supabase.from('customer_requests').insert([{
                                    customer_name: formData.get('name'),
                                    customer_email: formData.get('email'),
                                    message: formData.get('message')
                                }]);
                                if (error) throw error;
                                import('react-hot-toast').then(t => t.default.success('Inquiry sent successfully! Our concierge will reach out.'));
                                e.target.reset();
                            } catch (err) {
                                import('react-hot-toast').then(t => t.default.error('Failed to send inquiry. Please try again.'));
                            } finally {
                                btn.disabled = false;
                                btn.innerText = originalText;
                            }
                        }}>
                            <div className="space-y-2 col-span-2 lg:col-span-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Your Name</label>
                                <input required name="name" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-slate-100" placeholder="Type name..." />
                            </div>
                            <div className="space-y-2 col-span-2 lg:col-span-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Email</label>
                                <input required name="email" type="email" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-slate-100" placeholder="your@email.com" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Your Message</label>
                                <textarea required name="message" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-slate-100 h-32 resize-none" placeholder="How can we help make your jewelry experience special?" />
                            </div>
                            <button type="submit" className="col-span-2 bg-slate-900 text-white p-5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all disabled:opacity-50">Send Message</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            {/* --- FOOTER --- */}
            <Footer storeName={storeInfo.storeName} />

            {/* --- MENU DRAWER --- */}

        </div>
    );
}

function TrustBadge({ icon, title, desc }) {
    return (
        <div className="space-y-3 flex flex-col items-center group cursor-default">
            <div className="p-4 bg-slate-50 rounded-2xl group-hover:scale-110 group-hover:bg-slate-900 transition-all duration-500 group-hover:text-white">
                {icon}
            </div>
            <h5 className="font-bold text-sm">{title}</h5>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{desc}</p>
        </div>
    );
}

function ContactItem({ icon, title, detail }) {
    return (
        <div className="flex items-center gap-4 group cursor-pointer text-left">
            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">{icon}</div>
            <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-sm font-bold text-slate-900">{detail}</p>
            </div>
        </div>
    );
}
