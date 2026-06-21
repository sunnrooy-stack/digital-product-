"use client";

import React, { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  metaTitle: string;
  metaDescription: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    try {
      if (editingId) {
        const updatedCat = { id: editingId, name, slug, parentId: parentId || null, metaTitle, metaDescription };
        await fetch("http://localhost:3000/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCat),
        });
        setCategories(categories.map((c) => c.id === editingId ? updatedCat : c));
        setEditingId(null);
      } else {
        const newCat = { name, slug, parentId: parentId || null, metaTitle, metaDescription };
        const res = await fetch("http://localhost:3000/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCat),
        });
        const data = await res.json();
        if (data.category) {
          setCategories([...categories, data.category]);
        }
      }

      // Reset form
      setName("");
      setSlug("");
      setParentId("");
      setMetaTitle("");
      setMetaDescription("");
    } catch (err) {
      console.error("Failed to save category:", err);
      alert("Failed to save category.");
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parentId || "");
    setMetaTitle(cat.metaTitle);
    setMetaDescription(cat.metaDescription);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/categories?id=${id}`, { method: "DELETE" });
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  const getParentName = (pId: string | null) => {
    if (!pId) return "-";
    const parent = categories.find((c) => c.id === pId);
    return parent ? parent.name : "-";
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Category Management</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Create, edit, and organize nested categories with built-in search engine optimization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="admin-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-xl font-bold border-b border-border pb-3">
              {editingId ? "Edit Category" : "Create New Category"}
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Figma Kits"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Slug (URL Route)</label>
              <input
                type="text"
                placeholder="e.g. figma-kits"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">None (Top-Level Category)</option>
                {categories
                  .filter((c) => c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <h4 className="font-semibold text-sm">SEO Meta Config</h4>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Meta Title</label>
                <input
                  type="text"
                  placeholder="SEO Search result title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Meta Description</label>
                <textarea
                  placeholder="Short description for search preview"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                {editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setSlug("");
                    setParentId("");
                    setMetaTitle("");
                    setMetaDescription("");
                  }}
                  className="px-4 py-2.5 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="admin-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Category</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Slug</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Parent</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No categories created yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold">{cat.name}</div>
                        {cat.metaTitle && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            🔍 {cat.metaTitle}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-primary font-mono">/{cat.slug}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {getParentName(cat.parentId)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="px-3 py-1 bg-muted hover:bg-muted/80 text-xs font-semibold rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
