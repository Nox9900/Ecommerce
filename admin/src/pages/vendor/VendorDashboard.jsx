import { useState, useEffect } from "react";
import axios from "axios";
import { DollarSignIcon, PackageIcon, AlertCircleIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function VendorDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/vendors/stats`, { withCredentials: true });
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching vendor stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Vendor Dashboard</h2>
                <div className={`badge badge-lg ${stats?.status === "approved" ? "badge-success" : "badge-warning"
                    }`}>
                    Status: {stats?.status || "Pending"}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <DollarSignIcon className="size-8" />
                        </div>
                        <div className="stat-title">Net Earnings</div>
                        <div className="stat-value text-primary">${stats?.earnings?.toFixed(2) || "0.00"}</div>
                        <div className="stat-desc">After platform fees</div>
                    </div>
                </div>

                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-figure text-secondary">
                            <PackageIcon className="size-8" />
                        </div>
                        <div className="stat-title">Active Products</div>
                        <div className="stat-value text-secondary">{stats?.totalProducts || 0}</div>
                        <div className="stat-desc">Listed on marketplace</div>
                    </div>
                </div>
            </div>

            {stats?.status !== "approved" && (
                <div className="alert alert-warning shadow-lg">
                    <AlertCircleIcon />
                    <div>
                        <h3 className="font-bold">Account Pending Approval</h3>
                        <div className="text-xs">Your shop is currently being reviewed. You will be able to sell once approved by the admin.</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VendorDashboard;
