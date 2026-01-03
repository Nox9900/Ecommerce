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

    const [categoryForm, setCategoryForm] = useState({
        name: "",
        icon: "",
        displayOrder: 0,
        isActive: true
    });

    const [heroForm, setHeroForm] = useState({
        title: "",
        subtitle: "",
        label: "",
        imageUrl: "",
        isActive: true
    });

    // Fetch Data
    const { data: heroData, isLoading: heroLoading } = useQuery({
        queryKey: ["hero"],
        queryFn: mobileApi.getHero,
        onSuccess: (data) => {
            if (data) {
                setHeroForm({
                    title: data.title || "",
                    subtitle: data.subtitle || "",
                    label: data.label || "",
                    imageUrl: data.imageUrl || "",
                    isActive: data.isActive ?? true
                });
            }
        }
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ["categories-all"],
        queryFn: mobileApi.getCategories
    });

    // Hero Mutations
    const updateHeroMutation = useMutation({
        mutationFn: (data) => heroData?._id
            ? mobileApi.updateHero(heroData._id, data)
            : mobileApi.createHero(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hero"] });
            alert("Hero section updated successfully!");
        }
    });

    // Category Mutations
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

    // Handlers
    const handleHeroSubmit = (e) => {
        e.preventDefault();
        updateHeroMutation.mutate(heroForm);
    };

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            updateCategoryMutation.mutate({ id: editingCategory._id, data: categoryForm });
        } else {
            createCategoryMutation.mutate(categoryForm);
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            icon: category.icon,
            displayOrder: category.displayOrder,
            isActive: category.isActive
        });
        setShowCategoryModal(true);
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({
            name: "",
            icon: "",
            displayOrder: 0,
            isActive: true
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

            {/* Hero Section Management */}
            <section className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                    <h2 className="card-title flex items-center gap-2 mb-4">
                        <LayoutIcon className="w-5 h-5 text-secondary" />
                        Hero Section
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <form onSubmit={handleHeroSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Label</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. New Collection"
                                    className="input input-bordered"
                                    value={heroForm.label}
                                    onChange={(e) => setHeroForm({ ...heroForm, label: e.target.value })}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Title</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Summer Sale"
                                    className="input input-bordered"
                                    value={heroForm.title}
                                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Subtitle</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Up to 50% off"
                                    className="input input-bordered"
                                    value={heroForm.subtitle}
                                    onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Image URL</span></label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    className="input input-bordered"
                                    value={heroForm.imageUrl}
                                    onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <span className="label-text">Active</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={heroForm.isActive}
                                        onChange={(e) => setHeroForm({ ...heroForm, isActive: e.target.checked })}
                                    />
                                </label>
                            </div>

                            <div className="card-actions justify-end mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary gap-2"
                                    disabled={updateHeroMutation.isPending}
                                >
                                    {updateHeroMutation.isPending ? <span className="loading loading-spinner"></span> : <SaveIcon className="w-4 h-4" />}
                                    Save Hero Section
                                </button>
                            </div>
                        </form>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wider">Preview (Mobile Look)</h3>
                            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-lg bg-base-300">
                                {heroForm.imageUrl ? (
                                    <img src={heroForm.imageUrl} className="w-full h-full object-cover" alt="Hero Preview" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-base-content/20 italic">No image provided</div>
                                )}
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="absolute bottom-0 left-0 p-4 text-white">
                                    <div className="bg-primary/90 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mb-1">{heroForm.label || "Label"}</div>
                                    <h4 className="text-xl font-bold">{heroForm.title || "Hero Title"}</h4>
                                    <p className="text-xs opacity-80">{heroForm.subtitle || "Subtitle message goes here"}</p>
                                </div>
                            </div>
                            <div className="alert bg-base-200 border-none text-xs">
                                <InfoIcon className="w-4 h-4" />
                                <span>The mobile app uses a blurred overlay for text readability.</span>
                            </div>
                        </div>
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
                                    <th>Icon (Ionicons)</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoriesLoading ? (
                                    <tr><td colSpan="5" className="text-center py-10"><span className="loading loading-spinner loading-lg"></span></td></tr>
                                ) : categories.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-10 opacity-60 italic">No categories managed yet.</td></tr>
                                ) : categories.map((cat) => (
                                    <tr key={cat._id}>
                                        <td><div className="badge badge-ghost">{cat.displayOrder}</div></td>
                                        <td className="font-bold">{cat.name}</td>
                                        <td><code className="text-xs opacity-70">{cat.icon}</code></td>
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

            {/* Category Modal */}
            <input type="checkbox" className="modal-toggle" checked={showCategoryModal} readOnly />
            <div className="modal">
                <div className="modal-box">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl">{editingCategory ? "Edit Category" : "Add New Category"}</h3>
                        <button onClick={closeCategoryModal} className="btn btn-sm btn-circle btn-ghost"><XIcon className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleCategorySubmit} className="space-y-4">
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
                                <span className="label-text-alt text-xs opacity-60">Uses Ionicons name</span>
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
