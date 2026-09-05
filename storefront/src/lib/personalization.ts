// Smart Personalization & Recommendation Engine for Digital Products Store

export interface UserPersonalizationProfile {
  name: string;
  email: string;
  role: string; // "Freelancer" | "Content Creator" | "Editor" | "Developer"
  dateOfBirth?: string;
  isVerified?: boolean;
}

export interface ProductScored {
  id: string;
  title: string;
  price: number;
  description?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  sellerName?: string;
  isFeatured?: boolean;
  fileUrls?: string[];
  recommendationReason?: string;
  recommendationScore?: number;
  [key: string]: any;
}

const ROLE_AFFINITY_KEYWORDS: Record<string, string[]> = {
  Developer: [
    "code", "saas", "template", "templates", "react", "nextjs", "next.js",
    "dashboard", "api", "database", "fullstack", "programming", "dev",
    "software", "web", "boilerplate", "script", "app", "ui kit", "component"
  ],
  "Content Creator": [
    "prompt", "ai prompts", "prompts", "ai", "creator", "pack", "youtube",
    "social", "stream", "thumbnail", "reels", "shorts", "graphics", "sound",
    "music", "audio", "hooks", "caption", "marketing", "bundle"
  ],
  Editor: [
    "preset", "presets", "after effects", "premiere", "davinci", "video",
    "motion", "capcut", "alight motion", "lut", "luts", "vfx", "fx",
    "transition", "sound effects", "sfx", "overlay", "color grading", "cinematic"
  ],
  Freelancer: [
    "ui", "ux", "ui/ux", "graphic design", "figma", "portfolio", "client",
    "business", "marketing", "freelance", "brand", "agency", "landing page",
    "pitch deck", "invoice", "proposal", "contract", "design system"
  ],
};

// Deterministic string hash algorithm to give each user a unique permutation seed
function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getActiveUser(): UserPersonalizationProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("verified_user");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

export function recordUserSearch(query: string, userEmail?: string): void {
  if (typeof window === "undefined" || !query.trim()) return;
  const cleanQuery = query.trim().toLowerCase();
  const email = userEmail || getActiveUser()?.email || "guest";
  const storageKey = `user_searches_${email}`;

  try {
    const raw = localStorage.getItem(storageKey);
    let searches: string[] = raw ? JSON.parse(raw) : [];
    searches = [cleanQuery, ...searches.filter((s) => s !== cleanQuery)].slice(0, 15);
    localStorage.setItem(storageKey, JSON.stringify(searches));
    window.dispatchEvent(new CustomEvent("personalization_updated", { detail: { type: "search", query: cleanQuery } }));
  } catch (e) {}
}

export function getUserSearches(userEmail?: string): string[] {
  if (typeof window === "undefined") return [];
  const email = userEmail || getActiveUser()?.email || "guest";
  const storageKey = `user_searches_${email}`;
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function recordProductView(product: { id: string; category?: string; tags?: string[] }, userEmail?: string): void {
  if (typeof window === "undefined" || !product || !product.id) return;
  const email = userEmail || getActiveUser()?.email || "guest";
  const storageKey = `user_interactions_${email}`;

  try {
    const raw = localStorage.getItem(storageKey);
    let history: { id: string; category?: string; tags?: string[]; timestamp: number }[] = raw ? JSON.parse(raw) : [];
    history = [
      { id: String(product.id), category: product.category, tags: product.tags || [], timestamp: Date.now() },
      ...history.filter((h) => String(h.id) !== String(product.id)),
    ].slice(0, 30);
    localStorage.setItem(storageKey, JSON.stringify(history));
    window.dispatchEvent(new CustomEvent("personalization_updated", { detail: { type: "view", product } }));
  } catch (e) {}
}

export function getUserInteractions(userEmail?: string): { id: string; category?: string; tags?: string[] }[] {
  if (typeof window === "undefined") return [];
  const email = userEmail || getActiveUser()?.email || "guest";
  const storageKey = `user_interactions_${email}`;
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getPersonalizedProducts(
  products: any[],
  customUser?: UserPersonalizationProfile | null
): ProductScored[] {
  if (!Array.isArray(products) || products.length === 0) return [];

  const user = customUser !== undefined ? customUser : getActiveUser();
  const userEmail = user?.email || "guest_user";
  const userRole = user?.role || "Freelancer";
  const isUserLoggedIn = Boolean(user && user.email);

  const searches = getUserSearches(userEmail);
  const interactions = getUserInteractions(userEmail);
  const roleKeywords = ROLE_AFFINITY_KEYWORDS[userRole] || ROLE_AFFINITY_KEYWORDS["Freelancer"];

  return products.map((prod) => {
    let score = 0;
    let reason = "✨ Trending Pick";

    const titleLower = (prod.title || "").toLowerCase();
    const descLower = (prod.description || "").toLowerCase();
    const catLower = (prod.category || "").toLowerCase();
    const tagsLower: string[] = (prod.tags || []).map((t: any) => String(t || "").toLowerCase());
    const fullText = `${titleLower} ${descLower} ${catLower} ${tagsLower.join(" ")}`;

    // 1. Match Search History (Highest weight: up to 50 pts)
    let searchMatchFound = false;
    for (const searchQuery of searches) {
      if (searchQuery.length < 2) continue;
      const tokens = searchQuery.split(/\s+/).filter(Boolean);
      const allTokensMatch = tokens.every((tok) => fullText.includes(tok));
      if (allTokensMatch) {
        score += 50;
        reason = `🔍 Based on your search for "${searchQuery}"`;
        searchMatchFound = true;
        break;
      } else if (tokens.some((tok) => fullText.includes(tok))) {
        score += 25;
        if (!searchMatchFound) {
          reason = `🔍 Matches search keywords`;
        }
      }
    }

    // 2. Match User Professional Role (Weight: up to 35 pts)
    if (isUserLoggedIn) {
      let roleMatches = 0;
      for (const kw of roleKeywords) {
        if (fullText.includes(kw)) {
          roleMatches++;
        }
      }
      if (roleMatches > 0) {
        const roleScore = Math.min(roleMatches * 12, 36);
        score += roleScore;
        if (!searchMatchFound) {
          reason = `🎯 Top choice for ${userRole}s`;
        }
      }
    }

    // 3. Match Past Viewed/Clicked Categories & Tags (Weight: up to 25 pts)
    const viewedCategories = interactions.map((i) => (i.category || "").toLowerCase()).filter(Boolean);
    const viewedTags = interactions.flatMap((i) => (i.tags || []).map((t) => t.toLowerCase()));

    if (viewedCategories.includes(catLower) && catLower !== "") {
      score += 15;
      if (!searchMatchFound && !reason.startsWith("🎯")) {
        reason = `📦 Related to items you viewed`;
      }
    }

    const tagOverlap = tagsLower.filter((t) => viewedTags.includes(t)).length;
    if (tagOverlap > 0) {
      score += Math.min(tagOverlap * 5, 15);
    }

    // 4. Featured & Quality boost (+8 pts)
    if (prod.isFeatured) {
      score += 8;
    }

    // 5. Unique User Diversity Seed Hash (Ensures User A and User B always have a distinct personalized feed)
    const userProdCombined = `${userEmail}_${prod.id || prod.title}`;
    const pseudoHash = (hashSeed(userProdCombined) % 1000) / 100; // 0.00 to 9.99
    score += pseudoHash;

    return {
      ...prod,
      recommendationScore: Math.round(score * 10) / 10,
      recommendationReason: reason,
    };
  }).sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
}
