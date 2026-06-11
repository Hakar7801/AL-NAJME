/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Phone, MapPin, Shield, Mail, ArrowUp, Calendar, Heart, Award, Cpu, ShieldCheck 
} from "lucide-react";
import Navbar from "./components/Navbar.js";
import HeroSection from "./components/HeroSection.js";
import ProductsGrid from "./components/ProductsGrid.js";
import VipNumbersList from "./components/VipNumbersList.js";
import CartModal from "./components/CartModal.js";
import CheckoutSection from "./components/CheckoutSection.js";
import Dashboard from "./components/Dashboard.js";
import LoginScreen from "./components/LoginScreen.js";
import InfoPages from "./components/InfoPages.js";
import { Product, VipNumber, CartItem, User, SiteSettings, TranslationSet, EWallet } from "./types.js";

// Absolute endpoint provider
const API_URL = window.location.origin;

export default function App() {
  // Locale States
  const [lang, setLang] = useState<string>(() => localStorage.getItem("alnajm_lang") || "ar");
  const [translationsList, setTranslationsList] = useState<TranslationSet[]>([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState<"home" | "phones" | "accessories" | "maintenance" | "programming" | "vip_numbers" | "contact" | "privacy" | "terms" | "dashboard" | "login" | "checkout">("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Authentication states
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("alnajm_token"));
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Active db variables (synchronizing with REST APIs)
  const [products, setProducts] = useState<Product[]>([]);
  const [vips, setVips] = useState<VipNumber[]>([]);
  const [wallets, setWallets] = useState<EWallet[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Shopping cart persistence (Items survive page refreshes)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("alnajm_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist cart values
  useEffect(() => {
    localStorage.setItem("alnajm_cart", JSON.stringify(cart));
  }, [cart]);

  // Handle back to top indicators
  useEffect(() => {
    const toggleVisible = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  // Fetch initial system settings, languages, and products
  const fetchSiteSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      if (res.ok) setSettings(await res.json());
    } catch (e) {
      console.error("error reading appsettings", e);
    }
  };

  const fetchTranslations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/languages`);
      if (res.ok) {
        const list = await res.json();
        setTranslationsList(list);
      }
    } catch (e) {
      console.error("error reading translations", e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error("error reading products", e);
    }
  };

  const fetchVips = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vip-numbers`);
      if (res.ok) setVips(await res.json());
    } catch (e) {
      console.error("error reading VIP items", e);
    }
  };

  const fetchEWallets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallets`);
      if (res.ok) setWallets(await res.json());
    } catch (e) {
      console.error("error reading ewallets", e);
    }
  };

  // Validate active JSON token
  const validateMe = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        setCurrentUser(await res.json());
      } else {
        // Token expired/invalid
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  };

  useEffect(() => {
    fetchSiteSettings();
    fetchTranslations();
    fetchProducts();
    fetchVips();
    fetchEWallets();

    if (token) {
      validateMe(token);
    }
  }, [token]);

  // Handler: Language changes
  const handleLanguageChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("alnajm_lang", newLang);
  };

  // Safe translation key selector falling back gracefully
  const translate = (key: string): string => {
    const selectedPack = translationsList.find(p => p.code === lang) || translationsList.find(p => p.code === "ar");
    if (selectedPack?.translations?.[key]) {
      return selectedPack.translations[key];
    }

    // Default hardcoded translation library fallback
    const fallback: Record<string, Record<string, string>> = {
      ar: {
        "nav.home": "الرئيسية",
        "nav.phones": "الهواتف الذكية",
        "nav.smartphones": "الهواتف الذكية",
        "nav.accessories": "الإكسسوارات والملاحق",
        "nav.maintenance": "طلب صيانة مالكة",
        "nav.programming": "قسم البرمجة",
        "nav.vipNumbers": "أرقام VIP مميزة",
        "nav.contact": "اتصل بنا",
        "nav.dashboard": "لوحة الإدارة",
        "nav.login": "الدخول الملكي",
        "hero.badge": "متجر النجم موبايل - وكيل معتمد بصنعاء",
        "hero.title": "فخامة الهواتف الذكية والخدمات البرمجية المتكاملة",
        "hero.desc": "الوجهة الأولى والأحدث في اليمن لبيع الهواتف الأنيقة، الملحقات الفاخرة، صيانة وتجاوز حسابات الهواتف، وامتلاك أرقى الأرقام المميزة لشبكة يمن موبايل وكافة الاتصالات.",
        "hero.ctaProducts": "تصفح معروض الهواتف",
        "hero.ctaVip": "اقتنِ رقمك المميز",
        "cart.title": "سلة حجز المشتريات",
        "cart.empty": "سلتك فارغة حالياً. أضف عناصر معروضة لحجزها.",
        "cart.total": "الإجمالي المستحق",
        "cart.reserveButton": "متابعة تأكيد الحجز",
        "cart.itemCount": "قطعة مستقلة",
        "status.approved": "مقبول ومؤكد",
        "status.declined": "مرفوض / رمز صوري غير صحيح",
        "status.pending": "معلق قيد المراجعة",
        "login.title": "تسجيل الدخول",
        "login.registerTitle": "فتح حساب ملكي جديد",
        "login.username": "اسم المستخدم",
        "login.password": "كلمة المرور",
        "login.email": "البريد الإلكتروني",
        "login.fullName": "الاسم الكامل",
        "login.phone": "رقم الهاتف والواتساب للتواصل",
        "login.registerLink": "ليس لديك حساب؟ افتح حسابك الفخم هنا",
        "reservation.title": "تأكيد واستكمال الحجز فوري",
        "reservation.transferInstruction": "يرجى تحويل مبلغ الفاتورة إلى وكيلنا عبر رقم الصرافة: {transferNumber} باسم النجم موبايل",
        "reservation.transferNumberLabel": "أدخل رقم إشعار الحوالة الصادر من الصرافة",
        "reservation.transferPlaceholder": "اكتب الكود المالي للسند هنا...",
        "reservation.walletInstruction": "يرجى الإيداع المباشر في حساب المحفظة المختارة على الرقم: {depositNumber} وإرفاق السند.",
        "reservation.walletLabel": "اختر المحفظة الإلكترونية لإرسال الدفعة",
        "reservation.uploadReceipt": "اضغط لرفع سند الإيداع",
        "reservation.captureCamera": "التقاط صورة السند بالكاميرا",
        "reservation.submitButton": "إرسال وتأكيد الطلب للإدارة فوراً",
        "search.placeholder": "ابحث عن منتج..."
      },
      en: {
        "nav.home": "Home",
        "nav.phones": "Smartphones",
        "nav.smartphones": "Smartphones",
        "nav.accessories": "Accessories",
        "nav.maintenance": "Repairs",
        "nav.programming": "OS & Programming",
        "nav.vipNumbers": "VIP SIM Cards",
        "nav.contact": "Contact Us",
        "nav.dashboard": "Admin Panel",
        "nav.login": "Authorized Sign In",
        "hero.badge": "Al-Najm Mobile - Authorized Dealer Sana'a",
        "hero.title": "Ultimate Smartphones & Premium Software Services",
        "hero.desc": "Yemen's premier showroom for elite mobile hardware, high-end accessories, bypass utilities, and prestigious cellular phone numbers.",
        "hero.ctaProducts": "View Products Catalog",
        "hero.ctaVip": "Secure VIP Line",
        "cart.title": "Reservation Shopping Cart",
        "cart.empty": "Your cart is currently empty. Shop items to book.",
        "cart.total": "Aggregate Balance Due",
        "cart.reserveButton": "Proceed with Reservation",
        "cart.itemCount": "item(s)",
        "status.approved": "Approved & Verified",
        "status.declined": "Declined",
        "status.pending": "Awaiting Review",
        "login.title": "Authorized Sign In",
        "login.registerTitle": "Register New Profile",
        "login.username": "Account Username",
        "login.password": "Password",
        "login.email": "Email Address",
        "login.fullName": "Full Profile Name",
        "login.phone": "Mobile Contact Number",
        "login.registerLink": "Create professional user account profile",
        "reservation.title": "Verify Booking Payment",
        "reservation.transferInstruction": "Please wire invoice cash amount to terminal receiver ID: {transferNumber} under Al-Najm Mobile branch.",
        "reservation.transferNumberLabel": "Specify cash wire tracking code",
        "reservation.transferPlaceholder": "Paste transaction receipt code...",
        "reservation.walletInstruction": "Deposit transfer into our selected digital wallet address: {depositNumber} and attach proof.",
        "reservation.walletLabel": "Select Digital Mobile Wallet",
        "reservation.uploadReceipt": "Drag & drop transaction receipt proof",
        "reservation.captureCamera": "Take direct photo from Camera device",
        "reservation.submitButton": "Submit Order Booking Request",
        "search.placeholder": "Search for a product..."
      }
    };

    return fallback[lang]?.[key] || fallback["ar"]?.[key] || key;
  };

  // Auth helper callbacks
  const handleLoginSuccess = (userToken: string, userProfile: any) => {
    setToken(userToken);
    setCurrentUser(userProfile);
    localStorage.setItem("alnajm_token", userToken);
    
    // Auto redirect pathing
    if (cart.length > 0) {
      setActiveTab("checkout");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("alnajm_token");
    setActiveTab("home");
  };

  // Cart manipulation helpers
  const handleAddToCart = (item: {
    type: "product" | "vip_number";
    productId?: string;
    vipNumberId?: string;
    priceOnOrder: number;
    productDetail?: Product;
    vipDetail?: VipNumber;
  }) => {
    // Check duplicates
    const exists = cart.find(c => 
      c.type === item.type && 
      (item.type === "product" ? c.productId === item.productId : c.vipNumberId === item.vipNumberId)
    );

    if (exists) {
      if (item.type === "vip_number") {
        alert(lang === "ar" ? "رقم الموبايل المميز نادر ولا يمكن حجز قطعتين متطابقتين!" : "VIP prestige lines can only be added once.");
        return;
      }
      // Increment
      setCart(cart.map(c => 
        (c.type === "product" && c.productId === item.productId) 
          ? { ...c, quantity: c.quantity + 1 } 
          : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    setCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, type: "product" | "vip_number", newQty: number) => {
    setCart(cart.map(c => {
      const match = type === "product" ? c.productId === id : c.vipNumberId === id;
      return (c.type === type && match) ? { ...c, quantity: newQty } : c;
    }));
  };

  const handleRemoveCartItem = (id: string, type: "product" | "vip_number") => {
    setCart(cart.filter(c => {
      const match = type === "product" ? c.productId === id : c.vipNumberId === id;
      return !(c.type === type && match);
    }));
  };

  // Calculate cart invoice values
  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.priceOnOrder * item.quantity), 0);
  };

  // Initiate booking checkout process
  const handleProceedCheckout = () => {
    setCartOpen(false);
    if (!token) {
      alert(lang === "ar" ? "يتعين عليك تسجيل الدخول أولاً لإجراء الحجز المالي" : "Authorized User Sign In required to submit shop bookings");
      setActiveTab("login");
    } else {
      setActiveTab("checkout");
    }
  };

  const handleAddProductToCart = (p: Product) => {
    handleAddToCart({
      type: "product",
      productId: p.id,
      priceOnOrder: p.price,
      productDetail: p
    });
  };

  const handleInstantReserveProduct = (p: Product) => {
    handleAddProductToCart(p);
    setActiveTab("checkout");
  };

  const handleAddVipToCart = (num: VipNumber) => {
    handleAddToCart({
      type: "vip_number",
      vipNumberId: num.id,
      priceOnOrder: num.price,
      vipDetail: num
    });
  };

  const handleInstantReserveVip = (num: VipNumber) => {
    handleAddVipToCart(num);
    setActiveTab("checkout");
  };

  const handleSubmitRating = async (productId: string, rating: number, comment: string) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ rating, comment, username: currentUser?.fullName || (lang === "ar" ? "عميل زائر" : "Guest User") })
      });
      if (res.ok) {
        alert(lang === "ar" ? "شكراً لمشاركتك تقييمك الفخم للمنتج!" : "Thank you for sharing your product review!");
        fetchProducts(); 
      }
    } catch {
      alert("Error submitting rating");
    }
  };

  // Final Order Submit handler
  const handleOrderSubmission = async (paymentDetails: {
    paymentMethod: "transfer" | "wallet";
    walletName?: string;
    transferNumber?: string;
    receiptImage?: string;
    fullName: string;
    phone: string;
    notes?: string;
  }) => {
    if (!token) return;
    
    try {
      const itemsPayload = cart.map(item => ({
        type: item.type,
        productId: item.productId,
        vipNumberId: item.vipNumberId,
        quantity: item.quantity,
        priceOnOrder: item.priceOnOrder
      }));

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: itemsPayload,
          paymentMethod: paymentDetails.paymentMethod,
          walletName: paymentDetails.walletName,
          transferNumber: paymentDetails.transferNumber,
          receiptImage: paymentDetails.receiptImage,
          userFullName: paymentDetails.fullName,
          userPhone: paymentDetails.phone,
          notes: paymentDetails.notes
        })
      });

      if (response.ok) {
        alert(lang === "ar" 
          ? "ألف مبروك! تم تسجيل حجزك الفخم بالخادم المركزي للنجم موبايل. يرجى التواصل برقم خدمة الإدارة لتفتيح الطلب فوراً!" 
          : "Congratulations! Your luxury reservation has been booked centrally. Support admins notified.");
        
        // Wipe local cart on success
        setCart([]);
        setActiveTab("dashboard");
      } else {
        const errorData = await response.json();
        alert(lang === "ar" ? errorData.errorAr : errorData.errorEn);
      }
    } catch (e) {
      alert("Reservation submission network failure.");
    }
  };

  return (
    <div 
      className={`min-h-screen bg-black text-[#f1f5f9] font-sans antialiased selection:bg-gold selection:text-black flex flex-col`}
      dir={lang === "ar" ? "rtl" : "ltr"}
      id="alnajm-master-viewport"
    >
      
      {/* 1. TOP STATS BAR NOTIFICATION */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#101010] to-zinc-950 border-b border-[#e5c15e]/20 text-[11px] font-bold py-2 px-4 shadow-sm relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center gap-4 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>
                {lang === "ar" 
                  ? "صنعاء - الأصبحي - بجانب سوبر ماركت كارفور - أمام سوق القات مباشرة" 
                  : "Sana'a - Al-Asbahi - Next to Carrefour - Opposite Qat Market"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="text-[#e5c158] font-black">{lang === "ar" ? "دعم فني فوري:" : "Support Line:"}</span>
            <a href="tel:777644776" className="hover:text-gold text-zinc-300">777644776</a>
            <span className="text-zinc-750">|</span>
            <a href="tel:775888975" className="hover:text-gold text-zinc-300">775888975</a>
          </div>

        </div>
      </div>

      {/* 2. THE FLOATING RESPONSIVE HEADER */}
      <Navbar 
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentLang={lang}
        setLang={handleLanguageChange}
        translate={translate}
        languages={translationsList}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartToggle={() => setCartOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSearch={(term) => setSearchTerm(term)}
      />

      {/* 3. MAIN HERO/SHOWROOM BODY CELLS */}
      <main className="flex-grow">
        
        {/* HOMEPAGE VIEW TRANSITIONS */}
        {activeTab === "home" && (
          <div className="animate-fade-in">
            {/* HERO INTRODUCTION */}
            <HeroSection 
              translate={translate} 
              lang={lang} 
              onExplore={() => {
                setActiveTab("phones");
                window.scrollTo({ top: 400, behavior: "smooth" });
              }} 
            />

            {/* QUICK CATEGORY HIGHLIGHT LINKS */}
            <div className="bg-[#070707] border-y border-zinc-900 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-12">
                  <span className="text-xs font-black text-gold uppercase tracking-widest block mb-1">
                    {lang === "ar" ? "أرقى معايير الخدمة والصيانة" : "OUR EXCLUSIVES"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-100">
                    {lang === "ar" ? "مجموعة فخمة متكاملة تلبي شغف التكنولوجيا" : "Fully Backed Telecommunication Service Portfolio"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right rtl:text-right">
                  {/* Highlight 1: Repair */}
                  <div className="dark-card p-6 rounded-2xl border border-zinc-850 hover:border-gold/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-[#e5c158]/50 flex items-center justify-center mb-4">
                        <Cpu className="w-5 h-5 text-gold" />
                      </div>
                      <h4 className="text-sm font-black text-slate-200 mb-2">
                        {lang === "ar" ? "صيانة ممتازة وفورية" : "Elite Hardware diagnostics"}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {lang === "ar" 
                          ? "فريق هندسي متخصص في حل كافة المشاكل وتغيير الشاشات وبطاريات الهواتف الأصلية بأعلى درجات المصنعية وضمانة النجم."
                          : "Certified maintenance center equipped with thermal toolings to repair screens and swap genuine premium storage modules."}
                      </p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("maintenance"); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                      className="text-xs font-bold text-gold hover:underline mt-4 cursor-pointer self-start"
                    >
                      {lang === "ar" ? "حجز صيانة الآن ←" : "Book support order now →"}
                    </button>
                  </div>

                  {/* Highlight 2: Programming */}
                  <div className="dark-card p-6 rounded-2xl border border-zinc-850 hover:border-gold/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-[#e5c158]/50 flex items-center justify-center mb-4">
                        <Award className="w-5 h-5 text-gold" />
                      </div>
                      <h4 className="text-sm font-black text-slate-200 mb-2">
                        {lang === "ar" ? "تعديل النظام وتجاوز الآيكلاود" : "MDM & Factory Bypass"}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {lang === "ar" 
                          ? "برمجة وباي باس فوري لأنظمة iOS وأندرويد وتعديل ترددات يمن موبايل 4G/5G فوري وبأسعار خيالية تناسب طموحك."
                          : "We support firmware flashing, iCloud unlocking, Google Account FRP bypass, and custom cellular bandwidth optimizations."}
                      </p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("programming"); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                      className="text-xs font-bold text-gold hover:underline mt-4 cursor-pointer self-start"
                    >
                      {lang === "ar" ? "طلب برمجة جهاز ←" : "Request OS bypass support →"}
                    </button>
                  </div>

                  {/* Highlight 3: Prestigious numbers */}
                  <div className="dark-card p-6 rounded-2xl border border-zinc-850 hover:border-gold/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-[#e5c158]/50 flex items-center justify-center mb-4">
                        <ShieldCheck className="w-5 h-5 text-gold" />
                      </div>
                      <h4 className="text-sm font-black text-slate-200 mb-2">
                        {lang === "ar" ? "شريحة الاتصال الذهبية" : "Exclusive VIP Sim Cards"}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {lang === "ar" 
                          ? "امتلك أرقى وأندر أرقام التناسق المتطابقة لتضفي هيبة وبرستيج لعلامتك التجارية أو جوالك الشخصي بأسعار رمزية."
                          : "Step up your status with highly consistent digital VIP phone numbers matching royal sequences perfectly."}
                      </p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("vip_numbers"); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                      className="text-xs font-bold text-gold hover:underline mt-4 cursor-pointer self-start"
                    >
                      {lang === "ar" ? "استعرض الأرقام الشاغرة ←" : "Explore SIM database →"}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* HOMEPAGE SPOTLIGHT GALLERY */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-black text-gold uppercase tracking-wider block">{lang === "ar" ? "المعرض المميز" : "TOP PREMIUM SELECTION"}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-100">{lang === "ar" ? "أحدث معروضات الهواتف الراقية" : "Latest Flagship Smartphones"}</h3>
                </div>
                <button
                  onClick={() => setActiveTab("phones")}
                  className="px-4 py-2 border border-zinc-800 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                >
                  {lang === "ar" ? "رؤية كافة الهواتف" : "Shop entire catalog"}
                </button>
              </div>

              {/* Grid slice for instant view */}
              <ProductsGrid 
                products={products}
                lang={lang}
                translate={translate}
                onAddToCart={handleAddProductToCart}
                onInstantReserve={handleInstantReserveProduct}
                onSubmitRating={handleSubmitRating}
                activeCategory="phones"
                onCategoryChange={(cat) => {
                  setActiveTab(cat as any);
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                searchTerm={searchTerm}
              />
            </div>

          </div>
        )}

        {/* PHONES GALLERY TABS */}
        {activeTab === "phones" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2 mb-8 border-b border-zinc-900 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-gold" />
              <span>{lang === "ar" ? "بوابة الأجهزة والهواتف الذكية الأفضل" : "Flagship Smartphones collection"}</span>
            </h2>
            <ProductsGrid 
              products={products}
              lang={lang}
              translate={translate}
              onAddToCart={handleAddProductToCart}
              onInstantReserve={handleInstantReserveProduct}
              onSubmitRating={handleSubmitRating}
              activeCategory="phones"
              onCategoryChange={(cat) => {
                setActiveTab(cat as any);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              searchTerm={searchTerm}
            />
          </div>
        )}

        {/* ACCESSORIES TABS */}
        {activeTab === "accessories" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2 mb-8 border-b border-zinc-900 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>{lang === "ar" ? "الإكسسوارات والملحقات الفاخرة" : "Premium Mobile Accessories"}</span>
            </h2>
            <ProductsGrid 
              products={products}
              lang={lang}
              translate={translate}
              onAddToCart={handleAddProductToCart}
              onInstantReserve={handleInstantReserveProduct}
              onSubmitRating={handleSubmitRating}
              activeCategory="accessories"
              onCategoryChange={(cat) => {
                setActiveTab(cat as any);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              searchTerm={searchTerm}
            />
          </div>
        )}

        {/* REPAIRS/MAINTENANCE TABS */}
        {activeTab === "maintenance" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2 mb-8 border-b border-zinc-900 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
              <span>{lang === "ar" ? "قسم صيانة العيوب والشاشات الأصلية" : "Authorized Hardware repair station"}</span>
            </h2>
            <ProductsGrid 
              products={products}
              lang={lang}
              translate={translate}
              onAddToCart={handleAddProductToCart}
              onInstantReserve={handleInstantReserveProduct}
              onSubmitRating={handleSubmitRating}
              activeCategory="maintenance"
              onCategoryChange={(cat) => {
                setActiveTab(cat as any);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              searchTerm={searchTerm}
            />
          </div>
        )}

        {/* OS & FIRMWARE PROGRAMMING BYPASS */}
        {activeTab === "programming" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2 mb-8 border-b border-zinc-900 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>{lang === "ar" ? "قسم البرمجيات وتجاوز حسابات الجوال" : "Secure Operating Systems flashing"}</span>
            </h2>
            <ProductsGrid 
              products={products}
              lang={lang}
              translate={translate}
              onAddToCart={handleAddProductToCart}
              onInstantReserve={handleInstantReserveProduct}
              onSubmitRating={handleSubmitRating}
              activeCategory="programming"
              onCategoryChange={(cat) => {
                setActiveTab(cat as any);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              searchTerm={searchTerm}
            />
          </div>
        )}

        {/* PRESTIGIOUS VIP NUMBERS LIST */}
        {activeTab === "vip_numbers" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2 mb-8 border-b border-zinc-900 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>{lang === "ar" ? "أرقى وأندر أرقام الاتصالات باليمن" : "VIP Prestigious cellular lines (Yemen Operator Series)"}</span>
            </h2>
            <VipNumbersList 
              vipNumbers={vips}
              lang={lang}
              translate={translate}
              onAddToCart={handleAddVipToCart}
              onInstantReserve={handleInstantReserveVip}
              searchTerm={searchTerm}
            />
          </div>
        )}

        {/* AUTHENTICATED CONTROL PANEL OR ADMINS CORE */}
        {activeTab === "dashboard" && (
          <Dashboard 
            currentUser={currentUser}
            translate={translate}
            lang={lang}
            apiUrl={API_URL}
            token={token}
            onRefreshProducts={fetchProducts}
            onRefreshVipNumbers={fetchVips}
          />
        )}

        {/* LOGIN SCREEN GATES */}
        {activeTab === "login" && (
          <LoginScreen 
            translate={translate}
            lang={lang}
            apiUrl={API_URL}
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setActiveTab("home")}
          />
        )}

        {/* CHECOUT RESERVATION SUMMARY & PROOF CORNER */}
        {activeTab === "checkout" && (
          <CheckoutSection 
            items={cart}
            total={getCartTotal()}
            translate={translate}
            lang={lang}
            wallets={wallets}
            onSubmitReservation={handleOrderSubmission}
            onCancel={() => setCartOpen(true)}
            transferReceiveNumber={settings?.transferReceiveNumber || "775888975"}
            receiptReceiveNumber={settings?.receiptReceiveNumber || "775888975"}
          />
        )}

        {/* AUXILIARY LEAF PAGES: CONTACT MAPS / PRIVACY / TERMS Clauses */}
        {(activeTab === "contact" || activeTab === "privacy" || activeTab === "terms") && (
          <InfoPages 
            lang={lang}
            translate={translate}
            settings={settings}
            slug={activeTab}
          />
        )}

      </main>

      {/* 4. EXQUISITE ROYAL BLACK FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 text-right rtl:text-right ltr:text-left mt-12 relative z-10" id="almajm-royal-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Store Bio */}
          <div className="space-y-4">
            <h4 className="text-base font-black text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span>{lang === "ar" ? "النجم موبايل" : "Al-Najm Mobile"}</span>
            </h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {lang === "ar"
                ? "المعرض الرائد والأول في بروتوكول بيع الأجهزة الذكية الفخمة، الإكسسوارات النادرة، والصيانة البرمجية الدقيقة تلبيةً لتطلعات عملائنا الفخمة بصنعاء."
                : "Sana'a's ultimate destination for flagship smartphones, elite services, motherboard micro-soldering, and exclusive SIM lines."}
            </p>
            <div className="text-[10px] text-zinc-550 font-mono tracking-wider">
              {lang === "ar" ? "مرخص ومضمون مبيعات • 2026" : "Official Licensed dealer • 2026"}
            </div>
          </div>

          {/* Col 2: Categories Shortcuts */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider">
              {lang === "ar" ? "أقسام المعرض" : "Showroom Categories"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => { setActiveTab("phones"); window.scrollTo({ top: 300, behavior: "smooth" }); }} className="text-zinc-500 hover:text-gold transition-colors cursor-pointer">
                  {translate("nav.smartphones")}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("accessories"); window.scrollTo({ top: 300, behavior: "smooth" }); }} className="text-zinc-500 hover:text-gold transition-colors cursor-pointer">
                  {translate("nav.accessories")}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("vip_numbers"); window.scrollTo({ top: 300, behavior: "smooth" }); }} className="text-zinc-500 hover:text-gold transition-colors cursor-pointer">
                  {translate("nav.vipNumbers")}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("maintenance"); window.scrollTo({ top: 300, behavior: "smooth" }); }} className="text-zinc-500 hover:text-gold transition-colors cursor-pointer">
                  {translate("nav.maintenance")}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Safe usage documents */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider">
              {lang === "ar" ? "مواثيق الشروط والسيادة" : "Governance Policy"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => { setActiveTab("privacy"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-zinc-500 hover:text-gold transition-colors cursor-pointer">
                  {lang === "ar" ? "سياسة الخصوصية وسرية الصور" : "Privacy & Camera Policy"}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("terms"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-zinc-500 hover:text-gold transition-colors cursor-pointer">
                  {lang === "ar" ? "الشروط والأحكام وشهادة الضمان" : "Terms of Service & Holding Guaranteed"}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-zinc-500 hover:text-gold transition-colors cursor-pointer">
                  {lang === "ar" ? "خريطة فرع كارفور الأصبحي" : "Our Carrefour Branch Street map"}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Verified seals logo */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-310 tracking-wider">
              {lang === "ar" ? "أمن المراجعة والتسوية" : "Compliance Seal"}
            </h4>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              {lang === "ar"
                ? "يتم مراجعة ومعادلة كافة سندات الإيداع المرفقة رقمياً بشكل يدوي صارم تحت رعاية مشرفي النجم موبايل قبل الموافقة لإرسال كود الإتمام."
                : "All client mobile wallet receipts and cellular wire uploads undergo strict administrative verification cycles before dispatch approvals."}
            </p>
            
            <div className="flex gap-2">
              <span className="p-2 bg-zinc-950 border border-zinc-90 text-[9px] font-bold text-emerald-400 rounded-lg shrink-0">
                SSL ACCREDITED
              </span>
              <span className="p-2 bg-zinc-950 border border-zinc-90 text-[9px] font-bold text-yellow-500 rounded-lg shrink-0">
                2FA SECURED
              </span>
            </div>
          </div>

        </div>

        {/* Deep lower copyright bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-900 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-550 gap-4 font-mono text-center sm:text-right">
          <div>
            © 2026 {lang === "ar" ? "النجم موبايل Al-Najm Mobile بصنعاء. جميع الحقوق الملكية محفوظة." : "Al-Najm Mobile Sana'a. All rights reserved."}
          </div>
          <div className="flex gap-4">
            <span>Server status: sandboxed node</span>
            <span>Uptime: 100%</span>
          </div>
        </div>
      </footer>

      {/* 5. GIGANTIC FLOATING SHOPPING CART SIDEBAR */}
      {cartOpen && (
        <CartModal 
          onClose={() => setCartOpen(false)}
          lang={lang}
          translate={translate}
          cartItems={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={handleProceedCheckout}
          total={getCartTotal()}
        />
      )}

      {/* 6. FLOATING QUICK SCROLL UP BUTTON */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 p-3 bg-gold hover:bg-yellow-400 text-black rounded-full shadow-2xl hover:scale-105 transition-all cursor-pointer border border-[#101010]"
          title="أعلى الصفحة"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

    </div>
  );
}
