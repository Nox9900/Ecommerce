import { useState } from "react";
import { useSearchParams } from "react-router";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi, productApi, mobileApi, shopApi } from "../../lib/api"; // Reuse productApi for delete/update if needed, or vendorApi for isolation
import { getStockStatusBadge } from "../../lib/utils";
import toast from "react-hot-toast";

function VendorProducts() {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q") || "";

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        subcategory: "",
        brand: "",
        isSubsidy: false,
        price: "",
        originalPrice: "",
        stock: "",
        soldCount: "0",
        description: "",
        shop: "",
    });
    const [attributes, setAttributes] = useState([]); // [{ name: "", values: [""] }]
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const queryClient = useQueryClient();

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["vendor-products", q],
        queryFn: () => vendorApi.getProducts(q),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["active-categories"],
        queryFn: mobileApi.getActiveCategories,
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
        mutationFn: vendorApi.updateProduct,
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

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
            name: "",
            category: "",
            subcategory: "",
            brand: "",
            isSubsidy: false,
            price: "",
            originalPrice: "",
            stock: "",
            soldCount: "0",
            description: "",
            shop: "",
        });
        setAttributes([]);
        setImages([]);
        setImagePreviews([]);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            subcategory: product.subcategory || "",
            brand: product.brand || "",
            isSubsidy: product.isSubsidy || false,
            price: product.price.toString(),
            originalPrice: product.originalPrice ? product.originalPrice.toString() : "",
            stock: product.stock.toString(),
            soldCount: (product.soldCount || 0).toString(),
            description: product.description,
            shop: product.shop?._id || product.shop || "",
        });
        setAttributes(product.attributes || []);
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
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("originalPrice", formData.originalPrice);
        data.append("stock", formData.stock);
        data.append("category", formData.category);
        data.append("subcategory", formData.subcategory);
        data.append("brand", formData.brand);
        data.append("isSubsidy", formData.isSubsidy);
        data.append("soldCount", formData.soldCount);
        data.append("shop", formData.shop);
        data.append("attributes", JSON.stringify(attributes.filter(attr => attr.name && attr.values.length > 0)));
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

            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <h3 className="font-bold text-lg mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label"><span>Name</span></label>
                                    <input type="text" placeholder="Name" className="input input-bordered" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span>Category</span></label>
                                    <select
                                        className="select select-bordered"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label"><span>Subcategory</span></label>
                                    <select
                                        className="select select-bordered"
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                        disabled={!formData.category}
                                    >
                                        <option value="">Select subcategory</option>
                                        {categories
                                            .find(c => c.name === formData.category)
                                            ?.subcategories?.map((sub) => (
                                                <option key={sub.name} value={sub.name}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label"><span>Brand</span></label>
                                    <input
                                        type="text"
                                        placeholder="Brand"
                                        className="input input-bordered"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label cursor-pointer justify-start gap-4 h-full">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary"
                                            checked={formData.isSubsidy}
                                            onChange={(e) => setFormData({ ...formData, isSubsidy: e.target.checked })}
                                        />
                                        <span className="label-text font-bold text-red-500">Enable 10B Subsidy</span>
                                    </label>
                                </div>
                                <div className="form-control">
                                    <label className="label"><span>Sold Count</span></label>
                                    <input
                                        type="number"
                                        className="input input-bordered"
                                        value={formData.soldCount}
                                        onChange={(e) => setFormData({ ...formData, soldCount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="form-control">
                                    <label className="label"><span>Price ($)</span></label>
                                    <input type="number" step="0.01" className="input input-bordered" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span>Orig. Price ($)</span></label>
                                    <input type="number" step="0.01" className="input input-bordered opacity-70" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span>Stock</span></label>
                                    <input type="number" className="input input-bordered" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label"><span>Shop</span></label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formData.shop}
                                    onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
                                >
                                    <option value="">Select Shop</option>
                                    {shops.map((shop) => (
                                        <option key={shop._id} value={shop._id}>
                                            {shop.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label"><span>Description</span></label>
                                <textarea className="textarea textarea-bordered w-full h-24" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                            </div>

                            {/* PRODUCT ATTRIBUTES */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center justify-between w-full">
                                        Product Attributes
                                        <button
                                            type="button"
                                            onClick={() => setAttributes([...attributes, { name: "", values: [""] }])}
                                            className="btn btn-xs btn-outline btn-primary ml-2"
                                        >
                                            Add Attribute
                                        </button>
                                    </span>
                                </label>

                                <div className="space-y-4 bg-base-200 p-4 rounded-xl">
                                    {attributes.map((attr, attrIndex) => (
                                        <div key={attrIndex} className="bg-base-100 p-4 rounded-lg relative">
                                            <button
                                                type="button"
                                                onClick={() => setAttributes(attributes.filter((_, i) => i !== attrIndex))}
                                                className="btn btn-xs btn-circle btn-ghost absolute right-2 top-2 text-error"
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>

                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Attribute Name (e.g. Size, Color)"
                                                    className="input input-sm input-bordered w-full font-semibold"
                                                    value={attr.name}
                                                    onChange={(e) => {
                                                        const newAttrs = [...attributes];
                                                        newAttrs[attrIndex].name = e.target.value;
                                                        setAttributes(newAttrs);
                                                    }}
                                                />

                                                <div className="flex flex-wrap gap-2">
                                                    {attr.values.map((val, valIndex) => (
                                                        <div key={valIndex} className="flex items-center gap-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Value"
                                                                className="input input-xs input-bordered w-24"
                                                                value={val}
                                                                onChange={(e) => {
                                                                    const newAttrs = [...attributes];
                                                                    newAttrs[attrIndex].values[valIndex] = e.target.value;
                                                                    setAttributes(newAttrs);
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newAttrs = [...attributes];
                                                                    newAttrs[attrIndex].values = attr.values.filter((_, i) => i !== valIndex);
                                                                    if (newAttrs[attrIndex].values.length === 0) {
                                                                        newAttrs[attrIndex].values = [""];
                                                                    }
                                                                    setAttributes(newAttrs);
                                                                }}
                                                                className="btn btn-xs btn-circle btn-ghost text-error"
                                                            >
                                                                <XIcon className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newAttrs = [...attributes];
                                                            newAttrs[attrIndex].values.push("");
                                                            setAttributes(newAttrs);
                                                        }}
                                                        className="btn btn-xs btn-ghost btn-circle"
                                                    >
                                                        <PlusIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {attributes.length === 0 && (
                                        <p className="text-center text-xs opacity-50 italic">No attributes added yet</p>
                                    )}
                                </div>
                            </div>

                            <input type="file" multiple className="file-input file-input-bordered w-full" onChange={handleImageChange} />
                            <div className="modal-action">
                                <button type="button" className="btn" onClick={closeModal} disabled={createProductMutation.isPending || updateProductMutation.isPending}>Cancel</button>
                                <button type="submit" className="btn btn-primary min-w-[100px]" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                                    {createProductMutation.isPending || updateProductMutation.isPending ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VendorProducts;
