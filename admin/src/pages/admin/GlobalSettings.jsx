import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { SaveIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function GlobalSettings() {
    const [settings, setSettings] = useState({
        globalCommissionRate: 0.1,
        platformName: "",
        contactEmail: "",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/settings`, { withCredentials: true });
            setSettings(response.data);
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/admin/settings`, settings, { withCredentials: true });
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Failed to update settings");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Global Platform Settings</h2>

            <div className="card bg-base-100 shadow-xl">
                <form onSubmit={handleSubmit} className="card-body gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Platform Name</span>
                        </label>
                        <input
                            type="text"
                            value={settings.platformName}
                            onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                            className="input input-bordered"
                            placeholder="e.g. My Marketplace"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Global Commission Rate (0.1 = 10%)</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={settings.globalCommissionRate}
                            onChange={(e) => setSettings({ ...settings, globalCommissionRate: parseFloat(e.target.value) })}
                            className="input input-bordered"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Contact Email</span>
                        </label>
                        <input
                            type="email"
                            value={settings.contactEmail}
                            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                            className="input input-bordered"
                        />
                    </div>

                    <div className="card-actions justify-end mt-4">
                        <button type="submit" className="btn btn-primary gap-2">
                            <SaveIcon className="size-4" /> Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GlobalSettings;
