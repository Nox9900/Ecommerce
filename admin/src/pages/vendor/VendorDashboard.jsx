import { useState, useEffect } from "react";
import axios from "axios";
import { DollarSignIcon, PackageIcon, AlertCircleIcon, HistoryIcon, SendIcon } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function VendorDashboard() {
    const [stats, setStats] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, withdrawalsRes] = await Promise.all([
                axios.get(`${API_URL}/vendors/stats`, { withCredentials: true }),
                axios.get(`${API_URL}/vendors/withdrawals`, { withCredentials: true })
            ]);
            setStats(statsRes.data);
            setWithdrawals(withdrawalsRes.data);
        } catch (error) {
            console.error("Error fetching vendor data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawRequest = async (e) => {
        e.preventDefault();
        if (!withdrawAmount || isNaN(withdrawAmount)) {
            return toast.error("Please enter a valid amount");
        }

        if (parseFloat(withdrawAmount) > stats.earnings) {
            return toast.error("Insufficient earnings");
        }

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/vendors/withdrawals`,
                { amount: parseFloat(withdrawAmount) },
                { withCredentials: true }
            );
            toast.success("Withdrawal request submitted");
            setWithdrawAmount("");
            fetchData();
        } catch (error) {
            console.error("Error requesting withdrawal:", error);
            toast.error(error.response?.data?.message || "Failed to submit request");
        } finally {
            setIsSubmitting(false);
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
                        {stats?.status === "approved" && stats?.earnings > 0 && (
                            <div className="mt-4">
                                <form onSubmit={handleWithdrawRequest} className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        className="input input-sm input-bordered w-full max-w-xs"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        min="1"
                                        step="0.01"
                                    />
                                    <button
                                        type="submit"
                                        className={`btn btn-sm btn-primary ${isSubmitting ? "loading" : ""}`}
                                        disabled={isSubmitting}
                                    >
                                        <SendIcon className="size-4 mr-1" /> Withdraw
                                    </button>
                                </form>
                            </div>
                        )}
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

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <HistoryIcon className="size-5" />
                    <h3 className="text-xl font-bold">Withdrawal History</h3>
                </div>

                <div className="card bg-base-100 shadow-xl overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawals.map((w) => (
                                <tr key={w._id}>
                                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                                    <td className="font-bold">${w.amount.toFixed(2)}</td>
                                    <td>
                                        <div className={`badge ${w.status === "approved" ? "badge-success" :
                                                w.status === "rejected" ? "badge-error" : "badge-warning"
                                            }`}>
                                            {w.status}
                                        </div>
                                    </td>
                                    <td className="text-sm opacity-70">{w.adminNote || "-"}</td>
                                </tr>
                            ))}
                            {withdrawals.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 opacity-50">No withdrawal requests found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default VendorDashboard;
