/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Smartphone, Search, ShoppingCart, User, LogOut, Menu, X, Globe, Settings2, KeyRound 
} from "lucide-react";
import { User as UserType } from "../types.js";

interface NavbarProps {
  currentLang: string;
  setLang: (lang: string) => void;
  translate: (key: string) => string;
  languages: Array<{ code: string; name: string; direction: string }>;
  currentUser: UserType | null;
  onLogout: () => void;
  cartCount: number;
  onCartToggle: () => void;
  onSearch: (term: string) => void;
  onNavigate: (section: string) => void;
  activeTab: string;
}

export default function Navbar({
  currentLang,
  setLang,
  translate,
  languages,
  currentUser,
  onLogout,
  cartCount,
  onCartToggle,
  onSearch,
  onNavigate,
  activeTab
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isRtl = currentLang === "ar";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const menuItems = [
    { id: "home", labelKey: "nav.home" },
    { id: "phones", labelKey: "nav.phones" },
    { id: "accessories", labelKey: "nav.accessories" },
    { id: "maintenance", labelKey: "nav.maintenance" },
    { id: "programming", labelKey: "nav.programming" },
    { id: "vipNumbers", labelKey: "nav.vipNumbers" },
    { id: "contact", labelKey: "nav.contact" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 border-b border-zinc-800/85 backdrop-blur-md" id="alnajm-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Design */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")} id="brand-logo">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-l from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Smartphone className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                النجم موبايل
              </span>
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                AL-NAJM MOBILE
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse" id="desktop-menu">
            {menuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                   key={item.id}
                   onClick={() => onNavigate(item.id)}
                   className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active 
                      ? "text-amber-500 bg-zinc-900/60 border border-amber-500/20" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  {translate(item.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Search, Cart, Lang, Auth controls */}
          <div className="hidden md:flex items-center gap-4" id="desktop-controls">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={translate("search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 xl:w-64 pl-10 pr-4 py-2 text-xs rounded-full bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-amber-500 focus:w-64 transition-all duration-300 text-slate-100"
              />
              <button type="submit" className="absolute left-3 top-2.5 text-zinc-500 hover:text-amber-500">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-900 cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>{currentLang === "ar" ? "AR" : "EN"}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl py-1 w-28">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      currentLang === l.code ? "text-amber-500" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Shopping Cart button */}
            <button
              onClick={onCartToggle}
              className="relative p-2 rounded-full border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-amber-500 transition-all cursor-pointer"
              id="nav-cart-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth panel */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <button
                  onClick={() => onNavigate("dashboard")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border ${
                    activeTab === "dashboard"
                      ? "bg-amber-600 text-black border-amber-600"
                      : "border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                  }`}
                  id="nav-dashboard-btn"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[80px] truncate">{currentUser.fullName}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg border border-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate("login")}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg gold-gradient text-black gold-gradient-hover shadow-lg shadow-amber-500/10"
                id="nav-login-btn"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{translate("login.title")}</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={onCartToggle}
              className="relative p-2 rounded-full border border-zinc-800 hover:bg-zinc-900 text-zinc-300 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg border border-zinc-800"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#0c0c0c] px-4 py-5 space-y-4" id="mobile-drawer">
          
          {/* Quick Search for Mobile */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={translate("search.placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-slate-100"
            />
            <button type="submit" className="absolute left-3 top-3 text-zinc-500">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Menu List Links */}
          <div className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === item.id 
                    ? "text-amber-500 bg-zinc-900/80 border-r-4 border-gold" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                }`}
              >
                {translate(item.labelKey)}
              </button>
            ))}
          </div>

          {/* Language Switch */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-zinc-900/50">
            <span className="text-xs text-zinc-500">اللغة / Language</span>
            <div className="flex gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-3 py-1 text-xs font-bold rounded-md ${
                    currentLang === l.code ? "bg-gold text-black" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Auth Controls for Mobile */}
          <div className="pt-2 border-t border-zinc-800">
            {currentUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onNavigate("dashboard");
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-gold border border-gold/30 rounded-lg hover:bg-gold/10"
                >
                  <User className="w-4 h-4" />
                  <span>{currentUser.fullName} ({currentUser.role === "super-admin" ? "سوبر أدمن" : currentUser.role === "admin" ? "أدمن" : "الملف الشخصي"})</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full py-3 text-sm font-bold text-red-400 bg-red-500/10 rounded-lg flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onNavigate("login");
                  setMobileOpen(false);
                }}
                className="w-full py-3 font-semibold rounded-lg gold-gradient text-black text-center block text-sm shadow-xl"
              >
                {translate("login.title")}
              </button>
            )}
          </div>

        </div>
      )}
    </nav>
  );
}
