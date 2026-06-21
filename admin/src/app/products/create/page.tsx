"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();

  // Form State
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
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  const [adminCategories, setAdminCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://digital-product-store-l9r1.onrender.com/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAdminCategories(data);
          if (data.length > 0) {
            setFormCategory(data[0].name);
          }
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      alert("Cloudinary cloud name is not set in admin/.env.local!");
      return null;
    }

    try {
      // 1. Fetch secure signature from backend
      const sigRes = await fetch("https://digital-product-store-l9r1.onrender.com/api/upload/signature");
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const { timestamp, signature } = await sigRes.json();

      // 2. Upload file directly to Cloudinary using the signature
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", "915851656698785"); // User's API Key
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error.message);
      
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary secure upload error:", err);
      alert("Failed to securely upload file to Cloudinary.");
      return null;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tagsArray = formTags.split(",").map((t) => t.trim()).filter((t) => t !== "");
    const fileArray = formFileUrls.split(",").map((f) => f.trim()).filter((f) => f !== "");

    const newProduct = {
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

    try {
      await fetch("https://digital-product-store-l9r1.onrender.com/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      router.push("/products?tab=list");
    } catch (err) {
      console.error("Failed to create product:", err);
      alert("Failed to sync product with storefront backend. Saved locally.");
      router.push("/products?tab=list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Upload New Product</h2>
          <p className="text-muted-foreground text-sm mt-1">Publish a digital asset to the storefront catalog.</p>
        </div>
        <button
          onClick={() => router.push("/products?tab=list")}
          className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl text-sm transition-colors"
        >
          Back to Catalog
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="admin-panel p-8 rounded-2xl space-y-6">
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
                placeholder="Tell customers what is included in the package..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={5}
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
                  className="w-full md:w-1/3 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={uploadingCover ? "Uploading image to Cloudinary..." : formCover}
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
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/products?tab=list")}
            className="px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
