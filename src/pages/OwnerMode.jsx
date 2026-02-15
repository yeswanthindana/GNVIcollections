import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Plus, Package, DollarSign, Settings, LogOut, TrendingUp, Trash2,
    Edit, ShoppingBag, Search, Filter, Layers, BarChart3, Users,
    ChevronRight, MoreVertical, LayoutGrid, List, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OwnerMode() {
    const [activeTab, setActiveTab] = useState('inventory');
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        image_url: '',
        available: true,
        category: 'Electronics'
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const { data: saleData } = await supabase.from('sales').select('*, products(name)').order('sale_date', { ascending: false });

        setProducts(prodData || []);
        setSales(saleData || []);
        setLoading(false);
    }

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('products').insert([newProduct]);
        if (!error) {
            setShowAddProduct(false);
            setNewProduct({ name: '', description: '', price: '', image_url: '', available: true, category: 'Electronics' });
            fetchData();
        }
    };

    const toggleAvailability = async (id, currentStatus) => {
        await supabase.from('products').update({ available: !currentStatus }).eq('id', id);
        fetchData();
    };

    const recordSale = async (product) => {
        const { error } = await supabase.from('sales').insert([{
            product_id: product.id,
            amount: product.price,
            quantity: 1,
            notes: `Manual sale of ${product.name}`
        }]);
        if (!error) fetchData();
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Delete this product permanently?')) {
            await supabase.from('products').delete().eq('id', id);
            fetchData();
        }
    };

    const logout = () => supabase.auth.signOut();

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-layout">
            {/* Professional Sidebar */}
            <aside className="admin-sidebar shadow-sm">
                <div className="mb-10 px-4">
                    <h1 className="text-xl font-black text-primary flex items-center gap-2">
                        <ShoppingBag /> Seller Central
                    </h1>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Global Dashboard</p>
                </div>

                <nav className="flex flex-col gap-1">
                    <SidebarBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={18} />} label="Inventory" count={products.length} />
                    <SidebarBtn active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={<BarChart3 size={18} />} label="Sales Analysis" />
                    <SidebarBtn active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} icon={<Users size={18} />} label="Customers" />
                </nav>

                <div className="mt-auto pt-10 px-4 border-t border-border-color">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 text-text-muted hover:text-red-600 transition-colors w-full text-left font-semibold text-sm"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Full Width Workspace */}
            <main className="admin-main">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#0f172a] capitalize">{activeTab} Hub</h2>
                        <p className="text-text-muted text-sm mt-1">Update your store catalog and track real-time metrics.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {activeTab === 'inventory' && (
                            <div className="relative flex-grow md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search inventory..."
                                    className="w-full pl-11 pr-4 h-11 border border-border-color rounded-lg bg-white outline-none focus:border-primary text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}
                        <button
                            onClick={() => setShowAddProduct(true)}
                            className="btn btn-primary h-11 px-6 shadow-sm"
                        >
                            <Plus size={18} /> Add Product
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'inventory' ? (
                            <motion.div
                                key="inventory"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="data-table-container shadow-sm"
                            >
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product Information</th>
                                            <th>Category</th>
                                            <th>Pricing</th>
                                            <th>Stock Level</th>
                                            <th className="text-right pr-6">Manage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(p => (
                                            <tr key={p.id} className="hover:bg-[#fcfdfe] transition-colors">
                                                <td>
                                                    <div className="flex items-center gap-4">
                                                        <img src={p.image_url || 'https://via.placeholder.com/50'} className="h-10 w-10 rounded-lg object-cover border border-border-color" />
                                                        <div>
                                                            <p className="font-bold text-sm">{p.name}</p>
                                                            <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{p.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="badge badge-blue">{p.category || 'General'}</span></td>
                                                <td className="font-bold font-mono text-sm">${p.price}</td>
                                                <td>
                                                    <button
                                                        onClick={() => toggleAvailability(p.id, p.available)}
                                                        className={`badge ${p.available ? 'badge-green' : 'badge-red'} cursor-pointer hover:opacity-80 transition-opacity`}
                                                    >
                                                        {p.available ? 'In Stock' : 'Draft'}
                                                    </button>
                                                </td>
                                                <td>
                                                    <div className="flex items-center justify-end gap-2 pr-6">
                                                        <button onClick={() => recordSale(p)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Quick Sale"><TrendingUp size={16} /></button>
                                                        <button className="p-2 text-primary hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                                        <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredProducts.length === 0 && (
                                    <div className="p-20 text-center">
                                        <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                                        <h3 className="text-lg font-bold">No results found</h3>
                                        <p className="text-text-muted text-sm">Try adjusting your filters or search terms.</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                <div className="stat-grid">
                                    <div className="stat-card">
                                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                                        <h3 className="text-3xl font-black">${sales.reduce((acc, s) => acc + (s.amount || 0), 0).toLocaleString()}</h3>
                                    </div>
                                    <div className="stat-card">
                                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Orders</p>
                                        <h3 className="text-3xl font-black">{sales.length}</h3>
                                    </div>
                                    <div className="stat-card">
                                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Stock Value</p>
                                        <h3 className="text-3xl font-black">${products.reduce((acc, p) => acc + (p.price || 0), 0).toLocaleString()}</h3>
                                    </div>
                                </div>

                                <div className="data-table-container">
                                    <div className="p-6 border-b border-border-color bg-[#fcfdfe] flex justify-between items-center">
                                        <h3 className="font-bold">Recent Transactions</h3>
                                    </div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Item</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sales.map(s => (
                                                <tr key={s.id}>
                                                    <td className="text-xs font-medium text-text-muted">{new Date(s.sale_date).toLocaleString()}</td>
                                                    <td className="font-bold">{s.products?.name || 'Item'}</td>
                                                    <td className="font-bold text-green-600">+${s.amount}</td>
                                                    <td><span className="badge badge-green">Paid</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                )}
            </main>

            {/* Add Product Modal */}
            {showAddProduct && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8"
                    >
                        <div className="flex justify-between items-center mb-8 pb-4 border-b">
                            <h3 className="text-xl font-bold">New Product Listing</h3>
                            <button onClick={() => setShowAddProduct(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddProduct} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-text-muted uppercase mb-2 block tracking-widest">Name</label>
                                    <input required className="w-full px-4 h-11 border rounded-lg outline-none focus:border-primary" placeholder="SuperX Headphones..." value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase mb-2 block tracking-widest">Price ($)</label>
                                    <input required type="number" className="w-full px-4 h-11 border rounded-lg outline-none focus:border-primary" placeholder="199.99" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase mb-2 block tracking-widest">Category</label>
                                    <select className="w-full px-4 h-11 border rounded-lg outline-none focus:border-primary" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                        <option>Electronics</option>
                                        <option>Audio</option>
                                        <option>Watches</option>
                                        <option>Computing</option>
                                        <option>Home</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-text-muted uppercase mb-2 block tracking-widest">Image URL</label>
                                    <input className="w-full px-4 h-11 border rounded-lg outline-none focus:border-primary" placeholder="https://..." value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-text-muted uppercase mb-2 block tracking-widest">Description</label>
                                    <textarea className="w-full px-4 py-3 border rounded-lg outline-none focus:border-primary h-24" placeholder="Brief details about the product..." value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddProduct(false)} className="btn btn-secondary flex-grow">Discard</button>
                                <button type="submit" className="btn btn-primary flex-grow">Publish Product</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function SidebarBtn({ active, icon, label, onClick, count }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all relative ${active ? 'bg-blue-50 text-primary' : 'text-text-muted hover:bg-slate-50'}`}
        >
            {icon}
            <span className="flex-grow text-left">{label}</span>
            {count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? 'bg-primary text-white' : 'bg-slate-100 text-text-muted'}`}>
                    {count}
                </span>
            )}
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
        </button>
    );
}

const X = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
