import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Loader2, Ticket } from "lucide-react";
import toast from "react-hot-toast";

const CouponsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const queryClient = useQueryClient();
    const modalRef = useRef(null);

    const { data: coupons, isLoading } = useQuery({
        queryKey: ["coupons"],
        queryFn: async () => {
            const { data } = await api.get("/coupons");
            return data.data.coupons;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (newCoupon) => {
            const { data } = await api.post("/coupons", newCoupon);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            closeModal();
            toast.success("Coupon created successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create coupon");
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }) => {
            const { data: res } = await api.put(`/coupons/${id}`, data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            closeModal();
            toast.success("Coupon updated successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update coupon");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/coupons/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            toast.success("Coupon deleted successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete coupon");
        },
    });

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        type: "percentage",
        value: "",
        minOrderValue: "",
        validUntil: "",
        usageLimit: "",
    });

    const resetForm = () => {
        setFormData({
            code: "",
            type: "percentage",
            value: "",
            minOrderValue: "",
            validUntil: "",
            usageLimit: "",
        });
        setEditingCoupon(null);
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                minOrderValue: coupon.minOrderValue || "",
                validUntil: coupon.validUntil ? coupon.validUntil.split("T")[0] : "",
                usageLimit: coupon.usageLimit || "",
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
        if (modalRef.current) {
            modalRef.current.close();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            value: Number(formData.value),
            minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        };

        if (editingCoupon) {
            updateMutation.mutate({ id: editingCoupon._id, ...payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus className="mr-2 h-4 w-4" /> Create Coupon
                </button>
            </div>

            <div className="overflow-x-auto bg-base-100 rounded-box border border-base-200">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Usage</th>
                            <th>Min Order</th>
                            <th>Valid Until</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-10">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                </td>
                            </tr>
                        ) : coupons?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-base-content/60">
                                    <div className="flex flex-col items-center gap-2">
                                        <Ticket className="h-10 w-10 opacity-20" />
                                        <p>No coupons found. Create one to get started.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            coupons?.map((coupon) => (
                                <tr key={coupon._id} className="hover">
                                    <td className="font-medium font-mono">{coupon.code}</td>
                                    <td>
                                        {coupon.type === "percentage" ? (
                                            <span className="badge badge-primary badge-outline font-bold">{coupon.value}% OFF</span>
                                        ) : (
                                            <span className="badge badge-secondary badge-outline font-bold">${coupon.value} OFF</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <progress
                                                className="progress progress-primary w-16"
                                                value={coupon.usedCount}
                                                max={coupon.usageLimit || 100}
                                            ></progress>
                                            <span className="text-xs opacity-70">
                                                {coupon.usedCount} / {coupon.usageLimit || "∞"}
                                            </span>
                                        </div>
                                    </td>
                                    <td>${coupon.minOrderValue || 0}</td>
                                    <td>{coupon.validUntil ? format(new Date(coupon.validUntil), "MMM dd, yyyy") : "-"}</td>
                                    <td>
                                        {coupon.isActive ? (
                                            <span className="badge badge-success badge-sm">Active</span>
                                        ) : (
                                            <span className="badge badge-ghost badge-sm">Inactive</span>
                                        )}
                                    </td>
                                    <td className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="btn btn-ghost btn-sm btn-square" onClick={() => openModal(coupon)}>
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                                                onClick={() => {
                                                    if (confirm("Delete this coupon?")) deleteMutation.mutate(coupon._id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* DaisyUI Modal */}
            <dialog ref={modalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">{editingCoupon ? "Edit Coupon" : "New Coupon"}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Coupon Code</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. SUMMER20"
                                className="input input-bordered w-full uppercase"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                                disabled={!!editingCoupon}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Type</span></label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount ($)</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Value</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 20"
                                    className="input input-bordered w-full"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Min Order ($)</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className="input input-bordered w-full"
                                    value={formData.minOrderValue}
                                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Usage Limit</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited"
                                    className="input input-bordered w-full"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text">Valid Until</span></label>
                            <input
                                type="date"
                                className="input input-bordered w-full"
                                value={formData.validUntil}
                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                required
                            />
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingCoupon ? "Update Coupon" : "Create Coupon"}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeModal}>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default CouponsPage;
