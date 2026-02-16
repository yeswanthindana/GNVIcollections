import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // OWNER BYPASS: If email is empty or specific, allow PIN access
        if (password === '1995' || password === 'GNVI1995' || (email === 'rsowjanya2012@gmail.com' && password === 'Sowjanya@96')) {
            localStorage.setItem('gnvi_owner_session', 'active');
            toast.success('Owner Verified: Welcome back, Sowjanya');
            window.location.reload(); // Force App to pick up new localStorage
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Access Granted to GNVI Command Center');
            navigate('/admin');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-luxury-cream flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=2000)' }}>
            <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl lg:bg-white/40"></div>

            <div className="relative w-full max-w-md">
                <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-luxury-gold transition-colors mb-12">
                    <ArrowLeft size={14} /> Back to Collection
                </Link>

                <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-white">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-playfair font-black text-luxury-black mb-4">GNVI ADMIN</h1>
                        <p className="text-gray-400 text-sm font-medium">Secured Entry for Collection Managers</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">Boutique Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    required
                                    type="email"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                                    placeholder="manager@gnvi.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">Passcode</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    required
                                    type="password"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-luxury-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-luxury-gold disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-xl shadow-luxury-gold/10"
                        >
                            {loading ? <Loader2 className="mx-auto animate-spin" /> : 'Authorize Access'}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Encrypted Authentication</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
