/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Smartphone, ShieldCheck, Cpu, Star, Award, MapPin } from "lucide-react";

interface HeroProps {
  translate: (key: string) => string;
  onExplore: () => void;
  lang: string;
}

export default function HeroSection({ translate, onExplore, lang }: HeroProps) {
  const isRtl = lang === "ar";

  return (
    <div className="relative overflow-hidden bg-[#0a0a0a] border-b border-zinc-850 py-16 lg:py-24" id="alnajm-hero">
      
      {/* Decorative backdrop gradients representing premium smart phones / cosmic look */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] rounded-full bg-yellow-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-[200px] h-[200px] rounded-full bg-red-600/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Titles */}
          <div className="lg:col-span-7 space-y-6 text-right rtl:text-right ltr:text-left">
            
            {/* Tagline / Authorized Agent Banner */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-amber-500/20 text-amber-500 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>
                {isRtl 
                  ? "وكيل معتمد - شركة الكون تيليكوم (يمن موبايل)" 
                  : "Authorized Agent - Yemen Mobile (AlKown Telecom)"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              <span className="block text-slate-100 font-extrabold">
                {translate("hero.title")}
              </span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                {isRtl ? "الفخامة والأصالة في عالم الهواتف" : "Luxury & Authority in Smartphones"}
              </span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base max-w-xl font-medium leading-relaxed">
              {translate("hero.subtitle")}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 py-4 max-w-md">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
                <span className="block text-xl font-bold font-mono text-amber-500">+1200</span>
                <span className="text-[10px] text-zinc-500 font-bold block mt-1">
                  {isRtl ? "هواتف ذكية" : "Smartphones"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
                <span className="block text-xl font-bold font-mono text-amber-500">+500</span>
                <span className="text-[10px] text-zinc-500 font-bold block mt-1">
                  {isRtl ? "أرقام مميزة" : "VIP SIMs"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
                <span className="block text-xl font-bold font-mono text-emerald-400">100%</span>
                <span className="text-[10px] text-zinc-500 font-bold block mt-1">
                  {isRtl ? "صيانة مضمونة" : "Certified Repair"}
                </span>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-8 py-4 font-bold rounded-xl gold-gradient text-black text-center shadow-lg hover:shadow-yellow-500/10 cursor-pointer text-sm gold-gradient-hover"
              >
                {translate("hero.cta")}
              </button>
              <a
                href="#alnajm-location"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("alnajm-location")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-4 font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800/80 text-slate-300 border border-zinc-800 hover:border-zinc-700 text-center text-sm flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{isRtl ? "موقع الفرع في صنعاء" : "Store Location in Sana'a"}</span>
              </a>
            </div>

          </div>

          {/* Luxury Promotional Graphic Device Rendering */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Glowing Golden Circle Ring */}
            <div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full border border-amber-500/20 animate-pulse duration-[4000ms]" />
            <div className="absolute w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] rounded-full border border-dashed border-amber-500/10" />

            {/* Visual Phone Mock representation */}
            <div className="relative w-52 h-[410px] rounded-[40px] bg-zinc-950 border-[5px] border-zinc-900 shadow-2xl p-3 flex flex-col justify-between overflow-hidden">
              {/* Dynamic island */}
              <div className="mx-auto w-16 h-3 rounded-full bg-black mt-1" />
              
              {/* Screen display mock details card */}
              <div className="flex-1 mt-4 flex flex-col justify-between text-center relative z-10">
                <div className="p-2 space-y-1">
                  <div className="w-6 h-6 rounded-md bg-gold/20 flex items-center justify-center mx-auto">
                    <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="block text-[10px] font-bold text-zinc-500">YEMEN MOBILE</span>
                  <span className="block text-xs font-black text-rose-500">النجم موبايل</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/75 border border-zinc-800 text-center m-1">
                  <span className="text-[10px] text-zinc-400 block">{isRtl ? "الرقم الملكي المميز" : "VIP Platinum SIM"}</span>
                  <span className="text-sm font-extrabold text-amber-300 tracking-wider block font-mono">777777770</span>
                  <span className="text-[9px] text-amber-500 block mt-1">{isRtl ? "متاح للحجز الفوري" : "Ready to Reserve"}</span>
                </div>

                <div className="space-y-1.5 p-1 pb-4">
                  <span className="block text-[8px] text-zinc-500 leading-tight">
                    {isRtl ? "الأصبحي - بجانب سوبر ماركت كارفور" : "Beside Carrefour Supermarket"}
                  </span>
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                </div>
              </div>

              {/* Decorative phone reflection */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-tr from-white/0 to-white/[0.03] skew-x-12" />
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-3 right-6 bg-[#141414] border border-amber-500/35 rounded-2xl p-2.5 shadow-2xl flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <span className="block text-[9px] font-bold text-zinc-500">{isRtl ? "أنظمة وتقنية" : "Systems Technology"}</span>
                <span className="block text-xs font-black text-slate-100">{isRtl ? "برمجة وباي باس" : "OS Flashing"}</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-2 bg-[#141414] border border-zinc-800 rounded-2xl p-2.5 shadow-2xl flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="block text-[9px] font-bold text-zinc-500">{isRtl ? "قطع غيار" : "Hardware Parts"}</span>
                <span className="block text-xs font-black text-slate-100">{isRtl ? "شاشات وكالة أصلية" : "Genuine Glass"}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
