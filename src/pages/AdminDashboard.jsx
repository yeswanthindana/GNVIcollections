import React, { useState, useEffect } from 'react';
import {
    Plus, Package, DollarSign, LayoutDashboard, Settings,
    LogOut, Trash2, Edit, CheckCircle2, XCircle,
    FileText, TrendingUp, AlertCircle, Upload, Search,
    MoreVertical, Filter, ChevronRight, Layers, FileDigit, Image as ImageIcon,
    Sparkles, Eye, ShieldCheck, Globe, X, ShoppingCart, ShoppingBag, Percent, Store, Mail, Phone, MapPin, History, MessageSquare, Clock, User as UserIcon,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [history, setHistory] = useState([]);
    const [requests, setRequests] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const navigate = useNavigate();

    // Store Settings (Local State for now)
    const [storeSettings, setStoreSettings] = useState(() => {
        const saved = localStorage.getItem('gnvi_store_settings');
        return saved ? JSON.parse(saved) : {
            storeName: 'GNVI Collections',
            supportEmail: 'support@gnvi.com',
            phone: '+91 98765 43210',
            address: 'Visakhapatnam, Andhra Pradesh, India',
            currency: '₹',
            maintenanceMode: false
        };
    });

    // Form States
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        original_price: '',
        current_price: '',
        category_id: '',
        stock_status: 'In Stock',
        image_url: '',
        rating: 5,
        featured: false
    });

    const [productImageFile, setProductImageFile] = useState(null);

    useEffect(() => {
        const channel = supabase
            .channel('dashboard_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    // New order arrived! Refresh to get items.
                    fetchData();
                    toast.success('New Order Received! 🔔');
                } else if (payload.eventType === 'UPDATE') {
                    // Realtime status update
                    setOrders((prev) => prev.map((order) =>
                        order.id === payload.new.id ? { ...order, ...payload.new } : order
                    ));
                } else if (payload.eventType === 'DELETE') {
                    setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('gnvi_store_settings', JSON.stringify(storeSettings));
    }, [storeSettings]);

    async function fetchData() {
        setLoading(true);
        try {
            // Parallel fetching
            const [catRes, prodRes, histRes, reqRes, ordRes] = await Promise.all([
                supabase.from('categories').select('*'),
                supabase.from('products').select('*, categories:category_id(name)').order('created_at', { ascending: false }),
                supabase.from('product_history').select('*').order('changed_at', { ascending: false }).limit(20),
                supabase.from('customer_requests').select('*').order('created_at', { ascending: false }),
                supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
            ]);

            if (catRes.data) setCategories(catRes.data);

            // Handle product mapping if join fails
            let prodData = prodRes.data;
            if (prodRes.error) {
                const { data: rawData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
                const catMap = (catRes.data || []).reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});
                prodData = rawData?.map(p => ({
                    ...p,
                    categories: { name: catMap[p.category_id] || 'Jewelry' }
                }));
            }
            if (prodData) setProducts(prodData);
            if (histRes.data) setHistory(histRes.data);
            if (reqRes.data) setRequests(reqRes.data);
            if (ordRes.data) setOrders(ordRes.data);

        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const savePromise = async () => {
            let finalImageUrl = formData.image_url;
            if (productImageFile) {
                const fileExt = productImageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `products/${fileName}`;
                await supabase.storage.from('products').upload(filePath, productImageFile);
                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
                finalImageUrl = publicUrl;
            }

            const cleanData = {
                sku: formData.sku,
                name: formData.name,
                description: formData.description,
                original_price: Number(formData.original_price),
                current_price: Number(formData.current_price),
                image_url: finalImageUrl,
                category_id: formData.category_id || null,
                stock_status: formData.stock_status,
                featured: formData.featured,
                rating: Number(formData.rating) || 5
            };

            let result;
            if (editingProduct) {
                result = await supabase.from('products').update(cleanData).eq('id', editingProduct.id);
            } else {
                result = await supabase.from('products').insert([cleanData]);
            }
            if (result.error) throw result.error;
        };

        toast.promise(savePromise(), {
            loading: 'Saving masterpiece...',
            success: () => {
                fetchData();
                setShowProductModal(false);
                setEditingProduct(null);
                setProductImageFile(null);
                setFormData({ sku: '', name: '', description: '', original_price: '', current_price: '', category_id: '', stock_status: 'In Stock', image_url: '', rating: 5, featured: false });
                return 'Inventory synchronized!';
            },
            error: (err) => `Sync failed: ${err.message}`
        });
    };

    const handleDeleteProduct = async (product) => {
        if (!window.confirm(`Are you certain you wish to remove "${product.name}" from the collection? This action is permanent.`)) return;

        const deletePromise = async () => {
            // 1. Delete image from storage if it exists and is internal
            if (product.image_url && product.image_url.includes('supabase.co')) {
                try {
                    const path = product.image_url.split('products/').pop();
                    await supabase.storage.from('products').remove([`products/${path}`]);
                } catch (e) { console.error("Storage delete failed", e); }
            }

            // 2. Delete product from DB (Trigger will handle history)
            const { error } = await supabase.from('products').delete().eq('id', product.id);
            if (error) throw error;
            fetchData();
        };

        toast.promise(deletePromise(), {
            loading: 'Removing masterpiece...',
            success: 'Product successfully removed from collection',
            error: (err) => `Failed to remove product: ${err.message}`
        });
    };

    const handleResolveRequest = async (id) => {
        const promise = async () => {
            const { error } = await supabase.from('customer_requests').update({ status: 'Resolved' }).eq('id', id);
            if (error) throw error;
            fetchData();
        };

        toast.promise(promise(), {
            loading: 'Updating...',
            success: 'Inquiry resolved and archived',
            error: 'Failed to update'
        });
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        let updateData = { status: newStatus };

        if (newStatus === 'Rejected') {
            const reason = window.prompt("Please enter reason for rejection:");
            if (!reason) return;
            updateData.rejection_reason = reason;
        }

        if (newStatus === 'Shipped') {
            const courier = window.prompt("Enter Courier Service Name:");
            if (!courier) return;
            const tracking = window.prompt("Enter Tracking ID:");
            if (!tracking) return;
            updateData.courier_name = courier;
            updateData.tracking_id = tracking;
        }

        // Optimistic UI Update: React instantly!
        setOrders(prevOrders => prevOrders.map(order =>
            order.id === orderId ? { ...order, ...updateData } : order
        ));

        const promise = async () => {
            const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
            if (error) {
                console.error('Update Order Error:', error);
                fetchData(); // Sync: revert optimistic update
                throw new Error(error.message); // throw specifically for toast
            }
            // Success! Realtime listener will handle the rest.
        };

        toast.promise(promise(), {
            loading: 'Syncing...',
            success: `Order marked as ${newStatus}`,
            error: (err) => `Sync Failed: ${err.message}`
        });
    };


    const stats = {
        total: products.length,
        value: products.reduce((acc, p) => acc + Number(p.current_price), 0),
        featured: products.filter(p => p.featured).length,
        outOfStock: products.filter(p => p.stock_status !== 'In Stock').length
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0 p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                        <Store size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">GNVI</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Management</p>
                    </div>
                </div>

                <nav className="space-y-2 grow">
                    <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={18} />} label="Inventory" />
                    <NavBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={18} />} label="Orders" count={orders.filter(o => o.status === 'Processing').length} />
                    <NavBtn active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={<MessageSquare size={18} />} label="Customer Inquiries" count={requests.filter(r => r.status === 'Pending').length} />
                    <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18} />} label="Activity Log" />
                    <NavBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<TrendingUp size={18} />} label="Analytics" />
                    <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18} />} label="Store Profile" />
                </nav>

                <button
                    onClick={async () => {
                        localStorage.removeItem('gnvi_owner_session');
                        await supabase.auth.signOut();
                        window.location.replace('/');
                    }}
                    className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all text-sm font-bold mt-8"
                >
                    <LogOut size={18} /> Exit Console
                </button>
            </aside>

            {/* Main Content */}
            <main className="grow p-8 lg:p-12 overflow-y-auto h-screen">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('_', ' ')}</h2>
                        <p className="text-slate-400 font-medium mt-1">Control center for your luxury boutique variety.</p>
                    </div>
                    {activeTab === 'products' && (
                        <button onClick={() => setShowProductModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-2xl shadow-slate-900/20 active:scale-95 transition-all hover:bg-slate-800">
                            <Plus size={20} /> New Addition
                        </button>
                    )}
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'products' && (
                        <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="grid grid-cols-4 gap-6">
                                <StatCard label="Live Catalog" value={stats.total} icon={<Layers size={14} className="text-blue-500" />} />
                                <StatCard label="Featured Variety" value={stats.featured} icon={<Sparkles size={14} className="text-amber-500" />} />
                                <StatCard label="Valuation" value={`${storeSettings.currency}${stats.value.toLocaleString()}`} icon={<DollarSign size={14} className="text-green-500" />} />
                                <StatCard label="Critical Stock" value={stats.outOfStock} icon={<AlertCircle size={14} className="text-red-500" />} />
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-4">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            <th className="px-6 py-6 font-black">Visual & Identity</th>
                                            <th className="px-6 py-6 font-black">SKU / ID</th>
                                            <th className="px-6 py-6 font-black">Classification</th>
                                            <th className="px-6 py-6 font-black">Current Price</th>
                                            <th className="px-6 py-6 font-black">Status</th>
                                            <th className="px-6 py-6 font-black text-right">Settings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-slate-50">
                                        {products.map(p => (
                                            <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-6 flex items-center gap-4">
                                                    <div className="h-16 w-16 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shrink-0">
                                                        <img src={p.image_url || 'https://via.placeholder.com/100'} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{p.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-50">{p.categories?.name || 'Jewelry'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block border border-slate-100">
                                                        {p.sku || p.id.slice(0, 8)}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-slate-100">{p.categories?.name || 'Jewelry'}</span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="font-black text-slate-900">{storeSettings.currency}{p.current_price?.toLocaleString()}</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${p.stock_status === 'In Stock' ? 'text-green-600' : 'text-red-500'}`}>
                                                        <div className={`w-2 h-2 rounded-full ${p.stock_status === 'In Stock' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}></div>
                                                        {p.stock_status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => { setEditingProduct(p); setFormData(p); setShowProductModal(true); }} className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all" title="Edit Masterpiece">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteProduct(p)} className="p-3 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl transition-all" title="Remove Permanently">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl">
                            {orders.length === 0 ? (
                                <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">No Orders Yet</div>
                            ) : (
                                <div className="space-y-6">
                                    {orders.map(order => (
                                        <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8 pb-8 border-b border-slate-50">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full 
                                                            ${order.status === 'Processing' ? 'bg-amber-50 text-amber-600' :
                                                                order.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                                                    'bg-green-50 text-green-600'}`}>{order.status}</span>
                                                        <span className="text-slate-300">/</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(order.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900">{order.customer_name}</h3>
                                                    <div className="flex flex-col gap-1 text-xs font-bold text-slate-400">
                                                        <span className="flex items-center gap-2"><Mail size={14} /> {order.customer_email}</span>
                                                        <span className="flex items-center gap-2"><Phone size={14} /> {order.customer_phone || 'N/A'}</span>
                                                        <span className="flex items-center gap-2"><MapPin size={14} /> {order.customer_address}</span>
                                                    </div>

                                                    {order.status === 'Rejected' && (
                                                        <div className="mt-2 p-3 bg-red-50 rounded-xl text-xs font-bold text-red-600 border border-red-100">
                                                            Reason: {order.rejection_reason}
                                                        </div>
                                                    )}

                                                    {order.status === 'Shipped' && (
                                                        <div className="mt-2 p-3 bg-blue-50 rounded-xl text-xs font-bold text-blue-600 border border-blue-100">
                                                            Courier: {order.courier_name} | Tracking: {order.tracking_id}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Valuation</p>
                                                    <p className="text-3xl font-black text-slate-900">{storeSettings.currency}{order.total_amount.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Order Manifest</h4>
                                                <div className="grid gap-4">
                                                    {order.order_items?.map(item => (
                                                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-300 border border-slate-100 text-xs">x{item.quantity}</div>
                                                                <div>
                                                                    <p className="font-bold text-sm text-slate-900">{item.product_name}</p>
                                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SKU: {item.product_id?.slice(0, 8) || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <p className="font-bold text-sm text-slate-900">{storeSettings.currency}{item.price_at_time.toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap justify-end gap-3 mt-8 pt-6 border-t border-slate-50">
                                                <a href={`mailto:${order.customer_email}?subject=Regarding Order #${order.id.slice(0, 8)}`} className="px-6 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">Contact Client</a>

                                                <div className="w-full mt-4">
                                                    {order.status === 'Processing' ? (
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={() => handleUpdateOrderStatus(order.id, 'Rejected')}
                                                                className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors border border-red-100"
                                                            >
                                                                Reject Order
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateOrderStatus(order.id, 'Confirmed')}
                                                                className="px-6 py-3 bg-slate-900 rounded-xl text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-lg hover:shadow-slate-900/20"
                                                            >
                                                                Confirm Order
                                                            </button>
                                                        </div>
                                                    ) : order.status === 'Rejected' ? (
                                                        <div className="text-right text-xs font-bold text-red-400 uppercase tracking-widest">
                                                            Order Closed
                                                        </div>
                                                    ) : (
                                                        <div className="bg-slate-50 p-4 rounded-2xl flex flex-wrap items-center gap-2 justify-between">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Fulfillment Pipeline</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {['Confirmed', 'Packing', 'Ready for Shipping', 'Shipped'].map((step, idx) => {
                                                                    // Determine if this step is "active", "completed", or "upcoming"
                                                                    const steps = ['Confirmed', 'Packing', 'Ready for Shipping', 'Shipped', 'Delivered'];
                                                                    const currentIdx = steps.indexOf(order.status);
                                                                    const stepIdx = steps.indexOf(step);

                                                                    const isActive = order.status === step;
                                                                    const isPast = currentIdx > stepIdx;

                                                                    return (
                                                                        <button
                                                                            key={step}
                                                                            onClick={() => handleUpdateOrderStatus(order.id, step)}
                                                                            disabled={isPast || isActive}
                                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2
                                                                                ${isActive
                                                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                                                                                    : isPast
                                                                                        ? 'bg-green-50 text-green-600 border-green-100 opacity-80 cursor-default'
                                                                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'
                                                                                }`}
                                                                        >
                                                                            {isPast && <CheckCircle2 size={12} />}
                                                                            {step}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'requests' && (
                        <motion.div key="requests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-5xl">
                            {requests.length === 0 ? (
                                <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">No Inquiries Yet</div>
                            ) : (
                                <div className="grid gap-6">
                                    {requests.map(req => (
                                        <div key={req.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${req.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>{req.status}</span>
                                                    <span className="text-slate-300">/</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(req.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900">{req.customer_name}</h3>
                                                <p className="text-slate-500 text-sm leading-relaxed max-w-xl">{req.message}</p>
                                                <div className="flex gap-6 pt-2">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Mail size={14} /> {req.customer_email}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                                                <a href={`mailto:${req.customer_email}?subject=Regarding your inquiry to GNVI Collections`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all text-center flex items-center justify-center gap-2">
                                                    <Mail size={14} /> Reply
                                                </a>
                                                {req.status !== 'Resolved' && (
                                                    <button onClick={() => handleResolveRequest(req.id)} className="bg-slate-50 text-slate-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2">
                                                        <CheckCircle2 size={14} /> Resolve
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 max-w-4xl">
                            {history.length === 0 ? (
                                <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">No Activity Logged Yet</div>
                            ) : (
                                <div className="relative border-l-4 border-slate-900/5 ml-4 space-y-12">
                                    {history.map(item => (
                                        <div key={item.id} className="relative pl-10">
                                            <div className={`absolute -left-[14px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-white ring-8 ring-[#F8FAFC] 
                                                ${item.change_type?.includes('Order') ? 'bg-indigo-600' : 'bg-slate-900'}`}>
                                                {item.change_type?.includes('Order') ? <ShoppingBag size={12} /> : <Clock size={12} />}
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <span>{item.change_type}</span>
                                                    <span>{new Date(item.changed_at).toLocaleString()}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900">{item.product_name}</h4>
                                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Before</p>
                                                        <p className="text-xs font-bold text-slate-500 line-through truncate max-w-[150px]">{item.old_value}</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-300" />
                                                    <div>
                                                        <p className="text-[8px] font-black text-amber-500 uppercase mb-1">After</p>
                                                        <p className="text-sm font-black text-slate-900 truncate max-w-[150px]">{item.new_value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Layers size={24} /></div>
                                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Inventory Mix</h4>
                                    <div className="space-y-4">
                                        {categories.map(cat => (
                                            <div key={cat.id} className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-600">{cat.name}</span>
                                                <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded-md">
                                                    {products.filter(p => p.category_id === cat.id).length} Items
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><Percent size={24} /></div>
                                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pricing Strategy</h4>
                                    <p className="text-4xl font-black text-slate-900">Active</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Smart discount calculation is applied to {products.filter(p => p.original_price > p.current_price).length} varieties in current catalog.</p>
                                </div>
                                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                                    <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Sparkles size={24} /></div>
                                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Store Health</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-slate-50 text-xs font-bold">
                                            <span className="text-slate-500">Featured Slots</span>
                                            <span>{stats.featured} / 12</span>
                                        </div>
                                        <div className="flex justify-between py-2 text-xs font-bold">
                                            <span className="text-slate-500">Stock Warnings</span>
                                            <span className="text-red-500">{stats.outOfStock}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl space-y-8">
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm grid md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <h4 className="text-lg font-black flex items-center gap-3"><Store size={22} className="text-slate-900" /> Store Identity</h4>
                                    <div className="space-y-6">
                                        <FormInput label="Boutique Name" value={storeSettings.storeName} onChange={(v) => setStoreSettings({ ...storeSettings, storeName: v })} />
                                        <FormInput label="Official Email" value={storeSettings.supportEmail} onChange={(v) => setStoreSettings({ ...storeSettings, supportEmail: v })} />
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <h4 className="text-lg font-black flex items-center gap-3"><Globe size={22} className="text-slate-900" /> Regional Values</h4>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency Locale</label>
                                            <select className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-slate-900/10 transition-all font-black text-xs" value={storeSettings.currency} onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}>
                                                <option value="₹">Indian Rupee (₹)</option>
                                                <option value="$">US Dollar ($)</option>
                                                <option value="€">Euro (€)</option>
                                            </select>
                                        </div>
                                        <FormInput label="Atelier Address" value={storeSettings.address} onChange={(v) => setStoreSettings({ ...storeSettings, address: v })} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex items-center justify-between">
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black">Permanent Sync</h4>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-loose">Updates will be synced to your local boutique profile immediately.</p>
                                </div>
                                <button onClick={() => toast.success('Atelier Profile Updated')} className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl">Apply Changes</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* --- PRODUCT MODAL --- */}
            <AnimatePresence>
                {showProductModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                            <header className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="text-2xl font-black tracking-tight">{editingProduct ? 'Refine Variety' : 'New Creation'}</h3>
                                <button onClick={() => { setShowProductModal(false); setEditingProduct(null); }} className="p-3 hover:bg-slate-50 rounded-2xl"><X size={24} /></button>
                            </header>
                            <form onSubmit={handleProductSubmit} className="p-10 space-y-6 overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-2 gap-6">
                                    <FormInput label="Identifier / SKU" value={formData.sku} onChange={v => setFormData({ ...formData, sku: v })} placeholder="e.g. BR-KOR-01" />
                                    <FormInput label="Display Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="Masterpiece Name" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <FormInput label={`Sale Price (${storeSettings.currency})`} type="number" value={formData.current_price} onChange={v => setFormData({ ...formData, current_price: v })} />
                                    <FormInput label={`MRP (${storeSettings.currency})`} type="number" value={formData.original_price} onChange={v => setFormData({ ...formData, original_price: v })} />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Classification</label>
                                        <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border-none outline-none ring-1 ring-slate-100 focus:ring-slate-900" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                            <option value="">Select Genre</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Availability</label>
                                        <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border-none outline-none ring-1 ring-slate-100 focus:ring-slate-900" value={formData.stock_status} onChange={e => setFormData({ ...formData, stock_status: e.target.value })}>
                                            <option value="In Stock">In Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="featured-admin" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} />
                                    <label htmlFor="featured-admin" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer">Feature on Home Page</label>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Visual</label>
                                    <div className="relative h-48 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group overflow-hidden transition-all hover:border-slate-400">
                                        {formData.image_url || productImageFile ? (
                                            <img src={productImageFile ? URL.createObjectURL(productImageFile) : formData.image_url} className="h-full w-full object-contain p-6" />
                                        ) : (
                                            <div className="text-center">
                                                <ImageIcon size={32} className="text-slate-300 mx-auto mb-3" />
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Drop masterpiece image</p>
                                            </div>
                                        )}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setProductImageFile(e.target.files[0])} />
                                    </div>
                                </div>
                            </form>
                            <footer className="p-8 border-t border-slate-50">
                                <button onClick={handleProductSubmit} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all active:scale-95">Complete Update</button>
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function NavBtn({ active, icon, label, onClick, count }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${active ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/30' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest">
                {icon} {label}
            </div>
            {count > 0 && <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-full">{count}</span>}
        </button>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-slate-50 rounded-xl mb-2">{icon}</div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
            <h4 className="text-2xl font-black text-slate-900">{value}</h4>
        </div>
    );
}

function FormInput({ label, value, onChange, placeholder, type = "text", disabled }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
            <input required type={type} disabled={disabled} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border-none outline-none ring-1 ring-slate-100 focus:ring-slate-900/10 placeholder:text-slate-300 transition-all disabled:opacity-50" />
        </div>
    );
}
