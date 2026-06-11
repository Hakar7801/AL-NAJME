/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Sparkles, Smartphone, CheckCircle, Award } from "lucide-react";
import { VipNumber } from "../types.js";

interface VipNumbersProps {
  vipNumbers: VipNumber[];
  translate: (key: string) => string;
  lang: string;
  onAddToCart: (num: VipNumber) => void;
  onInstantReserve: (num: VipNumber) => void;
  searchTerm: string;
}

export default function VipNumbersList({
  vipNumbers,
  translate,
  lang,
  onAddToCart,
  onInstantReserve,
  searchTerm
}: VipNumbersProps) {
  const isRtl = lang === "ar";
  const [localSearch, setLocalSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const providers = ["all", "Yemen Mobile", "Sabafon", "YOU", "Y"];
  const categories = ["all", "platinum", "gold", "silver", "normal"];

  // Filter VIP Numbers based on provider, category, general search and number digit lookups
  const filtered = vipNumbers.filter((item) => {
    // Provider check
    if (selectedProvider !== "all" && item.provider !== selectedProvider) return false;

    // Category check
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;

    // Search digits or letters check
    const query = (localSearch || searchTerm || "").trim().toLowerCase();
    if (query) {
      const matchNumber = item.number.includes(query);
      const matchProvider = item.provider.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      return matchNumber || matchProvider || matchCat;
    }

    return true;
  });

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "platinum":
        return {
          bg: "bg-red-500/10 border-red-500/30 text-red-400",
          labelAr: "بلاتيني ملكي",
          labelEn: "Platinum Royal"
        };
      case "gold":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-gold",
          labelAr: "ذهبي فخم",
          labelEn: "Luxury Gold"
        };
      case "silver":
        return {
          bg: "bg-zinc-400/10 border-zinc-400/20 text-zinc-300",
          labelAr: "فضي أنيق",
          labelEn: "Elegant Silver"
        };
      default:
        return {
          bg: "bg-zinc-800/20 border-zinc-700/20 text-zinc-450",
          labelAr: "مميز عادي",
          labelEn: "Normal Premium"
        };
    }
  };

  const getProviderLogo = (provider: string) => {
    switch (provider) {
      case "Yemen Mobile":
        return "bg-rose-600 text-white font-black";
      case "Sabafon":
        return "bg-emerald-600 text-white font-bold";
      case "YOU":
        return "bg-[#ffe082] text-black font-extrabold";
      default:
        return "bg-blue-600 text-white";
    }
  };

  return (
    <div className="py-12 bg-[#0a0a0a]" id="alnajm-numbers-dir">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-xs font-bold text-gold mb-2.5">
            <Award className="w-3.5 h-3.5" />
            <span>{isRtl ? "نخبة الأرقام المميزة والملكية" : "Exclusive VIP Cellular Numbers"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
            {isRtl ? "احجز رقمك الملكي المناسب فوراً" : "Reserve Your Custom Digital Line"}
          </h2>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
            {isRtl 
              ? "نقدم كوكبة من الأرقام الذهبية والبلاتينية المتناسقة لشركات الاتصال اليمنية وبأفضل الأسعار المنافسة في السوق."
              : "We provide rare matched-digit telecom lines for Yemen Mobile, Sabafon, and YOU networks at supreme rates."}
          </p>
        </div>

        {/* Filter Toolbar controls */}
        <div className="dark-card p-5 rounded-2xl border border-zinc-800/60 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Number Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder={isRtl ? "ابحث بداخل الرقم (مثال: 777)..." : "Search within digits (e.g., 777)..."}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full text-right rtl:text-right pl-4 pr-10 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-850 text-slate-100 focus:outline-none focus:border-gold"
              />
              <Search className="w-4 h-4 text-zinc-550 absolute right-3 top-3.5" />
            </div>

            {/* Provider Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 shrink-0 font-bold">{isRtl ? "الشركة:" : "Carrier:"}</span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold cursor-pointer"
              >
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p === "all" ? (isRtl ? "كل الشركات" : "All Providers") : p}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Level Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 shrink-0 font-bold">{isRtl ? "التصنيف:" : "Class:"}</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? (isRtl ? "كل التصاميم" : "All Classes") : (isRtl ? getCategoryTheme(c).labelAr : getCategoryTheme(c).labelEn)}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Results grid list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const theme = getCategoryTheme(item.category);
            const isSold = item.status === "sold";

            return (
              <div 
                key={item.id}
                className="dark-card-royal rounded-2xl p-4 flex flex-col justify-between border border-zinc-800/50 hover:scale-[1.01] transition-transform"
                id={`vip-card-${item.id}`}
              >
                <div className="space-y-4">
                  {/* Provider Pill badge & Class level */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getProviderLogo(item.provider)}`}>
                      {item.provider}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${theme.bg}`}>
                      {isRtl ? theme.labelAr : theme.labelEn}
                    </span>
                  </div>

                  {/* Interactive Big Digit Layout */}
                  <div className="text-center py-4 bg-zinc-950/60 rounded-xl border border-zinc-900 shadow-inner">
                    <span className="block text-2xl font-black text-amber-500 font-mono tracking-widest">
                      {item.number}
                    </span>
                    <span className="block text-[9px] uppercase font-bold tracking-widest text-amber-500/55 mt-1">
                      {item.provider} REGULAR SIM
                    </span>
                  </div>
                </div>

                {/* Lower billing & status checkouts */}
                <div className="pt-4 border-t border-zinc-900 mt-4 flex flex-col gap-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold leading-none">{translate("product.price")}</span>
                      <span className="text-base font-black text-rose-500 font-mono">
                        ${item.price}
                        <span className="text-[10px] text-zinc-500 font-bold block">
                          (≈ {(item.price * 530).toLocaleString()} ريال)
                        </span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${isSold ? "text-red-500" : "text-emerald-400"}`}>
                        {isSold ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span>{isRtl ? "محجوز / مباع" : "Sold Out"}</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>{isRtl ? "متاح فوري" : "Available"}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Operational actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onInstantReserve({ 
                        id: item.id, 
                        nameAr: `رقم مميز ${item.number}`, 
                        nameEn: `VIP SIM ${item.number}`,
                        price: item.price,
                        category: "phones", // pseudo product category for cart operations
                        images: ["https://images.unsplash.com/photo-1562408590-e32931084e23?w=200&auto=format&fit=crop&q=60"],
                        descriptionAr: `رقم مميز يمن موبايل فخم للغاية ${item.number}`,
                        descriptionEn: `VIP premium line ${item.number}`,
                        specsAr: `الشبكة: ${item.provider}\nالحالة: متاح`,
                        specsEn: `Carrier: ${item.provider}\nStatus: Available`,
                        status: item.status,
                        quantity: 1,
                        ratings: []
                      } as any)}
                      disabled={isSold}
                      className="py-2.5 text-xs font-bold rounded-lg border border-amber-500 text-amber-500 bg-amber-500/5 hover:bg-gold hover:text-black transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      {isRtl ? "حجز مباشر" : "Reserve"}
                    </button>
                    <button
                      onClick={() => onAddToCart({
                        id: item.id,
                        nameAr: `رقم مميز ${item.number}`,
                        nameEn: `VIP SIM ${item.number}`,
                        price: item.price,
                        category: "phones",
                        images: ["https://images.unsplash.com/photo-1562408590-e32931084e23?w=200&auto=format&fit=crop&q=60"],
                        descriptionAr: `رقم مميز يمن موبايل فخم للغاية ${item.number}`,
                        descriptionEn: `VIP premium line ${item.number}`,
                        specsAr: `الشبكة: ${item.provider}`,
                        specsEn: `Carrier: ${item.provider}`,
                        status: item.status,
                        quantity: 1,
                        ratings: []
                      } as any)}
                      disabled={isSold}
                      className="py-2.5 text-xs font-bold rounded-lg bg-gold text-black hover:bg-yellow-400 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      {isRtl ? "للسلة" : "To Cart"}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty state visual */}
        {filtered.length === 0 && (
          <div className="text-center py-12 max-w-sm mx-auto p-4 border border-zinc-800/40 rounded-3xl mt-4">
            <Smartphone className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
            <h4 className="text-zinc-400 text-xs font-bold">{isRtl ? "عذراً، لم نجد رقم مطابق لبيانات التصفية." : "No premium numbers matched your selected filters."}</h4>
          </div>
        )}

      </div>
    </div>
  );
}
