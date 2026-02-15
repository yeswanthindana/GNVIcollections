import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function CartDrawer() {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const [step, setStep] = useState('cart'); // 'cart' or 'checkout'
    const [loading, setLoading] = useState(false);

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        // Generate ID client-side to bypass SELECT policy restriction for anon users
        const orderId = crypto.randomUUID();

        const orderBuffer = {
            id: orderId,
            customer_name: formData.get('name'),
            customer_phone: formData.get('phone'),
            customer_email: formData.get('email'),
            customer_address: formData.get('address'),
            total_amount: cartTotal,
            status: 'Processing'
        };

        try {
            // 1. Create Order (No .select() needed)
            const { error: orderError } = await supabase
                .from('orders')
                .insert([orderBuffer]);

            if (orderError) throw orderError;

            // 2. Create Order Items
            const itemsBuffer = cartItems.map(item => ({
                order_id: orderId,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price_at_time: item.current_price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsBuffer);

            if (itemsError) throw itemsError;

            // Success
            toast.success('Order placed successfully! Concierge will contact you shortly.');
            clearCart();
            setIsCartOpen(false);
            setStep('cart');
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                                <ShoppingBag size={20} />
                                {step === 'cart' ? 'Your Selection' : 'Secure Checkout'}
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                        <ShoppingBag size={32} />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your bag is empty</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 text-slate-900 font-bold border-b-2 border-slate-900 hover:text-slate-600 hover:border-slate-600 transition-all text-sm"
                                    >
                                        Start Collecting
                                    </button>
                                </div>
                            ) : step === 'cart' ? (
                                <div className="space-y-6">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                                <img
                                                    src={item.image_url || 'https://via.placeholder.com/100'}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-sm text-slate-900 truncate pr-4">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">
                                                    {item.categories?.name || 'Jewelry'}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm hover:shadow-md transition-all text-xs font-bold"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm hover:shadow-md transition-all text-xs font-bold"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="font-bold text-sm">₹{(item.current_price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                                        <h4 className="font-bold text-sm mb-4">Order Summary</h4>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-500">Subtotal ({cartItems.length} items)</span>
                                            <span className="font-bold">₹{cartTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-500">Shipping</span>
                                            <span className="text-green-600 font-bold">Free</span>
                                        </div>
                                        <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between font-black text-lg">
                                            <span>Total</span>
                                            <span>₹{cartTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Full Name</label>
                                            <input required name="name" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. Aditi Sharma" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Mobile Number</label>
                                            <input required name="phone" type="tel" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. +91 98765 43210" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Email Address</label>
                                            <input required name="email" type="email" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. aditi@example.com" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Shipping Address</label>
                                            <textarea required name="address" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-slate-900 h-32 resize-none" placeholder="Enter complete address with pincode..." />
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50">
                                {step === 'cart' ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end mb-4">
                                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Valuation</span>
                                            <span className="text-2xl font-black text-slate-900">₹{cartTotal.toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={() => setStep('checkout')}
                                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20"
                                        >
                                            Proceed to Checkout <ArrowRight size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <button
                                            form="checkout-form"
                                            disabled={loading}
                                            type="submit"
                                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Processing...' : 'Confirm Order'}
                                        </button>
                                        <button
                                            onClick={() => setStep('cart')}
                                            className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 py-2"
                                        >
                                            Back to Cart
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
