import { useState, useEffect } from "react";
import axios from "axios";
import { DollarSignIcon, CheckCircleIcon, XCircleIcon, MessageSquareIcon } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function WithdrawalManagement() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminNote, setAdminNote] = useState("");
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/withdrawals`, { withCredentials: true });
            setWithdrawals(response.data);
        } catch (error) {
            console.error("Error fetching withdrawals:", error);
            toast.error("Failed to fetch withdrawals");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (withdrawalId, status) => {
        try {
            await axios.patch(
                `${API_URL}/admin/withdrawals/${withdrawalId}/status`,
                { status, adminNote },
                { withCredentials: true }
            );
            toast.success(`Withdrawal ${status} successfully`);
            setAdminNote("");
            setSelectedWithdrawal(null);
            fetchWithdrawals();
        } catch (error) {
            console.error("Error updating withdrawal status:", error);
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Payout Management</h2>

            <div className="card bg-base-100 shadow-xl overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Vendor</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {withdrawals.map((w) => (
                            <tr key={w._id}>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{w.vendor?.shopName || "Unknown Shop"}</span>
                                        <span className="text-xs opacity-70">{w.vendor?.owner?.name} ({w.vendor?.owner?.email})</span>
                                    </div>
                                </td>
                                <td className="font-bold text-lg">${w.amount.toFixed(2)}</td>
                                <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className={`badge ${w.status === "approved" ? "badge-success" :
                                            w.status === "rejected" ? "badge-error" : "badge-warning"
                                        }`}>
                                        {w.status}
                                    </div>
                                </td>
                                <td>
                                    {w.status === "pending" && (
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => {
                                                    setSelectedWithdrawal(w._id);
                                                    document.getElementById("payout_modal").showModal();
                                                }}
                                            >
                                                <CheckCircleIcon className="size-4 mr-1" /> Process
                                            </button>
                                        </div>
                                    )}
                                    {w.adminNote && (
                                        <div className="flex items-center gap-1 text-xs opacity-60 mt-1">
                                            <MessageSquareIcon className="size-3" /> {w.adminNote}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {withdrawals.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-10 opacity-50">No payout requests found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Processing Modal */}
            <dialog id="payout_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Process Payout Request</h3>
                    <p className="py-4">Please add a note and choose to approve or reject this request.</p>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Admin Note</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered h-24"
                            placeholder="Add a reason for approval/rejection or payment reference..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="modal-action flex gap-2">
                        <form method="dialog" className="flex-1">
                            <button className="btn btn-ghost w-full">Cancel</button>
                        </form>
                        <button
                            className="btn btn-error"
                            onClick={() => {
                                handleUpdateStatus(selectedWithdrawal, "rejected");
                                document.getElementById("payout_modal").close();
                            }}
                        >
                            <XCircleIcon className="size-4 mr-1" /> Reject
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={() => {
                                handleUpdateStatus(selectedWithdrawal, "approved");
                                document.getElementById("payout_modal").close();
                            }}
                        >
                            <CheckCircleIcon className="size-4 mr-1" /> Approve & Paid
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}

export default WithdrawalManagement;
