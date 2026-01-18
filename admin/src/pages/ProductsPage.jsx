import { useState } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi, mobileApi, shopApi } from "../lib/api";
import { getStockStatusBadge } from "../lib/utils";

function ProductsPage() {
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

  // fetch some data
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["mobile-categories"],
    queryFn: mobileApi.getCategories,
  });

  const { data: shops = [] } = useQuery({
    queryKey: ["all-shops"],
    queryFn: productApi.getAllShops,
  });

  // creating, update, deleting
  const createProductMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const closeModal = () => {
    // reset the state
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

    // revoke previous blob URLs to free memory
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // for new products, require images
    if (!editingProduct && imagePreviews.length === 0) {
      return alert("Please upload at least one image");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("originalPrice", formData.originalPrice);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("subcategory", formData.subcategory);
    formDataToSend.append("brand", formData.brand);
    formDataToSend.append("isSubsidy", formData.isSubsidy);
    formDataToSend.append("soldCount", formData.soldCount);
    formDataToSend.append("shop", formData.shop);
    formDataToSend.append("attributes", JSON.stringify(attributes.filter(attr => attr.name && attr.values.length > 0)));

    // only append new images if they were selected
    if (images.length > 0) images.forEach((image) => formDataToSend.append("images", image));

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, formData: formDataToSend });
    } else {
      createProductMutation.mutate(formDataToSend);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-base-content/70 mt-1">Manage your product inventory</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {products?.map((product) => {
          const status = getStockStatusBadge(product.stock);

          return (
            <div key={product._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-6">
                  <div className="avatar">
                    <div className="w-20 rounded-xl">
                      <img src={product.images[0]} alt={product.name} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="card-title">{product.name}</h3>
                        <div className="flex items-center gap-2 text-base-content/70 text-sm">
                          <span>{product.category}</span>
                          <span>•</span>
                          <span className="text-primary font-medium">{product.vendor?.shopName || product.shop?.name || "Unknown Vendor"}</span>
                        </div>
                      </div>
                      <div className={`badge ${status.class}`}>{status.text}</div>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div>
                        <p className="text-xs text-base-content/70">Price</p>
                        <p className="font-bold text-lg">${product.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/70">Stock</p>
                        <p className="font-bold text-lg">{product.stock} units</p>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-square btn-ghost"
                      onClick={() => handleEdit(product)}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="btn btn-square btn-ghost text-error"
                      onClick={() => deleteProductMutation.mutate(product._id)}
                    >
                      {deleteProductMutation.isPending ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <Trash2Icon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD/EDIT PRODUCT MODAL */}

      <input type="checkbox" className="modal-toggle" checked={showModal} />

      <div className="modal">
        <div className="modal-box max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Product Name</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter product name"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Category</span>
                </label>
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
                <label className="label">
                  <span>Subcategory</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  disabled={!formData.category}
                >
                  <option value="">Select subcategory</option>
                  {categories
                    .find((c) => c.name === formData.category)
                    ?.subcategories?.map((sub) => (
                      <option key={sub.name} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Brand</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nike, Apple"
                  className="input input-bordered"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
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
                <label className="label">
                  <span>Sold Count (Display)</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered"
                  value={formData.soldCount}
                  onChange={(e) => setFormData({ ...formData, soldCount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Current Price ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Original Price ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered opacity-70"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Stock</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span>Shop (Optional)</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.shop}
                onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
              >
                <option value="">Select shop</option>
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span>Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* PRODUCT ATTRIBUTES */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base">Product Attributes</span>
                <button
                  type="button"
                  onClick={() => setAttributes([...attributes, { name: "", values: [""] }])}
                  className="btn btn-xs btn-outline btn-primary"
                >
                  Add Attribute
                </button>
              </label>

              <div className="space-y-4 bg-base-200 p-4 rounded-xl">
                {attributes.map((attr, attrIndex) => (
                  <div key={attrIndex} className="bg-base-100 p-4 rounded-lg relative">
                    <button
                      type="button"
                      onClick={() => setAttributes(attributes.filter((_, i) => i !== attrIndex))}
                      className="btn btn-xs btn-circle btn-ghost absolute right-2 top-2  text-error"
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
                  <p className="text-center text-xs text-base-content/50 italic">No attributes added yet</p>
                )}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Images
                </span>
                <span className="label-text-alt text-xs opacity-60">Max 3 images</span>
              </label>

              <div className="bg-base-200 rounded-xl p-4 border-2 border-dashed border-base-300 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input file-input-bordered file-input-primary w-full"
                  required={!editingProduct}
                />

                {editingProduct && (
                  <p className="text-xs text-base-content/60 mt-2 text-center">
                    Leave empty to keep current images
                  </p>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="avatar">
                      <div className="w-20 rounded-lg">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={closeModal}
                className="btn"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {createProductMutation.isPending || updateProductMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
