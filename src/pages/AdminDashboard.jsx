import React, { useState, useEffect } from 'react';
import {
    Plus, Package, DollarSign, LayoutDashboard, Settings,
    LogOut, Trash2, Edit, CheckCircle2, XCircle,
    FileText, TrendingUp, AlertCircle, Upload, Search,
    MoreVertical, Filter, ChevronRight, Layers, FileDigit, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('inventory');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        original_price: '',
        current_price: '',
        category_id: '',
        stock_status: 'In Stock',
        image_url: ''
    });

    const [invoiceFile, setInvoiceFile] = useState(null);
    const [productImageFile, setProductImageFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        let { data: prods, error: prodErr } = await supabase
            .from('products')
            .select('*, categories:category_id(name)')
            .order('created_at', { ascending: false });

        if (prodErr) {
            const { data: flatProds, error: flatErr } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            if (!flatErr) prods = flatProds;
        }

        const { data: cats } = await supabase.from('categories').select('*');
        const { data: invs } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });

        if (prods) setProducts(prods);
        if (cats) setCategories(cats);
        if (invs) setInvoices(invs);
        setLoading(false);
    }

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const savePromise = async () => {
            let finalImageUrl = formData.image_url;

            // Image Upload Logic
            if (productImageFile) {
                const fileExt = productImageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `products/${fileName}`;

                const { error: uploadError } = await supabase.storage.from('products').upload(filePath, productImageFile);
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
                finalImageUrl = publicUrl;
            }

            const submissionData = { ...formData, image_url: finalImageUrl };
            const { error } = editingProduct
                ? await supabase.from('products').update(submissionData).eq('id', editingProduct.id)
                : await supabase.from('products').insert([submissionData]);

            if (error) throw error;
        };

        toast.promise(savePromise(), {
            loading: 'Saving treasure...',
            success: () => {
                fetchData();
                setShowProductModal(false);
                setEditingProduct(null);
                setProductImageFile(null);
                setFormData({ name: '', description: '', original_price: '', current_price: '', category_id: '', stock_status: 'In Stock', image_url: '' });
                return 'Product synchronized with the vault!';
            },
            error: 'Failed to update ledger.'
        });
        setLoading(false);
    };

    const handleDeleteProduct = async (id) => {
        if (confirm('Permanently remove this piece from the collection?')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) {
                toast.success('Asset liquidated.');
                fetchData();
            } else {
                toast.error('Deletion failed.');
            }
        }
    };

    const handleInvoiceUpload = async (e) => {
        e.preventDefault();
        if (!invoiceFile) return;

        const fileExt = invoiceFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `invoices/${fileName}`;

        const uploadPromise = async () => {
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, invoiceFile);
            if (uploadError) throw uploadError;

            // 2. Add to Database
            const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(filePath);
            const { error: dbError } = await supabase.from('invoices').insert([{
                file_name: invoiceFile.name,
                file_url: publicUrl
            }]);
            if (dbError) throw dbError;
        };

        toast.promise(uploadPromise(), {
            loading: 'Archiving document...',
            success: () => {
                fetchData();
                setShowInvoiceModal(false);
                setInvoiceFile(null);
                return 'Invoice archived successfully.';
            },
            error: 'Archive failed.'
        });
    };

    const stats = {
        total: products.length,
        inStock: products.filter(p => p.stock_status === 'In Stock').length,
        outOfStock: products.filter(p => p.stock_status === 'Out of Stock').length,
        value: products.reduce((acc, p) => acc + Number(p.current_price), 0).toLocaleString()
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 bg-luxury-black text-white p-8 flex flex-col sticky top-0 h-screen shrink-0">
                <div className="mb-12">
                    <h1 className="text-2xl font-playfair font-black tracking-tighter">GNVI ADMIN</h1>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Management Suite</p>
                </div>

                <nav className="flex flex-col gap-2 grow">
                    <AdminSidebarBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={18} />} label="Vault Inventory" />
                    <AdminSidebarBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<LayoutDashboard size={18} />} label="Global Market" />
                    <AdminSidebarBtn active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} icon={<FileText size={18} />} label="Bill Archives" />
                </nav>

                <div className="pt-8 border-t border-white/5 space-y-4">
                    <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest w-full">
                        <LogOut size={16} /> Relinquish Access
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="grow p-6 lg:p-12 overflow-x-hidden">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <span className="text-[10px] font-black uppercase text-luxury-gold tracking-[0.4em] mb-2 block">Enterprise / {activeTab}</span>
                        <h2 className="text-4xl font-playfair font-black text-luxury-black capitalize">{activeTab} Control</h2>
                    </div>

                    <div className="flex gap-4">
                        {activeTab === 'invoices' ? (
                            <button onClick={() => setShowInvoiceModal(true)} className="bg-luxury-black text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-luxury-gold transition-all">
                                <Upload size={14} /> Upload Bill
                            </button>
                        ) : (
                            <button onClick={() => setShowProductModal(true)} className="bg-luxury-black text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-luxury-gold transition-all">
                                <Plus size={14} /> Add Treasure
                            </button>
                        )}
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-luxury-gold border-t-transparent"></div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'inventory' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#111111] text-white">
                                            <tr>
                                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-white/5">Digital Asset</th>
                                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-white/5">Classification</th>
                                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-white/5">Valuation</th>
                                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-white/5">Vault Status</th>
                                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right border-b border-white/5">Operations</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 italic font-medium">
                                            {products.map(p => (
                                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className="relative group">
                                                                <div className="absolute -inset-1 bg-luxury-gold/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                <img src={p.image_url || 'https://via.placeholder.com/50'} className="relative w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-base text-luxury-black not-italic">{p.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tighter not-italic">Ref: {p.id.slice(0, 8)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="bg-gray-100 text-[10px] font-black uppercase text-gray-500 px-3 py-1.5 rounded-full tracking-widest not-italic">{p.categories?.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-400 text-[10px] line-through">₹{p.original_price}</span>
                                                            <span className="font-bold text-sm text-luxury-black">₹{p.current_price}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${p.stock_status === 'In Stock' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                            {p.stock_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setEditingProduct(p); setFormData(p); setShowProductModal(true); }} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Edit size={16} /></button>
                                                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'analytics' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatBox label="Active Assets" value={stats.total} icon={<Layers className="text-luxury-gold" />} />
                                    <StatBox label="Market Value" value={`₹${stats.value}`} icon={<DollarSign className="text-green-600" />} />
                                    <StatBox label="Secured Items" value={stats.inStock} icon={<CheckCircle2 className="text-blue-600" />} />
                                    <StatBox label="Liquidation Req." value={stats.outOfStock} icon={<AlertCircle className="text-red-600" />} />
                                </div>

                                <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-2xl font-playfair font-black mb-8">Performance Trajectory</h3>
                                    <div className="h-64 flex items-end gap-4 pb-4">
                                        {[40, 70, 45, 90, 65, 85, 55, 95, 30].map((h, i) => (
                                            <div key={i} className="grow bg-luxury-gold/10 rounded-t-lg relative group transition-all hover:bg-luxury-gold/30">
                                                <div style={{ height: `${h}%` }} className="absolute bottom-0 left-0 right-0 bg-luxury-gold rounded-t-lg shadow-lg"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'invoices' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {invoices.map(inv => (
                                    <div key={inv.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group">
                                        <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold group-hover:text-white transition-all">
                                            <FileDigit size={24} />
                                        </div>
                                        <div className="grow overflow-hidden">
                                            <p className="font-bold text-sm truncate uppercase tracking-tighter">{inv.file_name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(inv.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <a href={inv.file_url} target="_blank" className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-luxury-black"><ChevronRight size={18} /></a>
                                    </div>
                                ))}
                                {invoices.length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                                        <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                                        <p className="font-bold text-gray-400 uppercase tracking-widest">No bill archives found.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>

            {/* --- PRODUCT MODAL --- */}
            <AnimatePresence>
                {showProductModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-2xl rounded-3xl p-10 shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-playfair font-black text-luxury-black">{editingProduct ? 'Edit Asset' : 'New Treasure Entry'}</h3>
                                <button onClick={() => { setShowProductModal(false); setEditingProduct(null); }} className="p-2 hover:bg-gray-100 rounded-full"><XCircle size={24} /></button>
                            </div>

                            <form onSubmit={handleProductSubmit} className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Product Name</label>
                                    <input required className="w-full p-3 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-luxury-gold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Original Price ($)</label>
                                    <input required type="number" className="w-full p-3 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-luxury-gold" value={formData.original_price} onChange={e => setFormData({ ...formData, original_price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Current Price ($)</label>
                                    <input required type="number" className="w-full p-3 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-luxury-gold" value={formData.current_price} onChange={e => setFormData({ ...formData, current_price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Collection Category</label>
                                    <select className="w-full p-3 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-luxury-gold" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                        <option value="">Select...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Inventory Status</label>
                                    <select className="w-full p-3 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-luxury-gold" value={formData.stock_status} onChange={e => setFormData({ ...formData, stock_status: e.target.value })}>
                                        <option>In Stock</option>
                                        <option>Out of Stock</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Product Representation (Image)</label>
                                    <div className="flex gap-4 items-center">
                                        {formData.image_url && <img src={formData.image_url} className="w-12 h-12 rounded border" />}
                                        <input
                                            type="file"
                                            className="grow p-2 text-xs border rounded-lg bg-gray-50 border-none outline-none focus:ring-1 focus:ring-luxury-gold"
                                            onChange={e => setProductImageFile(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Artisan Significance (Description)</label>
                                    <textarea className="w-full p-3 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-luxury-gold h-24 resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <button type="submit" className="col-span-2 bg-luxury-black text-white py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-luxury-gold transition-all mt-4">
                                    Synchronize with Archive
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- INVOICE MODAL --- */}
            <AnimatePresence>
                {showInvoiceModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-playfair font-black text-luxury-black">Archive Bill</h3>
                                <button onClick={() => { setShowInvoiceModal(false); setInvoiceFile(null); }} className="p-2 hover:bg-gray-100 rounded-full"><XCircle size={24} /></button>
                            </div>

                            <form onSubmit={handleInvoiceUpload} className="space-y-8">
                                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-10 text-center hover:border-luxury-gold transition-colors group cursor-pointer relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setInvoiceFile(e.target.files[0])} />
                                    <ImageIcon className="mx-auto mb-4 text-gray-200 group-hover:text-luxury-gold transition-all" size={48} />
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest group-hover:text-luxury-black">
                                        {invoiceFile ? invoiceFile.name : 'Select or Drop Invoice'}
                                    </p>
                                </div>

                                <button disabled={!invoiceFile} type="submit" className="w-full bg-luxury-black text-white py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-luxury-gold disabled:bg-gray-100 disabled:text-gray-400 transition-all">
                                    Commit to Archives
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AdminSidebarBtn({ active, icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-sm font-bold uppercase tracking-widest ${active ? 'bg-luxury-gold text-white shadow-xl shadow-luxury-gold/20' : 'text-gray-500 hover:text-white'}`}
        >
            {icon} {label}
        </button>
    );
}

function StatBox({ label, value, icon }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 group hover:border-luxury-gold transition-colors">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-luxury-gold/10 transition-colors">{icon}</div>
                <TrendingUp size={16} className="text-green-500 opacity-20" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <h4 className="text-2xl font-black text-luxury-black">{value}</h4>
            </div>
        </div>
    );
}
