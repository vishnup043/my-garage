
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Search,
    Trash2,
    Download,
    Printer,
    ArrowLeft,
    Save,
    X,
    CheckCircle,
    Clock,
    User,
    Calendar,
    DollarSign,
    Eye,
    Edit2,
    History,
    Wallet,
    MessageCircle,
    MoreVertical,
    Car
} from 'lucide-react';
import { Invoice, Job } from '../types';
import { db } from '../db';

interface InvoiceViewProps {
    onBack: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ onBack }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

    const [formData, setFormData] = useState<Partial<Invoice>>({
        invoiceFor: 'Service Invoice',
        invoiceNumber: '',
        jobId: '',
        customerName: '',
        date: new Date().toISOString().split('T')[0],
        branch: 'Main Branch',
        status: 'Unpaid',
        details: '',
        tax: 0,
        discount: 0,
        totalAmount: 0,
        grandTotal: 0,
        notes: '',
        isInternalNote: false,
        isSharedWithCustomer: false,
        items: []
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (isAdding && !formData.invoiceNumber) {
            const lastInvoice = invoices[0];
            const nextNum = lastInvoice ? (parseInt(lastInvoice.invoiceNumber) + 1).toString().padStart(8, '0') : '00000001';
            setFormData(prev => ({ ...prev, invoiceNumber: nextNum }));
        }
    }, [isAdding, invoices]);

    const calculateTotals = (subtotal: number, taxRate: number, discount: number) => {
        const taxAmount = subtotal * (taxRate / 100);
        const grandTotal = subtotal + taxAmount - (subtotal * (discount / 100));
        return { taxAmount, grandTotal };
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const invoiceData = db.getInvoices();
            const jobData = db.getJobs();
            const branchData = db.getBranches();
            const customerData = db.getCustomers();

            setInvoices(invoiceData.sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber)));
            setJobs(jobData.filter(j => j.status === 'Completed'));
            setBranches(branchData);
            setCustomers(customerData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const invoice: Invoice = {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
            invoiceNumber: formData.invoiceNumber || '',
            invoiceFor: formData.invoiceFor || 'Service Invoice',
            jobId: formData.jobId || '',
            customerName: formData.customerName || '',
            date: formData.date || '',
            branch: formData.branch || 'Main Branch',
            status: formData.status as any || 'Unpaid',
            details: formData.details || '',
            tax: formData.tax || 0,
            discount: formData.discount || 0,
            totalAmount: formData.totalAmount || 0,
            grandTotal: formData.grandTotal || 0,
            notes: formData.notes || '',
            isInternalNote: formData.isInternalNote || false,
            isSharedWithCustomer: formData.isSharedWithCustomer || false,
            items: formData.items || [],
            customerMobile: formData.customerMobile,
            customerEmail: formData.customerEmail,
            customerAddress: formData.customerAddress,

            repairCategory: formData.repairCategory,
            serviceType: formData.serviceType,
            vehicleName: formData.vehicleName,
            plateNumber: formData.plateNumber,
            dateIn: formData.dateIn,
            dateOut: formData.dateOut,
            adjustmentAmount: formData.adjustmentAmount || 0,
            dueAmount: formData.dueAmount || 0
        };

        try {
            await db.saveInvoice(invoice);
            setIsAdding(false);
            resetForm();
            loadData();
        } catch (error) {
            alert('Failed to save invoice');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await db.deleteInvoice(id);
                loadData();
            } catch (error) {
                alert('Failed to delete invoice');
            }
        }
    };

    const handleShare = (invoice: Invoice) => {
        const message = `Hello ${invoice.customerName}, your invoice #${invoice.invoiceNumber} for ₹${invoice.grandTotal} is ready. Status: ${invoice.status}.`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handlePay = async (invoice: Invoice) => {
        const updatedInvoice = { ...invoice, status: 'Paid' as const };
        try {
            await db.saveInvoice(updatedInvoice);
            loadData();
        } catch (error) {
            alert('Failed to update payment status');
        }
    };

    const handleEdit = (invoice: Invoice) => {
        setFormData(invoice);
        setIsAdding(true);
        setOpenMenuId(null);
    };

    const resetForm = () => {
        setFormData({
            invoiceFor: 'Service Invoice',
            invoiceNumber: '',
            jobId: '',
            customerName: '',
            date: new Date().toISOString().split('T')[0],
            branch: 'Main Branch',
            status: 'Unpaid',
            details: '',
            tax: 0,
            discount: 0,
            totalAmount: 0,
            grandTotal: 0,
            notes: '',
            isInternalNote: false,
            isSharedWithCustomer: false,
            items: []
        });
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition lg:hidden">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-blue-600" />
                        Invoices & Billing
                    </h2>
                </div>
                <button
                    onClick={() => { resetForm(); setIsAdding(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Create Invoice
                </button>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by customer or invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>

            {isAdding ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8 border-b pb-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <ArrowLeft size={20} />
                            </button>
                            <h3 className="text-xl font-bold text-gray-800">Add Invoice</h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const nextNum = invoices[0] ? (parseInt(invoices[0].invoiceNumber) + 1).toString().padStart(8, '0') : '00000001';
                                    setFormData(prev => ({ ...prev, invoiceNumber: nextNum }));
                                }}
                                className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition"
                                title="Reset Invoice Number"
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                            <button
                                type="button"
                                className="p-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition"
                                title="Customer Details"
                            >
                                <User size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Invoice Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Invoice For*</label>
                                        <select
                                            required
                                            value={formData.invoiceFor}
                                            onChange={e => setFormData({ ...formData, invoiceFor: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-white border border-green-500 rounded-lg outline-none text-gray-700"
                                        >
                                            <option value="Service Invoice">Service Invoice</option>
                                            <option value="Parts Invoice">Parts Invoice</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Invoice Number*</label>
                                        <div className="flex-1 relative">
                                            <input
                                                required
                                                type="text"
                                                value={formData.invoiceNumber}
                                                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-green-500 rounded-lg outline-none text-gray-700"
                                            />
                                            <CheckCircle size={16} className="absolute right-3 top-3 text-green-500" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Jobcard Number*</label>
                                        <select
                                            required
                                            value={formData.jobId}
                                            onChange={e => {
                                                const job = jobs.find(j => j.id === e.target.value);
                                                const subtotal = job?.charges || 0;
                                                const { grandTotal } = calculateTotals(subtotal, formData.tax || 0, formData.discount || 0);
                                                setFormData({
                                                    ...formData,
                                                    jobId: e.target.value,
                                                    customerName: job?.customerName || '',
                                                    customerMobile: job?.customerMobile || '',
                                                    customerEmail: job?.customerEmail || '',
                                                    customerAddress: job?.customerAddress || '',
                                                    totalAmount: subtotal,
                                                    grandTotal: grandTotal,

                                                    repairCategory: job?.repairCategory || '',
                                                    serviceType: job?.serviceType || '',
                                                    vehicleName: `${job?.brand} ${job?.model}`,
                                                    plateNumber: job?.vehicleNumber || '',
                                                    dateIn: job?.dateIn || '',
                                                    dateOut: job?.dateOut || ''
                                                });
                                            }}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-gray-700"
                                        >
                                            <option value="">Select Jobcard</option>
                                            {jobs.map(j => (
                                                <option key={j.id} value={j.id}>{j.vehicleNumber} - {j.customerName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Invoice Date*</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-gray-700"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Status*</label>
                                        <select
                                            required
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-gray-700"
                                        >
                                            <option value="">Select Payment Status</option>
                                            <option value="Unpaid">Unpaid</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Partial">Partial</option>
                                        </select>
                                    </div>

                                    <div className="flex items-start justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px] pt-2">Details</label>
                                        <textarea
                                            value={formData.details}
                                            onChange={e => setFormData({ ...formData, details: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-gray-700 min-h-[80px]"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 pl-[136px]">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.tax === 5.5}
                                                onChange={e => {
                                                    const tax = e.target.checked ? 5.5 : 0;
                                                    const { grandTotal } = calculateTotals(formData.totalAmount || 0, tax, formData.discount || 0);
                                                    setFormData({ ...formData, tax, grandTotal });
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-600">vat 5 5%</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Customer Name*</label>
                                        <div className="flex-1 relative">
                                            <input
                                                required
                                                type="text"
                                                list="customer-list"
                                                value={formData.customerName}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const customer = customers.find(c => c.name === val);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        customerName: val,
                                                        customerMobile: customer?.mobile || prev.customerMobile,
                                                        customerAddress: customer?.address || prev.customerAddress,
                                                        customerEmail: customer?.email || prev.customerEmail
                                                    }));
                                                }}
                                                readOnly={!!formData.jobId}
                                                className={`w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-gray-700 ${formData.jobId ? 'bg-gray-50' : ''}`}
                                                placeholder="Select or enter customer name"
                                            />
                                            <datalist id="customer-list">
                                                {customers.map((c, i) => (
                                                    <option key={i} value={c.name} />
                                                ))}
                                            </datalist>
                                            {formData.jobId && (
                                                <X
                                                    size={14}
                                                    className="absolute right-3 top-3.5 text-gray-400 cursor-pointer hover:text-red-500 transition"
                                                    onClick={() => setFormData(prev => ({ ...prev, customerName: '', jobId: '' }))}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Total Amount ($)*</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.totalAmount}
                                            onChange={e => {
                                                const subtotal = Number(e.target.value);
                                                const { grandTotal } = calculateTotals(subtotal, formData.tax || 0, formData.discount || 0);
                                                setFormData({ ...formData, totalAmount: subtotal, grandTotal });
                                            }}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-gray-700"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Branch*</label>
                                        <div className="flex-1 relative">
                                            <select
                                                required
                                                value={formData.branch}
                                                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-green-500 rounded-lg outline-none text-gray-700 appearance-none"
                                            >
                                                <option value="">Select Branch</option>
                                                {branches.map(b => (
                                                    <option key={b.id} value={b.name}>{b.name}</option>
                                                ))}
                                            </select>
                                            <CheckCircle size={16} className="absolute right-8 top-3 text-green-500" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Grand Total ($)*</label>
                                        <input
                                            required
                                            readOnly
                                            type="number"
                                            value={formData.grandTotal}
                                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-700 font-bold"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-600 min-w-[120px]">Discount (%)</label>
                                        <input
                                            type="number"
                                            value={formData.discount}
                                            onChange={e => {
                                                const discount = Number(e.target.value);
                                                const { grandTotal } = calculateTotals(formData.totalAmount || 0, formData.tax || 0, discount);
                                                setFormData({ ...formData, discount, grandTotal });
                                            }}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-6 border-t pt-6">
                                <h4 className="text-xl font-bold text-gray-800">Add Notes</h4>
                                <button type="button" className="p-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="flex items-start gap-8">
                                <div className="flex items-center gap-4 min-w-[120px] pt-2">
                                    <span className="text-sm font-medium text-gray-600">Notes</span>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex gap-4">
                                        <textarea
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-gray-700 min-h-[100px]"
                                        />
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                <button type="button" className="px-4 py-2 bg-gray-100 text-sm text-gray-600 border-r border-gray-200 hover:bg-gray-200">Choose Files</button>
                                                <span className="px-4 py-2 text-sm text-gray-400">No file chosen</span>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isInternalNote}
                                                        onChange={e => setFormData({ ...formData, isInternalNote: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-sm text-gray-600">Internal Notes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isSharedWithCustomer}
                                                        onChange={e => setFormData({ ...formData, isSharedWithCustomer: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-sm text-gray-600">Shared with customer</span>
                                                </label>
                                            </div>
                                        </div>
                                        <button type="button" className="p-2 text-gray-400 hover:text-red-500 transition self-start">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-orange-700 transition uppercase tracking-widest"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            ) : null}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-visible">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Invoice No</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading invoices...</td></tr>
                        ) : filteredInvoices.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No invoices found.</td></tr>
                        ) : (
                            filteredInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-400">
                                        #{inv.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{inv.customerName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">₹{inv.grandTotal}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                                            inv.status === 'Unpaid' ? 'bg-red-50 text-red-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}
                                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {openMenuId === inv.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setOpenMenuId(null)}
                                                ></div>
                                                <div className="absolute right-6 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-100 text-left">
                                                    <button
                                                        onClick={() => { setViewingInvoice(inv); setOpenMenuId(null); }}
                                                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                                                    >
                                                        <Eye size={18} className="text-gray-400" />
                                                        View Invoice
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(inv)}
                                                        className="w-full px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-3 transition"
                                                    >
                                                        <Edit2 size={18} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                                                    >
                                                        <History size={18} className="text-gray-400" />
                                                        Payment History
                                                    </button>
                                                    <button
                                                        onClick={() => { handlePay(inv); setOpenMenuId(null); }}
                                                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                                                    >
                                                        <Wallet size={18} className="text-gray-400" />
                                                        Pay
                                                    </button>
                                                    <button
                                                        onClick={() => { handleShare(inv); setOpenMenuId(null); }}
                                                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                                                    >
                                                        <MessageCircle size={18} className="text-emerald-500" />
                                                        Share on WhatsApp
                                                    </button>
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                    <button
                                                        onClick={() => { handleDelete(inv.id); setOpenMenuId(null); }}
                                                        className="w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition"
                                                    >
                                                        <Trash2 size={18} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {viewingInvoice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h2 className="text-2xl font-bold text-gray-800">Garage Management System</h2>
                            <button
                                onClick={() => setViewingInvoice(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Company and Customer Info */}
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                                            <Car size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-800 leading-none">GARAGE</h3>
                                            <p className="text-sm font-bold text-orange-500 tracking-widest uppercase">MASTER</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MessageCircle size={16} className="text-gray-400" />
                                            <span>dhara@dasinfomedia.com</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <span>1234567890</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1"><Search size={16} className="text-gray-400" /></div>
                                            <span>Dasinfomedia, A-206, Shapath Hexa,Ahmedabad, Gujarat , Ahmedabad, Gujarat, India</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <span className="font-bold">{viewingInvoice.customerName}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1"><Search size={16} className="text-gray-400" /></div>
                                            <span>{viewingInvoice.customerAddress || 'Not Provided'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <span>{viewingInvoice.customerMobile || 'Not Provided'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle size={16} className="text-gray-400" />
                                            <span>{viewingInvoice.customerEmail || 'Not Provided'}</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-1">
                                        <p className="text-sm font-bold text-gray-800">Invoice: <span className="font-normal text-gray-600">{viewingInvoice.invoiceNumber}</span></p>
                                        <p className="text-sm font-bold text-gray-800">Status : <span className={`font-bold ${viewingInvoice.status === 'Paid' ? 'text-emerald-600' : 'text-red-600'}`}>{viewingInvoice.status === 'Paid' ? 'Full Paid' : viewingInvoice.status}</span></p>
                                        <p className="text-sm font-bold text-gray-800">Date : <span className="font-normal text-gray-600">{viewingInvoice.date}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Job Details Grid */}
                            <div className="grid grid-cols-4 gap-6 border-t border-gray-100 pt-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Jobcard Number</label>
                                    <p className="font-bold text-gray-800">{viewingInvoice.jobId || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Repair Category</label>
                                    <p className="font-bold text-gray-800">{viewingInvoice.repairCategory || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Vehicle Name</label>
                                    <p className="font-bold text-gray-800">{viewingInvoice.vehicleName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Number Plate</label>
                                    <p className="font-bold text-gray-800">{viewingInvoice.plateNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">In Date</label>
                                    <p className="font-bold text-gray-800">{viewingInvoice.dateIn || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Out Date</label>
                                    <p className="font-bold text-gray-800">{viewingInvoice.dateOut || 'N/A'}</p>
                                </div>
                            </div>

                            {/* More Details Grid */}
                            <div className="grid grid-cols-4 gap-6 border-t border-gray-100 pt-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Service Type</label>
                                    <p className="font-bold text-gray-800">{viewingInvoice.serviceType || 'N/A'}</p>
                                </div>
                                <div className="col-span-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Details</label>
                                    <p className="font-bold text-gray-800">{viewingInvoice.details || 'Not Added'}</p>
                                </div>
                            </div>

                            {/* Financials Table */}
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="px-6 py-3 text-right text-gray-500 font-medium">Fixed Service Charge (₹):</td>
                                            <td className="px-6 py-3 text-right font-bold text-gray-800 w-48">{viewingInvoice.serviceType === 'Free' ? 'Free Service' : '₹0.00'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-3 text-right text-gray-500 font-medium">Total Service Amount (₹):</td>
                                            <td className="px-6 py-3 text-right font-bold text-gray-800">₹{viewingInvoice.totalAmount.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-3 text-right text-gray-500 font-medium">Discount (%):</td>
                                            <td className="px-6 py-3 text-right font-bold text-gray-800">{viewingInvoice.discount.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-3 text-right text-gray-500 font-medium">Total (₹):</td>
                                            <td className="px-6 py-3 text-right font-bold text-gray-800">₹{viewingInvoice.grandTotal.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-3 text-right text-gray-500 font-medium">Adjustment Amount(Paid Amount) (₹):</td>
                                            <td className="px-6 py-3 text-right font-bold text-gray-800">₹{(viewingInvoice.adjustmentAmount || 0).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-3 text-right text-gray-500 font-medium">Due Amount (₹):</td>
                                            <td className="px-6 py-3 text-right font-bold text-gray-800">₹{(viewingInvoice.dueAmount || 0).toFixed(2)}</td>
                                        </tr>
                                        <tr className="bg-orange-600 text-white">
                                            <td className="px-6 py-4 text-right font-black uppercase tracking-widest">Grand Total( ₹ ):</td>
                                            <td className="px-6 py-4 text-right font-black text-xl">₹{viewingInvoice.grandTotal.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
                            <button className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-100">
                                <Printer size={20} />
                            </button>
                            <button className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-100">
                                <FileText size={20} />
                            </button>
                            <button
                                onClick={() => setViewingInvoice(null)}
                                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default InvoiceView;
