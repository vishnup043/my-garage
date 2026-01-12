
import React, { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Trash2,
    Edit2,
    AlertTriangle,
    ArrowLeft,
    Save,
    X,
    ShieldCheck,
    MapPin,
    Truck,
    ShoppingCart,
    BarChart3,
    Calendar,
    User,
    Phone,
    Mail,
    FileText,
    CheckCircle,
    Clock,
    PlusCircle
} from 'lucide-react';
import { InventoryItem, Supplier, Purchase } from '../types';
import { db } from '../db';

interface InventoryViewProps {
    onBack: () => void;
}

type SubView = 'supplier' | 'product' | 'purchase' | 'stock';

const InventoryView: React.FC<InventoryViewProps> = ({ onBack }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [subView, setSubView] = useState<SubView>('product');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isAddingPurchase, setIsAddingPurchase] = useState(false);

    const [loading, setLoading] = useState(true);

    // Form States
    const [productForm, setProductForm] = useState<Partial<InventoryItem>>({
        quantity: 0,
        unit: 'pcs',
        minStock: 5,
        price: 0
    });

    const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({
        name: '',
        contactPerson: '',
        mobile: '',
        email: '',
        address: '',
        category: ''
    });

    const [purchaseForm, setPurchaseForm] = useState<Partial<Purchase>>({
        purchaseNo: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        supplierId: '',
        items: [],
        totalAmount: 0
    });



    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [inv, sup, pur] = await Promise.all([
                db.getInventory(),
                db.getSuppliers(),
                db.getPurchases()
            ]);
            setItems(inv);
            setSuppliers(sup);
            setPurchases(pur);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Product Handlers ---
    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const item: InventoryItem = {
            ...editingItem,
            id: editingItem?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
            name: productForm.name || '',
            category: productForm.category || '',
            quantity: Number(productForm.quantity) || 0,
            unit: productForm.unit || 'pcs',
            minStock: Number(productForm.minStock) || 0,
            price: Number(productForm.price) || 0,
            lastUpdated: new Date().toISOString()
        };

        try {
            await db.saveInventoryItem(item);
            setIsAdding(false);
            setEditingItem(null);
            resetProductForm();
            loadData();
        } catch (error) {
            alert('Failed to save product');
        }
    };

    const resetProductForm = () => {
        setProductForm({
            quantity: 0,
            unit: 'pcs',
            minStock: 5,
            price: 0
        });
    };

    // --- Supplier Handlers ---
    const handleSaveSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        const supplier: Supplier = {
            id: editingSupplier?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
            name: supplierForm.name || '',
            contactPerson: supplierForm.contactPerson || '',
            mobile: supplierForm.mobile || '',
            email: supplierForm.email || '',
            address: supplierForm.address || '',
            category: supplierForm.category || ''
        };

        try {
            await db.saveSupplier(supplier);
            setIsAdding(false);
            setEditingSupplier(null);
            setSupplierForm({ name: '', contactPerson: '', mobile: '', email: '', address: '', category: '' });
            loadData();
        } catch (error) {
            alert('Failed to save supplier');
        }
    };

    // --- Purchase Handlers ---
    const handleSavePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        const purchase: Purchase = {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
            purchaseNo: purchaseForm.purchaseNo || `PUR-${Math.floor(1000 + Math.random() * 9000)}`,
            purchaseDate: purchaseForm.purchaseDate || '',
            supplierId: purchaseForm.supplierId || '',
            items: purchaseForm.items || [],
            totalAmount: purchaseForm.totalAmount || 0,
            notes: purchaseForm.notes || ''
        };

        try {
            await db.savePurchase(purchase);
            setIsAddingPurchase(false);
            setPurchaseForm({ purchaseNo: '', purchaseDate: new Date().toISOString().split('T')[0], supplierId: '', items: [], totalAmount: 0 });
            loadData();
        } catch (error) {
            alert('Failed to save purchase');
        }
    };

    const addPurchaseItem = (productId: string) => {
        const product = items.find(i => i.id === productId);
        if (!product) return;

        const newItem = {
            productId,
            quantity: 1,
            price: product.price || 0,
            amount: product.price || 0
        };

        const updatedItems = [...(purchaseForm.items || []), newItem];
        const total = updatedItems.reduce((sum, i) => sum + i.amount, 0);
        setPurchaseForm({ ...purchaseForm, items: updatedItems, totalAmount: total });
    };

    // --- Filters ---
    const filteredProducts = items.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPurchases = purchases.filter(p =>
        p.purchaseNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition lg:hidden">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-blue-600" />
                        Inventory Management
                    </h2>
                </div>
                <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                    <button onClick={() => setSubView('supplier')} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${subView === 'supplier' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Supplier</button>
                    <button onClick={() => setSubView('product')} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${subView === 'product' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Product</button>
                    <button onClick={() => setSubView('purchase')} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${subView === 'purchase' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Purchase</button>
                    <button onClick={() => setSubView('stock')} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${subView === 'stock' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Stock</button>

                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
                {subView === 'product' && (
                    <button onClick={() => { resetProductForm(); setIsAdding(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition">
                        <Plus size={20} /> Add Product
                    </button>
                )}
                {subView === 'supplier' && (
                    <button onClick={() => { setSupplierForm({ name: '', contactPerson: '', mobile: '', email: '', address: '', category: '' }); setIsAdding(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition">
                        <Plus size={20} /> Add Supplier
                    </button>
                )}
                {subView === 'purchase' && (
                    <button onClick={() => setIsAddingPurchase(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition">
                        <ShoppingCart size={20} /> New Purchase
                    </button>
                )}

            </div>

            {/* --- Forms --- */}
            {isAdding && subView === 'product' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">{editingItem ? 'Edit Product' : 'Add New Product'}</h3>
                        <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Product Name</label>
                            <input required type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <input required type="text" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Price</label>
                            <input required type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                        </div>

                        <div className="md:col-span-3 pt-4">
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <Save size={20} /> Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isAdding && subView === 'supplier' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                        <button onClick={() => { setIsAdding(false); setEditingSupplier(null); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSaveSupplier} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Supplier Name</label>
                            <input required type="text" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Contact Person</label>
                            <input type="text" value={supplierForm.contactPerson} onChange={e => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Mobile</label>
                            <input type="text" value={supplierForm.mobile} onChange={e => setSupplierForm({ ...supplierForm, mobile: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Address</label>
                            <textarea value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" rows={2} />
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <Save size={20} /> Save Supplier
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isAddingPurchase && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Record New Purchase</h3>
                        <button onClick={() => setIsAddingPurchase(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSavePurchase} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Supplier</label>
                                <select required value={purchaseForm.supplierId} onChange={e => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500">
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Purchase Date</label>
                                <input required type="date" value={purchaseForm.purchaseDate} onChange={e => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="border rounded-xl p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-sm">Purchase Items</h4>
                                <select onChange={e => addPurchaseItem(e.target.value)} value="" className="px-3 py-1 border rounded-lg text-xs">
                                    <option value="">+ Add Item</option>
                                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>
                            {purchaseForm.items?.map((pItem, idx) => (
                                <div key={idx} className="flex items-center gap-4 text-sm">
                                    <span className="flex-1 font-medium">{items.find(i => i.id === pItem.productId)?.name}</span>
                                    <input type="number" value={pItem.quantity} onChange={e => {
                                        const newItems = [...(purchaseForm.items || [])];
                                        newItems[idx].quantity = Number(e.target.value);
                                        newItems[idx].amount = newItems[idx].quantity * newItems[idx].price;
                                        setPurchaseForm({ ...purchaseForm, items: newItems, totalAmount: newItems.reduce((sum, i) => sum + i.amount, 0) });
                                    }} className="w-20 px-2 py-1 border rounded" />
                                    <span className="w-24 text-right">₹{pItem.amount}</span>
                                </div>
                            ))}
                            <div className="pt-4 border-t flex justify-between font-bold">
                                <span>Total Amount</span>
                                <span>₹{purchaseForm.totalAmount}</span>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition">Save Purchase</button>
                    </form>
                </div>
            )}



            {/* --- Lists --- */}
            {subView === 'product' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(item => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest mb-2 inline-block">{item.category}</span>
                                    <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => { setEditingItem(item); setProductForm(item); setIsAdding(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16} /></button>
                                    <button onClick={async () => { if (window.confirm('Delete?')) { await db.deleteInventoryItem(item.id); loadData(); } }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-gray-400 text-[10px] uppercase font-black">Category</p><p className="font-bold">{item.category}</p></div>
                                <div className="text-right"><p className="text-gray-400 text-[10px] uppercase font-black">Price</p><p className="font-bold text-blue-600">₹{item.price}</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {subView === 'supplier' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSuppliers.map(s => (
                        <div key={s.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Truck size={24} /></div>
                                    <div><h4 className="font-bold text-gray-800">{s.name}</h4><p className="text-xs text-gray-400">{s.category}</p></div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => { setEditingSupplier(s); setSupplierForm(s); setIsAdding(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16} /></button>
                                    <button onClick={async () => { if (window.confirm('Delete?')) { await db.deleteSupplier(s.id); loadData(); } }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2"><User size={14} className="text-gray-400" /> {s.contactPerson}</div>
                                <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {s.mobile}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {subView === 'purchase' && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Purchase No</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Items</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPurchases.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-400">{p.purchaseNo}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{suppliers.find(s => s.id === p.supplierId)?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{p.purchaseDate}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-600">₹{p.totalAmount}</td>
                                    <td className="px-6 py-4 text-right text-xs font-bold text-gray-400">{p.items.length} Items</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {subView === 'stock' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.quantity <= item.minStock ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-gray-400 text-[10px] uppercase font-black mb-1">Current Quantity</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-3xl font-black ${item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-800'}`}>{item.quantity}</span>
                                        <span className="text-gray-400 font-bold">{item.unit}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-[10px] uppercase font-black mb-1">Min Level</p>
                                    <p className="font-bold text-gray-600">{item.minStock} {item.unit}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


        </div>
    );
};

export default InventoryView;
