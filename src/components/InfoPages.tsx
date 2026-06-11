/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MapPin, Phone, MessageSquare, Mail, ShieldAlert, FileText, Share2, Award, Clock } from "lucide-react";
import { SiteSettings } from "../types.js";

interface InfoPagesProps {
  lang: string;
  translate: (key: string) => string;
  settings: SiteSettings | null;
  slug: "contact" | "privacy" | "terms";
}

export default function InfoPages({ lang, translate, settings, slug }: InfoPagesProps) {
  const isRtl = lang === "ar";

  const defaultPhones = settings?.contactPhones || ["777644776", "775888975", "737201461", "711516860"];
  const embedLink = settings?.coordinates?.embedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15392.20417937397!2d44.2048!3d15.2917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1603db0000000001%3A0x0!2zMTXCsDE3JzMwLjEiTiA0NMKwMTInMTcuMyJF!5e0!3m2!1sar!2sye!4v1700000000000";

  if (slug === "contact") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right rtl:text-right ltr:text-left animate-fade-in" id="alnajm-location">
        
        {/* Contact Page */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-1">
            {isRtl ? "تواصل معنا - مقر الشحنة الفخمة" : "GET IN TOUCH WITH THE STORE"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
            {isRtl ? "يسعدنا دائماً خدمتكم والإجابة على تساؤلاتكم" : "We are Glad to Support & Answer Your Queries"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Support options */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="dark-card p-5 rounded-2xl border border-zinc-800 space-y-4">
              <h4 className="text-sm font-black text-[#e5c158] flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Clock className="w-4 h-4" />
                <span>{isRtl ? "ساعات الدوام بفرع صنعاء" : "Operating Hours"}</span>
              </h4>
              <p className="text-zinc-350 text-xs leading-relaxed font-bold">
                {isRtl 
                  ? "يومياً من الساعة 9:00 صباحاً حتى السبت، عدا يوم الجمعة من الساعة 4:00 عصراً حتى 10:00 مساءً."
                  : "Daily from 9:00 AM to 10:00 PM, except Friday from 4:00 PM to 10:00 PM."}
              </p>
            </div>

            <div className="dark-card p-5 rounded-2xl border border-zinc-800 space-y-4">
              <h4 className="text-sm font-black text-[#e5c158] flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Phone className="w-4 h-4" />
                <span>{isRtl ? "أرقام التميز وخدمة العملاء" : "Customer Support Numbers"}</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-zinc-300">
                {defaultPhones.map((phone, i) => (
                  <a 
                    key={i} 
                    href={`tel:${phone}`}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-90 hover:border-gold hover:text-gold text-center block"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </div>

            <div className="dark-card p-5 rounded-2xl border border-zinc-800 space-y-4">
              <h4 className="text-sm font-black text-[#e5c158] flex items-center gap-2 border-b border-zinc-900 pb-2">
                <MapPin className="w-4 h-4" />
                <span>{isRtl ? "العنوان بالتفصيل" : "Detailed Store Address"}</span>
              </h4>
              <p className="text-zinc-300 text-xs leading-relaxed">
                {isRtl 
                  ? settings?.addressAr || "صنعاء - الأصبحي - بجانب سوبر ماركت كارفور - أمام سوق القات."
                  : settings?.addressEn || "Sana'a - Al-Asbahi - Next to Carrefour Supermarket - Opposite Qat Market."}
              </p>
              
              {settings?.socialLinks && settings.socialLinks.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] text-zinc-550 block font-bold leading-none mb-2">{isRtl ? "تابعونا على قنوات التواصل:" : "Follow Us on Socials:"}</span>
                  <div className="flex flex-wrap gap-1.5 justify-start">
                    {settings.socialLinks.map((sl) => (
                      <a
                        key={sl.id}
                        href={sl.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#e5c158]/10 text-gold border border-zinc-800 text-[10px] font-bold uppercase transition-colors"
                      >
                        {sl.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Map display */}
          <div className="lg:col-span-7">
            <div className="dark-card p-4 rounded-3xl border border-zinc-800 bg-zinc-950/40">
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-90">
                <iframe
                  title="Al-Najm Mobile Google Map Branch"
                  src={embedLink}
                  width="100%"
                  height="100%"
                  className="border-0"
                  allowFullScreen={true}
                  loading="lazy"
                />
              </div>
              <span className="block text-[10px] text-zinc-500 font-bold mt-2 text-center">
                {isRtl 
                  ? "خريطة تفاعلية لفرع الأصبحي - أمام سوق القات مباشرة"
                  : "Interactive Google Maps view of Al-Asbahi Main branch, Sana'a."}
              </span>
            </div>
          </div>

        </div>

      </div>
    );
  }

  if (slug === "privacy") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-right rtl:text-right ltr:text-left animate-fade-in" id="alnajm-privacy">
        <div className="dark-card p-6 sm:p-10 rounded-3xl border border-zinc-800 space-y-6">
          
          <div className="flex items-center gap-2 border-b border-zinc-850 pb-4">
            <ShieldAlert className="w-7 h-7 text-gold shrink-0" />
            <div>
              <h1 className="text-2xl font-black text-slate-100">{isRtl ? "سياسة الخصوصية وسرية البيانات" : "Privacy Policy Agreement"}</h1>
              <span className="text-[10px] text-zinc-500 block font-bold mt-1">تاريخ التحديث الأخير: يونيو 2026</span>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-4">
            <p>
              {isRtl
                ? "في النجم موبايل، نلتزم بحماية سرية وخصوصية الحسابات والتعاملات الرقمية التي يقوم بها العملاء من خلال موقعنا حيال حجز الهواتف أو أرقام التميز."
                : "At Al-Najm Mobile, we take strict responsibility for securing customer ledger details, transactional data proof, and phone reservations."}
            </p>

            <h3 className="text-sm font-black text-gold pt-2">
              {isRtl ? "1. البيانات التي يتم جمعها وحفظها" : "1. Information We Collect"}
            </h3>
            <p>
              {isRtl
                ? "نقوم بجمع بيانات الاسم الكامل ورقم الجوال لتمكين المتجر من التواصل لإجراء الاستلام، بالإضافة لرموز الحوالات وسندات الدفع لتوثيق التسوية المالية."
                : "We collect full names, telephone numbers, and financial cash wire receipt codes solely to handle smartphone pick up coordinates."}
            </p>

            <h3 className="text-sm font-black text-gold pt-2">
              {isRtl ? "2. حماية الصور وسندات الإيداع" : "2. Secure Database Storage"}
            </h3>
            <p>
              {isRtl
                ? "يتم رفع سندات الدفع المشفرة والتقاطات الكاميرا مباشرة بداخل الخادم السحابي الآمن لمتجرنا، ولا يتم إتاحتها لأي جهة ثالثة خارج طاقم الإدارة المصرح."
                : "Transaction receipts captured via direct mobile cameras or files are encoded seamlessly on our server to prevent leakage."}
            </p>

            <h3 className="text-sm font-black text-gold pt-2">
              {isRtl ? "3. حقوق حذف البيانات" : "3. General Rights on Erasure"}
            </h3>
            <p>
              {isRtl
                ? "يمكن للعميل التقدم بطلب لحذف سجله تماماً عبر التواصل المباشر مع السوبر أدمن عبر أرقام خدمة العملاء الموثقة."
                : "Customers may ask for full session profiles or transaction removals by directly calling the authorized Admin nodes."}
            </p>
          </div>

        </div>
      </div>
    );
  }

  // Terms and Conditions
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-right rtl:text-right ltr:text-left animate-fade-in" id="alnajm-terms">
      <div className="dark-card p-6 sm:p-10 rounded-3xl border border-zinc-805 space-y-6">
        
        <div className="flex items-center gap-2 border-b border-zinc-850 pb-4">
          <FileText className="w-7 h-7 text-gold shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-slate-100">{isRtl ? "الشروط والأحكام وشهادة الضمان" : "Terms & Conditions of Reservations"}</h1>
            <span className="text-[10px] text-zinc-500 block font-bold mt-1">نسخة نظام الخدمة المحدثة لعام 2026</span>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-4">
          <p>
            {isRtl
              ? "مرحباً بكم في منصة النجم موبايل. استخدامكم للموقع وحجز الأجهزة أو خدمات الصيانة الملكية يخضع للشروط التنظيمية المبينة أدناه:"
              : "Welcome to Al-Najm Mobile. Your reservations of smartphones, accessories, and SIM cards are bound by the service clauses cataloged below:"}
          </p>

          <h3 className="text-sm font-black text-gold pt-2">
            {isRtl ? "1. ضوابط حجز الأجهزة والأرقام المميزة" : "1. Reservation Hold policy"}
          </h3>
          <p>
            {isRtl
              ? "حجز الأجهزة أو الأرقام المميزة يظل سارياً لمدة 48 ساعة فقط كفترة حظر مؤقتة بعد ترحيل الطلب. يتم إلغاء الحجز تلقائياً إذا تبين أن رقم الحوالة ورقية أو سند الإيداع غير صحيح."
              : "Reservations for devices or premium cellular lines remain active for a maximum window of 48 hours. If the wire reference is void, we release lock parameters automatically."}
          </p>

          <h3 className="text-sm font-black text-gold pt-2">
            {isRtl ? "2. الضمان الرسمي للهواتف الذكية" : "2. Hardware Warranties"}
          </h3>
          <p>
            {isRtl
              ? "كافة الأجهزة المباعة مضمونة وكالة لمدة عام كامل ضد العيوب المصنعية، ولا يغطي الضمان الكسر أو السوائل أو البرمجة غير الرسمية الخارجة عن فرعنا."
              : "All official mobile handsets carried are cataloged with 1-year product warranty. Screen drops, water logs, or bootloader modifications void warranty."}
          </p>

          <h3 className="text-sm font-black text-gold pt-2">
            {isRtl ? "3. تعديل الرسوم الأسعار والتحديثات" : "3. Pricing updates"}
          </h3>
          <p>
            {isRtl
              ? "يمتلك السوبر أدمن الحق المطلق في تعديل أسعار الصرف بالريال اليمني أو تحديث قيم الهواتف تزامناً مع أسعار السوق دون إشعار مسبق."
              : "Global pricing is synchronized dynamically. Admins may alter USD conversions relative to Yemen Mobile parameters at any time."}
          </p>
        </div>

      </div>
    </div>
  );
}
