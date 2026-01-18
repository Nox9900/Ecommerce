import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mobileApi } from "../lib/api";
import {
    SmartphoneIcon,
    LayoutIcon,
    GridIcon,
    PlusIcon,
    PencilIcon,
    Trash2Icon,
    SaveIcon,
    XIcon,
    InfoIcon
} from "lucide-react";

function SettingsPage() {
    const queryClient = useQueryClient();
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const [categoryForm, setCategoryForm] = useState({
        name: "",
        icon: "",
        displayOrder: 0,
        isActive: true,
        subcategories: []
    });

    const [heroForm, setHeroForm] = useState({
        title: "",
        subtitle: "",
        label: "",
        imageUrl: "",
        isActive: true
    });

    const [bannerForm, setBannerForm] = useState({
        title: "",
        label: "Official Subsidy",
        imageUrl: "",
        price: "",
        type: "subsidy",
        isActive: true,
        displayOrder: 0
    });

    // Subcategory handlers
    const addSubcategory = () => {
        setCategoryForm({
            ...categoryForm,
            subcategories: [
                ...categoryForm.subcategories,
                { name: "", icon: "", color: "#3B82F6", displayOrder: categoryForm.subcategories.length, isActive: true }
            ]
        });
    };

    const removeSubcategory = (index) => {
        const newSubcategories = [...categoryForm.subcategories];
        newSubcategories.splice(index, 1);
        setCategoryForm({ ...categoryForm, subcategories: newSubcategories });
    };

    const updateSubcategory = (index, field, value) => {
        const newSubcategories = [...categoryForm.subcategories];
        newSubcategories[index] = { ...newSubcategories[index], [field]: value };
        setCategoryForm({ ...categoryForm, subcategories: newSubcategories });
    };

    // Fetch Data
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ["categories-all"],
        queryFn: mobileApi.getCategories
    });

    const { data: banners = [], isLoading: bannersLoading } = useQuery({
        queryKey: ["promo-banners-all"],
        queryFn: mobileApi.getPromoBanners
    });

    // Mutations
    const createCategoryMutation = useMutation({
        mutationFn: mobileApi.createCategory,
        onSuccess: () => {
            closeCategoryModal();
            queryClient.invalidateQueries({ queryKey: ["categories-all"] });
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, data }) => mobileApi.updateCategory(id, data),
        onSuccess: () => {
            closeCategoryModal();
            queryClient.invalidateQueries({ queryKey: ["categories-all"] });
        }
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: mobileApi.deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories-all"] });
        }
    });

    const createBannerMutation = useMutation({
        mutationFn: mobileApi.createPromoBanner,
        onSuccess: () => {
            closeBannerModal();
            queryClient.invalidateQueries({ queryKey: ["promo-banners-all"] });
        }
    });

    const updateBannerMutation = useMutation({
        mutationFn: ({ id, data }) => mobileApi.updatePromoBanner(id, data),
        onSuccess: () => {
            closeBannerModal();
            queryClient.invalidateQueries({ queryKey: ["promo-banners-all"] });
        }
    });

    const deleteBannerMutation = useMutation({
        mutationFn: mobileApi.deletePromoBanner,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["promo-banners-all"] });
        }
    });

    // Handlers
    const handleCategorySubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            updateCategoryMutation.mutate({ id: editingCategory._id, data: categoryForm });
        } else {
            createCategoryMutation.mutate(categoryForm);
        }
    };

    const handleBannerSubmit = (e) => {
        e.preventDefault();
        if (editingBanner) {
            updateBannerMutation.mutate({ id: editingBanner._id, data: bannerForm });
        } else {
            createBannerMutation.mutate(bannerForm);
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            icon: category.icon,
            displayOrder: category.displayOrder,
            isActive: category.isActive,
            subcategories: category.subcategories || []
        });
        setShowCategoryModal(true);
    };

    const handleEditBanner = (banner) => {
        setEditingBanner(banner);
        setBannerForm({
            title: banner.title,
            label: banner.label,
            imageUrl: banner.imageUrl,
            price: banner.price,
            type: banner.type,
            isActive: banner.isActive,
            displayOrder: banner.displayOrder
        });
        setShowBannerModal(true);
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({
            name: "",
            icon: "",
            displayOrder: 0,
            isActive: true,
            subcategories: []
        });
    };

    const closeBannerModal = () => {
        setShowBannerModal(false);
        setEditingBanner(null);
        setBannerForm({
            title: "",
            label: "Official Subsidy",
            imageUrl: "",
            price: "",
            type: "subsidy",
            isActive: true,
            displayOrder: 0
        });
    };

    return (
        <div className="space-y-10 pb-10">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <SmartphoneIcon className="w-8 h-8 text-primary" />
                    Mobile App Settings
                </h1>
                <p className="text-base-content/70 mt-1">Configure the look and feel of your mobile application.</p>
            </header>

            {/* Promo Banners Management */}
            <section className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="card-title flex items-center gap-2">
                            <LayoutIcon className="w-5 h-5 text-warning" />
                            Promo Banners
                        </h2>
                        <button
                            onClick={() => setShowBannerModal(true)}
                            className="btn btn-sm btn-outline btn-warning gap-2"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Banner
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full text-base-content">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Price</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bannersLoading ? (
                                    <tr><td colSpan="5" className="text-center py-10"><span className="loading loading-spinner loading-lg"></span></td></tr>
                                ) : banners.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-10 opacity-60 italic">No promo banners yet.</td></tr>
                                ) : banners.map((banner) => (
                                    <tr key={banner._id}>
                                        <td className="font-bold">{banner.title}</td>
                                        <td>{banner.price}</td>
                                        <td><div className="badge badge-outline text-[10px] uppercase">{banner.type}</div></td>
                                        <td>
                                            <div className={`badge badge-sm ${banner.isActive ? 'badge-success' : 'badge-ghost opacity-50'}`}>
                                                {banner.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                        </td>
                                        <td className="text-right flex justify-end gap-1">
                                            <button onClick={() => handleEditBanner(banner)} className="btn btn-square btn-ghost btn-xs text-info">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => window.confirm("Are you sure?") && deleteBannerMutation.mutate(banner._id)}
                                                className="btn btn-square btn-ghost btn-xs text-error"
                                            >
                                                {deleteBannerMutation.isPending ? <span className="loading loading-spinner"></span> : <Trash2Icon className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Category Management */}
            <section className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="card-title flex items-center gap-2">
                            <GridIcon className="w-5 h-5 text-accent" />
                            Product Categories
                        </h2>
                        <button
                            onClick={() => setShowCategoryModal(true)}
                            className="btn btn-sm btn-outline btn-accent gap-2"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Category
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full text-base-content">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Category Name</th>
                                    <th>Icon</th>
                                    <th>Subcategories</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoriesLoading ? (
                                    <tr><td colSpan="6" className="text-center py-10"><span className="loading loading-spinner loading-lg"></span></td></tr>
                                ) : categories.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-10 opacity-60 italic">No categories managed yet.</td></tr>
                                ) : categories.map((cat) => (
                                    <tr key={cat._id}>
                                        <td><div className="badge badge-ghost">{cat.displayOrder}</div></td>
                                        <td className="font-bold">{cat.name}</td>
                                        <td><code className="text-xs opacity-70">{cat.icon}</code></td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {cat.subcategories?.map((sub, idx) => (
                                                    <span key={idx} className="badge badge-sm badge-outline opacity-70">{sub.name}</span>
                                                ))}
                                                {!cat.subcategories?.length && <span className="text-xs opacity-40">None</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`badge badge-sm ${cat.isActive ? 'badge-success' : 'badge-ghost opacity-50'}`}>
                                                {cat.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                        </td>
                                        <td className="text-right flex justify-end gap-1">
                                            <button onClick={() => handleEditCategory(cat)} className="btn btn-square btn-ghost btn-xs text-info">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => window.confirm("Are you sure?") && deleteCategoryMutation.mutate(cat._id)}
                                                className="btn btn-square btn-ghost btn-xs text-error"
                                            >
                                                {deleteCategoryMutation.isPending ? <span className="loading loading-spinner"></span> : <Trash2Icon className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Banner Modal */}
            <input type="checkbox" className="modal-toggle" checked={showBannerModal} readOnly />
            <div className="modal">
                <div className="modal-box">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl">{editingBanner ? "Edit Banner" : "Add New Banner"}</h3>
                        <button onClick={closeBannerModal} className="btn btn-sm btn-circle btn-ghost"><XIcon className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleBannerSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Title</span></label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={bannerForm.title}
                                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text">Label</span></label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={bannerForm.label}
                                onChange={(e) => setBannerForm({ ...bannerForm, label: e.target.value })}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text">Price (e.g. ¥38)</span></label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={bannerForm.price}
                                onChange={(e) => setBannerForm({ ...bannerForm, price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text">Image URL</span></label>
                            <input
                                type="url"
                                className="input input-bordered"
                                value={bannerForm.imageUrl}
                                onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text">Type</span></label>
                            <select
                                className="select select-bordered"
                                value={bannerForm.type}
                                onChange={(e) => setBannerForm({ ...bannerForm, type: e.target.value })}
                            >
                                <option value="subsidy">Subsidy (Red)</option>
                                <option value="fresh">Fresh (Green)</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-4">
                                <span className="label-text">Active</span>
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={bannerForm.isActive}
                                    onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                                />
                            </label>
                        </div>

                        <div className="modal-action">
                            <button type="button" onClick={closeBannerModal} className="btn">Cancel</button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                            >
                                {(createBannerMutation.isPending || updateBannerMutation.isPending) && <span className="loading loading-spinner"></span>}
                                {editingBanner ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Category Modal */}
            <input type="checkbox" className="modal-toggle" checked={showCategoryModal} readOnly />
            <div className="modal">
                <div className="modal-box max-w-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl">{editingCategory ? "Edit Category" : "Add New Category"}</h3>
                        <button onClick={closeCategoryModal} className="btn btn-sm btn-circle btn-ghost"><XIcon className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleCategorySubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Category Name</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Electronics"
                                    className="input input-bordered"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Icon Name</span>
                                    <span className="label-text-alt text-xs opacity-60">Ionicons name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. laptop-outline"
                                    className="input input-bordered"
                                    value={categoryForm.icon}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Display Order</span></label>
                                <input
                                    type="number"
                                    className="input input-bordered"
                                    value={categoryForm.displayOrder}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <span className="label-text">Active</span>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={categoryForm.isActive}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="divider">Subcategories</div>

                        <div className="space-y-4">
                            {categoryForm.subcategories.map((sub, index) => (
                                <div key={index} className="flex flex-wrap items-end gap-3 p-3 bg-base-200 rounded-lg relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeSubcategory(index)}
                                        className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </button>

                                    <div className="form-control flex-1 min-w-[150px]">
                                        <label className="label py-1"><span className="label-text text-xs">Name</span></label>
                                        <input
                                            type="text"
                                            className="input input-sm input-bordered"
                                            value={sub.name}
                                            onChange={(e) => updateSubcategory(index, "name", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-control w-24">
                                        <label className="label py-1"><span className="label-text text-xs">Icon</span></label>
                                        <input
                                            type="text"
                                            className="input input-sm input-bordered"
                                            value={sub.icon}
                                            onChange={(e) => updateSubcategory(index, "icon", e.target.value)}
                                        />
                                    </div>

                                    <div className="form-control w-16">
                                        <label className="label py-1"><span className="label-text text-xs">Color</span></label>
                                        <input
                                            type="color"
                                            className="input input-sm h-8 w-12 p-0 border-none cursor-pointer"
                                            value={sub.color || "#3B82F6"}
                                            onChange={(e) => updateSubcategory(index, "color", e.target.value)}
                                        />
                                    </div>

                                    <div className="form-control w-16">
                                        <label className="label py-1"><span className="label-text text-xs">Order</span></label>
                                        <input
                                            type="number"
                                            className="input input-sm input-bordered"
                                            value={sub.displayOrder}
                                            onChange={(e) => updateSubcategory(index, "displayOrder", parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div className="form-control mb-1">
                                        <label className="label cursor-pointer gap-2 py-1">
                                            <span className="label-text text-xs">Active</span>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-xs"
                                                checked={sub.isActive}
                                                onChange={(e) => updateSubcategory(index, "isActive", e.target.checked)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addSubcategory}
                                className="btn btn-sm btn-block btn-outline border-dashed gap-2"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Add Subcategory
                            </button>
                        </div>

                        <div className="modal-action">
                            <button type="button" onClick={closeCategoryModal} className="btn">Cancel</button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                            >
                                {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && <span className="loading loading-spinner"></span>}
                                {editingCategory ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
