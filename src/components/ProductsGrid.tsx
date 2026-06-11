/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Star, ShoppingCart, ShieldCheck, Heart, ChevronLeft, ChevronRight, MessageSquareCode, Sparkles 
} from "lucide-react";
import { Product, Rating } from "../types.js";

interface ProductsGridProps {
  products: Product[];
  translate: (key: string) => string;
  lang: string;
  onAddToCart: (p: Product) => void;
  onInstantReserve: (p: Product) => void;
  onSubmitRating: (productId: string, rating: number, comment: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  searchTerm: string;
}

export default function ProductsGrid({
  products,
  translate,
  lang,
  onAddToCart,
  onInstantReserve,
  onSubmitRating,
  activeCategory,
  onCategoryChange,
  searchTerm
}: ProductsGridProps) {
  const isRtl = lang === "ar";
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Rating submission sub-state
  const [rateScore, setRateScore] = useState(5);
  const [rateComment, setRateComment] = useState("");
  const [imageIndexMap, setImageIndexMap] = useState<Record<string, number>>({});

  // Filter products by category AND search terms
  const filteredProducts = products.filter((p) => {
    // Category match
    if (activeCategory !== "all" && p.category !== activeCategory) return false;

    // Search term match over name description or specifications
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const nAr = (p.nameAr || "").toLowerCase();
      const nEn = (p.nameEn || "").toLowerCase();
      const dAr = (p.descriptionAr || "").toLowerCase();
      const dEn = (p.descriptionEn || "").toLowerCase();
      const sAr = (p.specsAr || "").toLowerCase();
      const sEn = (p.specsEn || "").toLowerCase();
      return (
        nAr.includes(term) ||
        nEn.includes(term) ||
        dAr.includes(term) ||
        dEn.includes(term) ||
        sAr.includes(term) ||
        sEn.includes(term)
      );
    }
    return true;
  });

  const categories = [
    { id: "all", labelAr: "الكل", labelEn: "All" },
    { id: "phones", labelAr: "هواتف ذكية", labelEn: "Smartphones" },
    { id: "accessories", labelAr: "إكسسوارات", labelEn: "Accessories" },
    { id: "maintenance", labelAr: "صيانة", labelEn: "Hardware Service" },
    { id: "programming", labelAr: "برمجة السوفتوير", labelEn: "Programming/OS" }
  ];

  const handleImageNav = (productId: string, imagesCount: number, direction: "prev" | "next", e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIdx = imageIndexMap[productId] || 0;
    let nextIdx = currentIdx;

    if (direction === "next") {
      nextIdx = (currentIdx + 1) % imagesCount;
    } else {
      nextIdx = (currentIdx - 1 + imagesCount) % imagesCount;
    }

    setImageIndexMap({ ...imageIndexMap, [productId]: nextIdx });
  };

  const calculateAvgRating = (ratings: Rating[]) => {
    if (!ratings || ratings.length === 0) return 4.5; // default elegant placeholder rating
    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    return Number((total / ratings.length).toFixed(1));
  };

  const handleRatingSubmit = (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    onSubmitRating(productId, rateScore, rateComment);
    setRateComment("");
    // Close and refresh selected detail card
    const updatedProd = products.find(p => p.id === productId);
    if (updatedProd) {
      setSelectedProduct(updatedProd);
    }
  };

  return (
    <div className="py-12 bg-[#0c0c0c]" id="alnajm-products-dir">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and category selector tags */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="text-right rtl:text-right ltr:text-left">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-1">
              {isRtl ? "المعرض الذهبي للمنتجات والخدمات" : "Golden Showroom of Products"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              {isRtl ? "تصفح معروضات النجم موبايل" : "Explore Al-Najm Catalog"}
            </h2>
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex flex-wrap gap-2 justify-start rtl:justify-end">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-amber-600 text-black border-amber-600 shadow-md shadow-amber-500/10"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                {isRtl ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 dark-card-royal rounded-3xl max-w-md mx-auto p-8 border border-zinc-800">
            <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-300 mb-1">
              {isRtl ? "لم يتم العثور على نتائج" : "No Items Found"}
            </h3>
            <p className="text-zinc-500 text-xs mb-4">
              {isRtl ? "جرّب تصنيفاً مختلفاً أو تعديل حقول البحث الحالية." : "Try expanding your filter tab choice or search words."}
            </p>
            <button 
              onClick={() => { onCategoryChange("all"); }} 
              className="px-4 py-2 bg-zinc-800 text-xs font-bold rounded-lg hover:bg-zinc-700 text-zinc-300"
            >
              {isRtl ? "عرض كل الأصناف" : "Show All Deliverables"}
            </button>
          </div>
        )}

        {/* Products Grid list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const currentImgIndex = imageIndexMap[p.id] || 0;
            const images = p.images && p.images.length ? p.images : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60"];
            const isOutOfStock = p.status === "unavailable" || p.quantity <= 0;
            const avgRating = calculateAvgRating(p.ratings);

            return (
              <div 
                key={p.id}
                className="group dark-card-royal p-4 rounded-2xl flex flex-col justify-between transition-all duration-300 relative cursor-pointer"
                onClick={() => setSelectedProduct(p)}
                id={`product-card-${p.id}`}
              >
                {/* Image slider container */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-900/50 mb-4 border border-zinc-800/40">
                  <img
                    src={images[currentImgIndex]}
                    alt={isRtl ? p.nameAr : p.nameEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Multiple image controller triggers */}
                  {images.length > 1 && (
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleImageNav(p.id, images.length, "prev", e)}
                        className="w-7 h-7 rounded-full bg-black/85 text-white flex items-center justify-center hover:text-amber-500 pointer-events-auto"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleImageNav(p.id, images.length, "next", e)}
                        className="w-7 h-7 rounded-full bg-black/85 text-white flex items-center justify-center hover:text-amber-500 pointer-events-auto"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Image indicator dots */}
                  {images.length > 1 && (
                    <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                      {images.map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full ${i === currentImgIndex ? "bg-amber-500" : "bg-zinc-640"}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md shadow-md ${
                      isOutOfStock 
                        ? "bg-red-500/90 text-white" 
                        : "bg-black/85 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {isOutOfStock ? translate("product.unavailable") : translate("product.available")}
                    </span>
                  </div>

                  {/* Quantity Indicator */}
                  {!isOutOfStock && p.quantity < 6 && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-md animate-pulse">
                        {isRtl ? `تبقى ${p.quantity} قطع فقط` : `Only ${p.quantity} left`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info block */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Brand type tag */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                      <span className="uppercase text-amber-500/80">{p.category}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
                        <span className="text-zinc-300 font-mono">{avgRating}</span>
                        <span className="text-[10px] text-zinc-500">({p.ratings?.length || 0})</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-100 line-clamp-1 mt-1 group-hover:text-amber-500 transition-colors leading-relaxed">
                      {isRtl ? p.nameAr : p.nameEn}
                    </h3>

                    <p className="text-zinc-400 text-xs line-clamp-2 mt-1 leading-relaxed">
                      {isRtl ? p.descriptionAr : p.descriptionEn}
                    </p>
                  </div>

                  {/* Pricing and Action controllers */}
                  <div className="pt-3 border-t border-zinc-900 mt-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold leading-none">{translate("product.price")}</span>
                        <span className="text-base font-black text-rose-500 font-mono">
                          ${p.price.toLocaleString()}
                          <span className="text-[10px] text-zinc-500 font-bold ml-1">
                            {isRtl ? `(≈ ${(p.price * 530).toLocaleString()} ريال)` : `(≈ ${(p.price * 530).toLocaleString()} YER)`}
                          </span>
                        </span>
                      </div>

                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Instant reserve */}
                        <button
                          onClick={() => onInstantReserve(p)}
                          disabled={isOutOfStock}
                          className="px-3 py-2 text-xs font-bold rounded-lg border border-amber-500/55 text-amber-500 bg-amber-500/5 hover:bg-amber-500 hover:text-black transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        >
                          {isRtl ? "حجز" : "Reserve"}
                        </button>
                        
                        {/* Cart */}
                        <button
                          onClick={() => onAddToCart(p)}
                          disabled={isOutOfStock}
                          className="px-3 py-2 text-xs font-bold rounded-lg bg-gold text-black hover:bg-[#ffe082] transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          title={translate("product.addToCart")}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Detailed Sheet Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" id="alnajm-product-detail-modal">
            <div className="relative bg-[#101010] border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-right rtl:text-right ltr:text-left">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 left-4 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images View */}
                <div>
                  <div className="w-full aspect-square rounded-2xl bg-zinc-950 p-4 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedProduct.images && selectedProduct.images.length ? selectedProduct.images[0] : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60"} 
                      alt=""
                      referrerPolicy="no-referrer"
                      className="max-h-full object-contain"
                    />
                  </div>
                  
                  {/* Additional thumbnails if available */}
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {selectedProduct.images?.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer p-1">
                        <img src={img} className="w-full h-full object-contain" referrerPolicy="no-referrer" alt="" />
                      </div>
                    ))}
                  </div>

                  {/* Safety Policy info snippet */}
                  <div className="mt-4 p-3.5 rounded-xl bg-orange-500/5 border border-amber-500/10 text-xs text-orange-200 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      {isRtl 
                        ? "حجز مضمون 100%! المتجر يحفظ حجزك لمدة 48 ساعة بعد الدفع لإتاحة الاستلام المباشر أو التوصيل داخل صنعاء."
                        : "100% Secure reservation locked for 48 hours for immediate pick up or local transit inside Sana'a."}
                    </p>
                  </div>
                </div>

                {/* Specification and Text Details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gold px-2.5 py-1 rounded bg-amber-500/10">
                      {selectedProduct.category.toUpperCase()}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2 leading-tight">
                      {isRtl ? selectedProduct.nameAr : selectedProduct.nameEn}
                    </h2>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-xs block font-bold leading-none uppercase">{translate("product.price")}</span>
                    <span className="text-2xl font-black text-rose-500 font-mono">
                      ${selectedProduct.price.toLocaleString()}
                      <span className="text-xs text-zinc-400 font-bold ml-2">
                        {isRtl ? `(≈ ${(selectedProduct.price * 530).toLocaleString()} ريال يمني)` : `(≈ ${(selectedProduct.price * 530).toLocaleString()} YER)`}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-zinc-500 text-xs font-bold block">{isRtl ? "الوصف التعريفي" : "Detail Description"}</span>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      {isRtl ? selectedProduct.descriptionAr : selectedProduct.descriptionEn}
                    </p>
                  </div>

                  {/* Technical Specs sheets */}
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-xs font-bold block">{translate("product.specs")}</span>
                    <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-855 text-zinc-350 text-xs space-y-1 font-mono">
                      {(isRtl ? selectedProduct.specsAr : selectedProduct.specsEn).split("\n").map((line, i) => (
                        <div key={i} className="flex justify-between py-1 border-b border-zinc-900/60 last:border-0">
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action row in modal */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        onAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 py-3 text-xs font-bold rounded-xl bg-gold text-black hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-4.5 h-4.5" />
                      <span>{isRtl ? "إضافة لسلة الحجز" : "Add to Reservation Cart"}</span>
                    </button>
                    <button
                      onClick={() => {
                        onInstantReserve(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="px-6 py-3 text-xs font-bold rounded-xl border border-amber-500 text-amber-500 hover:bg-amber-500/5 transition-colors cursor-pointer"
                    >
                      {isRtl ? "حجز الآن" : "Reserve Immediately"}
                    </button>
                  </div>

                </div>
              </div>

              {/* Reviews and Ratings interactive section */}
              <div className="border-t border-zinc-900 mt-10 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquareCode className="w-5 h-5 text-gold" />
                    <h3 className="text-base font-black text-slate-100">{translate("product.rating")}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4.5 h-4.5 fill-gold stroke-none" />
                    <span className="font-extrabold text-slate-100 font-mono">{calculateAvgRating(selectedProduct.ratings || [])}</span>
                    <span className="text-zinc-500 text-xs">({selectedProduct.ratings?.length || 0} {isRtl ? "مراجعات" : "reviews"})</span>
                  </div>
                </div>

                {/* Submited Ratings logs */}
                <div className="space-y-3.5 mb-6">
                  {selectedProduct.ratings && selectedProduct.ratings.length > 0 ? (
                    selectedProduct.ratings.map((rate) => (
                      <div key={rate.id} className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-90 w-full text-right">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-200">{rate.userName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{new Date(rate.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-0.5 my-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-3.5 h-3.5 ${s <= rate.rating ? "fill-amber-500 text-gold" : "text-zinc-700"}`} 
                            />
                          ))}
                        </div>
                        <p className="text-zinc-400 text-xs mt-0.5">{rate.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-xs italic text-center py-4 bg-zinc-950/20 rounded-xl">
                      {isRtl ? "لا توجد تقييمات سابقة لهذا الصنف. كن أول من يضع بصمته!" : "No user feedback logged yet. Write the very first review!"}
                    </p>
                  )}
                </div>

                {/* Leave feedback form */}
                <form onSubmit={(e) => handleRatingSubmit(e, selectedProduct.id)} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h4 className="text-xs font-bold text-slate-300 mb-3">{translate("product.addRating")}</h4>
                  
                  {/* Select stars */}
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-xs text-zinc-500 ml-2">{isRtl ? "التقييم:" : "Rating:"}</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRateScore(s)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star className={`w-5 h-5 ${s <= rateScore ? "fill-amber-500 text-gold" : "text-zinc-650"}`} />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <textarea
                      placeholder={isRtl ? "كتابة رأيك في جودة ومواصفات المنتج..." : "Write your thoughts on specs & quality..."}
                      value={rateComment}
                      onChange={(e) => setRateComment(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 text-slate-100 placeholder-zinc-600 focus:outline-none focus:border-gold"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-zinc-800 hover:bg-gold hover:text-black transition-colors text-zinc-300 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      {isRtl ? "تثبيت التعليق والتقييم" : "Post Review"}
                    </button>
                  </div>
                </form>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
