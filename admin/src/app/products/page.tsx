"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  coverImage: string;
  previewMedia: string[];
  fileUrls: string[];
  status: "Draft" | "Approved" | "Scheduled";
  publishDate?: string;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  downloads: number;
  views: number;
  revenue: number;
}

function ProductsContent() {
  const [activeTab, setActiveTab] = useState<"list" | "form" | "analytics">("list");
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (tabParam === "list" || tabParam === "form" || tabParam === "analytics") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [products, setProducts] = useState<Product[]>([]);

  const refreshProducts = () => {
    fetch("https://digital-product-1-l3qr.onrender.com/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((err) => console.log("Failed to load products from storefront API:", err));
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Form State
  const [formId, setFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formCategory, setFormCategory] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formCover, setFormCover] = useState("");
  const [formFileUrls, setFormFileUrls] = useState("");
  const [formStatus, setFormStatus] = useState<"Draft" | "Approved" | "Scheduled">("Approved");
  const [formPublishDate, setFormPublishDate] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formMetaTitle, setFormMetaTitle] = useState("");
  const [formMetaDesc, setFormMetaDesc] = useState("");

  const [adminCategories, setAdminCategories] = useState<any[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    fetch("https://digital-product-1-l3qr.onrender.com/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAdminCategories(data);
          if (data.length > 0 && !formCategory) {
            setFormCategory(data[0].name);
          }
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = "unsigned_preset"; // Or your preset
    if (!cloudName) {
      alert("Missing Cloudinary Cloud Name in environment variables.");
      return null;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      alert("Failed to upload file to Cloudinary.");
      return null;
    }
  };

  const handleEdit = (prod: Product) => {
    setFormId(prod.id);
    setFormTitle(prod.title);
    setFormDesc(prod.description);
    setFormPrice(prod.price);
    setFormCategory(prod.category);
    setFormTags(prod.tags.join(", "));
    setFormCover(prod.coverImage);
    setFormFileUrls(prod.fileUrls.join(", "));
    setFormStatus(prod.status);
    setFormPublishDate(prod.publishDate || "");
    setFormIsFeatured(prod.isFeatured);
    setFormMetaTitle(prod.metaTitle);
    setFormMetaDesc(prod.metaDescription);
    setActiveTab("form");
  };

  const handleDuplicate = (prod: Product) => {
    const duplicated: Product = {
      ...prod,
      id: Date.now().toString(),
      title: `${prod.title} (Copy)`,
      downloads: 0,
      views: 0,
      revenue: 0,
    };
    fetch("https://digital-product-1-l3qr.onrender.com/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(duplicated),
    })
      .then(() => refreshProducts())
      .catch(() => setProducts([...products, duplicated]));
  };

  const handleDelete = (id: string) => {
    fetch(`https://digital-product-1-l3qr.onrender.com/api/products?id=${id}`, {
      method: "DELETE",
    })
      .then(() => refreshProducts())
      .catch(() => setProducts(products.filter((p) => p.id !== id)));
  };

  const handleToggleFeatured = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, isFeatured: !target.isFeatured };
    fetch("https://digital-product-1-l3qr.onrender.com/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
      .then(() => refreshProducts())
      .catch(() =>
        setProducts(
          products.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
        )
      );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formTags.split(",").map((t) => t.trim()).filter((t) => t !== "");
    const fileArray = formFileUrls.split(",").map((f) => f.trim()).filter((f) => f !== "");

    if (formId) {
      // Edit mode
      const updatedProduct = {
        id: formId,
        title: formTitle,
        description: formDesc,
        price: Number(formPrice),
        category: formCategory,
        tags: tagsArray,
        coverImage: formCover,
        fileUrls: fileArray,
        status: formStatus,
        publishDate: formPublishDate || undefined,
        isFeatured: formIsFeatured,
        metaTitle: formMetaTitle,
        metaDescription: formMetaDesc,
      };

      fetch("https://digital-product-1-l3qr.onrender.com/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      })
        .then(() => refreshProducts())
        .catch(() =>
          setProducts(
            products.map((p) => (p.id === formId ? { ...p, ...updatedProduct } : p))
          )
        );
    } else {
      // Add mode
      const newProduct: Product = {
        id: Date.now().toString(),
        title: formTitle,
        description: formDesc,
        price: Number(formPrice),
        category: formCategory,
        tags: tagsArray,
        coverImage: formCover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        previewMedia: [],
        fileUrls: fileArray,
        status: formStatus,
        publishDate: formPublishDate || undefined,
        isFeatured: formIsFeatured,
        metaTitle: formMetaTitle,
        metaDescription: formMetaDesc,
        downloads: 0,
        views: 0,
        revenue: 0,
      };

      fetch("https://digital-product-1-l3qr.onrender.com/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })
        .then(() => refreshProducts())
        .catch(() => setProducts([...products, newProduct]));
    }

    // Reset Form
    clearForm();
    setActiveTab("list");
  };

  const clearForm = () => {
    setFormId(null);
    setFormTitle("");
    setFormDesc("");
    setFormPrice(0);
    setFormCategory("Design Templates");
    setFormTags("");
    setFormCover("");
    setFormFileUrls("");
    setFormStatus("Approved");
    setFormPublishDate("");
    setFormIsFeatured(false);
    setFormMetaTitle("");
    setFormMetaDesc("");
  };

  // Bulk export simulation
  const handleBulkExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "products_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Bulk import simulation
  const handleBulkImport = () => {
    alert("Bulk import mock: Uploading database template CSV/JSON file to synchronize products list.");
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Product Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage catalog listings, draft states, tags, publishing logs, and analytics.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              clearForm();
              setActiveTab("form");
            }}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            + Create Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab("list")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "list" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📂 Catalog List
        </button>
        <button
          onClick={() => setActiveTab("form")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "form" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📝 {formId ? "Edit Product" : "Add Product"}
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "analytics" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📈 Stats & Downloads
        </button>
      </div>

      {/* CONTENT TABS */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-2 w-full md:max-w-md">
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={handleBulkImport}
                className="flex-1 md:flex-none px-4 py-2 bg-muted hover:bg-muted/80 font-semibold rounded-xl text-sm transition-colors"
              >
                📥 Import
              </button>
              <button
                onClick={handleBulkExport}
                className="flex-1 md:flex-none px-4 py-2 bg-muted hover:bg-muted/80 font-semibold rounded-xl text-sm transition-colors"
              >
                📤 Export
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="admin-panel rounded-2xl overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-40 bg-gradient-to-r from-slate-800 to-indigo-950 relative flex items-center justify-center text-muted-foreground text-sm font-semibold">
                    {prod.coverImage ? (
                      <img src={prod.coverImage} alt={prod.title} className="w-full h-full object-cover" />
                    ) : (
                      "No Cover"
                    )}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold ${
                      prod.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                      prod.status === "Draft" ? "bg-muted text-muted-foreground" : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {prod.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs text-primary font-bold uppercase">{prod.category}</span>
                      <span className="text-lg font-black text-primary">${prod.price}</span>
                    </div>
                    <h3 className="text-lg font-bold line-clamp-1">{prod.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{prod.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-2">
                      {prod.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {/* Live Views / Download Stats */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3 text-[11px] text-muted-foreground border-t border-border/30">
                      <span>👁️ <strong>{prod.views || 0}</strong> views</span>
                      <span>📥 <strong>{prod.downloads || 0}</strong> downloads</span>
                      <span>💵 <strong className="text-primary">${prod.revenue || 0}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-border bg-muted/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="checkbox" 
                        checked={prod.isFeatured}
                        onChange={() => handleToggleFeatured(prod.id)}
                        className="accent-primary w-4 h-4 cursor-pointer"
                        id={`featured-${prod.id}`}
                      />
                      <label htmlFor={`featured-${prod.id}`} className="cursor-pointer font-medium select-none">
                        Featured Product
                      </label>
                    </div>
                    {prod.publishDate && <span>📅 {prod.publishDate}</span>}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(prod)}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-xs font-bold rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      🔂 Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-lg transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "form" && (
        <form onSubmit={handleFormSubmit} className="admin-panel p-8 rounded-2xl space-y-6">
          <h3 className="text-xl font-bold border-b border-border pb-3">
            {formId ? "Modify Product Listing" : "Add New Digital Product"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title & Description */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js App Boilerplate"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                <textarea
                  required
                  placeholder="Tell customers what is included..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="49"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {adminCategories.length === 0 ? (
                      <option value="">Loading...</option>
                    ) : (
                      adminCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="nextjs, react, ui-kit"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Media & Publishing Configuration */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Cover Image (Upload or URL)</label>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingCover(true);
                        const url = await uploadToCloudinary(file);
                        if (url) setFormCover(url);
                        setUploadingCover(false);
                      }
                    }}
                    className="w-full md:w-auto bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={uploadingCover ? "Uploading to Cloudinary..." : formCover}
                    onChange={(e) => setFormCover(e.target.value)}
                    disabled={uploadingCover}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Digital Product Files (Upload or URLs)</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        setUploadingFiles(true);
                        const urls = [];
                        for (const file of files) {
                          const url = await uploadToCloudinary(file);
                          if (url) urls.push(url);
                        }
                        const existing = formFileUrls ? formFileUrls.split(',').map(u=>u.trim()).filter(Boolean) : [];
                        setFormFileUrls([...existing, ...urls].join(", "));
                        setUploadingFiles(false);
                      }
                    }}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="https://cloudinary.com/... OR https://drive.google.com/... (comma separated)"
                    value={uploadingFiles ? "Uploading files to Cloudinary... Please wait." : formFileUrls}
                    onChange={(e) => setFormFileUrls(e.target.value)}
                    disabled={uploadingFiles}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Approved">Active (Approved)</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
                {formStatus === "Scheduled" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Publish Date</label>
                    <input
                      type="date"
                      value={formPublishDate}
                      onChange={(e) => setFormPublishDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* SEO Config */}
              <div className="border-t border-border pt-4 mt-4 space-y-3">
                <h4 className="font-bold text-sm">Product Search Engine Optimization (SEO)</h4>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Meta Title</label>
                  <input
                    type="text"
                    placeholder="SEO title tag"
                    value={formMetaTitle}
                    onChange={(e) => setFormMetaTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Meta Description</label>
                  <textarea
                    placeholder="Brief summary for search result snippets"
                    value={formMetaDesc}
                    onChange={(e) => setFormMetaDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-4 border-t border-border">
            <input 
              type="checkbox" 
              checked={formIsFeatured}
              onChange={() => setFormIsFeatured(!formIsFeatured)}
              className="accent-primary w-5 h-5 cursor-pointer"
              id="form-featured"
            />
            <label htmlFor="form-featured" className="cursor-pointer text-sm font-semibold select-none">
              Mark this listing as a Featured Product
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              {formId ? "Save Changes" : "Publish Product"}
            </button>
            <button
              type="button"
              onClick={() => {
                clearForm();
                setActiveTab("list");
              }}
              className="px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Product Downloads & Sales Analytics</h3>
          <div className="admin-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Product</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground text-center">Views</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground text-center">Downloads</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground text-center">Conversion Rate</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const convRate = prod.views > 0 ? ((prod.downloads / prod.views) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={prod.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold">{prod.title}</td>
                      <td className="p-4 text-center font-semibold text-muted-foreground">{prod.views}</td>
                      <td className="p-4 text-center font-semibold text-cyan-400">{prod.downloads} downloads</td>
                      <td className="p-4 text-center text-sm font-bold text-emerald-500">{convRate}%</td>
                      <td className="p-4 font-black text-primary">${prod.revenue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Loading Catalog View...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
