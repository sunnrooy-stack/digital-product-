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
  features?: string[];
  demoUrl?: string;
  aspectRatio?: string;
  coverAspectRatio?: string;
  preview1AspectRatio?: string;
  preview2AspectRatio?: string;
  preview3AspectRatio?: string;
  aspectRatios?: string[];
  previewGallery?: any[];
  status: "Draft" | "Approved" | "Scheduled" | string;
  publishDate?: string;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  downloads: number;
  views: number;
  revenue: number;
  [key: string]: any;
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

  const getLocalProducts = (): Product[] => {
    try {
      const stored = localStorage.getItem("admin_local_products");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const mergeLocalWithFetched = (fetchedData: Product[]): Product[] => {
    const local = getLocalProducts();
    const map = new Map<string, Product>();
    const titleMap = new Map<string, string>();

    fetchedData.forEach((p) => {
      map.set(String(p.id), p);
      if (p.title) {
        titleMap.set(p.title.trim().toLowerCase(), String(p.id));
      }
    });

    local.forEach((p) => {
      const titleKey = p.title ? p.title.trim().toLowerCase() : "";
      if (map.has(String(p.id))) {
        map.set(String(p.id), { ...map.get(String(p.id)), ...p });
      } else if (titleKey && titleMap.has(titleKey)) {
        const dbId = titleMap.get(titleKey)!;
        map.set(dbId, { ...map.get(dbId), ...p, id: dbId });
      } else {
        map.set(String(p.id), p);
      }
    });

    return Array.from(map.values());
  };

  const refreshProducts = () => {
    fetch(`http://localhost:5000/api/products?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(mergeLocalWithFetched(data));
        } else {
          fetch(`https://digital-product-1-l3qr.onrender.com/api/products?t=${new Date().getTime()}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((remoteData) => { if (Array.isArray(remoteData)) setProducts(mergeLocalWithFetched(remoteData)); })
            .catch(() => setProducts(getLocalProducts()));
        }
      })
      .catch(() => {
        fetch(`https://digital-product-1-l3qr.onrender.com/api/products?t=${new Date().getTime()}`, { cache: "no-store" })
          .then((r) => r.json())
          .then((remoteData) => { if (Array.isArray(remoteData)) setProducts(mergeLocalWithFetched(remoteData)); })
          .catch(() => setProducts(getLocalProducts()));
      });
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Feature Tag Badges
  const AVAILABLE_FEATURE_TAGS = ["FEATURED", "NEW", "POPULAR", "TRENDING", "PREMIUM"];
  const AVAILABLE_PLATFORM_TAGS = ["pc", "windows", "mac", "mobile", "android", "ios"];
  const AVAILABLE_AI_TAGS = ["chatgpt", "claude", "gemini", "grok"];
  const AVAILABLE_COURSE_TAGS = ["ai-tech", "digital-marketing", "business", "programming"];
  const AVAILABLE_DESIGN_TAGS = ["graphic-design", "ui-ux", "3d-assets", "video-motion"];
  const AVAILABLE_PRESET_TAGS = [
    "preset-pc", "preset-mobile",
    "after-effects", "premiere", "photoshop", "lightroom", "davinci", "blender", "final-cut",
    "alight-motion", "capcut", "vn", "kinemaster", "picsart", "lightroom-mobile"
  ];

  const [selectedFeatureTags, setSelectedFeatureTags] = useState<Record<string, boolean>>({
    FEATURED: true,
    NEW: true,
    POPULAR: false,
    TRENDING: false,
    PREMIUM: false,
  });

  const [selectedPlatformTags, setSelectedPlatformTags] = useState<Record<string, boolean>>({
    pc: false,
    windows: false,
    mac: false,
    mobile: false,
    android: false,
    ios: false,
  });

  const [selectedAiTags, setSelectedAiTags] = useState<Record<string, boolean>>({
    chatgpt: false,
    claude: false,
    gemini: false,
    grok: false,
  });

  const [selectedCourseTags, setSelectedCourseTags] = useState<Record<string, boolean>>({
    "ai-tech": false,
    "digital-marketing": false,
    business: false,
    programming: false,
  });

  const [selectedDesignTags, setSelectedDesignTags] = useState<Record<string, boolean>>({
    "graphic-design": false,
    "ui-ux": false,
    "3d-assets": false,
    "video-motion": false,
  });

  const [selectedPresetTags, setSelectedPresetTags] = useState<Record<string, boolean>>({
    "preset-pc": false,
    "preset-mobile": false,
    "after-effects": false,
    premiere: false,
    photoshop: false,
    lightroom: false,
    davinci: false,
    blender: false,
    "final-cut": false,
    "alight-motion": false,
    capcut: false,
    vn: false,
    kinemaster: false,
    picsart: false,
    "lightroom-mobile": false,
  });

  const toggleFeatureTag = (tag: string) => {
    setSelectedFeatureTags((prev) => {
      const updated = { ...prev, [tag]: !prev[tag] };
      if (tag === "FEATURED") {
        setFormIsFeatured(updated.FEATURED);
      }
      return updated;
    });
  };

  const togglePlatformTag = (tag: string) => {
    setSelectedPlatformTags((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  const toggleAiTag = (tag: string) => {
    setSelectedAiTags((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  const toggleCourseTag = (tag: string) => {
    setSelectedCourseTags((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  const toggleDesignTag = (tag: string) => {
    setSelectedDesignTags((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  const togglePresetTag = (tag: string) => {
    setSelectedPresetTags((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  // Form State
  const [formId, setFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formFeatures, setFormFeatures] = useState("");
  const [formPrice, setFormPrice] = useState<number | string>("");
  const [formCategory, setFormCategory] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formCover, setFormCover] = useState("");
  const [formDemoUrl, setFormDemoUrl] = useState("");
  const [formCoverAspectRatio, setFormCoverAspectRatio] = useState<string>("16:9");
  const [formPreview1AspectRatio, setFormPreview1AspectRatio] = useState<string>("16:9");
  const [formPreview2AspectRatio, setFormPreview2AspectRatio] = useState<string>("16:9");
  const [formPreview3AspectRatio, setFormPreview3AspectRatio] = useState<string>("16:9");
  const [formPreview1, setFormPreview1] = useState("");
  const [formPreview2, setFormPreview2] = useState("");
  const [formPreview3, setFormPreview3] = useState("");
  const [formFileUrls, setFormFileUrls] = useState("");
  const [formStatus, setFormStatus] = useState<"Draft" | "Approved" | "Scheduled" | string>("Approved");
  const [formPublishDate, setFormPublishDate] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formMetaTitle, setFormMetaTitle] = useState("");
  const [formMetaDesc, setFormMetaDesc] = useState("");

  const [adminCategories, setAdminCategories] = useState<any[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPreview1, setUploadingPreview1] = useState(false);
  const [uploadingPreview2, setUploadingPreview2] = useState(false);
  const [uploadingPreview3, setUploadingPreview3] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    fetch(`https://digital-product-1-l3qr.onrender.com/api/categories?t=${new Date().getTime()}`, { cache: "no-store" })
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
    setFormTitle(prod.title || "");
    setFormDesc(prod.description || "");
    setFormFeatures((prod.features || []).join("\n"));
    setFormPrice(prod.price ?? "");
    setFormCategory(prod.category || "");
    setFormCoverAspectRatio((prod as any).coverAspectRatio || (prod as any).aspectRatio || "16:9");
    setFormPreview1AspectRatio((prod as any).preview1AspectRatio || "16:9");
    setFormPreview2AspectRatio((prod as any).preview2AspectRatio || "16:9");
    setFormPreview3AspectRatio((prod as any).preview3AspectRatio || "16:9");

    const prodTagsUpper = (prod.tags || []).map((t) => String(t).toUpperCase().trim());
    const prodTagsNormalized = (prod.tags || []).map((t) => String(t).toLowerCase().trim().replace(/[\s_]+/g, '-'));

    const hasTag = (tagKey: string) => {
      const normKey = tagKey.toLowerCase().trim().replace(/[\s_]+/g, '-');
      const normNoHyphen = normKey.replace(/-/g, '');
      return prodTagsNormalized.some((t) => t === normKey || t === normNoHyphen || t.includes(normKey) || normKey.includes(t));
    };

    setSelectedFeatureTags({
      FEATURED: !!prod.isFeatured || prodTagsUpper.includes("FEATURED"),
      NEW: prodTagsUpper.includes("NEW"),
      POPULAR: prodTagsUpper.includes("POPULAR"),
      TRENDING: prodTagsUpper.includes("TRENDING"),
      PREMIUM: prodTagsUpper.includes("PREMIUM"),
    });

    setSelectedPlatformTags({
      pc: hasTag("pc"),
      windows: hasTag("windows"),
      mac: hasTag("mac"),
      mobile: hasTag("mobile"),
      android: hasTag("android"),
      ios: hasTag("ios"),
    });

    setSelectedAiTags({
      chatgpt: hasTag("chatgpt"),
      claude: hasTag("claude"),
      gemini: hasTag("gemini"),
      grok: hasTag("grok"),
    });

    setSelectedCourseTags({
      "ai-tech": hasTag("ai-tech"),
      "digital-marketing": hasTag("digital-marketing"),
      business: hasTag("business"),
      programming: hasTag("programming"),
    });

    setSelectedDesignTags({
      "graphic-design": hasTag("graphic-design"),
      "ui-ux": hasTag("ui-ux"),
      "3d-assets": hasTag("3d-assets"),
      "video-motion": hasTag("video-motion"),
    });

    setSelectedPresetTags({
      "preset-pc": hasTag("preset-pc"),
      "preset-mobile": hasTag("preset-mobile"),
      "after-effects": hasTag("after-effects") || hasTag("aftereffects"),
      premiere: hasTag("premiere"),
      photoshop: hasTag("photoshop"),
      lightroom: hasTag("lightroom"),
      davinci: hasTag("davinci"),
      blender: hasTag("blender"),
      "final-cut": hasTag("final-cut") || hasTag("finalcut"),
      "alight-motion": hasTag("alight-motion") || hasTag("alightmotion"),
      capcut: hasTag("capcut"),
      vn: hasTag("vn"),
      kinemaster: hasTag("kinemaster"),
      picsart: hasTag("picsart"),
      "lightroom-mobile": hasTag("lightroom-mobile") || hasTag("lightroommobile"),
    });

    const customTags = (prod.tags || []).filter(
      (t) => {
        const norm = String(t).toLowerCase().trim().replace(/[\s_]+/g, '-');
        return !AVAILABLE_FEATURE_TAGS.includes(t.toUpperCase()) &&
               !AVAILABLE_PLATFORM_TAGS.some(p => norm.includes(p)) &&
               !AVAILABLE_AI_TAGS.some(a => norm.includes(a)) &&
               !AVAILABLE_COURSE_TAGS.some(c => norm.includes(c)) &&
               !AVAILABLE_DESIGN_TAGS.some(d => norm.includes(d)) &&
               !AVAILABLE_PRESET_TAGS.some(pr => norm.includes(pr));
      }
    );
    setFormTags(customTags.join(", "));
    setFormCover(prod.coverImage || "");
    setFormDemoUrl(prod.demoUrl || "");
    setFormPreview1(prod.previewMedia?.[0] || "");
    setFormPreview2(prod.previewMedia?.[1] || "");
    setFormPreview3(prod.previewMedia?.[2] || "");
    setFormFileUrls((prod.fileUrls || []).join(", "));
    setFormStatus(prod.status || "Approved");
    setFormPublishDate(prod.publishDate || "");
    setFormIsFeatured(!!prod.isFeatured);
    setFormMetaTitle(prod.metaTitle || "");
    setFormMetaDesc(prod.metaDescription || "");
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
    setProducts([...products, duplicated]);
    fetch("https://digital-product-1-l3qr.onrender.com/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(duplicated),
    })
      .then(res => { if (!res.ok) alert("Failed to duplicate product!"); })
      .finally(() => refreshProducts());
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    try {
      const stored = getLocalProducts();
      localStorage.setItem("admin_local_products", JSON.stringify(stored.filter((p) => String(p.id) !== String(id))));
    } catch (e) {}

    Promise.allSettled([
      fetch(`http://localhost:5000/api/products/${id}`, { method: "DELETE" }).catch(() => null),
      fetch(`https://digital-product-1-l3qr.onrender.com/api/products/${id}`, { method: "DELETE" }).catch(() => null),
    ]).finally(() => refreshProducts());
  };

  const handleToggleFeatured = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const isNowFeatured = !target.isFeatured;
    let updatedTags = [...(target.tags || [])];
    if (isNowFeatured) {
      if (!updatedTags.map(t => t.toUpperCase()).includes("FEATURED")) {
        updatedTags.push("FEATURED");
      }
    } else {
      updatedTags = updatedTags.filter(t => t.toUpperCase() !== "FEATURED");
    }
    const updated = { ...target, isFeatured: isNowFeatured, tags: updatedTags };

    // 1. Instant local UI update
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));

    // 2. Persist to backend endpoints
    const payload = JSON.stringify({ isFeatured: isNowFeatured, tags: updatedTags });

    fetch(`http://localhost:5000/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }).catch(() => null);

    fetch(`https://digital-product-1-l3qr.onrender.com/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }).catch(() => null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeBadges = Object.keys(selectedFeatureTags).filter((t) => selectedFeatureTags[t]);
    const activePlatforms = Object.keys(selectedPlatformTags).filter((t) => selectedPlatformTags[t]);
    const activeAiTools = Object.keys(selectedAiTags).filter((t) => selectedAiTags[t]);
    const activeCourseTopics = Object.keys(selectedCourseTags).filter((t) => selectedCourseTags[t]);
    const activeDesignTopics = Object.keys(selectedDesignTags).filter((t) => selectedDesignTags[t]);
    const activePresetTags = Object.keys(selectedPresetTags).filter((t) => selectedPresetTags[t]);
    const customTagsArray = formTags.split(",").map((t) => t.trim()).filter((t) => t !== "" && !AVAILABLE_FEATURE_TAGS.includes(t.toUpperCase()) && !AVAILABLE_PLATFORM_TAGS.includes(t.toLowerCase()) && !AVAILABLE_AI_TAGS.includes(t.toLowerCase()) && !AVAILABLE_COURSE_TAGS.includes(t.toLowerCase()) && !AVAILABLE_DESIGN_TAGS.includes(t.toLowerCase()) && !AVAILABLE_PRESET_TAGS.includes(t.toLowerCase()));
    const tagsArray = Array.from(new Set([...activeBadges, ...activePlatforms, ...activeAiTools, ...activeCourseTopics, ...activeDesignTopics, ...activePresetTags, ...customTagsArray]));
    const fileArray = formFileUrls.split(",").map((f) => f.trim()).filter((f) => f !== "");
    const previewArray = [formPreview1, formPreview2, formPreview3].map((u) => u.trim()).filter((u) => u !== "");
    const featuresArray = formFeatures.split("\n").map((f) => f.trim()).filter((f) => f !== "");
    const isProductFeatured = selectedFeatureTags.FEATURED || formIsFeatured;

    if (formId) {
      // Edit mode
      const updatedProduct = {
        id: formId,
        title: formTitle,
        description: formDesc,
        price: Number(formPrice),
        category: formCategory,
        tags: tagsArray,
        coverImage: formCover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        demoUrl: formDemoUrl,
        aspectRatio: formCoverAspectRatio,
        coverAspectRatio: formCoverAspectRatio,
        preview1AspectRatio: formPreview1AspectRatio,
        preview2AspectRatio: formPreview2AspectRatio,
        preview3AspectRatio: formPreview3AspectRatio,
        aspectRatios: [formCoverAspectRatio, formPreview1AspectRatio, formPreview2AspectRatio, formPreview3AspectRatio],
        previewMedia: previewArray,
        fileUrls: fileArray,
        features: featuresArray,
        status: formStatus,
        publishDate: formPublishDate || undefined,
        isFeatured: isProductFeatured,
        metaTitle: formMetaTitle,
        metaDescription: formMetaDesc,
        downloads: 0,
        views: 0,
        revenue: 0,
      };

      setProducts(products.map((p) => (p.id === formId ? { ...p, ...updatedProduct } : p)));

      // Persist to local storage for instant local storefront sync
      try {
        const stored = getLocalProducts();
        const updatedList = stored.map((p) => (String(p.id) === String(formId) ? { ...p, ...updatedProduct } : p));
        if (!stored.some((p) => String(p.id) === String(formId))) {
          updatedList.push(updatedProduct as any);
        }
        localStorage.setItem("admin_local_products", JSON.stringify(updatedList));
      } catch (e) {}

      // Dual PUT to local backend & remote Render server
      Promise.allSettled([
        fetch(`http://localhost:5000/api/products/${formId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProduct),
        }).catch(() => null),
        fetch(`https://digital-product-1-l3qr.onrender.com/api/products/${formId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProduct),
        }).catch(() => null),
      ]).finally(() => refreshProducts());
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
        demoUrl: formDemoUrl,
        aspectRatio: formCoverAspectRatio,
        coverAspectRatio: formCoverAspectRatio,
        preview1AspectRatio: formPreview1AspectRatio,
        preview2AspectRatio: formPreview2AspectRatio,
        preview3AspectRatio: formPreview3AspectRatio,
        aspectRatios: [formCoverAspectRatio, formPreview1AspectRatio, formPreview2AspectRatio, formPreview3AspectRatio],
        previewMedia: previewArray,
        fileUrls: fileArray,
        features: featuresArray,
        status: formStatus,
        publishDate: formPublishDate || undefined,
        isFeatured: isProductFeatured,
        metaTitle: formMetaTitle,
        metaDescription: formMetaDesc,
        downloads: 0,
        views: 0,
        revenue: 0,
      };

      (async () => {
        let createdProduct: any = newProduct;
        try {
          let res = await fetch("http://localhost:5000/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProduct),
          }).catch(() => null);

          if (res && res.ok) {
            const data = await res.json().catch(() => null);
            if (data && data.product) createdProduct = data.product;
          } else {
            res = await fetch("https://digital-product-1-l3qr.onrender.com/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newProduct),
            }).catch(() => null);
            if (res && res.ok) {
              const data = await res.json().catch(() => null);
              if (data && data.product) createdProduct = data.product;
            }
          }
        } catch (err) {
          console.error("Product create sync notice:", err);
        }

        // Persist to local storage cleanly without duplicates
        try {
          const stored = getLocalProducts();
          const updated = [
            createdProduct,
            ...stored.filter(
              (p) =>
                String(p.id) !== String(createdProduct.id) &&
                String(p.id) !== String(newProduct.id) &&
                (!p.title || !createdProduct.title || p.title.trim().toLowerCase() !== createdProduct.title.trim().toLowerCase())
            ),
          ];
          localStorage.setItem("admin_local_products", JSON.stringify(updated));
        } catch (e) {}

        refreshProducts();
      })();
    }

    // Reset Form
    clearForm();
    setActiveTab("list");
  };

  const clearForm = () => {
    setFormId(null);
    setFormTitle("");
    setFormDesc("");
    setFormFeatures("");
    setFormPrice("");
    setFormCategory("Design Templates");
    setFormCoverAspectRatio("16:9");
    setFormPreview1AspectRatio("16:9");
    setFormPreview2AspectRatio("16:9");
    setFormPreview3AspectRatio("16:9");
    setSelectedFeatureTags({
      FEATURED: true,
      NEW: true,
      POPULAR: false,
      TRENDING: false,
      PREMIUM: false,
    });
    setFormTags("");
    setFormCover("");
    setFormDemoUrl("");
    setFormPreview1("");
    setFormPreview2("");
    setFormPreview3("");
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
    <div className="w-full max-w-7xl mx-auto space-y-8">
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
                      {prod.price <= 0 ? (
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          FREE
                        </span>
                      ) : (
                        <span className="text-lg font-black text-primary">${prod.price}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold line-clamp-1">{prod.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{prod.description}</p>
                    
                    {/* Feature Badges & Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {prod.isFeatured && !(prod.tags || []).map(t=>t.toUpperCase()).includes("FEATURED") && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                          ⭐ FEATURED
                        </span>
                      )}
                      {(prod.tags || []).map((tag) => {
                        const uTag = tag.toUpperCase();
                        if (uTag === "FEATURED") return <span key={tag} className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">⭐ FEATURED</span>;
                        if (uTag === "NEW") return <span key={tag} className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">✨ NEW</span>;
                        if (uTag === "POPULAR") return <span key={tag} className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">🔥 POPULAR</span>;
                        if (uTag === "TRENDING") return <span key={tag} className="text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">📈 TRENDING</span>;
                        if (uTag === "PREMIUM") return <span key={tag} className="text-[10px] bg-gradient-to-r from-amber-500/30 to-purple-500/30 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">👑 PREMIUM</span>;
                        return (
                          <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">
                            #{tag}
                          </span>
                        );
                      })}
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
                        checked={!!prod.isFeatured || (prod.tags || []).map(t => String(t).toUpperCase()).includes("FEATURED")}
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
        <form onSubmit={handleFormSubmit} className="admin-panel p-6 sm:p-8 lg:p-10 rounded-3xl space-y-8">
          <h3 className="text-2xl font-extrabold border-b border-border pb-4">
            {formId ? "Modify Product Listing" : "Add New Digital Product"}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Title & Description */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js App Boilerplate"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-base text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  required
                  placeholder="Tell customers about this product package..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={5}
                  className="w-full bg-background border border-border rounded-xl p-4 text-base text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase flex items-center justify-between">
                  <span>⚡ What&apos;s Included / Bullet Points</span>
                  <span className="text-xs text-primary font-medium lowercase">(one item per line)</span>
                </label>
                <textarea
                  placeholder="Full source code download&#10;Figma design templates&#10;Comprehensive setup documentation&#10;Lifetime updates"
                  value={formFeatures || ""}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  rows={5}
                  className="w-full bg-background border border-border rounded-xl p-4 text-sm md:text-base text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">Price (₹ INR or $ USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="49"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-base font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
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

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Feature & Badge Tags:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-muted/20 border border-border/80 p-4 rounded-xl">
                  {AVAILABLE_FEATURE_TAGS.map((tag) => {
                    const isChecked = !!selectedFeatureTags[tag];
                    return (
                      <label
                        key={tag}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          isChecked
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "bg-background border-border text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFeatureTag(tag)}
                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                        <span className="flex items-center gap-1.5">
                          {tag === "FEATURED" && "⭐"}
                          {tag === "NEW" && "✨"}
                          {tag === "POPULAR" && "🔥"}
                          {tag === "TRENDING" && "📈"}
                          {tag === "PREMIUM" && "👑"}
                          {tag}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* 💻 Software Platform & OS Tags Section */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>💻 Software Platform & OS Tags</span>
                    <span className="text-xs text-primary font-medium lowercase">(helps clients search by PC / OS)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-muted/20 border border-border/80 p-4 rounded-xl">
                    {AVAILABLE_PLATFORM_TAGS.map((tag) => {
                      const isChecked = !!selectedPlatformTags[tag];
                      return (
                        <label
                          key={tag}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isChecked
                              ? "bg-primary/10 border-primary text-primary shadow-sm"
                              : "bg-background border-border text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePlatformTag(tag)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                          <span className="flex items-center gap-1.5 uppercase font-mono">
                            {tag === "pc" && "💻 PC"}
                            {tag === "windows" && "🪟 Windows"}
                            {tag === "mac" && "🍎 Mac"}
                            {tag === "mobile" && "📱 Mobile"}
                            {tag === "android" && "🤖 Android"}
                            {tag === "ios" && "🍏 iOS"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 🧠 AI & Tech Tool Tags Section */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>🧠 AI & Tech Tool Tags</span>
                    <span className="text-xs text-primary font-medium lowercase">(helps clients search by AI Tool)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 bg-muted/20 border border-border/80 p-4 rounded-xl">
                    {AVAILABLE_AI_TAGS.map((tag) => {
                      const isChecked = !!selectedAiTags[tag];
                      return (
                        <label
                          key={tag}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isChecked
                              ? "bg-primary/10 border-primary text-primary shadow-sm"
                              : "bg-background border-border text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAiTag(tag)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                          <span className="flex items-center gap-1.5 uppercase font-mono">
                            {tag === "chatgpt" && "🤖 ChatGPT"}
                            {tag === "claude" && "🧠 Claude AI"}
                            {tag === "gemini" && "✨ Gemini AI"}
                            {tag === "grok" && "⚡ Grok"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 📚 Course Sub-Topic Tags Section */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>📚 Course Sub-Topic Tags</span>
                    <span className="text-xs text-primary font-medium lowercase">(helps clients search by Course Topic)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 bg-muted/20 border border-border/80 p-4 rounded-xl">
                    {AVAILABLE_COURSE_TAGS.map((tag) => {
                      const isChecked = !!selectedCourseTags[tag];
                      return (
                        <label
                          key={tag}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isChecked
                              ? "bg-primary/10 border-primary text-primary shadow-sm"
                              : "bg-background border-border text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCourseTag(tag)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                          <span className="flex items-center gap-1.5 uppercase font-mono">
                            {tag === "ai-tech" && "🤖 AI & Tech"}
                            {tag === "digital-marketing" && "📢 Marketing"}
                            {tag === "business" && "💼 Business"}
                            {tag === "programming" && "💻 Coding & Dev"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 🎨 Design & Creative Asset Tags Section */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>🎨 Design & Creative Asset Tags</span>
                    <span className="text-xs text-primary font-medium lowercase">(helps clients search by Design Topic)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 bg-muted/20 border border-border/80 p-4 rounded-xl">
                    {AVAILABLE_DESIGN_TAGS.map((tag) => {
                      const isChecked = !!selectedDesignTags[tag];
                      return (
                        <label
                          key={tag}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isChecked
                              ? "bg-primary/10 border-primary text-primary shadow-sm"
                              : "bg-background border-border text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDesignTag(tag)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                          <span className="flex items-center gap-1.5 uppercase font-mono">
                            {tag === "graphic-design" && "🎨 Graphic Design"}
                            {tag === "ui-ux" && "🖥️ UI/UX Design"}
                            {tag === "3d-assets" && "📦 3D & Creative"}
                            {tag === "video-motion" && "🎬 Video & Motion"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* ✨ Presets & Software Tags Section */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>✨ Presets & Software Tags</span>
                    <span className="text-xs text-primary font-medium lowercase">(helps clients search Presets by PC/Mobile & App)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-muted/20 border border-border/80 p-4 rounded-xl">
                    {AVAILABLE_PRESET_TAGS.map((tag) => {
                      const isChecked = !!selectedPresetTags[tag];
                      return (
                        <label
                          key={tag}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isChecked
                              ? "bg-primary/10 border-primary text-primary shadow-sm"
                              : "bg-background border-border text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePresetTag(tag)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                          <span className="flex items-center gap-1.5 uppercase font-mono truncate">
                            {tag === "preset-pc" && "🖥️ Preset PC"}
                            {tag === "preset-mobile" && "📱 Preset Mobile"}
                            {tag === "after-effects" && "🎬 After Effects"}
                            {tag === "premiere" && "🎞️ Premiere Pro"}
                            {tag === "photoshop" && "🖼️ Photoshop"}
                            {tag === "lightroom" && "📷 Lightroom"}
                            {tag === "davinci" && "🎥 DaVinci"}
                            {tag === "blender" && "🧊 Blender"}
                            {tag === "final-cut" && "✂️ Final Cut"}
                            {tag === "alight-motion" && "⚡ Alight Motion"}
                            {tag === "capcut" && "🎬 CapCut"}
                            {tag === "vn" && "🎥 VN Editor"}
                            {tag === "kinemaster" && "🎞️ KineMaster"}
                            {tag === "picsart" && "🎨 PicsArt"}
                            {tag === "lightroom-mobile" && "📱 Lightroom Mob"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Additional Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="nextjs, react, ui-kit"
                    value={formTags || ""}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Media, Digital Assets & Publishing Configuration */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-5 rounded-2xl border border-border/80 bg-muted/20 space-y-5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Product Images & Gallery URLs:</h4>

                {/* Main Cover Image */}
                <div className="space-y-2 p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
                  <label className="text-xs font-bold text-primary flex items-center justify-between">
                    <span>🖼️ Main Cover Image (Primary Banner)</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Mode: {formCoverAspectRatio}</span>
                  </label>
                  <div className="space-y-2">
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
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground cursor-pointer file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    />
                    <input
                      type="text"
                      placeholder="Main Banner URL (e.g. https://images.unsplash.com/...)"
                      value={uploadingCover ? "Uploading main cover..." : (formCover || "")}
                      onChange={(e) => setFormCover(e.target.value)}
                      disabled={uploadingCover}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  {/* Aspect Ratio Selector for Main Cover */}
                  <div className="space-y-1.5 pt-2 border-t border-indigo-500/20">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                      📐 Select Main Photo Aspect Ratio / Resolution:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "16:9", icon: "🖥️" },
                        { id: "1:1", icon: "🔲" },
                        { id: "9:16", icon: "📱" },
                        { id: "4:3", icon: "📺" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setFormCoverAspectRatio(mode.id)}
                          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            formCoverAspectRatio === mode.id
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-md scale-105"
                              : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{mode.icon}</span>
                          <span>{mode.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 🌐 Live Preview URL Section */}
                <div className="space-y-2 p-4 rounded-xl border border-primary/30 bg-primary/5">
                  <label className="text-xs font-bold text-primary flex items-center justify-between">
                    <span className="flex items-center gap-1.5">🌐 Live Preview URL (Live Demo Link)</span>
                    <span className="text-[10px] text-muted-foreground lowercase">(opens live demo in new tab for clients)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/live-demo"
                    value={formDemoUrl || ""}
                    onChange={(e) => setFormDemoUrl(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>

                {/* 1st Preview Image */}
                <div className="space-y-2 p-4 rounded-xl border border-border bg-background/40">
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                    <span>📸 1st Preview Image Link (Thumbnail #1)</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Mode: {formPreview1AspectRatio}</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingPreview1(true);
                          const url = await uploadToCloudinary(file);
                          if (url) setFormPreview1(url);
                          setUploadingPreview1(false);
                        }
                      }}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground cursor-pointer file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    />
                    <input
                      type="text"
                      placeholder="1st Preview URL link..."
                      value={uploadingPreview1 ? "Uploading 1st preview..." : (formPreview1 || "")}
                      onChange={(e) => setFormPreview1(e.target.value)}
                      disabled={uploadingPreview1}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  {/* Aspect Ratio Selector for 1st Preview */}
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      📐 Select 1st Preview Aspect Ratio / Resolution:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "16:9", icon: "🖥️" },
                        { id: "1:1", icon: "🔲" },
                        { id: "9:16", icon: "📱" },
                        { id: "4:3", icon: "📺" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setFormPreview1AspectRatio(mode.id)}
                          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            formPreview1AspectRatio === mode.id
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-md scale-105"
                              : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{mode.icon}</span>
                          <span>{mode.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2nd Preview Image */}
                <div className="space-y-2 p-4 rounded-xl border border-border bg-background/40">
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                    <span>📸 2nd Preview Image Link (Thumbnail #2)</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Mode: {formPreview2AspectRatio}</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingPreview2(true);
                          const url = await uploadToCloudinary(file);
                          if (url) setFormPreview2(url);
                          setUploadingPreview2(false);
                        }
                      }}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground cursor-pointer file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    />
                    <input
                      type="text"
                      placeholder="2nd Preview URL link..."
                      value={uploadingPreview2 ? "Uploading 2nd preview..." : (formPreview2 || "")}
                      onChange={(e) => setFormPreview2(e.target.value)}
                      disabled={uploadingPreview2}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  {/* Aspect Ratio Selector for 2nd Preview */}
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      📐 Select 2nd Preview Aspect Ratio / Resolution:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "16:9", icon: "🖥️" },
                        { id: "1:1", icon: "🔲" },
                        { id: "9:16", icon: "📱" },
                        { id: "4:3", icon: "📺" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setFormPreview2AspectRatio(mode.id)}
                          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            formPreview2AspectRatio === mode.id
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-md scale-105"
                              : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{mode.icon}</span>
                          <span>{mode.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3rd Preview Image */}
                <div className="space-y-2 p-4 rounded-xl border border-border bg-background/40">
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                    <span>📸 3rd Preview Image Link (Thumbnail #3)</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Mode: {formPreview3AspectRatio}</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingPreview3(true);
                          const url = await uploadToCloudinary(file);
                          if (url) setFormPreview3(url);
                          setUploadingPreview3(false);
                        }
                      }}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground cursor-pointer file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    />
                    <input
                      type="text"
                      placeholder="3rd Preview URL link..."
                      value={uploadingPreview3 ? "Uploading 3rd preview..." : (formPreview3 || "")}
                      onChange={(e) => setFormPreview3(e.target.value)}
                      disabled={uploadingPreview3}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  {/* Aspect Ratio Selector for 3rd Preview */}
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      📐 Select 3rd Preview Aspect Ratio / Resolution:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "16:9", icon: "🖥️" },
                        { id: "1:1", icon: "🔲" },
                        { id: "9:16", icon: "📱" },
                        { id: "4:3", icon: "📺" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setFormPreview3AspectRatio(mode.id)}
                          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            formPreview3AspectRatio === mode.id
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-md scale-105"
                              : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{mode.icon}</span>
                          <span>{mode.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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
                    value={uploadingFiles ? "Uploading files to Cloudinary... Please wait." : (formFileUrls || "")}
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
                    value={formStatus || "Approved"}
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
                      value={formPublishDate || ""}
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
                    value={formMetaTitle || ""}
                    onChange={(e) => setFormMetaTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Meta Description</label>
                  <textarea
                    placeholder="Brief summary for search result snippets"
                    value={formMetaDesc || ""}
                    onChange={(e) => setFormMetaDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              💾 {formId ? "[ Save Changes ]" : "[ Save Product ]"}
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
