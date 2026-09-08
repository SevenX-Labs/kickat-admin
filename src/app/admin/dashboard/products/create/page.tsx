"use client";

import { 
  ArrowLeft, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  Sparkles,
  Package, 
  DollarSign, 
  Layers, 
  ShieldCheck,
  Eye,
  Info
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("Royal Canin");
  const [category, setCategory] = useState("Dog Nutrition & Kibble");
  const [species, setSpecies] = useState("Dogs");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");

  const [mrp, setMrp] = useState<number | "">(2999);
  const [price, setPrice] = useState<number | "">(2499);
  const [costPrice, setCostPrice] = useState<number | "">(1650);
  const [gstRate, setGstRate] = useState("18%");
  const [hsnCode, setHsnCode] = useState("23091000");

  const [sku, setSku] = useState("KIK-PET-9042");
  const [barcode, setBarcode] = useState("8901234567890");
  const [stock, setStock] = useState<number | "">(85);
  const [lowStockAlert, setLowStockAlert] = useState<number | "">(15);
  const [weight, setWeight] = useState("15 kg");

  const [status, setStatus] = useState<"ACTIVE" | "DRAFT" | "ARCHIVED">("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [freeShipping, setFreeShipping] = useState(true);

  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300&h=300&fit=crop&q=80"
  ]);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const marginPct = (mrp && price && costPrice && typeof price === "number" && typeof costPrice === "number")
    ? Math.round(((price - costPrice) / price) * 100)
    : 0;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        router.push("/admin/dashboard/products");
      }, 1200);
    }, 800);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 sm:space-y-6 w-full min-w-0 pb-16">
      
      {/* Toast Alert */}
      {savedSuccess && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Product created successfully! Redirecting...</span>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <Link
            href="/admin/dashboard/products"
            className="clay-button flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-fraunces text-xl sm:text-2xl font-bold tracking-tight text-[#2A241E]">
              Add New Product
            </h1>
            <p className="text-xs text-slate-500">
              Publish pet food, supplements, or accessories to the Kickat catalog.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href="/admin/dashboard/products"
            className="clay-button px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="clay-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>{saving ? "Publishing..." : "Publish Product"}</span>
          </button>
        </div>
      </div>

      {/* Main Form 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left 8 Columns: Main Form Fields */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Package className="h-4 w-4 text-orange-500" />
              <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                General Information
              </h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Product Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Royal Canin Maxi Puppy Dry Food (15kg)"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. royal-canin-maxi-puppy-15kg"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Brand Name</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="Royal Canin">Royal Canin</option>
                    <option value="Pedigree">Pedigree</option>
                    <option value="Whiskas">Whiskas</option>
                    <option value="Kickat Essentials">Kickat Essentials</option>
                    <option value="Bio-Groom">Bio-Groom</option>
                    <option value="KONG">KONG</option>
                    <option value="Farmina N&D">Farmina N&D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Catalog Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="Dog Nutrition & Kibble">Dog Nutrition & Kibble</option>
                    <option value="Cat Treats & Catnip Delights">Cat Treats & Catnip Delights</option>
                    <option value="Pet Grooming & Spa Hygiene">Pet Grooming & Spa Hygiene</option>
                    <option value="Veterinary Care & Supplements">Veterinary Care & Supplements</option>
                    <option value="Interactive Chew & Plush Toys">Interactive Chew & Plush Toys</option>
                    <option value="Avian & Small Animal Habitat">Avian & Small Animal Habitat</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Target Species</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="Dogs">🐕 Dogs (Canine)</option>
                    <option value="Cats">🐱 Cats (Feline)</option>
                    <option value="Birds">🦜 Birds (Avian)</option>
                    <option value="Small Animals">🐰 Small Animals</option>
                    <option value="All Pets">🐾 Universal / All Pets</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Short Summary</label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="One sentence highlight e.g. Specially formulated for large breed puppies up to 15 months."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Detailed Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide comprehensive details: ingredients, feeding guide, nutritional analysis, and storage guidelines..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Images */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-indigo-500" />
                <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                  Product Imagery
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">JPEG, PNG, WEBP up to 5MB</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 aspect-square">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9.5px] font-black px-2 py-0.5 rounded-md shadow-sm">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-rose-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Upload Box */}
              <label className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl flex flex-col items-center justify-center p-3 text-center cursor-pointer aspect-square bg-[#FAF7F3] hover:bg-orange-50/50 transition">
                <UploadCloud className="h-6 w-6 text-orange-500 mb-1" />
                <span className="text-[11px] font-bold text-slate-700">Add Media</span>
                <span className="text-[9.5px] text-slate-400">Click to upload</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setImages([...images, url]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Section 3: Pricing & GST */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                Pricing, Margins & Taxes
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">MRP (₹) *</label>
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(Number(e.target.value) || "")}
                  placeholder="2999"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Sale Price (₹) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || "")}
                  placeholder="2499"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Cost Price (₹)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value) || "")}
                  placeholder="1650"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            {/* Margin badge */}
            <div className="clay-inset p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Gross Profit Margin:</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black ${marginPct > 20 ? "text-emerald-600" : "text-amber-600"}`}>
                  {marginPct}% Margin
                </span>
                <span className="text-[11px] text-slate-500 ml-1.5">
                  (₹{typeof price === "number" && typeof costPrice === "number" ? price - costPrice : 0} profit/unit)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">GST Slab (%)</label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="0%">0% Exempt</option>
                  <option value="5%">5% (Kibble Base)</option>
                  <option value="12%">12% (Supplements)</option>
                  <option value="18%">18% (Standard Pet Goods)</option>
                  <option value="28%">28% (Luxury Gear)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">HSN Code</label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  placeholder="23091000"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Inventory & Stock */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Layers className="h-4 w-4 text-blue-500" />
              <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                Inventory, SKU & Specs
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">SKU Code *</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="KIK-PET-9042"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Barcode / EAN</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="8901234567890"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Opening Stock *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value) || "")}
                  placeholder="85"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Low Stock Warning</label>
                <input
                  type="number"
                  value={lowStockAlert}
                  onChange={(e) => setLowStockAlert(Number(e.target.value) || "")}
                  placeholder="15"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Net Weight / Vol</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="15 kg"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right 4 Columns: Side Controls & Meta */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          
          {/* Publishing Status Card */}
          <div className="clay-card p-4 sm:p-5 space-y-4">
            <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E]">
              Publishing Status
            </h3>

            <div className="space-y-2">
              {[
                { label: "Active (Visible in store)", val: "ACTIVE", color: "text-emerald-600" },
                { label: "Draft (Hidden preview)", val: "DRAFT", color: "text-amber-600" },
                { label: "Archived (Discontinued)", val: "ARCHIVED", color: "text-slate-400" },
              ].map((st) => (
                <label key={st.val} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FAF7F3] cursor-pointer transition">
                  <input
                    type="radio"
                    name="pub_status"
                    checked={status === st.val}
                    onChange={() => setStatus(st.val as any)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span className={`text-xs font-bold ${st.color}`}>{st.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Featured on Homepage</span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Mark as Best Seller</span>
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Free Express Delivery</span>
                <input
                  type="checkbox"
                  checked={freeShipping}
                  onChange={(e) => setFreeShipping(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Google Search Snippet Preview */}
          <div className="clay-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E]">
                SEO Snippet Preview
              </h3>
            </div>

            <div className="clay-inset p-3 space-y-1">
              <p className="text-[11px] text-blue-800 font-bold truncate hover:underline cursor-pointer">
                {title || "Product Title"} | Kickat India
              </p>
              <p className="text-[10px] text-emerald-700 truncate font-mono">
                https://kickat.in/products/{slug || "product-url"}
              </p>
              <p className="text-[10.5px] text-slate-500 line-clamp-2 leading-tight">
                {shortDesc || "Shop premium pet food, treats, accessories, and grooming essentials with superfast shipping across India."}
              </p>
            </div>
          </div>

          {/* Quick Pet Store Hint */}
          <div className="clay-tip-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐾</span>
              <h4 className="text-xs font-bold text-[#1E3B1B]">Catalog Tip</h4>
            </div>
            <p className="text-[11px] text-[#3E5C38] leading-relaxed">
              Including precise net weight and breed suitability increases search conversion by up to 28%.
            </p>
          </div>

        </div>

      </div>

    </form>
  );
}
