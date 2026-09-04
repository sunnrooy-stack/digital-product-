"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cart";
import { motion } from "framer-motion";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  tags: string[];
  coverImage: string;
  sellerName: string;
  isFeatured: boolean;
}

const gradients = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
];

function ProductsContent() {
  const { addItem, removeItem, isInCart, items } = useCartStore();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [storeCategories, setStoreCategories] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const DEFAULT_PRODUCTS = [
        { id: "1", title: "SaaS Starter Kit", price: 89, description: "A premium SaaS boilerplate.", category: "Templates", tags: ["nextjs", "saas"], coverImage: "", sellerName: "DevPro", isFeatured: true },
        { id: "2", title: "AI Prompt Pack", price: 29, description: "Highly engineered AI prompts.", category: "AI Prompts", tags: ["gpt"], coverImage: "", sellerName: "PromptMaster", isFeatured: true },
        { id: "3", title: "React Dashboard", price: 49, description: "Beautiful custom React admin dashboard.", category: "Templates", tags: ["react"], coverImage: "", sellerName: "UIForge", isFeatured: true }
      ];

      // 1. Fetch Products safely (try local backend first, then remote Render backend)
      let fetchedProducts: any[] | null = null;
      try {
        const localRes = await fetch(`http://localhost:5000/api/products?t=${Date.now()}`).catch(() => null);
        if (localRes && localRes.ok) {
          fetchedProducts = await localRes.json().catch(() => null);
        }
      } catch (e) {}

      if (!fetchedProducts || !Array.isArray(fetchedProducts)) {
        try {
          const remoteRes = await fetch(`https://digital-product-1-l3qr.onrender.com/api/products?t=${Date.now()}`, { cache: "no-store" }).catch(() => null);
          if (remoteRes && remoteRes.ok) {
            fetchedProducts = await remoteRes.json().catch(() => null);
          }
        } catch (e) {}
      }

      let localProducts: any[] = [];
      try {
        const stored = localStorage.getItem("admin_local_products");
        if (stored) localProducts = JSON.parse(stored);
      } catch (e) {}

      if (isMounted) {
        const baseList = (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) ? fetchedProducts : DEFAULT_PRODUCTS;
        const map = new Map<string, any>();
        const titleMap = new Map<string, string>();

        baseList.forEach((p) => {
          map.set(String(p.id), p);
          if (p.title) titleMap.set(p.title.trim().toLowerCase(), String(p.id));
        });

        localProducts.forEach((p) => {
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

        setProducts(Array.from(map.values()));
        setLoading(false);
      }

      // 2. Fetch Categories safely
      try {
        let catData: any[] | null = null;
        const localCatRes = await fetch("http://localhost:5000/api/categories").catch(() => null);
        if (localCatRes && localCatRes.ok) {
          catData = await localCatRes.json().catch(() => null);
        }
        if (!catData || !Array.isArray(catData)) {
          const remoteCatRes = await fetch("https://digital-product-1-l3qr.onrender.com/api/categories").catch(() => null);
          if (remoteCatRes && remoteCatRes.ok) {
            catData = await remoteCatRes.json().catch(() => null);
          }
        }
        if (isMounted && Array.isArray(catData)) {
          setStoreCategories(catData);
        }
      } catch (e) {}
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedTagBadge, setSelectedTagBadge] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedAiTool, setSelectedAiTool] = useState<string>("all");
  const [selectedCourseTopic, setSelectedCourseTopic] = useState<string>("all");
  const [selectedDesignTopic, setSelectedDesignTopic] = useState<string>("all");
  const [selectedPresetPlatform, setSelectedPresetPlatform] = useState<string>("all");
  const [selectedPresetSoftware, setSelectedPresetSoftware] = useState<string>("all");
  
  const categories = ["all", ...storeCategories.map(c => c.name)];
  const badgeTagOptions = ["all", "FEATURED", "NEW", "POPULAR", "TRENDING", "PREMIUM"];
  const platformOptions = [
    { id: "all", label: "All OS", icon: "🌐" },
    { id: "windows", label: "Windows", icon: "🪟" },
    { id: "mobile", label: "Mobile", icon: "📱" },
    { id: "mac", label: "Mac", icon: "🍎" },
  ];

  const aiToolOptions = [
    { id: "all", label: "All AI Tools", icon: "🌐" },
    { id: "chatgpt", label: "ChatGPT", icon: "🤖" },
    { id: "claude", label: "Claude AI", icon: "🧠" },
    { id: "gemini", label: "Gemini AI", icon: "✨" },
    { id: "grok", label: "Grok", icon: "⚡" },
  ];

  const courseTopicOptions = [
    { id: "all", label: "All Topics", icon: "🌐" },
    { id: "ai-tech", label: "AI & Technology", icon: "🤖" },
    { id: "digital-marketing", label: "Digital Marketing", icon: "📢" },
    { id: "business", label: "Business & Startup", icon: "💼" },
    { id: "programming", label: "Coding & Dev", icon: "💻" },
  ];

  const designTopicOptions = [
    { id: "all", label: "All Designs", icon: "🌐" },
    { id: "graphic-design", label: "Graphic Design", icon: "🎨" },
    { id: "ui-ux", label: "UI/UX Design", icon: "🖥️" },
    { id: "3d-assets", label: "3D & Creative Assets", icon: "📦" },
    { id: "video-motion", label: "Video & Motion", icon: "🎬" },
  ];

  const presetPlatformOptions = [
    { id: "all", label: "All Presets", icon: "🌐" },
    { id: "pc", label: "PC Presets", icon: "🖥️" },
    { id: "mobile", label: "Mobile Presets", icon: "📱" },
  ];

  const pcPresetSoftwares = [
    { id: "all", label: "All PC Softwares", icon: "🌐" },
    { id: "after-effects", label: "Adobe After Effects", icon: "🎬" },
    { id: "premiere", label: "Adobe Premiere Pro", icon: "🎞️" },
    { id: "photoshop", label: "Adobe Photoshop", icon: "🖼️" },
    { id: "lightroom", label: "Adobe Lightroom", icon: "📷" },
    { id: "davinci", label: "DaVinci Resolve", icon: "🎥" },
    { id: "blender", label: "Blender", icon: "🧊" },
    { id: "final-cut", label: "Final Cut Pro", icon: "✂️" },
  ];

  const mobilePresetSoftwares = [
    { id: "all", label: "All Mobile Apps", icon: "🌐" },
    { id: "alight-motion", label: "Alight Motion", icon: "⚡" },
    { id: "capcut", label: "CapCut", icon: "🎬" },
    { id: "vn", label: "VN Editor", icon: "🎥" },
    { id: "kinemaster", label: "KineMaster", icon: "🎞️" },
    { id: "picsart", label: "PicsArt", icon: "🎨" },
    { id: "lightroom-mobile", label: "Lightroom Mobile", icon: "📱" },
  ];

  const filteredProducts = products.filter((p) => {
    const pTagsLower = (p.tags || []).map((t) => t.toLowerCase());
    const matchesSearch = searchQuery === "" || 
                          p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pTagsLower.some((t) => t.includes(searchQuery.toLowerCase()));
                          
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    
    let matchesBadge = true;
    if (selectedTagBadge !== "all") {
      const pTagsUpper = (p.tags || []).map((t) => t.toUpperCase());
      if (selectedTagBadge === "FEATURED") {
        matchesBadge = p.isFeatured || pTagsUpper.includes("FEATURED");
      } else {
        matchesBadge = pTagsUpper.includes(selectedTagBadge);
      }
    }

    let matchesPlatform = true;
    if (selectedPlatform !== "all") {
      const pText = `${p.title} ${p.description} ${p.category} ${pTagsLower.join(" ")}`.toLowerCase();
      if (selectedPlatform === "windows") {
        matchesPlatform = pTagsLower.includes("pc") || pTagsLower.includes("windows") || pText.includes("windows") || pText.includes("win") || pText.includes("pc") || pText.includes("exe");
      } else if (selectedPlatform === "mac") {
        matchesPlatform = pTagsLower.includes("mac") || pText.includes("mac") || pText.includes("macos") || pText.includes("apple") || pText.includes("dmg");
      } else if (selectedPlatform === "mobile") {
        matchesPlatform = pTagsLower.includes("mobile") || pTagsLower.includes("android") || pTagsLower.includes("ios") || pText.includes("mobile") || pText.includes("android") || pText.includes("ios") || pText.includes("apk") || pText.includes("app");
      }
    }

    let matchesAiTool = true;
    if (selectedAiTool !== "all") {
      const pText = `${p.title} ${p.description} ${p.category} ${pTagsLower.join(" ")}`.toLowerCase();
      if (selectedAiTool === "chatgpt") {
        matchesAiTool = pTagsLower.includes("chatgpt") || pText.includes("chatgpt") || pText.includes("gpt");
      } else if (selectedAiTool === "claude") {
        matchesAiTool = pTagsLower.includes("claude") || pText.includes("claude") || pText.includes("anthropic");
      } else if (selectedAiTool === "gemini") {
        matchesAiTool = pTagsLower.includes("gemini") || pText.includes("gemini") || pText.includes("bard") || pText.includes("google ai");
      } else if (selectedAiTool === "grok") {
        matchesAiTool = pTagsLower.includes("grok") || pText.includes("grok") || pText.includes("xai");
      }
    }

    let matchesCourseTopic = true;
    if (selectedCourseTopic !== "all") {
      const pText = `${p.title} ${p.description} ${p.category} ${pTagsLower.join(" ")}`.toLowerCase();
      if (selectedCourseTopic === "ai-tech") {
        matchesCourseTopic = pTagsLower.includes("ai-tech") || pText.includes("ai & technology") || pText.includes("ai") || pText.includes("tech");
      } else if (selectedCourseTopic === "digital-marketing") {
        matchesCourseTopic = pTagsLower.includes("digital-marketing") || pText.includes("digital marketing") || pText.includes("marketing") || pText.includes("seo") || pText.includes("ads");
      } else if (selectedCourseTopic === "business") {
        matchesCourseTopic = pTagsLower.includes("business") || pText.includes("business") || pText.includes("entrepreneurship") || pText.includes("startup") || pText.includes("finance");
      } else if (selectedCourseTopic === "programming") {
        matchesCourseTopic = pTagsLower.includes("programming") || pText.includes("programming") || pText.includes("development") || pText.includes("coding") || pText.includes("code") || pText.includes("web dev");
      }
    }

    let matchesDesignTopic = true;
    if (selectedDesignTopic !== "all") {
      const pText = `${p.title} ${p.description} ${p.category} ${pTagsLower.join(" ")}`.toLowerCase();
      if (selectedDesignTopic === "graphic-design") {
        matchesDesignTopic = pTagsLower.includes("graphic-design") || pText.includes("graphic design") || pText.includes("graphic") || pText.includes("banner") || pText.includes("logo") || pText.includes("poster");
      } else if (selectedDesignTopic === "ui-ux") {
        matchesDesignTopic = pTagsLower.includes("ui-ux") || pText.includes("ui/ux") || pText.includes("ui") || pText.includes("ux") || pText.includes("figma") || pText.includes("ui kit");
      } else if (selectedDesignTopic === "3d-assets") {
        matchesDesignTopic = pTagsLower.includes("3d-assets") || pText.includes("3d") || pText.includes("blender") || pText.includes("creative asset") || pText.includes("render");
      } else if (selectedDesignTopic === "video-motion") {
        matchesDesignTopic = pTagsLower.includes("video-motion") || pText.includes("video") || pText.includes("motion") || pText.includes("after effects") || pText.includes("premiere") || pText.includes("animation");
      }
    }

    let matchesPresetPlatform = true;
    if (selectedPresetPlatform !== "all") {
      const pText = `${p.title} ${p.description} ${p.category} ${pTagsLower.join(" ")}`.toLowerCase();
      if (selectedPresetPlatform === "pc") {
        matchesPresetPlatform = pTagsLower.includes("preset-pc") || pTagsLower.includes("pc") || pText.includes("after effects") || pText.includes("premiere") || pText.includes("photoshop") || pText.includes("lightroom") || pText.includes("davinci") || pText.includes("blender") || pText.includes("final cut") || pText.includes("pc");
      } else if (selectedPresetPlatform === "mobile") {
        matchesPresetPlatform = pTagsLower.includes("preset-mobile") || pTagsLower.includes("mobile") || pText.includes("alight motion") || pText.includes("capcut") || pText.includes("vn") || pText.includes("kinemaster") || pText.includes("picsart") || pText.includes("lightroom mobile") || pText.includes("mobile");
      }
    }

    let matchesPresetSoftware = true;
    if (selectedPresetSoftware !== "all") {
      const pText = `${p.title} ${p.description} ${p.category} ${pTagsLower.join(" ")}`.toLowerCase();
      if (selectedPresetSoftware === "after-effects") {
        matchesPresetSoftware = pTagsLower.includes("after-effects") || pText.includes("after effects") || pText.includes("ae");
      } else if (selectedPresetSoftware === "premiere") {
        matchesPresetSoftware = pTagsLower.includes("premiere") || pText.includes("premiere") || pText.includes("pr");
      } else if (selectedPresetSoftware === "photoshop") {
        matchesPresetSoftware = pTagsLower.includes("photoshop") || pText.includes("photoshop") || pText.includes("psd") || pText.includes("ps");
      } else if (selectedPresetSoftware === "lightroom") {
        matchesPresetSoftware = pTagsLower.includes("lightroom") || pText.includes("lightroom") || pText.includes("xmp") || pText.includes("dng");
      } else if (selectedPresetSoftware === "davinci") {
        matchesPresetSoftware = pTagsLower.includes("davinci") || pText.includes("davinci") || pText.includes("resolve");
      } else if (selectedPresetSoftware === "blender") {
        matchesPresetSoftware = pTagsLower.includes("blender") || pText.includes("blender") || pText.includes(".blend");
      } else if (selectedPresetSoftware === "final-cut") {
        matchesPresetSoftware = pTagsLower.includes("final-cut") || pText.includes("final cut") || pText.includes("fcpx");
      } else if (selectedPresetSoftware === "alight-motion") {
        matchesPresetSoftware = pTagsLower.includes("alight-motion") || pText.includes("alight motion") || pText.includes("xml");
      } else if (selectedPresetSoftware === "capcut") {
        matchesPresetSoftware = pTagsLower.includes("capcut") || pText.includes("capcut");
      } else if (selectedPresetSoftware === "vn") {
        matchesPresetSoftware = pTagsLower.includes("vn") || pText.includes("vn editor") || pText.includes("vn app");
      } else if (selectedPresetSoftware === "kinemaster") {
        matchesPresetSoftware = pTagsLower.includes("kinemaster") || pText.includes("kinemaster");
      } else if (selectedPresetSoftware === "picsart") {
        matchesPresetSoftware = pTagsLower.includes("picsart") || pText.includes("picsart");
      } else if (selectedPresetSoftware === "lightroom-mobile") {
        matchesPresetSoftware = pTagsLower.includes("lightroom-mobile") || pText.includes("lightroom mobile") || pText.includes("dng");
      }
    }

    return matchesSearch && matchesCategory && matchesBadge && matchesPlatform && matchesAiTool && matchesCourseTopic && matchesDesignTopic && matchesPresetPlatform && matchesPresetSoftware;
  });

  const isSoftwareContext = 
    selectedCategory.toLowerCase().includes("software") || 
    /\bsoftware\b/i.test(searchQuery);

  const isAiTechContext = 
    (selectedCategory.toLowerCase().includes("ai & tech") || 
     selectedCategory.toLowerCase().includes("ai & technology") || 
     selectedCategory.toLowerCase().includes("ai tool") || 
     /\bai\b/i.test(selectedCategory)) &&
    !selectedCategory.toLowerCase().includes("thumbnail") ||
    /\bai\b/i.test(searchQuery) || 
    /\bchatgpt\b/i.test(searchQuery) || 
    /\bclaude\b/i.test(searchQuery) || 
    /\bgemini\b/i.test(searchQuery) || 
    /\bgrok\b/i.test(searchQuery);

  const isCoursesContext = 
    selectedCategory.toLowerCase().includes("course") || 
    /\bcourse\b/i.test(searchQuery) || 
    /\bmarketing\b/i.test(searchQuery) || 
    /\bbusiness\b/i.test(searchQuery) || 
    /\bentrepreneurship\b/i.test(searchQuery) || 
    /\bprogramming\b/i.test(searchQuery) || 
    /\bdevelopment\b/i.test(searchQuery);

  const isDesignContext = 
    selectedCategory.toLowerCase().includes("design") || 
    (selectedCategory.toLowerCase().includes("asset") && !selectedCategory.toLowerCase().includes("preset")) || 
    /\bdesign\b/i.test(searchQuery) || 
    /\bgraphic\b/i.test(searchQuery) || 
    /\bui\b/i.test(searchQuery) || 
    /\bux\b/i.test(searchQuery) || 
    /\b3d\b/i.test(searchQuery) || 
    /\bmotion\b/i.test(searchQuery) || 
    /\bvector\b/i.test(searchQuery);

  const isPresetsContext = 
    selectedCategory.toLowerCase().includes("preset") || 
    /\bpreset\b/i.test(searchQuery) || 
    /\blut\b/i.test(searchQuery) || 
    /\bafter effects\b/i.test(searchQuery) || 
    /\bpremiere\b/i.test(searchQuery) || 
    /\bphotoshop\b/i.test(searchQuery) || 
    /\blightroom\b/i.test(searchQuery) || 
    /\bdavinci\b/i.test(searchQuery) || 
    /\bblender\b/i.test(searchQuery) || 
    /\bfinal cut\b/i.test(searchQuery) || 
    /\balight motion\b/i.test(searchQuery) || 
    /\bcapcut\b/i.test(searchQuery) || 
    /\bvn\b/i.test(searchQuery) || 
    /\bkinemaster\b/i.test(searchQuery) || 
    /\bpicsart\b/i.test(searchQuery);

  useEffect(() => {
    if (!isSoftwareContext) {
      setSelectedPlatform("all");
    }
  }, [isSoftwareContext]);

  useEffect(() => {
    if (!isAiTechContext) {
      setSelectedAiTool("all");
    }
  }, [isAiTechContext]);

  useEffect(() => {
    if (!isCoursesContext) {
      setSelectedCourseTopic("all");
    }
  }, [isCoursesContext]);

  useEffect(() => {
    if (!isDesignContext) {
      setSelectedDesignTopic("all");
    }
  }, [isDesignContext]);

  useEffect(() => {
    if (!isPresetsContext) {
      setSelectedPresetPlatform("all");
      setSelectedPresetSoftware("all");
    }
  }, [isPresetsContext]);

  return (
    <div className="py-12 px-6 lg:px-12 max-w-[90rem] mx-auto w-full min-h-screen space-y-12">
      {/* Top Banner with Software OS, AI Tool, Course Topic, Design Topic or Presets filter on the Right Side */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="text-left space-y-2 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Digital Store</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Browse, filter, and buy premium resources curated by top design and software developers.
          </p>
        </div>

        {/* Software OS Checkbox Filter - Shown ONLY when Software is selected or searched */}
        {isSoftwareContext && (
          <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-2xl border border-border/60 shadow-sm shrink-0 min-w-[165px] animate-in fade-in slide-in-from-right-4 duration-200">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Software OS:</span>
            {platformOptions.map((plat) => {
              const isChecked = selectedPlatform === plat.id;
              return (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => setSelectedPlatform(plat.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer w-full text-left ${
                    isChecked
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-background/80 border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border transition-colors shrink-0 ${
                    isChecked ? "bg-white text-primary border-white font-black" : "border-border bg-muted/40 text-transparent"
                  }`}>
                    ✓
                  </span>
                  <span>{plat.icon} {plat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* AI & Tech Tool Checkbox Filter - Shown ONLY when AI & Tech is selected or searched */}
        {isAiTechContext && !isSoftwareContext && (
          <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-2xl border border-border/60 shadow-sm shrink-0 min-w-[165px] animate-in fade-in slide-in-from-right-4 duration-200">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1">AI Tool Filter:</span>
            {aiToolOptions.map((tool) => {
              const isChecked = selectedAiTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setSelectedAiTool(tool.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer w-full text-left ${
                    isChecked
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-background/80 border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border transition-colors shrink-0 ${
                    isChecked ? "bg-white text-primary border-white font-black" : "border-border bg-muted/40 text-transparent"
                  }`}>
                    ✓
                  </span>
                  <span>{tool.icon} {tool.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Course Sub-Topic Checkbox Filter - Shown ONLY when Courses is selected or searched */}
        {isCoursesContext && !isSoftwareContext && !isAiTechContext && (
          <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-2xl border border-border/60 shadow-sm shrink-0 min-w-[190px] animate-in fade-in slide-in-from-right-4 duration-200">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Course Topic:</span>
            {courseTopicOptions.map((topic) => {
              const isChecked = selectedCourseTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedCourseTopic(topic.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer w-full text-left ${
                    isChecked
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-background/80 border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border transition-colors shrink-0 ${
                    isChecked ? "bg-white text-primary border-white font-black" : "border-border bg-muted/40 text-transparent"
                  }`}>
                    ✓
                  </span>
                  <span>{topic.icon} {topic.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Design & Assets Sub-Topic Checkbox Filter - Shown ONLY when Design & Assets is selected or searched */}
        {isDesignContext && !isSoftwareContext && !isAiTechContext && !isCoursesContext && (
          <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-2xl border border-border/60 shadow-sm shrink-0 min-w-[195px] animate-in fade-in slide-in-from-right-4 duration-200">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Design Filter:</span>
            {designTopicOptions.map((topic) => {
              const isChecked = selectedDesignTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedDesignTopic(topic.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer w-full text-left ${
                    isChecked
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-background/80 border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border transition-colors shrink-0 ${
                    isChecked ? "bg-white text-primary border-white font-black" : "border-border bg-muted/40 text-transparent"
                  }`}>
                    ✓
                  </span>
                  <span>{topic.icon} {topic.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Presets & Assets Sub-Topic Checkbox Filter - Shown ONLY when Presets is selected or searched */}
        {isPresetsContext && !isSoftwareContext && !isAiTechContext && !isCoursesContext && !isDesignContext && (
          <div className="flex flex-col sm:flex-row gap-3 bg-muted/30 p-4 rounded-2xl border border-border/60 shadow-sm shrink-0 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Step 1: Platform Selection (PC vs Mobile) */}
            <div className="flex flex-col gap-2 min-w-[145px]">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Platform:</span>
              {presetPlatformOptions.map((plat) => {
                const isChecked = selectedPresetPlatform === plat.id;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetPlatform(plat.id);
                      setSelectedPresetSoftware("all");
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer w-full text-left ${
                      isChecked
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border shrink-0 ${
                      isChecked ? "bg-white text-primary border-white font-black" : "border-border bg-muted/40 text-transparent"
                    }`}>
                      ✓
                    </span>
                    <span>{plat.icon} {plat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Step 2: Software Selection (Dynamic based on selected platform) */}
            <div className="flex flex-col gap-2 min-w-[185px] border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                {selectedPresetPlatform === "mobile" ? "Mobile Apps:" : selectedPresetPlatform === "pc" ? "PC Software:" : "Software / App:"}
              </span>
              <div className="max-h-[190px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                {(selectedPresetPlatform === "mobile" ? mobilePresetSoftwares : selectedPresetPlatform === "pc" ? pcPresetSoftwares : [...pcPresetSoftwares, ...mobilePresetSoftwares.filter(m => m.id !== "all")]).map((sw) => {
                  const isChecked = selectedPresetSoftware === sw.id;
                  return (
                    <button
                      key={sw.id}
                      type="button"
                      onClick={() => setSelectedPresetSoftware(sw.id)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-extrabold transition-all border cursor-pointer w-full text-left ${
                        isChecked
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border shrink-0 ${
                        isChecked ? "bg-white text-primary border-white font-black" : "border-border bg-muted/40 text-transparent"
                      }`}>
                        ✓
                      </span>
                      <span className="truncate">{sw.icon} {sw.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-5 bg-muted/20 p-6 rounded-2xl border border-border">
        {/* Top Middle Search Bar */}
        <div className="w-full max-w-lg mx-auto relative">
          <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-border/40">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mr-2 self-center">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-primary text-white shadow-sm"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Feature Badge Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-border/40">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mr-2">Filter Badges:</span>
          {badgeTagOptions.map((badge) => {
            const isActive = selectedTagBadge === badge;
            return (
              <button
                key={badge}
                onClick={() => setSelectedTagBadge(badge)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all border ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {badge === "all" && "All Badges"}
                {badge === "FEATURED" && "⭐ FEATURED"}
                {badge === "NEW" && "✨ NEW"}
                {badge === "POPULAR" && "🔥 POPULAR"}
                {badge === "TRENDING" && "📈 TRENDING"}
                {badge === "PREMIUM" && "👑 PREMIUM"}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading catalog items...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No products match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const inCart = isInCart(product.id);
              const gradientIndex = index % gradients.length;
              const cartItem: CartItem = {
                id: product.id,
                title: product.title,
                price: product.price,
                coverImage: product.coverImage,
                sellerName: product.sellerName || "Admin",
              };

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 border border-border relative group"
                >
                  <div>
                    <a href={`/product?id=${product.id}`}>
                      <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${gradients[gradientIndex]} mb-3 flex items-center justify-center relative overflow-hidden`}>
                        {product.coverImage ? (
                          <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white/80 text-4xl">📦</span>
                        )}
                      </div>
                    </a>

                    {/* Feature Badges & Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.isFeatured && !(product.tags || []).map(t=>t.toUpperCase()).includes("FEATURED") && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                          ⭐ FEATURED
                        </span>
                      )}
                      {(product.tags || []).map((tag) => {
                        const uTag = tag.toUpperCase();
                        if (uTag === "FEATURED") return <span key={tag} className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">⭐ FEATURED</span>;
                        if (uTag === "NEW") return <span key={tag} className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">✨ NEW</span>;
                        if (uTag === "POPULAR") return <span key={tag} className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">🔥 POPULAR</span>;
                        if (uTag === "TRENDING") return <span key={tag} className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">📈 TRENDING</span>;
                        if (uTag === "PREMIUM") return <span key={tag} className="text-[9px] bg-gradient-to-r from-amber-500/30 to-purple-500/30 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">👑 PREMIUM</span>;
                        return (
                          <span key={tag} className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                            #{tag}
                          </span>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">by {product.sellerName || "Vendor"}</p>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                    {product.price <= 0 ? (
                      <span className="font-black text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        🎉 FREE
                      </span>
                    ) : (
                      <span className="font-extrabold text-lg text-primary">₹{product.price.toFixed(2)}</span>
                    )}

                    {product.price <= 0 ? (
                      <a
                        href={`/product?id=${product.id}`}
                        className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
                      >
                        ⚡ Get Free
                      </a>
                    ) : (
                      <button
                        onClick={() => inCart ? removeItem(product.id) : addItem(cartItem)}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                          inCart
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-foreground text-background hover:bg-foreground/90"
                        }`}
                      >
                        {inCart ? "In Cart ✓" : "Add to Cart"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StorefrontProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground text-sm">Loading Products Catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
