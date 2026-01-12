
import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Calendar,
    Download,
    FileText,
    Printer,
    Search,
    Users,
    Wrench,
    ArrowRight,
    ChevronDown,
    Plus,
    Settings,
    User
} from 'lucide-react';
import { db } from '../db';
import { Job, Customer } from '../types';

interface ReportsViewProps {
    onBack: () => void;
}

type ReportTab = 'SERVICES' | 'PRODUCT STOCK' | 'PRODUCT USAGE' | 'EMP. SERVICES' | 'UPCOMING SERVICES' | 'EMAILS';

const ReportsView: React.FC<ReportsViewProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<ReportTab>('SERVICES');
    const [startDate, setStartDate] = useState('2026-01-01');
    const [endDate, setEndDate] = useState('2026-01-06');
    const [selectedService, setSelectedService] = useState('All');
    const [selectedCustomer, setSelectedCustomer] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

    useEffect(() => {
        const jobData = db.getJobs();
        const customerData = db.getCustomers();
        setJobs(jobData);
        setCustomers(customerData);
        handleFilter(jobData);
    }, []);

    const handleFilter = (data: Job[] = jobs) => {
        let filtered = data.filter(job => {
            const jobDate = job.dateIn;
            const isWithinDate = jobDate >= startDate && jobDate <= endDate;
            const matchesService = selectedService === 'All' || job.services.includes(selectedService);
            const matchesCustomer = selectedCustomer === 'All' || job.customerName === selectedCustomer;
            const matchesSearch = job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.id.toLowerCase().includes(searchTerm.toLowerCase());

            return isWithinDate && matchesService && matchesCustomer && matchesSearch;
        });
        setFilteredJobs(filtered);
    };

    const totalAmount = filteredJobs.reduce((sum, job) => sum + (job.charges || 0), 0);

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        const headers = ['#', 'Job No.', 'Customer Name', 'Date', 'Vehicle Name', 'Service Type', 'Paid Amount ($)', 'Assign To'];
        const rows = filteredJobs.map((job, index) => [
            index + 1,
            `#${job.id.substring(0, 7).toUpperCase()}`,
            job.customerName,
            job.dateIn,
            `${job.brand} ${job.model}`,
            job.services.split(',')[0],
            job.charges?.toFixed(2) || '0.00',
            'Nandan kumar'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Garage_Report_${startDate}_to_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tabs: ReportTab[] = ['SERVICES', 'PRODUCT STOCK', 'PRODUCT USAGE', 'EMP. SERVICES', 'UPCOMING SERVICES', 'EMAILS'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 print:m-0 print:p-0">
            <style>
                {`
                @media print {
                    aside, header, nav, .no-print, button, input, select, .flex-justify-end {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .bg-white {
                        border: none !important;
                        box-shadow: none !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border: 1px solid #eee !important;
                        padding: 8px !important;
                    }
                }
                `}
            </style>
            <div className="flex items-center justify-between no-print">
                <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
                <div className="flex gap-2">
                    <button className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition">
                        <Plus size={20} />
                    </button>
                    <button className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition">
                        <Settings size={20} />
                    </button>
                    <button className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition">
                        <User size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar no-print">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === tab
                            ? 'border-blue-600 text-blue-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 no-print">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-600 min-w-[100px]">Start Date*</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-600 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-600 min-w-[100px]">End Date*</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-600 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-600 min-w-[100px]">Select Service</label>
                        <div className="flex-1 relative">
                            <select
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none appearance-none focus:border-blue-600 transition-all"
                            >
                                <option value="All">All</option>
                                <option value="Oil Change">Oil Change</option>
                                <option value="Brake Service">Brake Service</option>
                                <option value="General Service">General Service</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-600 min-w-[100px]">Select Customer</label>
                        <div className="flex-1 relative">
                            <select
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none appearance-none focus:border-blue-600 transition-all"
                            >
                                <option value="All">Select Customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => handleFilter()}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                    >
                        Go
                    </button>
                    <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                        View Chart
                    </button>
                </div>

                <div className="flex justify-end">
                    <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg shadow-blue-100">
                        Total Amount($) : {totalAmount}
                    </div>
                </div>
            </div>

            {/* Actions & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition uppercase">PDF</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition uppercase">print</button>
                    <button onClick={handleExportExcel} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition uppercase">excel</button>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-4 pr-10 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-600 w-full md:w-64 transition-all"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
                </div>
            </div>

            {/* Print Header (Only visible when printing) */}
            <div className="hidden print:block mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Garage Service Report</h1>
                <p className="text-gray-500 mt-2">Period: {startDate} to {endDate}</p>
                <div className="mt-4 text-xl font-bold">Total Amount: ${totalAmount}</div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Job No.</th>
                                <th className="px-6 py-4">Customer Name</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Vehicle Name</th>
                                <th className="px-6 py-4">Service Type</th>
                                <th className="px-6 py-4">Paid Amount ($)</th>
                                <th className="px-6 py-4">Assign To</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-medium">
                                        No records found for the selected criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map((job, index) => (
                                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">#{job.id.substring(0, 7).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{job.customerName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{job.dateIn}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{job.brand} {job.model}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase">
                                                {job.services.split(',')[0]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-800">{job.charges?.toFixed(2) || '0.00'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">Nandan kumar</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
