"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formFeatures, setFormFeatures] = useState("");
  const [formPrice, setFormPrice] = useState(0);
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
  const [formStatus, setFormStatus] = useState<"Draft" | "Approved" | "Scheduled">("Approved");
  const [formPublishDate, setFormPublishDate] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formMetaTitle, setFormMetaTitle] = useState("");
  const [formMetaDesc, setFormMetaDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPreview1, setUploadingPreview1] = useState(false);
  const [uploadingPreview2, setUploadingPreview2] = useState(false);
  const [uploadingPreview3, setUploadingPreview3] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // 🎥 YouTube & Live Previews Gallery Section State
  const [formPreviewGallery, setFormPreviewGallery] = useState<Array<{ id: string; title: string; url: string; thumbnail?: string }>>([
    {
      id: "pg_1",
      title: "Main Reel Live Preview",
      url: "",
      thumbnail: "",
    },
  ]);

  const addPreviewItem = () => {
    setFormPreviewGallery((prev) => [
      ...prev,
      {
        id: `pg_${Date.now()}_${prev.length + 1}`,
        title: `Live Preview Reel #${prev.length + 1}`,
        url: "",
        thumbnail: "",
      },
    ]);
  };

  const removePreviewItem = (id: string) => {
    setFormPreviewGallery((prev) => prev.filter((item) => item.id !== id));
  };

  const updatePreviewItem = (id: string, field: "title" | "url" | "thumbnail", value: string) => {
    setFormPreviewGallery((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "url" && value) {
            const ytMatch = value.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
            if (ytMatch && ytMatch[1] && !item.thumbnail) {
              updated.thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };
  
  const [adminCategories, setAdminCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://digital-product-1-l3qr.onrender.com/api/categories")
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
      const sigRes = await fetch("https://digital-product-1-l3qr.onrender.com/api/upload/signature");
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

    const newProduct = {
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
      previewGallery: formPreviewGallery.filter(item => item.url.trim() !== "" || item.title.trim() !== ""),
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

    // 1. Save to localStorage instantly for immediate storefront & admin access
    try {
      const stored = localStorage.getItem("admin_local_products");
      const existing: any[] = stored ? JSON.parse(stored) : [];
      const updated = [newProduct, ...existing.filter((p) => String(p.id) !== String(newProduct.id))];
      localStorage.setItem("admin_local_products", JSON.stringify(updated));
    } catch (e) {}

    // 2. Dual POST to local backend and remote Render API
    try {
      await Promise.allSettled([
        fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        }).catch(() => null),
        fetch("https://digital-product-1-l3qr.onrender.com/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        }).catch(() => null),
      ]);
    } catch (err) {
      console.error("Product create sync notice:", err);
    } finally {
      setLoading(false);
      router.push("/products?tab=list");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Upload New Product</h2>
          <p className="text-muted-foreground text-base mt-1">Publish a digital asset to the storefront catalog.</p>
        </div>
        <button
          onClick={() => router.push("/products?tab=list")}
          className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl text-sm transition-colors"
        >
          Back to Catalog
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="admin-panel p-6 sm:p-8 lg:p-10 rounded-3xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product Info */}
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
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-base font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-base text-foreground focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
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

              {/* 🌐 Video Link / Demo URL Section */}
              <div className="space-y-2 p-4 rounded-xl border border-red-500/30 bg-red-950/10">
                <label className="text-xs font-bold text-red-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">🎬 Video Link / Demo URL</span>
                  <span className="text-[10px] text-muted-foreground lowercase">(YouTube or external demo video link)</span>
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://example.com/demo"
                  value={formDemoUrl || ""}
                  onChange={(e) => setFormDemoUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
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
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            💾 {loading ? "Saving Product..." : "[ Save Product ]"}
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
