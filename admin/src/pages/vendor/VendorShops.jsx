import { useState } from "react";
import { useSearchParams } from "react-router";
import { PlusIcon, PencilIcon, Trash2Icon, StoreIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "../../lib/api";
import toast from "react-hot-toast";

function VendorShops() {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q") || "";
    // ... rest

    const queryClient = useQueryClient();

    const { data: shops = [], isLoading } = useQuery({
        queryKey: ["vendor-shops", q],
        queryFn: () => shopApi.getVendorShops(q),
    });

    const createShopMutation = useMutation({
        mutationFn: shopApi.create,
        onSuccess: () => {
            toast.success("Shop created successfully");
            closeModal();
            queryClient.invalidateQueries({ queryKey: ["vendor-shops"] });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to create shop"),
    });

    const updateShopMutation = useMutation({
        mutationFn: ({ id, formData }) => shopApi.update(id, formData),
        onSuccess: () => {
            toast.success("Shop updated successfully");
            closeModal();
            queryClient.invalidateQueries({ queryKey: ["vendor-shops"] });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update shop"),
    });

    const deleteShopMutation = useMutation({
        mutationFn: shopApi.delete,
        onSuccess: () => {
            toast.success("Shop and its products deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["vendor-shops"] });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to delete shop"),
    });

    const closeModal = () => {
        setShowModal(false);
        setEditingShop(null);
        setFormData({ name: "", description: "" });
        setLogo(null);
        setBanner(null);
        setLogoPreview("");
        setBannerPreview("");
    };

    const handleEdit = (shop) => {
        setEditingShop(shop);
        setFormData({
            name: shop.name,
            description: shop.description,
        });
        setLogoPreview(shop.logoUrl);
        setBannerPreview(shop.bannerUrl);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        if (logo) data.append("logo", logo);
        if (banner) data.append("banner", banner);

        if (editingShop) {
            updateShopMutation.mutate({ id: editingShop._id, formData: data });
        } else {
            createShopMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Shops</h1>
                    <p className="text-base-content/70 mt-1">Create and manage different shops for your products</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
                    <PlusIcon className="w-5 h-5" /> Add Shop
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center p-10">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    shops.map((shop) => (
                        <div key={shop._id} className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                            {shop.bannerUrl && (
                                <figure className="h-32">
                                    <img src={shop.bannerUrl} alt={shop.name} className="w-full h-full object-cover" />
                                </figure>
                            )}
                            <div className="card-body p-4">
                                <div className="flex items-center gap-4">
                                    <div className="avatar">
                                        <div className="w-16 rounded-xl bg-base-200 flex items-center justify-center">
                                            {shop.logoUrl ? (
                                                <img src={shop.logoUrl} alt={shop.name} />
                                            ) : (
                                                <StoreIcon className="w-8 h-8 opacity-20" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="card-title text-lg truncate">{shop.name}</h3>
                                        <p className="text-base-content/70 text-sm line-clamp-2">{shop.description}</p>
                                    </div>
                                </div>

                                <div className="card-actions justify-end mt-4">
                                    <button className="btn btn-square btn-ghost btn-sm" onClick={() => handleEdit(shop)}>
                                        <PencilIcon className="size-4" />
                                    </button>
                                    <button
                                        className="btn btn-square btn-ghost btn-sm text-error"
                                        onClick={() => {
                                            if (confirm("Are you sure? This will delete all products in this shop.")) {
                                                deleteShopMutation.mutate(shop._id);
                                            }
                                        }}
                                    >
                                        <Trash2Icon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {!isLoading && shops.length === 0 && (
                    <div className="col-span-full text-center p-10 opacity-50 bg-base-100 rounded-xl border-2 border-dashed border-base-content/10">
                        No shops found. Create your first shop to start adding products!
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-xl">
                        <h3 className="font-bold text-lg mb-4">{editingShop ? "Edit Shop" : "Add Shop"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Shop Name</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Vintage Treasures"
                                    className="input input-bordered"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Description</span></label>
                                <textarea
                                    className="textarea textarea-bordered h-24"
                                    placeholder="Tell customers about this shop..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Logo</span></label>
                                    <input
                                        type="file"
                                        className="file-input file-input-bordered w-full"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setLogo(file);
                                            setLogoPreview(URL.createObjectURL(file));
                                        }}
                                    />
                                    {logoPreview && (
                                        <div className="mt-2 avatar">
                                            <div className="w-16 rounded-xl">
                                                <img src={logoPreview} alt="Logo preview" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Banner</span></label>
                                    <input
                                        type="file"
                                        className="file-input file-input-bordered w-full"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setBanner(file);
                                            setBannerPreview(URL.createObjectURL(file));
                                        }}
                                    />
                                    {bannerPreview && (
                                        <div className="mt-2 h-16 w-full rounded-xl overflow-hidden">
                                            <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={closeModal}
                                    disabled={createShopMutation.isPending || updateShopMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={createShopMutation.isPending || updateShopMutation.isPending}
                                >
                                    {(createShopMutation.isPending || updateShopMutation.isPending) && (
                                        <span className="loading loading-spinner"></span>
                                    )}
                                    {editingShop ? "Update Shop" : "Create Shop"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VendorShops;
