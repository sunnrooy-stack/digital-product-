"use client";

import React, { useState } from "react";

export interface PreviewGalleryItem {
  id?: string;
  title: string;
  url: string;
  thumbnail?: string;
  type?: "youtube" | "video" | "link" | "image";
}

interface ProductPreviewGalleryProps {
  demoUrl?: string;
  previewMedia?: string[];
  previewGallery?: PreviewGalleryItem[];
  coverImage?: string;
  productTitle?: string;
}

function parseYouTubeUrl(url: string) {
  if (!url) return { isYouTube: false, embedUrl: "", thumbnail: "" };
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) {
    const videoId = match[1];
    return {
      isYouTube: true,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      videoId,
    };
  }
  return { isYouTube: false, embedUrl: url, thumbnail: "" };
}

export default function ProductPreviewGallery({
  demoUrl,
  previewMedia = [],
  previewGallery = [],
  coverImage,
  productTitle = "Product",
}: ProductPreviewGalleryProps) {
  // Normalize & construct playlist items from previewGallery OR fallbacks (demoUrl, previewMedia, coverImage)
  const items: PreviewGalleryItem[] = [];

  if (Array.isArray(previewGallery) && previewGallery.length > 0) {
    previewGallery.forEach((item, idx) => {
      if (item.url || item.title) {
        const yt = parseYouTubeUrl(item.url || "");
        items.push({
          id: item.id || `pg_${idx}`,
          title: item.title || `Video Link #${idx + 1}`,
          url: item.url,
          thumbnail: item.thumbnail || (yt.isYouTube ? yt.thumbnail : coverImage || ""),
          type: item.type || (yt.isYouTube ? "youtube" : "link"),
        });
      }
    });
  }

  // Fallback: If no previewGallery items passed, construct from demoUrl & previewMedia
  if (items.length === 0) {
    if (demoUrl) {
      const yt = parseYouTubeUrl(demoUrl);
      items.push({
        id: "demo_1",
        title: productTitle,
        url: demoUrl,
        thumbnail: yt.isYouTube ? yt.thumbnail : coverImage || "",
        type: yt.isYouTube ? "youtube" : "link",
      });
    }

    if (Array.isArray(previewMedia) && previewMedia.length > 0) {
      previewMedia.forEach((mediaUrl, idx) => {
        const yt = parseYouTubeUrl(mediaUrl);
        items.push({
          id: `pm_${idx}`,
          title: `${productTitle} - Link #${idx + 1}`,
          url: mediaUrl,
          thumbnail: yt.isYouTube ? yt.thumbnail : mediaUrl,
          type: yt.isYouTube ? "youtube" : mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
        });
      });
    }
  }

  // If no preview video items exist, do not render component
  if (items.length === 0) {
    return null;
  }

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeItem = items[activeIndex] || items[0];
  const ytInfo = parseYouTubeUrl(activeItem?.url || "");

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl my-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold shadow-lg shadow-red-500/10">
            ▶
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
            PRODUCT PREVIEW GALLERY:
          </h2>
        </div>

        {activeItem?.url && (
          <a
            href={activeItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all hover:scale-[1.03]"
          >
            <span>Open Link</span>
            <span>↗</span>
          </a>
        )}
      </div>

      {/* 🎬 YouTube-Style Main Player & Side Playlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Live Preview Display Area (Left 8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative group">
            {ytInfo.isYouTube ? (
              <iframe
                src={ytInfo.embedUrl}
                title={activeItem.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : activeItem.type === "video" || activeItem.url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={activeItem.url}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
                poster={activeItem.thumbnail}
              />
            ) : activeItem.url.startsWith("http") ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900/90 text-center p-6 space-y-4">
                {activeItem.thumbnail ? (
                  <img
                    src={activeItem.thumbnail}
                    alt={activeItem.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                ) : null}
                <div className="relative z-10 space-y-3 max-w-md bg-slate-950/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-2xl mx-auto">
                    🌐
                  </div>
                  <h4 className="text-lg font-bold text-white">{activeItem.title}</h4>
                  <p className="text-xs text-slate-400 font-mono break-all">{activeItem.url}</p>
                  <a
                    href={activeItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all"
                  >
                    <span>Launch Live Interactive Demo</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                <img src={activeItem.thumbnail || coverImage} alt={activeItem.title} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Active Preview Info Footer */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                  NOW PLAYING
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Item {activeIndex + 1} of {items.length}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{activeItem.title}</h3>
            </div>

            {activeItem.url && (
              <a
                href={activeItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono shrink-0 flex items-center gap-1"
              >
                <span>Direct Link</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Side Playlist Links Sidebar (Right 4 Columns - "SIDE MA LINK HO") */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>📋 PREVIEW PLAYLIST</span>
              <span className="text-[10px] text-red-400 bg-red-950/50 px-2 py-0.5 rounded-full border border-red-800/50">
                {items.length} Links
              </span>
            </h4>
            <span className="text-[10px] text-slate-500">Click link to play</span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {items.map((item, idx) => {
              const isActive = idx === activeIndex;
              const yt = parseYouTubeUrl(item.url);

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`group flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-slate-900 border-red-500/60 shadow-lg shadow-red-950/30 ring-1 ring-red-500/40"
                      : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700"
                  }`}
                >
                  {/* Thumbnail with Play Overlay */}
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 group-hover:border-slate-700 transition-colors">
                    {item.thumbnail || yt.thumbnail ? (
                      <img
                        src={item.thumbnail || yt.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                        <span className="text-xl">📹</span>
                      </div>
                    )}

                    {/* Red Play Button Badge */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-red-600/40"
                          : "bg-black/30 group-hover:bg-red-600/30"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-md transition-transform ${
                          isActive
                            ? "bg-red-600 scale-110"
                            : "bg-slate-900/90 group-hover:bg-red-600 group-hover:scale-110"
                        }`}
                      >
                        ▶
                      </div>
                    </div>

                    {/* Badge Pill */}
                    <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono text-white px-1.5 py-0.5 rounded tracking-tighter">
                      {yt.isYouTube ? "YT" : "LIVE"}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h5
                      className={`text-xs font-bold line-clamp-2 leading-tight transition-colors ${
                        isActive ? "text-red-400" : "text-slate-200 group-hover:text-white"
                      }`}
                    >
                      {item.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="truncate max-w-[120px] font-mono opacity-80">
                        {item.url ? item.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] : "live preview"}
                      </span>
                      {isActive && (
                        <span className="text-red-500 font-extrabold animate-pulse">Playing...</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
