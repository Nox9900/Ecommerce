import { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircleIcon, XCircleIcon, StoreIcon } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function VendorManagement() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/vendors`, { withCredentials: true });
            setVendors(response.data);
        } catch (error) {
            console.error("Error fetching vendors:", error);
            toast.error("Failed to fetch vendors");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (vendorId, status) => {
        try {
            await axios.patch(
                `${API_URL}/admin/vendors/${vendorId}/status`,
                { status },
                { withCredentials: true }
            );
            toast.success(`Vendor ${status} successfully`);
            fetchVendors();
        } catch (error) {
            console.error("Error updating vendor status:", error);
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Vendor Management</h2>
            </div>

            <div className="grid gap-6">
                {vendors.map((vendor) => (
                    <div key={vendor._id} className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-12">
                                            <StoreIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{vendor.shopName}</h3>
                                        <p className="text-sm opacity-70">Owner: {vendor.owner?.name} ({vendor.owner?.email})</p>
                                        <p className="text-sm mt-1">{vendor.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`badge ${vendor.status === "approved" ? "badge-success" :
                                            vendor.status === "rejected" ? "badge-error" : "badge-warning"
                                        }`}>
                                        {vendor.status}
                                    </div>

                                    {vendor.status === "pending" && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleStatusUpdate(vendor._id, "approved")}
                                                className="btn btn-sm btn-success gap-2"
                                            >
                                                <CheckCircleIcon className="size-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(vendor._id, "rejected")}
                                                className="btn btn-sm btn-error gap-2"
                                            >
                                                <XCircleIcon className="size-4" /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {vendor.status === "approved" && (
                                        <button
                                            onClick={() => handleStatusUpdate(vendor._id, "rejected")}
                                            className="btn btn-sm btn-ghost text-error gap-2"
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {vendors.length === 0 && (
                    <div className="text-center p-10 opacity-50">No vendors found</div>
                )}
            </div>
        </div>
    );
}

export default VendorManagement;
