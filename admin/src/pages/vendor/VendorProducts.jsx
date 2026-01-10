import { useState } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi, productApi, mobileApi, shopApi } from "../../lib/api"; // Reuse productApi for delete/update if needed, or vendorApi for isolation
import { getStockStatusBadge } from "../../lib/utils";
import toast from "react-hot-toast";

function VendorProducts() {
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        shop: "",
    });
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryData, setNewCategoryData] = useState({
        name: "",
        icon: "apps-outline", // default icon
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const queryClient = useQueryClient();

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["vendor-products"],
        queryFn: vendorApi.getProducts,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["mobile-categories"],
        queryFn: mobileApi.getCategories,
    });

    const { data: shops = [] } = useQuery({
        queryKey: ["vendor-shops"],
        queryFn: shopApi.getVendorShops,
    });

    const createProductMutation = useMutation({
        mutationFn: vendorApi.createProduct,
        onSuccess: () => {
            toast.success("Product created successfully");
            closeModal();
            queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to create product"),
    });

    const updateProductMutation = useMutation({
        mutationFn: productApi.update, // Backend needs to ensure vendor owns it
        onSuccess: () => {
            toast.success("Product updated successfully");
            closeModal();
            queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to update product"),
    });

    const deleteProductMutation = useMutation({
        mutationFn: productApi.delete,
        onSuccess: () => {
            toast.success("Product deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to delete product"),
    });

    const createCategoryMutation = useMutation({
        mutationFn: mobileApi.createCategory,
        onSuccess: () => {
            toast.success("Category suggestion sent to admin");
            setShowCategoryModal(false);
            setNewCategoryData({ name: "", icon: "apps-outline" });
            queryClient.invalidateQueries({ queryKey: ["mobile-categories"] });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to suggest category"),
    });

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ name: "", category: "", price: "", stock: "", description: "", shop: "" });
        setImages([]);
        setImagePreviews([]);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            stock: product.stock.toString(),
            description: product.description,
            shop: product.shop?._id || product.shop || "",
        });
        setImagePreviews(product.images);
        setShowModal(true);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) return alert("Maximum 3 images allowed");
        setImages(files);
        setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        images.forEach(image => data.append("images", image));

        if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct._id, formData: data });
        } else {
            createProductMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Products</h1>
                    <p className="text-base-content/70 mt-1">Manage your shop inventory</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
                    <PlusIcon className="w-5 h-5" /> Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>
                ) : (
                    products.map((product) => (
                        <div key={product._id} className="card bg-base-100 shadow-sm border border-base-200">
                            <div className="card-body p-4 flex-row items-center gap-6">
                                <div className="avatar">
                                    <div className="w-20 rounded-xl">
                                        <img src={product.images[0]} alt={product.name} />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="card-title text-lg">{product.name}</h3>
                                            <p className="text-base-content/70 text-sm">{product.category}</p>
                                        </div>
                                        <div className={`badge ${getStockStatusBadge(product.stock).class}`}>
                                            {getStockStatusBadge(product.stock).text}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 mt-2">
                                        <div>
                                            <p className="text-xs opacity-60">Price</p>
                                            <p className="font-bold">${product.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-60">Stock</p>
                                            <p className="font-bold">{product.stock}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button className="btn btn-square btn-ghost btn-sm" onClick={() => handleEdit(product)}>
                                        <PencilIcon className="size-4" />
                                    </button>
                                    <button className="btn btn-square btn-ghost btn-sm text-error" onClick={() => deleteProductMutation.mutate(product._id)}>
                                        <Trash2Icon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {!isLoading && products.length === 0 && (
                    <div className="text-center p-10 opacity-50">No products found. Start by adding one!</div>
                )}
            </div>

            {/* Modal is simplified for brevity but handles same logic as ProductsPage */}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <h3 className="font-bold text-lg mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Form fields omitted for brevity, same as ProductsPage.jsx */}
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Name" className="input input-bordered" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                <select
                                    className="select select-bordered"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.name} {!cat.isActive && "(Pending Approval)"}
                                        </option>
                                    ))}
                                </select>
                                {/* for the vendor to create a categorie */}
                                {/* <button
                                    type="button"
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => setShowCategoryModal(true)}
                                >
                                    Suggest New
                                </button> */}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Price" className="input input-bordered" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                <input type="number" placeholder="Stock" className="input input-bordered" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                            </div>
                            <select
                                className="select select-bordered w-full"
                                value={formData.shop}
                                onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
                                required
                            >
                                <option value="">Select Shop</option>
                                {shops.map((shop) => (
                                    <option key={shop._id} value={shop._id}>
                                        {shop.name}
                                    </option>
                                ))}
                            </select>
                            <textarea className="textarea textarea-bordered w-full h-24" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                            <input type="file" multiple className="file-input file-input-bordered w-full" onChange={handleImageChange} />
                            <div className="modal-action">
                                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Suggestion Modal */}
            {showCategoryModal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-sm">
                        <h3 className="font-bold text-lg mb-4">Suggest New Category</h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Category Name</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={newCategoryData.name}
                                    onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Icon Name (Ionicons)</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={newCategoryData.icon}
                                    onChange={(e) => setNewCategoryData({ ...newCategoryData, icon: e.target.value })}
                                />
                                <label className="label">
                                    <span className="label-text-alt opacity-60">e.g., shirt-outline, watch-outline</span>
                                </label>
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => createCategoryMutation.mutate(newCategoryData)}
                                disabled={createCategoryMutation.isPending || !newCategoryData.name}
                            >
                                {createCategoryMutation.isPending && <span className="loading loading-spinner"></span>}
                                Suggest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VendorProducts;
