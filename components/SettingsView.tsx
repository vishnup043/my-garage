
import React, { useState, useEffect } from 'react';
import {
    Settings,
    Save,
    ArrowLeft,
    Shop,
    MapPin,
    Phone,
    Mail,
    FileText,
    Link as LinkIcon
} from 'lucide-react';
import { db, ShopConfig } from '../db';

interface SettingsViewProps {
    onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
    const [config, setConfig] = useState<ShopConfig>({
        groupInviteLink: '',
        shopName: '',
        shopAddress: '',
        shopPhone: '',
        shopEmail: '',
        termsAndConditions: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const currentConfig = db.getConfig();
        setConfig(currentConfig);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await db.saveConfig(config);
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition lg:hidden">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Settings className="text-blue-600" />
                        System Settings
                    </h2>
                </div>
            </div>

            <form onSubmit={handleSave} className="max-w-2xl space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <Settings size={20} className="text-gray-400" />
                        General Settings
                    </h3>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Shop Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={config.shopName}
                                onChange={e => setConfig({ ...config, shopName: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                placeholder="e.g. AutoCare Pro"
                            />
                            <Settings className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Shop Address</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={config.shopAddress}
                                onChange={e => setConfig({ ...config, shopAddress: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                placeholder="Shop address for invoices"
                            />
                            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={config.shopPhone}
                                    onChange={e => setConfig({ ...config, shopPhone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                />
                                <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={config.shopEmail}
                                    onChange={e => setConfig({ ...config, shopEmail: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                />
                                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <LinkIcon size={20} className="text-gray-400" />
                        Integrations
                    </h3>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">WhatsApp Group Invite Link</label>
                        <input
                            type="url"
                            value={config.groupInviteLink}
                            onChange={e => setConfig({ ...config, groupInviteLink: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                            placeholder="https://chat.whatsapp.com/..."
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <FileText size={20} className="text-gray-400" />
                        Invoice Terms
                    </h3>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Terms & Conditions</label>
                        <textarea
                            value={config.termsAndConditions}
                            onChange={e => setConfig({ ...config, termsAndConditions: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 h-32"
                            placeholder="Enter terms and conditions for invoices..."
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </form>
        </div>
    );
};

export default SettingsView;
