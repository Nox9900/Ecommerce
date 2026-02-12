import { useState } from "react";
import { useSearchParams } from "react-router";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon, ImageIcon, CheckSquare, Square } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi, productApi, mobileApi, shopApi } from "../../lib/api";
import { getStockStatusBadge } from "../../lib/utils";
import toast from "react-hot-toast";
import { CardSkeleton } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import { PackageOpenIcon } from "lucide-react";

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

    // Bulk operations state
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showBulkStockModal, setShowBulkStockModal] = useState(false);
    const [bulkStockValue, setBulkStockValue] = useState("");

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

    const [variants, setVariants] = useState([]);

    // Generate variants when attributes change
    const generateVariants = () => {
        // Filter out empty attributes and values
        const validAttributes = attributes
            .map(attr => ({
                ...attr,
                values: attr.values.filter(v => v && v.trim() !== "")
            }))
            .filter(attr => attr.name && attr.name.trim() !== "" && attr.values.length > 0);

        if (validAttributes.length === 0) {
            toast.error("Add at least one attribute with values first");
            return;
        }

        const cartesian = (...arrays) => {
            return arrays.reduce((acc, curr) => {
                return acc.flatMap(d => curr.map(e => [...(Array.isArray(d) ? d : [d]), e]));
            });
        };

        const attrValues = validAttributes.map(attr => attr.values);
        let combinations = [];

        if (attrValues.length === 1) {
            combinations = attrValues[0].map(v => [v]);
        } else {
            combinations = cartesian(...attrValues);
        }

        const newVariants = combinations.map(combo => {
            const options = {};
            validAttributes.forEach((attr, index) => {
                options[attr.name] = combo[index];
            });

            // Check if this variant already exists to preserve its data/image
            const existingVariant = variants.find(v =>
                JSON.stringify(v.options) === JSON.stringify(options)
            );

            if (existingVariant) return existingVariant;

            return {
                name: combo.join(" / "),
                options,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                sku: "",
                image: "",
                imageFile: null
            };
        });

        setVariants(newVariants);
        toast.success(`Generated ${newVariants.length} variants`);
    };

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

    // Bulk operations mutations
    const bulkDeleteMutation = useMutation({
        mutationFn: vendorApi.bulkDelete,
        onSuccess: (data) => {
            toast.success(data.message || "Products deleted successfully");
            setSelectedProducts([]);
            queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete products");
        },
    });

    const bulkUpdateStockMutation = useMutation({
        mutationFn: ({ productIds, stock }) => vendorApi.bulkUpdateStock(productIds, stock),
        onSuccess: (data) => {
            toast.success(data.message || "Stock updated successfully");
            setSelectedProducts([]);
            setShowBulkStockModal(false);
            setBulkStockValue("");
            queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update stock");
        },
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
        setVariants([]);
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
        setVariants(product.variants || []);
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
        data.append("variants", JSON.stringify(variants));

        images.forEach(image => data.append("images", image));

        // Append variant images from state/refs (needs a way to store them)
        // Ideally we store files in `variants` state but File objects don't JSON stringify well for the `variants` field.
        // So we append them separately.
        variants.forEach((variant, index) => {
            if (variant.imageFile) {
                data.append(`variant_image_${index}`, variant.imageFile);
            }
        });

        if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct._id, formData: data });
        } else {
            createProductMutation.mutate(data);
        }
    };

    // Bulk operations handlers
    const handleSelectProduct = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map((p) => p._id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedProducts.length === 0) {
            toast.error("Please select at least one product");
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
            bulkDeleteMutation.mutate(selectedProducts);
        }
    };

    const handleBulkUpdateStock = () => {
        if (selectedProducts.length === 0) {
            toast.error("Please select at least one product");
            return;
        }
        setShowBulkStockModal(true);
    };

    const handleBulkStockSubmit = () => {
        const stockNum = parseInt(bulkStockValue);
        if (isNaN(stockNum) || stockNum < 0) {
            toast.error("Please enter a valid stock number");
            return;
        }

        bulkUpdateStockMutation.mutate({ productIds: selectedProducts, stock: stockNum });
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

            {/* BULK ACTIONS TOOLBAR */}
            {selectedProducts.length > 0 && (
                <div className="alert bg-primary/10 border-primary/20">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSelectAll}
                                className="btn btn-sm btn-ghost gap-2"
                            >
                                {selectedProducts.length === products.length ? (
                                    <CheckSquare className="w-5 h-5" />
                                ) : (
                                    <Square className="w-5 h-5" />
                                )}
                                {selectedProducts.length === products.length ? "Deselect All" : "Select All"}
                            </button>
                            <span className="font-medium">
                                {selectedProducts.length} product(s) selected
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBulkUpdateStock}
                                className="btn btn-sm btn-info gap-2"
                                disabled={bulkUpdateStockMutation.isPending}
                            >
                                {bulkUpdateStockMutation.isPending ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    "Update Stock"
                                )}
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="btn btn-sm btn-error gap-2"
                                disabled={bulkDeleteMutation.isPending}
                            >
                                {bulkDeleteMutation.isPending ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <>
                                        <Trash2Icon className="w-4 h-4" />
                                        Delete Selected
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    products.map((product) => (
                        <div key={product._id} className="card bg-base-100 shadow-sm border border-base-200">
                            <div className="card-body p-4 flex-row items-center gap-6">
                                {/* Checkbox for selection */}
                                <div className="form-control">
                                    <label className="cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary"
                                            checked={selectedProducts.includes(product._id)}
                                            onChange={() => handleSelectProduct(product._id)}
                                        />
                                    </label>
                                </div>

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
                    <EmptyState
                        title="No products found"
                        description={q ? `We couldn't find any products matching "${q}".` : "Your shop inventory is currently empty. Start by adding your first product!"}
                        icon={PackageOpenIcon}
                        buttonText={q ? null : "Add Product"}
                        onButtonClick={q ? null : () => setShowModal(true)}
                    />
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
                                                        const newAttrs = attributes.map((a, i) =>
                                                            i === attrIndex ? { ...a, name: e.target.value } : a
                                                        );
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
                                                                    const newAttrs = attributes.map((a, i) => {
                                                                        if (i === attrIndex) {
                                                                            const newVals = [...a.values];
                                                                            newVals[valIndex] = e.target.value;
                                                                            return { ...a, values: newVals };
                                                                        }
                                                                        return a;
                                                                    });
                                                                    setAttributes(newAttrs);
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newAttrs = attributes.map((a, i) => {
                                                                        if (i === attrIndex) {
                                                                            let newVals = a.values.filter((_, j) => j !== valIndex);
                                                                            if (newVals.length === 0) newVals = [""];
                                                                            return { ...a, values: newVals };
                                                                        }
                                                                        return a;
                                                                    });
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
                                                            const newAttrs = attributes.map((a, i) => {
                                                                if (i === attrIndex) {
                                                                    return { ...a, values: [...a.values, ""] };
                                                                }
                                                                return a;
                                                            });
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

                            {/* VARIANTS SECTION */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center justify-between w-full">
                                        Variants
                                        <button
                                            type="button"
                                            onClick={generateVariants}
                                            className="btn btn-xs btn-outline btn-secondary ml-2"
                                        >
                                            Generate / Refresh Variants
                                        </button>
                                    </span>
                                </label>

                                <div className="space-y-4 bg-base-200 p-4 rounded-xl max-h-96 overflow-y-auto">
                                    {variants.length === 0 && (
                                        <p className="text-center text-xs opacity-50 italic">
                                            Add attributes above and click "Generate" to create variants.
                                        </p>
                                    )}

                                    {variants.map((variant, index) => (
                                        <div key={index} className="bg-base-100 p-4 rounded-lg flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-sm bg-base-200 px-2 py-1 rounded">
                                                    {Object.values(variant.options).join(" / ")}
                                                </h4>

                                                {/* Variant Image Upload */}
                                                <div className="flex items-center gap-2">
                                                    {(variant.image || variant.imagePreview) && (
                                                        <div className="avatar">
                                                            <div className="w-8 h-8 rounded">
                                                                <img src={variant.imagePreview || variant.image} alt="Variant" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        className="file-input file-input-bordered file-input-xs w-full max-w-xs"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const newVariants = [...variants];
                                                                newVariants[index].imageFile = file;
                                                                newVariants[index].imagePreview = URL.createObjectURL(file);
                                                                setVariants(newVariants);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="form-control">
                                                    <label className="label py-0"><span className="label-text-alt">Price</span></label>
                                                    <input
                                                        type="number"
                                                        className="input input-sm input-bordered"
                                                        value={variant.price}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[index].price = parseFloat(e.target.value);
                                                            setVariants(newVariants);
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-control">
                                                    <label className="label py-0"><span className="label-text-alt">Stock</span></label>
                                                    <input
                                                        type="number"
                                                        className="input input-sm input-bordered"
                                                        value={variant.stock}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[index].stock = parseInt(e.target.value);
                                                            setVariants(newVariants);
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-control">
                                                    <label className="label py-0"><span className="label-text-alt">SKU</span></label>
                                                    <input
                                                        type="text"
                                                        className="input input-sm input-bordered"
                                                        value={variant.sku || ""}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[index].sku = e.target.value;
                                                            setVariants(newVariants);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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

            {/* BULK STOCK UPDATE MODAL */}
            {showBulkStockModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Update Stock for Selected Products</h3>
                        <p className="text-sm text-base-content/70 mb-4">
                            Updating stock for {selectedProducts.length} product(s). Enter the new stock value:
                        </p>

                        <div className="form-control">
                            <label className="label">
                                <span>New Stock Value</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Enter stock quantity"
                                className="input input-bordered w-full"
                                value={bulkStockValue}
                                onChange={(e) => setBulkStockValue(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => {
                                    setShowBulkStockModal(false);
                                    setBulkStockValue("");
                                }}
                                disabled={bulkUpdateStockMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleBulkStockSubmit}
                                disabled={bulkUpdateStockMutation.isPending || !bulkStockValue}
                            >
                                {bulkUpdateStockMutation.isPending ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    "Update Stock"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VendorProducts;
