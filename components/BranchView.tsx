import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Plus,
    Search,
    Trash2,
    ArrowLeft,
    Save,
    X,
    Building2,
    Phone,
    Mail,
    Image as ImageIcon,
    Globe,
    Map as MapIcon,
    Edit2,
    MoreVertical
} from 'lucide-react';
import { Branch } from '../types';
import { db } from '../db';
import { Country, State, City } from 'country-state-city';

interface BranchViewProps {
    onBack: () => void;
}

const BranchView: React.FC<BranchViewProps> = ({ onBack }) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [isManualCity, setIsManualCity] = useState(false);

    const [formData, setFormData] = useState<Partial<Branch>>({
        name: '',
        contactNumber: '',
        email: '',
        country: '',
        state: '',
        city: '',
        address: ''
    });

    useEffect(() => {
        if (editingBranch) {
            const country = countries.find(c => c.name === editingBranch.country);
            if (country) {
                setSelectedCountryCode(country.isoCode);
                const countryStates = State.getStatesOfCountry(country.isoCode);
                setStates(countryStates);
                const state = countryStates.find(s => s.name === editingBranch.state);
                if (state) {
                    setSelectedStateCode(state.isoCode);
                    const stateCities = City.getCitiesOfState(country.isoCode, state.isoCode);
                    setCities(stateCities);

                    // Check if the city exists in the list
                    const cityExists = stateCities.some(c => c.name === editingBranch.city);
                    if (!cityExists && editingBranch.city) {
                        setIsManualCity(true);
                    } else {
                        setIsManualCity(false);
                    }
                }
            }
        }
    }, [editingBranch, countries]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = db.getBranches();
            setBranches(data);
        } catch (error) {
            console.error('Failed to load branches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const branch: Branch = {
            id: editingBranch?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
            name: formData.name || '',
            contactNumber: formData.contactNumber || '',
            email: formData.email || '',
            country: formData.country || '',
            state: formData.state || '',
            city: formData.city || '',
            address: formData.address || ''
        };

        try {
            await db.saveBranch(branch);
            setIsAdding(false);
            setEditingBranch(null);
            resetForm();
            loadData();
        } catch (error) {
            alert('Failed to save branch');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            try {
                await db.deleteBranch(id);
                loadData();
            } catch (error) {
                alert('Failed to delete branch');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            contactNumber: '',
            email: '',
            country: '',
            state: '',
            city: '',
            address: ''
        });
        setSelectedCountryCode('');
        setSelectedStateCode('');
        setStates([]);
        setCities([]);
        setIsManualCity(false);
    };

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition lg:hidden">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Building2 className="text-blue-700" />
                        Branch Management
                    </h2>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => { resetForm(); setIsAdding(true); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Add Branch
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 mb-8">
                        <button onClick={() => { setIsAdding(false); setEditingBranch(null); }} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <ArrowLeft size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800">{editingBranch ? 'Edit Branch' : 'Add Branch'}</h3>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Branch Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">Branch Name*</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter branch name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">Contact Number*</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="Enter contact number"
                                        value={formData.contactNumber}
                                        onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">Email*</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                                    />
                                </div>


                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">Country*</label>
                                    <select
                                        required
                                        value={selectedCountryCode}
                                        onChange={e => {
                                            const countryCode = e.target.value;
                                            const countryName = countries.find(c => c.isoCode === countryCode)?.name || '';
                                            setSelectedCountryCode(countryCode);
                                            setFormData({ ...formData, country: countryName, state: '', city: '' });
                                            setStates(State.getStatesOfCountry(countryCode));
                                            setCities([]);
                                            setSelectedStateCode('');
                                        }}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition appearance-none"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(c => (
                                            <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">State</label>
                                    <select
                                        value={selectedStateCode}
                                        onChange={e => {
                                            const stateCode = e.target.value;
                                            const stateName = states.find(s => s.isoCode === stateCode)?.name || '';
                                            setSelectedStateCode(stateCode);
                                            setFormData({ ...formData, state: stateName, city: '' });
                                            setCities(City.getCitiesOfState(selectedCountryCode, stateCode));
                                        }}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition appearance-none"
                                        disabled={!selectedCountryCode}
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => (
                                            <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-600">Town/City</label>
                                        {selectedStateCode && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsManualCity(!isManualCity);
                                                    setFormData({ ...formData, city: '' });
                                                }}
                                                className="text-xs text-blue-700 font-bold hover:underline"
                                            >
                                                {isManualCity ? 'Select from list' : 'Add manually'}
                                            </button>
                                        )}
                                    </div>
                                    {isManualCity ? (
                                        <input
                                            type="text"
                                            placeholder="Enter city name"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                                        />
                                    ) : (
                                        <select
                                            value={formData.city}
                                            onChange={e => {
                                                if (e.target.value === 'manual') {
                                                    setIsManualCity(true);
                                                    setFormData({ ...formData, city: '' });
                                                } else {
                                                    setFormData({ ...formData, city: e.target.value });
                                                }
                                            }}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition appearance-none"
                                            disabled={!selectedStateCode}
                                        >
                                            <option value="">Select City</option>
                                            {cities.map(c => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                            {selectedStateCode && <option value="manual">+ Add Manually</option>}
                                        </select>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">Address*</label>
                                    <textarea
                                        required
                                        placeholder="Enter address"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition min-h-[100px] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full md:w-64 bg-blue-600 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition uppercase tracking-widest"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search branches by name or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                        />
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-12 text-center text-gray-500 font-medium">Loading branches...</div>
                        ) : filteredBranches.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-500 font-medium">No branches found.</div>
                        ) : (
                            filteredBranches.map(branch => (
                                <div key={branch.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
                                            <Building2 size={24} />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                            <button
                                                onClick={() => { setEditingBranch(branch); setFormData(branch); setIsAdding(true); }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(branch.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-800 mb-1">{branch.name}</h4>
                                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                                        <MapPin size={14} /> {branch.city}, {branch.state}
                                    </p>
                                    <div className="space-y-2 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                            <Phone size={14} className="text-gray-400" />
                                            {branch.contactNumber}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                            <Mail size={14} className="text-gray-400" />
                                            {branch.email}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default BranchView;
