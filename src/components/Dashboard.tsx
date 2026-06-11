/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, Shield, ClipboardList, Database, Languages, Network, LayoutGrid, Plus, Trash2, Edit3, Save, Check, X, ShieldAlert, Download, RefreshCw, FileText 
} from "lucide-react";
import { 
  User as UserType, Product, VipNumber, Order, SiteSettings, EWallet, TranslationSet, AuditLog 
} from "../types.js";

interface DashboardProps {
  currentUser: UserType | null;
  translate: (key: string) => string;
  lang: string;
  apiUrl: string;
  token: string | null;
  onRefreshProducts: () => void;
  onRefreshVipNumbers: () => void;
}

export default function Dashboard({
  currentUser,
  translate,
  lang,
  apiUrl,
  token,
  onRefreshProducts,
  onRefreshVipNumbers
}: DashboardProps) {
  const isRtl = lang === "ar";
  
  // Tabs based on privileges
  const [activeTab, setActiveTab] = useState<"profile" | "products" | "vip" | "orders" | "admins" | "settings" | "languages" | "logs">("profile");

  // DB States retrieved from REST APIs
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vips, setVips] = useState<VipNumber[]>([]);
  const [wallets, setWallets] = useState<EWallet[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [languages, setLanguages] = useState<TranslationSet[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [serverStats, setServerStats] = useState<any>(null);

  // Editing forms state triggers
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingVip, setEditingVip] = useState<VipNumber | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [newLangCode, setNewLangCode] = useState("");
  const [newLangName, setNewLangName] = useState("");

  const [loading, setLoading] = useState(false);

  // Fetch all related databases depending on roles
  const loadDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
      
      // Load orders
      const ordRes = await fetch(`${apiUrl}/api/orders`, { headers });
      if (ordRes.ok) setOrders(await ordRes.json());

      // If Admin or SuperAdmin, load deeper collections
      if (currentUser?.role === "admin" || currentUser?.role === "super-admin") {
        const uRes = await fetch(`${apiUrl}/api/users`, { headers });
        if (uRes.ok) setUsers(await uRes.json());

        const pRes = await fetch(`${apiUrl}/api/products`);
        if (pRes.ok) setProducts(await pRes.json());

        const vRes = await fetch(`${apiUrl}/api/vip-numbers`);
        if (vRes.ok) setVips(await vRes.json());
      }

      // If SuperAdmin, load system configurations
      if (currentUser?.role === "super-admin") {
        const wRes = await fetch(`${apiUrl}/api/wallets`);
        if (wRes.ok) setWallets(await wRes.json());

        const sRes = await fetch(`${apiUrl}/api/settings`);
        if (sRes.ok) setSettings(await sRes.json());

        const lRes = await fetch(`${apiUrl}/api/languages`);
        if (lRes.ok) setLanguages(await lRes.json());

        const logRes = await fetch(`${apiUrl}/api/logs`, { headers });
        if (logRes.ok) setAuditLogs(await logRes.json());

        const statRes = await fetch(`${apiUrl}/api/system/files`, { headers });
        if (statRes.ok) setServerStats(await statRes.json());
      }

    } catch (e) {
      console.error("Dashboard api errors", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser, token]);

  // Order status approvals mutators
  const handleOrderStatus = async (orderId: string, status: "approved" | "declined" | "pending") => {
    try {
      const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
      const res = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(isRtl ? "تم تعديل حالة الحجز ومزامنة المخزون!" : "Booking status locked successfully!");
        loadDashboardData();
        onRefreshProducts();
        onRefreshVipNumbers();
      }
    } catch (err) {
      alert("Error mutating order status");
    }
  };

  // PRODUCTS ACTIONS (Add/Edit/Delete)
  const [productForm, setProductForm] = useState<Partial<Product>>({
    nameAr: "", nameEn: "", category: "phones", price: 0, descriptionAr: "", descriptionEn: "", specsAr: "", specsEn: "", quantity: 5, images: []
  });

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
      const isEdit = !!editingProduct;
      const url = isEdit ? `${apiUrl}/api/products/${editingProduct?.id}` : `${apiUrl}/api/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(productForm)
      });

      if (res.ok) {
        alert(isRtl ? "تم حفظ المنتج بنجاح وتحديث معروضات النجم!" : "Product saved successfully into showroom!");
        setEditingProduct(null);
        setProductForm({ nameAr: "", nameEn: "", category: "phones", price: 0, descriptionAr: "", descriptionEn: "", specsAr: "", specsEn: "", quantity: 5, images: [] });
        loadDashboardData();
        onRefreshProducts();
      } else {
        const errorData = await res.json();
        alert(isRtl ? errorData.errorAr : errorData.errorEn);
      }
    } catch (err) {
      alert("Product save error");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من حذف هذا المنتج بالكامل من متجر النجم؟" : "Confirm permanent product delete from showroom?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        loadDashboardData();
        onRefreshProducts();
      }
    } catch (err) {
      alert("Delete call failed");
    }
  };

  const triggerEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm(p);
  };

  // VIP NUMBERS ACTIONS (Add/Edit/Delete)
  const [vipForm, setVipForm] = useState<Partial<VipNumber>>({
    number: "", price: 100, provider: "Yemen Mobile", status: "available", category: "gold"
  });

  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
      const isEdit = !!editingVip;
      const url = isEdit ? `${apiUrl}/api/vip-numbers/${editingVip?.id}` : `${apiUrl}/api/vip-numbers`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(vipForm)
      });

      if (res.ok) {
        alert(isRtl ? "تم ترحيل وحفظ الرقم المميز!" : "VIP list synced successfully!");
        setEditingVip(null);
        setVipForm({ number: "", price: 100, provider: "Yemen Mobile", status: "available", category: "gold" });
        loadDashboardData();
        onRefreshVipNumbers();
      } else {
        const errVal = await res.json();
        alert(isRtl ? errVal.errorAr : errVal.errorEn);
      }
    } catch (err) {
      alert("VIP submit error");
    }
  };

  const deleteVip = async (id: string) => {
    if (!confirm(isRtl ? "حذف الرقم الفخم نهائياً؟" : "Confirm deleting premium line?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/vip-numbers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        loadDashboardData();
        onRefreshVipNumbers();
      }
    } catch (err) {
      alert("VIP delete issue");
    }
  };

  const triggerEditVip = (v: VipNumber) => {
    setEditingVip(v);
    setVipForm(v);
  };

  // ADMIN ACCOUNTS MANAGEMENT (Super Admin ONLY)
  const [userForm, setUserForm] = useState({
    username: "", email: "", password: "", role: "admin", fullName: "", phone: ""
  });

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
      const isEdit = !!editingUser;
      const url = isEdit ? `${apiUrl}/api/users/${editingUser?.id}` : `${apiUrl}/api/users`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(userForm)
      });

      if (res.ok) {
        alert(isRtl ? "تم حفظ بيانات الحساب والصلاحيات!" : "Account saved into registry!");
        setEditingUser(null);
        setUserForm({ username: "", email: "", password: "", role: "admin", fullName: "", phone: "" });
        loadDashboardData();
      } else {
        const errorMsg = await res.json();
        alert(isRtl ? errorMsg.errorAr : errorMsg.errorEn);
      }
    } catch (err) {
      alert("User save call error");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من إلغاء حساب هذا المشرف؟" : "Terminate account for this admin?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        loadDashboardData();
      } else {
        const payload = await res.json();
        alert(isRtl ? payload.errorAr : payload.errorEn);
      }
    } catch (err) {
      alert("Delete user failed");
    }
  };

  // SITE SETTINGS MANAGEMENT (Super Admin ONLY)
  const handleSettingsUpdate = async (updated: SiteSettings) => {
    try {
      const res = await fetch(`${apiUrl}/api/settings`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        alert(isRtl ? "تم تحديث إعدادات وهوية المتجر الأصبحي بنجاح!" : "Store configuration updated successfully!");
        loadDashboardData();
      }
    } catch (err) {
      alert("Settings save failed");
    }
  };

  // MULTILINGUAL DICTIONARY AND CUSTOM TRANSLATION PACKS (Super Admin ONLY)
  const addNewLanguagePack = () => {
    if (!newLangCode || !newLangName) return;
    const exists = languages.some(l => l.code === newLangCode);
    if (exists) {
      alert(isRtl ? "رمز اللغة مكرر مسجل بالفعل!" : "Language code is already assigned!");
      return;
    }
    
    // Copy arab translations as base template
    const baseAr = languages.find(l => l.code === "ar")?.translations || {};
    const newPack: TranslationSet = {
      code: newLangCode,
      name: newLangName,
      direction: newLangCode === "ar" || newLangCode === "fa" || newLangCode === "ur" ? "rtl" : "ltr",
      translations: { ...baseAr }
    };

    const updated = [...languages, newPack];
    setLanguages(updated);
    saveLanguagesOnServer(updated);
    setNewLangCode("");
    setNewLangName("");
  };

  const removeLanguagePack = (code: string) => {
    if (code === "ar" || code === "en") {
      alert(isRtl ? "لا يمكن حذف اللغات الأساسية للمتجر (العربية والإنجليزي)" : "Default sets can't be deleted.");
      return;
    }
    const updated = languages.filter(l => l.code !== code);
    setLanguages(updated);
    saveLanguagesOnServer(updated);
  };

  const handleTranslationEdit = (langIndex: number, key: string, val: string) => {
    const copy = [...languages];
    copy[langIndex].translations[key] = val;
    setLanguages(copy);
  };

  const saveLanguagesOnServer = async (payload: TranslationSet[]) => {
    try {
      const res = await fetch(`${apiUrl}/api/languages`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(isRtl ? "تم حفظ مصفوفة مفاتيح المفردات وقاعدة اللغات بنجاح!" : "Translation package array saved successfully!");
        loadDashboardData();
      }
    } catch (err) {
      alert("Failed saving language pack");
    }
  };

  // MOCK automatic backup download trigger (JSON)
  const downloadDatabaseBackup = () => {
    if (!token) return;
    window.open(`${apiUrl}/api/system/backup?token=${token}`, "_blank");
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2">{isRtl ? "تسجيل الدخول مطلوب" : "Authentication Required"}</h3>
        <p className="text-zinc-500 text-xs">{isRtl ? "يرجى تسجيل الدخول للوصول إلى لوحة حجز الطلبات." : "Sign in to open the order invoice control board."}</p>
      </div>
    );
  }

  // Is Admin or Super Admin check
  const isAdmin = currentUser.role === "admin" || currentUser.role === "super-admin";
  const isSuper = currentUser.role === "super-admin";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right rtl:text-right ltr:text-left" id="dashboard-main-frame">
      
      {/* Upper greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/60 p-6 rounded-3xl border border-zinc-850 mb-8 shadow-inner">
        <div>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
            {currentUser.role === "super-admin" ? "محطة مدير النظام الفائق" : currentUser.role === "admin" ? "لوحة الإدارة والمبيعات" : "بوابة العميل الرقمية"}
          </span>
          <h2 className="text-2xl font-black text-slate-100 mt-1">
            {isRtl ? `أهلاً بك، ${currentUser.fullName}` : `Welcome back, ${currentUser.fullName}`}
          </h2>
          <span className="text-[10px] text-zinc-550 font-mono block mt-1 tracking-wider leading-none">
            IP: Sandbox Node Container • Role: {currentUser.role.toUpperCase()}
          </span>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={loadDashboardData}
            disabled={loading}
            className="p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-500 font-bold border border-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{isRtl ? "مزامنة البيانات فوري" : "Sync Database Live"}</span>
          </button>
          
          {isSuper && (
            <button 
              onClick={downloadDatabaseBackup}
              className="p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black font-bold border border-amber-500/35 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isRtl ? "نسخ احتياطي فوري" : "Download Backup"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Nav menus */}
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-900 pb-3 mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeTab === "profile" ? "bg-gold text-black" : "text-zinc-400 hover:bg-zinc-900"}`}
        >
          {isRtl ? "سجل طلباتي الشخصية" : "My Order History"}
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeTab === "products" ? "bg-gold text-black" : "text-zinc-400 hover:bg-zinc-900"}`}
            >
              {isRtl ? "إدارة الهواتف والإكسسوارات" : "Manage Products"}
            </button>
            <button
              onClick={() => setActiveTab("vip")}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeTab === "vip" ? "bg-gold text-black" : "text-zinc-400 hover:bg-zinc-900"}`}
            >
              {isRtl ? "إدارة الأرقام المميزة" : "Manage VIP SIMs"}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeTab === "orders" ? "bg-gold text-black" : "text-zinc-400 hover:bg-zinc-900"}`}
            >
              {isRtl ? "إدارة الطلبات والحجوزات" : "Manage Bookings"}
            </button>
          </>
        )}

        {isSuper && (
          <>
            <button
              onClick={() => setActiveTab("admins")}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeTab === "admins" ? "bg-gold text-black" : "text-zinc-400 hover:bg-zinc-900"}`}
            >
              {isRtl ? "إدارة المشرفين والصلاحيات" : "Admins Permissions"}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeTab === "settings" ? "bg-gold text-black" : "text-zinc-400 hover:bg-zinc-900"}`}
            >
              {isRtl ? "إعدادات الهوية والمحافظ" : "Store & Wallets"}
            </button>
            <button
              onClick={() => setActiveTab("languages")}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeTab === "languages" ? "bg-gold text-black" : "text-zinc-400 hover:bg-zinc-900"}`}
            >
              {isRtl ? "إدارة اللغات والمفردات" : "Languages Core"}
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer ${activeTab === "logs" ? "bg-gold text-black" : "text-zinc-400 hover:bg-zinc-900"}`}
            >
              {isRtl ? "سجل العمليات الأمني" : "Security Audit Logs"}
            </button>
          </>
        )}
      </div>

      {/* RENDER ACTIVE TABS CELLS */}

      {/* Tab: Customer profile order history */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl dark-card-royal">
            <h3 className="text-base font-black text-amber-500 mb-4">{isRtl ? "حالة طلباتك النشطة وحجوزاتك" : "Current Reservation Status"}</h3>
            
            {orders.length === 0 ? (
              <div className="text-center py-10">
                <ClipboardList className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-550 text-xs italic">{isRtl ? "لا توجد أي حجوزات سابقة لك حالياً." : "No previous orders logged under your client credential."}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#121212] font-bold text-zinc-450 border-b border-zinc-850">
                    <tr>
                      <th className="p-3 font-bold">{isRtl ? "رقم الفاتورة" : "Invoice ID"}</th>
                      <th className="p-3 font-bold">{isRtl ? "التاريخ" : "Booking Date"}</th>
                      <th className="p-3 font-bold">{isRtl ? "طريقة الدفع" : "Deposit Method"}</th>
                      <th className="p-3 font-bold">{isRtl ? "العناصر والمميزات" : "Items Ordered"}</th>
                      <th className="p-3 font-bold">{isRtl ? "الإجمالي" : "Total Cash"}</th>
                      <th className="p-3 font-bold">{isRtl ? "حالة الطلب" : "Verification Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-950/40">
                        <td className="p-3 font-mono font-bold text-amber-500">{o.id}</td>
                        <td className="p-3 text-zinc-400">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="p-3 font-bold text-zinc-300">
                          {o.paymentMethod === "transfer" ? (isRtl ? "حوالة مالية" : "Cash Wire") : (isRtl ? "محفظة رقمية" : "Mobile Wallet")}
                        </td>
                        <td className="p-3 text-zinc-400">
                          {o.items.map((it, i) => (
                            <div key={i}>
                              • {it.type === "product" ? (isRtl ? it.productDetail?.nameAr : it.productDetail?.nameEn) : `رقم مميز ${it.vipDetail?.number}`}
                            </div>
                          ))}
                        </td>
                        <td className="p-3 font-mono font-bold text-rose-400">${o.total}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            o.status === "approved" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : o.status === "declined"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}>
                            {o.status === "approved" ? translate("status.approved") : o.status === "declined" ? translate("status.declined") : translate("status.pending")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Products grid administration */}
      {activeTab === "products" && isAdmin && (
        <div className="space-y-6">
          
          {/* Create or Edit product form sheet */}
          <div className="p-5 rounded-2xl dark-card bg-zinc-950/80 border border-zinc-800">
            <h3 className="text-sm font-black text-amber-500 mb-4">
              {editingProduct ? (isRtl ? "تعديل تفاصيل جهاز معروض" : "Edit Showroom Product Details") : (isRtl ? "إضافة منتج أو جهاز أو خدمة جديدة" : "Add New Item into Showroom")}
            </h3>
            
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "الاسم العربي" : "Name Arabic"}</label>
                  <input
                    type="text"
                    value={productForm.nameAr}
                    onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "الاسم الإنجليزي" : "Name English"}</label>
                  <input
                    type="text"
                    value={productForm.nameEn}
                    onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "التصنيف" : "Category"}</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg cursor-pointer"
                  >
                    <option value="phones">{isRtl ? "هواتف ذكية" : "Smartphones"}</option>
                    <option value="accessories">{isRtl ? "إكسسوارات" : "Accessories"}</option>
                    <option value="maintenance">{isRtl ? "صيانة أجهزة" : "Hardware Repair"}</option>
                    <option value="programming">{isRtl ? "برمجة وباي باس" : "Programming/OS"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "السعر بالدولار" : "Price (USD)"}</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "الكمية المتاحة بالمخزن" : "Inventory Quantity"}</label>
                  <input
                    type="number"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "عنوان رابط الصورة (Image URL)" : "Image Reference URL"}</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.images?.[0] || ""}
                    onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "الوصف العربي" : "Description Arabic"}</label>
                  <textarea
                    value={productForm.descriptionAr}
                    onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "الوصف الإنجليزي" : "Description English"}</label>
                  <textarea
                    value={productForm.descriptionEn}
                    onChange={(e) => setProductForm({ ...productForm, descriptionEn: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "المواصفات الفنية بالعربي (سطر منفصل لكل ميزة)" : "Specs Arabic (newline separated)"}</label>
                  <textarea
                    value={productForm.specsAr}
                    onChange={(e) => setProductForm({ ...productForm, specsAr: e.target.value })}
                    rows={3}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg font-mono text-right"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "المواصفات الفنية بالإنجليزي (سطر منفصل)" : "Specs English (newline separated)"}</label>
                  <textarea
                    value={productForm.specsEn}
                    onChange={(e) => setProductForm({ ...productForm, specsEn: e.target.value })}
                    rows={3}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg font-mono text-left"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gold hover:bg-yellow-400 text-black text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isRtl ? "تأكيد الترشيح والحفظ" : "Commit Changes"}</span>
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ nameAr: "", nameEn: "", category: "phones", price: 0, descriptionAr: "", descriptionEn: "", specsAr: "", specsEn: "", quantity: 5, images: [] });
                    }}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-xs rounded-lg cursor-pointer"
                  >
                    {isRtl ? "إلغاء التعديل" : "Cancel"}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of current products managed */}
          <div className="p-5 rounded-2xl dark-card-royal border border-zinc-800">
            <h4 className="text-sm font-bold text-slate-200 mb-4">{isRtl ? "المنتجات والأقسام الحالية بالمرآب" : "Current Active Showroom Products"}</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#121212] font-semibold text-zinc-400">
                  <tr>
                    <th className="p-3">{isRtl ? "الصورة" : "Image"}</th>
                    <th className="p-3">{isRtl ? "اسم الصنف" : "Product Title"}</th>
                    <th className="p-3">{isRtl ? "القسم" : "Category"}</th>
                    <th className="p-3">{isRtl ? "السعر بالدولار" : "Price"}</th>
                    <th className="p-3">{isRtl ? "المخزون" : "Stock Volume"}</th>
                    <th className="p-3">{isRtl ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-950/40">
                      <td className="p-3">
                        <div className="w-8 h-8 rounded bg-black border border-zinc-800 overflow-hidden">
                          <img src={p.images?.[0]} className="w-full h-full object-contain" referrerPolicy="no-referrer" alt="" />
                        </div>
                      </td>
                      <td className="p-3 font-extrabold text-slate-100">{isRtl ? p.nameAr : p.nameEn}</td>
                      <td className="p-3 text-gold uppercase tracking-wider">{p.category}</td>
                      <td className="p-3 font-mono font-bold text-rose-500">${p.price}</td>
                      <td className="p-3 font-semibold text-zinc-350">{p.quantity} {isRtl ? "قطع" : "units"}</td>
                      <td className="p-3">
                        <div className="flex gap-1.5 justify-start">
                          <button
                            onClick={() => triggerEditProduct(p)}
                            className="p-1.5 bg-zinc-900 text-amber-500 hover:bg-amber-500 hover:text-black rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 bg-zinc-900 text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab: VIP SIM SIM Numbers Management */}
      {activeTab === "vip" && isAdmin && (
        <div className="space-y-6">
          
          <div className="p-5 rounded-2xl dark-card bg-zinc-950/80 border border-zinc-800">
            <h3 className="text-sm font-black text-amber-500 mb-4 font-sans">
              {editingVip ? (isRtl ? "تعديل إعدادات الرقم المميز" : "Edit VIP Number") : (isRtl ? "تسجيل رقم مميز بلاتيني/ذهبي جديد" : "Catalog New Premium Cellular SIM")}
            </h3>

            <form onSubmit={handleVipSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                <div>
                  <label className="text-zinc-500 block mb-0.5 font-bold">{isRtl ? "الرقم المميز للهاتف" : "Cellular Line ID"}</label>
                  <input
                    type="text"
                    value={vipForm.number}
                    onChange={(e) => setVipForm({ ...vipForm, number: e.target.value })}
                    required
                    placeholder="77******"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg tracking-widest font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-0.5 font-bold">{isRtl ? "السعر بالدولار" : "Price (USD)"}</label>
                  <input
                    type="number"
                    value={vipForm.price}
                    onChange={(e) => setVipForm({ ...vipForm, price: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-0.5 font-bold">{isRtl ? "شركة الاتصالات المدعومة" : "Carrier Operator"}</label>
                  <select
                    value={vipForm.provider}
                    onChange={(e) => setVipForm({ ...vipForm, provider: e.target.value as any })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg cursor-pointer"
                  >
                    <option value="Yemen Mobile">Yemen Mobile</option>
                    <option value="Sabafon">Sabafon</option>
                    <option value="YOU">YOU</option>
                    <option value="Y">Y Telecom</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 block mb-0.5 font-bold">{isRtl ? "تصنيف التناسق والبرستيج" : "Design Class Room"}</label>
                  <select
                    value={vipForm.category}
                    onChange={(e) => setVipForm({ ...vipForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg cursor-pointer"
                  >
                    <option value="platinum">Platinum Royal (بلاتيني)</option>
                    <option value="gold">Luxury Gold (ذهبي فخم)</option>
                    <option value="silver">Elegant Silver (فضي أنيق)</option>
                    <option value="normal">Normal Premium (مميز عادي)</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 block mb-0.5 font-bold">{isRtl ? "الحالة الحالية للشبكة" : "Availability"}</label>
                  <select
                    value={vipForm.status}
                    onChange={(e) => setVipForm({ ...vipForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg cursor-pointer"
                  >
                    <option value="available">{isRtl ? "نشط ومتاح فوري" : "Available"}</option>
                    <option value="sold">{isRtl ? "محجوز / مباع" : "Sold"}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gold hover:bg-yellow-400 text-black text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isRtl ? "تأهب وحفظ الرقم للبيع" : "Publish Line"}</span>
                </button>
                {editingVip && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVip(null);
                      setVipForm({ number: "", price: 100, provider: "Yemen Mobile", status: "available", category: "gold" });
                    }}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-xs rounded-lg cursor-pointer"
                  >
                    {isRtl ? "إلغاء" : "Cancel"}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table list of VIP lines */}
          <div className="p-5 rounded-2xl dark-card-royal border border-zinc-800">
            <h4 className="text-sm font-bold text-slate-200 mb-4">{isRtl ? "الأرقام المسجلة في النجم موبايل حالياً" : "Catalog of Premium Active SIM Cards"}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#121212] font-semibold text-zinc-400">
                  <tr>
                    <th className="p-3">{isRtl ? "الرقم المميز" : "VIP Number"}</th>
                    <th className="p-3">{isRtl ? "مشغل الاتصالات" : "Carrier"}</th>
                    <th className="p-3">{isRtl ? "التصنيف" : "Class Category"}</th>
                    <th className="p-3">{isRtl ? "السعر بالدولار" : "Price"}</th>
                    <th className="p-3">{isRtl ? "الحالة" : "Invoice Status"}</th>
                    <th className="p-3">{isRtl ? "خيارات التعديل" : "Options"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {vips.map((v) => (
                    <tr key={v.id} className="hover:bg-zinc-950/40">
                      <td className="p-3 font-mono font-black text-slate-100 tracking-wider text-sm">{v.number}</td>
                      <td className="p-3 text-zinc-300 font-bold uppercase">{v.provider}</td>
                      <td className="p-3 font-semibold capitalize text-gold">{v.category}</td>
                      <td className="p-3 font-mono font-bold text-rose-500">${v.price}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.status === "available" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {v.status === "available" ? (isRtl ? "نشط ومتاح" : "Available") : (isRtl ? "مباع / محجوز" : "Sold")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1.5 justify-start">
                          <button
                            onClick={() => triggerEditVip(v)}
                            className="p-1.5 bg-zinc-900 text-amber-500 hover:bg-amber-500 hover:text-black rounded cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteVip(v.id)}
                            className="p-1.5 bg-zinc-900 text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab: Handle Orders & Bookings list approvals */}
      {activeTab === "orders" && isAdmin && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl dark-card-royal border border-zinc-800">
            <h3 className="text-base font-black text-amber-500 mb-4 font-sans">
              {isRtl ? "مراجعة كشوفات حجوزات العملاء والتحقق من رقم الحوالة/سندات الإيداع" : "Verify Live Bookings & Verification Uploads"}
            </h3>

            {orders.length === 0 ? (
              <p className="text-zinc-500 text-xs italic text-center py-8">{isRtl ? "لا توجد أي طلبات حجز نشطة معلقة بالمراجعة." : "No orders awaiting verification."}</p>
            ) : (
              <div className="space-y-6">
                {orders.map((o) => (
                  <div key={o.id} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-4">
                    
                    {/* Invoice ID / Customer specs header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-3 gap-2">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-bold block">{isRtl ? "رقم الفاتورة لحجزك" : "INVOICE REFERENCE ID"}</span>
                        <h4 className="text-sm font-black text-rose-500 font-mono">{o.id}</h4>
                        <span className="text-[10px] text-zinc-400 font-bold block mt-1">
                          {isRtl ? `المرسل: ${o.userFullName} (${o.userPhone})` : `Sender: ${o.userFullName} (${o.userPhone})`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status dropdown/approval */}
                        <span className="text-xs text-zinc-500 font-bold">{isRtl ? "القرار الإداري الحالي:" : "Decision:"}</span>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                          o.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : o.status === "declined" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-550"
                        }`}>
                          {o.status}
                        </span>

                        <div className="flex gap-1">
                          <button
                            onClick={() => handleOrderStatus(o.id, "approved")}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            title="موافقة وتدعيم الحجز"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOrderStatus(o.id, "declined")}
                            className="p-1 rounded bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                            title="رفض الطلب"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details products list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-[#0d0d0d] rounded-xl border border-zinc-900 space-y-1.5 text-right">
                        <span className="text-[10px] text-zinc-550 block font-bold uppercase">{isRtl ? "العناصر وأحجام الكتالوج" : "Catalog Items"}</span>
                        {o.items.map((it, i) => (
                          <div key={i} className="text-zinc-300 font-bold">
                            - {it.type === "product" ? (isRtl ? it.productDetail?.nameAr : it.productDetail?.nameEn) : `رقم مميز ${it.vipDetail?.number}`} 
                            <span className="text-emerald-400 font-mono ml-2">(${it.priceOnOrder} x{it.quantity})</span>
                          </div>
                        ))}
                        
                        <div className="pt-2 border-t border-zinc-900 flex justify-between font-bold text-slate-200">
                          <span>{isRtl ? "المجموع الكلي للفاتورة:" : "Grand Total:"}</span>
                          <span className="font-mono text-rose-500 text-sm">${o.total}</span>
                        </div>
                        {o.notes && (
                          <div className="text-[11px] text-indigo-300 mt-2 italic bg-[#151515] p-2 rounded border border-indigo-500/10 leading-relaxed">
                            {isRtl ? "ملاحظات العميل:" : "Client directive:"} {o.notes}
                          </div>
                        )}
                      </div>

                      {/* Payment Verification Section (Reference number or Base64 Screenshot Receipt) */}
                      <div className="p-3 bg-[#0d0d0d] rounded-xl border border-zinc-900 text-right">
                        <span className="text-[10px] text-zinc-550 block font-bold uppercase">{isRtl ? "معلومات المعاملة الرقمية" : "Transaction Audit Proof"}</span>
                        
                        <div className="space-y-2 mt-1">
                          <div className="text-xs text-zinc-300">
                            {isRtl ? "طريقة الدفع المختارة:" : "Selected channel:"}{" "}
                            <span className="text-gold font-bold">
                              {o.paymentMethod === "transfer" ? (isRtl ? "حوالة مالية محلياً" : "Cash Wire") : `${isRtl ? "محفظة رقمية" : "E-Wallet"} (${o.walletName})`}
                            </span>
                          </div>

                          {o.paymentMethod === "transfer" ? (
                            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-slate-100">
                              <span className="text-zinc-500 block text-[9px] font-bold">{isRtl ? "رقم الحوالة المستلم لقيد المراجعة" : "REF REFERENCE NUMBER"}</span>
                              <span className="text-base font-extrabold text-amber-500 block tracking-widest mt-1">{o.transferNumber}</span>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <span className="text-zinc-550 block text-[10px] font-bold">{isRtl ? "سند الإيداع المرفق بالكاميرا/الملف:" : "Camera Snapshot attachment:"}</span>
                              {o.receiptImage ? (
                                <div className="max-w-[200px] rounded-lg border border-zinc-800 bg-black overflow-hidden relative group">
                                  <img 
                                    src={o.receiptImage} 
                                    alt="سند معاقد" 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-24 object-cover" 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // preview expanded in dialog
                                      const w = window.open();
                                      if (w) w.document.write(`<img src="${o.receiptImage}" style="max-height:100vh;margin:auto" />`);
                                    }}
                                    className="absolute inset-0 bg-black/60 font-black text-gold text-[10px] items-center justify-center hidden group-hover:flex"
                                  >
                                    {isRtl ? "تكبير الصورة" : "Zoom Original"}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-red-400 font-bold block">{isRtl ? "سند مفقود / غير متوفر!" : "No image submitted"}</span>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Manage System Administrators (Super Admin ONLY) */}
      {activeTab === "admins" && isSuper && (
        <div className="space-y-6">
          
          <div className="p-5 rounded-2xl dark-card bg-zinc-950/80 border border-zinc-850">
            <h3 className="text-sm font-black text-amber-500 mb-4 font-sans">
              {editingUser ? (isRtl ? "تعديل صلاحيات حساب مشرف" : "Edit Admin Permissions") : (isRtl ? "تسجيل مشرف نظام أو فني صيانة جديد" : "Deploy New System Admin Account")}
            </h3>

            <form onSubmit={handleUserSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-zinc-550 block mb-1 font-bold">{isRtl ? "اسم الدخول للموقع" : "Username"}</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    required
                    disabled={!!editingUser}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-550 block mb-1 font-bold">{isRtl ? "البريد الإلكتروني" : "Email Address"}</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                    disabled={!!editingUser}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-550 block mb-1 font-bold">{isRtl ? "كلمة المرور المشفرة" : "Password key"}</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder={editingUser ? (isRtl ? "اتركه فارغاً للاحتفاظ بالقديم" : "leave empty for same") : "123456"}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold">
                <div>
                  <label className="text-zinc-550 block mb-1">{isRtl ? "الاسم الكامل للموظف" : "Full Employee Name"}</label>
                  <input
                    type="text"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-550 block mb-1">{isRtl ? "رقم الهاتف للتواصل" : "Mobile Phone"}</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-slate-100 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-550 block mb-1">{isRtl ? "مستوى الصلاحية في الإدارة" : "Assigned Authorization Role"}</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg cursor-pointer"
                  >
                    <option value="user">Normal Client (عميل محلي)</option>
                    <option value="admin">Store Admin (مشرف مبيعات)</option>
                    <option value="super-admin">Super Admin (مدير النظام فائق)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gold hover:bg-yellow-400 text-black text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  <span>{isRtl ? "نشر وتأصيل كود الحساب" : "Confirm User Profile"}</span>
                </button>
                {editingUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({ username: "", email: "", password: "", role: "admin", fullName: "", phone: [] as any });
                    }}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-xs rounded-lg cursor-pointer"
                  >
                    {isRtl ? "إلغاء التحديث" : "Cancel"}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table representing all deployed users */}
          <div className="p-5 rounded-2xl dark-card-royal border border-zinc-800">
            <h4 className="text-sm font-bold text-slate-200 mb-4">{isRtl ? "كل الحسابات المسجلة كأدمنز ومستخدمين" : "Active Registered User Log Matrix"}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#121212] font-semibold text-zinc-400">
                  <tr>
                    <th className="p-3">{isRtl ? "الاسم" : "Full Name"}</th>
                    <th className="p-3">{isRtl ? "اسم المستخدم" : "Username"}</th>
                    <th className="p-3">{isRtl ? "الصلاحية" : "Role Level"}</th>
                    <th className="p-3">{isRtl ? "رقم الهاتف" : "Telephone"}</th>
                    <th className="p-3">{isRtl ? "البريد الإلكتروني" : "Email"}</th>
                    <th className="p-3">{isRtl ? "خيارات التعديل" : "Options"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-950/40">
                      <td className="p-3 font-bold text-slate-200">{u.fullName}</td>
                      <td className="p-3 font-mono text-amber-500">{u.username}</td>
                      <td className="p-3 font-extrabold capitalize text-zinc-300">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          u.role === "super-admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" : u.role === "admin" ? "bg-amber-500/10 text-gold border border-amber-500/20" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-zinc-400">{u.phone}</td>
                      <td className="p-3 text-zinc-450">{u.email}</td>
                      <td className="p-3">
                        <div className="flex gap-1.5 justify-start">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserForm({ username: u.username, email: u.email, password: "", role: u.role, fullName: u.fullName, phone: u.phone });
                            }}
                            className="p-1.5 bg-zinc-900 text-amber-500 hover:bg-amber-500 hover:text-black rounded cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 bg-zinc-900 text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab: Digital Wallets & Brand configuration (Super Admin ONLY) */}
      {activeTab === "settings" && isSuper && settings && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl dark-card bg-zinc-950/80 border border-zinc-80 &">
            <h3 className="text-sm font-black text-amber-500 mb-4 font-sans">{isRtl ? "إعدادات هوية متجر النجم وتفاصيل الجوالات" : "Al-Najm Mobile Brand Identity Settings"}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSettingsUpdate(settings);
            }} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-550 block mb-1 font-bold">{isRtl ? "اسم المتجر بالعربي" : "Store Name Arabic"}</label>
                  <input
                    type="text"
                    value={settings.siteNameAr}
                    onChange={(e) => setSettings({ ...settings, siteNameAr: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-555 block mb-1 font-bold">{isRtl ? "اسم المتجر بالإنجليزي" : "Store Name English"}</label>
                  <input
                    type="text"
                    value={settings.siteNameEn}
                    onChange={(e) => setSettings({ ...settings, siteNameEn: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-550 block mb-1 font-bold">{isRtl ? "العنوان بالتفصيل العربي" : "Sana'a Branch Arabic Address"}</label>
                  <input
                    type="text"
                    value={settings.addressAr}
                    onChange={(e) => setSettings({ ...settings, addressAr: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-555 block mb-1 font-bold">{isRtl ? "العنوان بالتفصيل الإنجليزي" : "Sana'a Branch English Address"}</label>
                  <input
                    type="text"
                    value={settings.addressEn}
                    onChange={(e) => setSettings({ ...settings, addressEn: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold">
                <div>
                  <label className="text-zinc-550 block mb-1">{isRtl ? "رقم استقبال الحوالات المالية" : "Wire Reception Phone"}</label>
                  <input
                    type="text"
                    value={settings.transferReceiveNumber}
                    onChange={(e) => setSettings({ ...settings, transferReceiveNumber: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-amber-500 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-550 block mb-1">{isRtl ? "رقم استقبال سندات المحافظ" : "Wallet Reception Phone"}</label>
                  <input
                    type="text"
                    value={settings.receiptReceiveNumber}
                    onChange={(e) => setSettings({ ...settings, receiptReceiveNumber: e.target.value })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-amber-500 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-550 block mb-1">{isRtl ? "سعر صرف الدولار مقابل الريال اليمني" : "Simulated Currency Ratio (1 USD = ? YER)"}</label>
                  <input
                    type="number"
                    value={settings.currencies.usdToYer}
                    onChange={(e) => setSettings({ ...settings, currencies: { usdToYer: Number(e.target.value) } })}
                    required
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* coordinates editing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "خط عرض الخريطة (Latitude)" : "Latitude coordinate"}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.coordinates.lat}
                    onChange={(e) => setSettings({ ...settings, coordinates: { ...settings.coordinates, lat: Number(e.target.value) } })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1 font-bold">{isRtl ? "خط طول الخريطة (Longitude)" : "Longitude coordinate"}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.coordinates.lng}
                    onChange={(e) => setSettings({ ...settings, coordinates: { ...settings.coordinates, lng: Number(e.target.value) } })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-lg"
                  />
                </div>
              </div>

              {/* Super Admin 2FA Toggle */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-100">{isRtl ? "تضمين المصادقة الثنائية (2FA) للسوبر أدمن" : "Enable S-Admin Two Factor Auth Mode (2FA)"}</span>
                  <span className="block text-[10px] text-zinc-400 mt-1">{isRtl ? "عند تفعيلها، يطلب رمز كود تحقق ذكي إضافي عند تسجيل دخول الإدارة." : "Secures control panel sessions with temporary secure login pins."}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled })}
                  className={`px-4 py-2 font-black rounded-lg text-xs cursor-pointer ${
                    settings.twoFactorEnabled ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {settings.twoFactorEnabled ? (isRtl ? "نشط ومفعل" : "ACTIVE ENFORCED") : (isRtl ? "معطل" : "NOT ACTIVE")}
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gold hover:bg-yellow-400 text-black text-xs font-black rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isRtl ? "تثبيت التحديثات الكاملة للمتجر" : "Submit Global Settings"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Wallets and e-wallets lists configuring */}
          <div className="p-5 rounded-2xl dark-card-royal border border-zinc-800">
            <h4 className="text-sm font-bold text-slate-200 mb-2">{isRtl ? "تعديل أرقام المحافظ الرقمية الحالية" : "Manage Mobile E-Wallet Depository accounts"}</h4>
            <p className="text-zinc-550 text-xs mb-4">{isRtl ? "قم بتعديل أرقام الإيداع الخاصة بكافة المحافظ المحمولة (الكريمي، جيب، بنكي، جوالي)." : "You can change or mute specific wallet accounts shown at checkout here."}</p>
            
            <div className="space-y-3.5 text-xs">
              {wallets.map((w, idx) => (
                <div key={w.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                  <div className="font-bold text-slate-200 uppercase">{isRtl ? w.nameAr : w.nameEn}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-medium shrink-0">{isRtl ? "رقم حساب الإيداع:" : "Deposit Phone:"}</span>
                    <input
                      type="text"
                      value={w.depositNumber}
                      onChange={(e) => {
                        const copy = [...wallets];
                        copy[idx].depositNumber = e.target.value;
                        setWallets(copy);
                      }}
                      className="w-full bg-[#121212] border border-zinc-800 text-slate-100 rounded p-1.5 font-mono text-center tracking-wider"
                    />
                  </div>
                  <div className="flex justify-end gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...wallets];
                        copy[idx].status = copy[idx].status === "active" ? "inactive" : "active";
                        setWallets(copy);
                      }}
                      className={`px-3 py-1.5 font-bold rounded ${w.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
                    >
                      {w.status === "active" ? (isRtl ? "مفتوح نشط" : "ACTIVE") : (isRtl ? "موقف" : "DISABLED")}
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch(`${apiUrl}/api/wallets`, {
                      method: "PUT",
                      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                      body: JSON.stringify(wallets)
                    });
                    if (res.ok) alert(isRtl ? "تم حفظ روابط وحسابات المحافظ الرقمية بنجاح!" : "Wallet addresses saved!");
                  }}
                  className="px-6 py-2.5 bg-gold text-black font-black rounded-lg cursor-pointer"
                >
                  {isRtl ? "حفظ التغييرات في حسابات المحافظ" : "Save All Wallets Config"}
                </button>
              </div>
            </div>
          </div>

          {/* Social Links management */}
          <div className="p-5 rounded-2xl dark-card bg-zinc-950/80 border border-zinc-800">
            <h4 className="text-sm font-bold text-slate-200 mb-2">{isRtl ? "إدارة قنوات التواصل الاجتماعي" : "Manage Social Platforms"}</h4>
            <p className="text-zinc-500 text-xs mb-4">{isRtl ? "يمكنك توجيه وتعديل وتفعيل قنوات فيسبوك وسناب وتيكتوك وتليجرام." : "Super Admin can add or delete channels dynamically which then display on the Contact page."}</p>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  const namePlatform = prompt(isRtl ? "أدخل اسم المنصة (مثال: TikTok, Facebook, Telegram...):" : "Platform Name (TikTok, Telegram, Facebook...):");
                  const linkUrl = prompt(isRtl ? "أدخل رابط الحساب الكامل:" : "Enter Full HTTP URL:");
                  if (namePlatform && linkUrl && settings) {
                    const updatedLinks = [...(settings.socialLinks || []), {
                      id: "soc-" + Math.random().toString(36).substring(2, 5),
                      platform: namePlatform,
                      url: linkUrl,
                      status: "active" as const
                    }];
                    const newSettings = { ...settings, socialLinks: updatedLinks };
                    setSettings(newSettings);
                    handleSettingsUpdate(newSettings);
                  }
                }}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-gold text-xs font-bold rounded-lg hover:bg-zinc-800"
              >
                + {isRtl ? "إضافة منصة تواصل اجتماعي جديدة" : "Add New Platform Channel"}
              </button>

              <div className="divide-y divide-zinc-900 mt-4 text-xs font-mono">
                {settings?.socialLinks && settings.socialLinks.length > 0 ? (
                  settings.socialLinks.map((sl, i) => (
                    <div key={sl.id} className="py-2.5 flex justify-between items-center bg-zinc-950/50 p-3 rounded-lg border border-zinc-900 mb-1.5">
                      <div>
                        <span className="font-bold text-amber-500 uppercase mr-2">{sl.platform}:</span>
                        <span className="text-zinc-400 text-[10px]">{sl.url}</span>
                      </div>
                      <button
                        onClick={() => {
                          const updated = settings.socialLinks.filter(item => item.id !== sl.id);
                          const newSettings = { ...settings, socialLinks: updated };
                          setSettings(newSettings);
                          handleSettingsUpdate(newSettings);
                        }}
                        className="text-red-400 font-bold p-1 bg-red-500/10 hover:bg-red-500/20 rounded cursor-pointer text-[10px]"
                      >
                        {isRtl ? "حذف القناة" : "Delete"}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-550 text-xs italic">{isRtl ? "لا توجد قنوات مفعلة حالياً. أضف قنوات ليتمكن عملاؤك من تصفحها." : "No social handles populated."}</div>
                )}
              </div>
            </div>
          </div>

          {/* Sandboxed Server properties files listing diagnostics */}
          {serverStats && (
            <div className="p-5 rounded-2xl dark-card-royal border border-zinc-850">
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5 mb-2">
                <Database className="w-4 h-4 text-gold" />
                <span>{isRtl ? "تشخيص البنية التحتية والوصول للملفات" : "Sandboxed Server Files & System Diagnostics"}</span>
              </h4>
              <p className="text-zinc-500 text-xs mb-4">{isRtl ? "تفاصيل الخادم والمسارات الفعالة بـ Cloud Run الحالية." : "Provides transparent server-level runtime directory statistics for compliance verifying."}</p>
              
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-900 font-mono text-[11px] text-zinc-400 space-y-2">
                <div><span className="text-amber-500 font-bold">Node Base:</span> {serverStats.rootPath}</div>
                <div><span className="text-amber-500 font-bold">Database File Node:</span> {serverStats.dbPath}</div>
                <div><span className="text-amber-500 font-bold">Active Port:</span> {serverStats.portActive}</div>
                <div><span className="text-amber-500 font-bold">Node Runtime Version:</span> {serverStats.nodeVersion}</div>
                <div><span className="text-amber-500 font-bold">Sandbox Environment:</span> {serverStats.environment} ({serverStats.platformSandbox})</div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab: Real-time Languages matrix controller */}
      {activeTab === "languages" && isSuper && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl dark-card bg-zinc-950/80 border border-zinc-800">
            <h3 className="text-sm font-black text-amber-500 mb-4 font-sans">{isRtl ? "تعديل مصفوفة مفردات اللغات (الترجمات)" : "Multilingual Translation Matrix Dictionary"}</h3>
            <p className="text-zinc-500 text-xs mb-4">
              {isRtl 
                ? "يتيح لك هذا القسم الخارق إضافة لغات جديدة وتعديل كافة النصوص المعروضة بالموقع فوراً دون ملامسة كود السورس الرئيسي."
                : "Allows Super Admins to append whole new language packs and alter translation strings directly."}
            </p>

            {/* Append language action */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3 mb-6">
              <h4 className="text-xs font-bold text-slate-300">{isRtl ? "إضافة لغة جديدة للموقع:" : "Add Custom Translation Pack:"}</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                <input
                  type="text"
                  placeholder={isRtl ? "رمز اللغة (مثل: fr, tr):" : "Code (e.g., fr, tr, sp)"}
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value.trim().toLowerCase())}
                  className="p-2 bg-[#101010] border border-zinc-800 text-slate-200 rounded"
                />
                <input
                  type="text"
                  placeholder={isRtl ? "اسم اللغة (مثل: الفرنسية):" : "Locale name (e.g., Français)"}
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  className="p-2 bg-[#101010] border border-zinc-800 text-slate-200 rounded"
                />
                <button
                  type="button"
                  onClick={addNewLanguagePack}
                  className="px-4 py-2 bg-gold text-black rounded font-black cursor-pointer"
                >
                  {isRtl ? "+ إضافة كود اللغة" : "Deploy Language Group"}
                </button>
              </div>
            </div>

            {/* List languages and configure keys */}
            <div className="space-y-6">
              {languages.map((l, langArrIdx) => (
                <div key={l.code} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/30">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-3">
                    <span className="font-extrabold text-amber-500 text-sm font-sans">{l.name} ({l.code}) - Direction: {l.direction.toUpperCase()}</span>
                    {(l.code !== "ar" && l.code !== "en") && (
                      <button
                        onClick={() => removeLanguagePack(l.code)}
                        className="text-red-400 font-extrabold text-[10px] py-1 px-2.5 bg-red-500/10 rounded cursor-pointer"
                      >
                        {isRtl ? "إزالة هذه اللغة" : "Delete Pack"}
                      </button>
                    )}
                  </div>

                  {/* Grid of keys editing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    {Object.keys(l.translations).map((key) => (
                      <div key={key} className="flex flex-col gap-1 p-2 bg-zinc-900/50 rounded border border-zinc-900">
                        <span className="text-zinc-500 font-mono break-all">{key}</span>
                        <input
                          type="text"
                          value={l.translations[key]}
                          onChange={(e) => handleTranslationEdit(langArrIdx, key, e.target.value)}
                          className="p-1.5 bg-black border border-zinc-800 text-slate-250 rounded text-right"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <button
                  onClick={() => saveLanguagesOnServer(languages)}
                  className="px-8 py-3 bg-amber-500 text-black font-black text-xs rounded-xl shadow-xl hover:scale-[1.01] transition-transform cursor-pointer font-sans"
                >
                  {isRtl ? "تثبيت وحفظ مصفوفة اللغات بالكامل" : "Lock All Multilingual Key Translations"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab: Security Audit logs */}
      {activeTab === "logs" && isSuper && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl dark-card-royal border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="text-base font-black text-slate-100">{isRtl ? "سجل كشوف العمليات الأمنية (Audit Log)" : "Security & System Audit Log Loggers"}</h3>
            </div>
            <p className="text-zinc-500 text-xs mb-4">{isRtl ? "سجل نظام فائق الأمان يرصد ترحيل الخدمات، محاولات الدخول، وإجراءات حجز المنتجات وتعديل أسعار الكتالوج." : "Tamper-proof visual session audit trail tracking every core operation."}</p>
            
            <div className="overflow-y-auto max-h-[500px] border border-zinc-900 rounded-xl divide-y divide-zinc-900 text-[11px] font-mono">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-zinc-950/40 hover:bg-zinc-950 text-right space-y-1">
                  <div className="flex justify-between text-zinc-500 text-[10px]">
                    <span className="text-rose-400 font-bold">Action: {log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-zinc-300 font-medium">
                    {log.details}
                  </div>
                  <div className="text-[10px] text-zinc-550 flex justify-between">
                    <span>Actor: {log.actorUsername} ({log.actorRole.toUpperCase()})</span>
                    {log.ipAddress && <span>Remote Node IP: {log.ipAddress}</span>}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-zinc-500 text-center py-4">{isRtl ? "السجل فارغ حالياً." : "Audit log empty"}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
