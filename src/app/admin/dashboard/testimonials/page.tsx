"use client";

import { 
  MessageSquareQuote, 
  Star, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Heart, 
  Share2, 
  Eye, 
  X,
  UploadCloud,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";

interface Testimonial {
  id: string;
  author: string;
  city: string;
  petName: string;
  petBreed: string;
  petSpecies: "Dogs" | "Cats" | "Birds" | "Other";
  rating: number;
  headline: string;
  story: string;
  productPurchased: string;
  isFeatured: boolean;
  status: "APPROVED" | "PENDING";
  date: string;
  avatarColor: string;
  petPhoto?: string;
  likesCount: number;
}

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    author: "Ananya Deshmukh",
    city: "Mumbai, Maharashtra",
    petName: "Bruno",
    petBreed: "Golden Retriever (3 yrs)",
    petSpecies: "Dogs",
    rating: 5,
    headline: "Transformed Bruno's Coat & Digestion in 3 Weeks!",
    story: "We struggled with dull fur and chronic sensitive tummy issues for almost a year. Within three weeks on Kickat's Royal Canin Maxi Puppy formula, his energy bounced back and his coat feels like pure silk. Best pet commerce service in India!",
    productPurchased: "Royal Canin Maxi Puppy Dry Food (15kg)",
    isFeatured: true,
    status: "APPROVED",
    date: "Sep 4, 2026",
    avatarColor: "bg-gradient-to-br from-amber-400 to-orange-500",
    petPhoto: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&q=80",
    likesCount: 38,
  },
  {
    id: "test-2",
    author: "Karan Johar Sharma",
    city: "Bengaluru, Karnataka",
    petName: "Milo & Luna",
    petBreed: "Persian & Indie Cats (1 & 2 yrs)",
    petSpecies: "Cats",
    rating: 5,
    headline: "The Only Treats Both My Picky Cats Go Crazy For",
    story: "Cat parents know how impossible it is to satisfy picky eaters. The Temptations seafood crunchy bites and lickable salmon puree have made treat time pure joy. Prompt next-day delivery was the cherry on top.",
    productPurchased: "Temptations Seafood & Salmon Bites (85g)",
    isFeatured: true,
    status: "APPROVED",
    date: "Sep 1, 2026",
    avatarColor: "bg-gradient-to-br from-violet-500 to-purple-600",
    petPhoto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop&q=80",
    likesCount: 42,
  },
  {
    id: "test-3",
    author: "Dr. Meenakshi Rao",
    city: "Hyderabad, Telangana",
    petName: "Simba",
    petBreed: "German Shepherd (5 yrs)",
    petSpecies: "Dogs",
    rating: 5,
    headline: "Significant Mobility Recovery for Hip Dysplasia",
    story: "As a veterinarian and pet mother, I scrutinize ingredients rigorously. The VetriScience GlycoFlex III joint chews sourced directly from Kickat are 100% authentic and Simba is climbing stairs pain-free again!",
    productPurchased: "VetriScience GlycoFlex III Joint Chews",
    isFeatured: true,
    status: "APPROVED",
    date: "Aug 26, 2026",
    avatarColor: "bg-gradient-to-br from-emerald-400 to-teal-600",
    petPhoto: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300&h=300&fit=crop&q=80",
    likesCount: 65,
  },
  {
    id: "test-4",
    author: "Rohan & Shalini Patel",
    city: "Ahmedabad, Gujarat",
    petName: "Rio",
    petBreed: "Conure Parrot (2 yrs)",
    petSpecies: "Birds",
    rating: 5,
    headline: "Cleanest Seed Blends & Calcium Toys",
    story: "Hard to find genuine, pest-free exotic avian diets in local pet shops. Kickat had the complete Kaytee Forti-Diet and mineral blocks delivered safely with airtight packaging.",
    productPurchased: "Kaytee Forti-Diet Pro Parakeet Habitat (2kg)",
    isFeatured: false,
    status: "APPROVED",
    date: "Aug 19, 2026",
    avatarColor: "bg-gradient-to-br from-blue-400 to-indigo-600",
    petPhoto: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=300&fit=crop&q=80",
    likesCount: 19,
  },
  {
    id: "test-5",
    author: "Sneha Mukherjee",
    city: "Kolkata, West Bengal",
    petName: "Zoro",
    petBreed: "Beagle Puppy (7 mos)",
    petSpecies: "Dogs",
    rating: 5,
    headline: "Indestructible KONG Toy Saved Our Furniture!",
    story: "Zoro was chewing every table leg in sight during teething. The KONG classic rubber chew dispenser stuffed with peanut butter kept him blissfully engaged for hours. Essential buy for puppy parents!",
    productPurchased: "KONG Classic Durable Rubber Chew (Large)",
    isFeatured: true,
    status: "APPROVED",
    date: "Aug 12, 2026",
    avatarColor: "bg-gradient-to-br from-rose-400 to-pink-600",
    petPhoto: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=300&h=300&fit=crop&q=80",
    likesCount: 27,
  },
  {
    id: "test-6",
    author: "Vikram Singhania",
    city: "New Delhi, Delhi",
    petName: "Oreo",
    petBreed: "Shih Tzu (4 yrs)",
    petSpecies: "Dogs",
    rating: 4,
    headline: "Great Oatmeal Shampoo for Sensitive Skin",
    story: "Bio-Groom oatmeal shampoo eliminated all scratching and redness after just two baths. Pleasant mild lavender scent that doesn't overwhelm his sensitive nose.",
    productPurchased: "Bio-Groom Herbal Oatmeal Pet Shampoo (355ml)",
    isFeatured: false,
    status: "PENDING",
    date: "Aug 08, 2026",
    avatarColor: "bg-gradient-to-br from-amber-500 to-yellow-600",
    likesCount: 14,
  },
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "FEATURED" | "APPROVED" | "PENDING">("ALL");
  const [speciesFilter, setSpeciesFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    author: "",
    city: "",
    petName: "",
    petBreed: "",
    petSpecies: "Dogs" as Testimonial["petSpecies"],
    rating: 5,
    headline: "",
    story: "",
    productPurchased: "Royal Canin Maxi Puppy Dry Food (15kg)",
    isFeatured: true,
    status: "APPROVED" as Testimonial["status"],
    petPhoto: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      author: "",
      city: "",
      petName: "",
      petBreed: "",
      petSpecies: "Dogs",
      rating: 5,
      headline: "",
      story: "",
      productPurchased: "Royal Canin Maxi Puppy Dry Food (15kg)",
      isFeatured: true,
      status: "APPROVED",
      petPhoto: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      author: item.author,
      city: item.city,
      petName: item.petName,
      petBreed: item.petBreed,
      petSpecies: item.petSpecies,
      rating: item.rating,
      headline: item.headline,
      story: item.story,
      productPurchased: item.productPurchased,
      isFeatured: item.isFeatured,
      status: item.status,
      petPhoto: item.petPhoto || "",
    });
    setIsModalOpen(true);
  };

  const handleToggleFeatured = (id: string) => {
    setTestimonials(testimonials.map(t => {
      if (t.id === id) {
        const nextState = !t.isFeatured;
        showToast(nextState ? `Pinned "${t.author}" to Homepage!` : `Removed from Homepage.`);
        return { ...t, isFeatured: nextState };
      }
      return t;
    }));
  };

  const handleDelete = (id: string, author: string) => {
    if (confirm(`Delete testimonial from ${author}?`)) {
      setTestimonials(testimonials.filter(t => t.id !== id));
      showToast(`Testimonial from "${author}" deleted.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.story.trim()) return;

    if (editingItem) {
      setTestimonials(testimonials.map(t => 
        t.id === editingItem.id
          ? { ...t, ...formData }
          : t
      ));
      showToast(`Updated testimonial from "${formData.author}"!`);
    } else {
      const newItem: Testimonial = {
        id: `test-${Date.now()}`,
        author: formData.author,
        city: formData.city || "Mumbai, India",
        petName: formData.petName || "Pet",
        petBreed: formData.petBreed || "Beloved Pet",
        petSpecies: formData.petSpecies,
        rating: formData.rating,
        headline: formData.headline || "Wonderful experience with Kickat!",
        story: formData.story,
        productPurchased: formData.productPurchased,
        isFeatured: formData.isFeatured,
        status: formData.status,
        date: "Today",
        avatarColor: "bg-gradient-to-br from-amber-400 to-orange-500",
        petPhoto: formData.petPhoto || undefined,
        likesCount: 1,
      };
      setTestimonials([newItem, ...testimonials]);
      showToast(`Created testimonial for "${formData.author}"!`);
    }

    setIsModalOpen(false);
  };

  const filtered = testimonials.filter((t) => {
    const matchesSearch = 
      t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.productPurchased.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "ALL" ? true :
      statusFilter === "FEATURED" ? t.isFeatured :
      t.status === statusFilter;

    const matchesSpecies = speciesFilter === "ALL" || t.petSpecies === speciesFilter;

    return matchesSearch && matchesStatus && matchesSpecies;
  });

  const featuredCount = testimonials.filter(t => t.isFeatured).length;
  const approvedCount = testimonials.filter(t => t.status === "APPROVED").length;

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 pb-16">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
            Customer Testimonials
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Curate, feature, and showcase verified pet parent stories on the homepage and catalog pages.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Total Stories</span>
            <MessageSquareQuote className="h-4 w-4 text-indigo-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">{testimonials.length}</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">{approvedCount} verified active</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Homepage Hero</span>
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">{featuredCount}</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Pinned to homepage</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Average Rating</span>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">4.96 <span className="text-xs text-slate-400 font-bold">/ 5.0</span></p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 mt-0.5 truncate">98% positive sentiment</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Photo Attached</span>
            <ImageIcon className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1.5">
            {testimonials.filter(t => t.petPhoto).length}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Real pet photography</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="clay-card p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search testimonials by pet parent, breed, headline, or product..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
            {(["ALL", "FEATURED", "APPROVED", "PENDING"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`
                  px-3 py-1.5 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer
                  ${statusFilter === st 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }
                `}
              >
                {st === "FEATURED" ? "⭐ FEATURED" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Pet Species Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono-eyebrow shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Species:
          </span>
          {["ALL", "Dogs", "Cats", "Birds", "Other"].map((sp) => (
            <button
              key={sp}
              onClick={() => setSpeciesFilter(sp)}
              className={`
                px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition cursor-pointer
                ${speciesFilter === sp
                  ? "bg-orange-500 text-white shadow-xs font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }
              `}
            >
              {sp === "Dogs" ? "🐕 Dogs" : sp === "Cats" ? "🐱 Cats" : sp === "Birds" ? "🦜 Birds" : sp}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Cards Grid */}
      {filtered.length === 0 ? (
        <div className="clay-card p-10 text-center space-y-3">
          <div className="text-4xl">💬</div>
          <h3 className="font-fraunces text-base font-bold text-[#2A241E]">No testimonials found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or add a new customer testimonial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
          {filtered.map((item) => (
            <div 
              key={item.id} 
              className={`
                clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 transition-all relative group
                ${item.isFeatured ? "ring-2 ring-amber-400/80 shadow-md" : ""}
              `}
            >
              {/* Header */}
              <div className="space-y-3">
                
                {/* Author row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl ${item.avatarColor} text-white text-xs font-black shadow-xs`}>
                      {item.author.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.author}
                        </h3>
                        <span title="Verified Pet Parent"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" /></span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{item.city}</p>
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {item.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] font-black rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0 uppercase">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                {/* Pet pill & Star rating */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/90 text-xs">
                  <span className="px-2 py-0.5 text-[10.5px] font-bold rounded-lg bg-[#F8F4EF] text-slate-700 border border-slate-200/60 truncate max-w-[200px]">
                    🐾 {item.petName} ({item.petBreed})
                  </span>

                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 ${i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Headline & Story */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E] leading-snug">
                    “{item.headline}”
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 font-normal">
                    {item.story}
                  </p>
                </div>

                {/* Pet Photo preview if available */}
                {item.petPhoto && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200/80 aspect-[16/9] bg-slate-100">
                    <img 
                      src={item.petPhoto} 
                      alt={`${item.petName} photo`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                      📸 {item.petName}
                    </div>
                  </div>
                )}

                {/* Purchased product tag */}
                <div className="clay-inset p-2.5 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-medium truncate mr-2">Verified Order: <strong>{item.productPurchased}</strong></span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.date}</span>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100/90 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(item.id)}
                  className={`
                    clay-button flex-1 py-1.5 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer
                    ${item.isFeatured ? "text-amber-700 hover:text-amber-800 bg-amber-50/60" : "text-slate-600 hover:text-amber-600"}
                  `}
                >
                  <Star className={`h-3.5 w-3.5 ${item.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                  <span>{item.isFeatured ? "Homepage Pinned" : "Pin to Home"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-orange-600 transition cursor-pointer"
                  title="Edit testimonial"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.author)}
                  className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Delete testimonial"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          Add / Edit Testimonial Clay Modal
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="clay-card w-full max-w-lg p-5 sm:p-6 bg-white space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar animate-scale-in">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-base">
                  💬
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    {editingItem ? "Edit Testimonial" : "New Customer Story"}
                  </h2>
                  <p className="text-[11px] text-slate-500">Publish pet parent social proof to web store</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-medium">
              
              {/* Pet Parent & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Ananya Deshmukh"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">City / State</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Pet Name & Breed & Species */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Pet Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.petName}
                    onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                    placeholder="e.g. Bruno"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Breed & Age</label>
                  <input
                    type="text"
                    value={formData.petBreed}
                    onChange={(e) => setFormData({ ...formData, petBreed: e.target.value })}
                    placeholder="e.g. Golden Retriever (3y)"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Species</label>
                  <select
                    value={formData.petSpecies}
                    onChange={(e) => setFormData({ ...formData, petSpecies: e.target.value as any })}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  >
                    <option value="Dogs">🐕 Dog</option>
                    <option value="Cats">🐱 Cat</option>
                    <option value="Birds">🦜 Bird</option>
                    <option value="Other">🐾 Other Pet</option>
                  </select>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Rating Score</label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setFormData({ ...formData, rating: s })}
                      className="p-1 text-slate-300 hover:text-amber-400 transition"
                    >
                      <Star className={`h-6 w-6 ${s <= formData.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-black text-slate-800">{formData.rating} Stars</span>
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Quote Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Transformed Bruno's Coat & Digestion!"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Story */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Full Testimonial Story *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Share the customer's detailed feedback, benefits observed, and health improvements..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Product Purchased & Photo URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Associated Product</label>
                  <input
                    type="text"
                    value={formData.productPurchased}
                    onChange={(e) => setFormData({ ...formData, productPurchased: e.target.value })}
                    placeholder="e.g. Royal Canin Maxi Puppy (15kg)"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Pet Photo Image URL</label>
                  <input
                    type="url"
                    value={formData.petPhoto}
                    onChange={(e) => setFormData({ ...formData, petPhoto: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Feature on Homepage Toggle */}
              <label className="clay-inset p-3 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Pin to Homepage Hero Carousel</p>
                  <p className="text-[10.5px] text-slate-500">Showcase this story prominently on the public web store</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-orange-600 h-4 w-4"
                />
              </label>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-orange inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>{editingItem ? "Save Changes" : "Publish Story"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
