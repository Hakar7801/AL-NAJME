/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { KeyRound, ShieldAlert, CheckCircle, RefreshCw, Smartphone, Key } from "lucide-react";

interface LoginScreenProps {
  translate: (key: string) => string;
  lang: string;
  apiUrl: string;
  onLoginSuccess: (token: string, user: any) => void;
  onCancel: () => void;
}

export default function LoginScreen({
  translate,
  lang,
  apiUrl,
  onLoginSuccess,
  onCancel
}: LoginScreenProps) {
  const isRtl = lang === "ar";
  
  // Auth view toggling: "login" | "register" | "recover" | "reset"
  const [view, setView] = useState<"login" | "register" | "recover" | "reset">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration additional states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Recovery output state
  const [recoveredUserId, setRecoveredUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(isRtl ? data.errorAr || "بيانات غير مطابقة" : data.errorEn || "Invalid credentials");
      } else {
        setSuccess(isRtl ? "تم تسجيل الدخول بنجاح!" : "Login successful!");
        onLoginSuccess(data.token, data.user);
      }
    } catch (err) {
      setError(isRtl ? "تعذر الاتصال بخادم النجم. يرجى المكن إعادة المحاولة." : "Network connection failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, fullName, phone })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(isRtl ? data.errorAr || "حدث خطأ أثناء التسجيل" : data.errorEn || "Error occurred");
      } else {
        setSuccess(isRtl ? "تم إنشاء الحساب الملكي وتطبيقه!" : "Profile registered successfully!");
        onLoginSuccess(data.token, data.user);
      }
    } catch (err) {
      setError(isRtl ? "خطأ في الشبكة" : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/auth/recover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, phone })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(isRtl ? data.errorAr || "اسم المستخدم أو الهاتف غير مطابق" : data.errorEn || "No mathing profile");
      } else {
        setSuccess(isRtl ? data.msgAr : data.msgEn);
        setRecoveredUserId(data.userId);
        setView("reset");
      }
    } catch (err) {
      setError("Error calling password recovery");
    } finally {
      setLoading(false);
    }
  };

  const handleResetNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/auth/reset-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: recoveredUserId, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(isRtl ? data.msgAr : data.msgEn);
        alert(isRtl ? "تم تغيير كلمة المرور بنجاح!" : "Password reset completely!");
        setView("login");
      }
    } catch (err) {
      setError("Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-right rtl:text-right ltr:text-left" id="auth-portal-screen">
      <div className="dark-card-royal p-8 rounded-3xl border border-zinc-800 shadow-2xl relative">
        
        {/* Banner with golden key */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#b89047] to-[#f5d061] flex items-center justify-center shadow-lg mx-auto mb-6">
          <KeyRound className="w-6 h-6 text-black stroke-[2.5]" />
        </div>

        <h2 className="text-xl font-black text-center text-slate-100 mb-6">
          {view === "login" && translate("login.title")}
          {view === "register" && translate("login.registerTitle")}
          {view === "recover" && (isRtl ? "استعادة كلمة المرور" : "Password Recovery")}
          {view === "reset" && (isRtl ? "إعادة تعيين كود الدخول" : "Reset Access Key")}
        </h2>

        {/* Display Alert alerts */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* VIEW: Login form */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-zinc-400 block">{translate("login.username")}</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., superadmin"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 text-right rtl:text-right font-mono"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <button 
                  type="button" 
                  onClick={() => { setError(""); setSuccess(""); setView("recover"); }}
                  className="text-[11px] text-[#e5c158] hover:underline cursor-pointer"
                >
                  {isRtl ? "نسيت الرمز السري؟" : "Forgot Password?"}
                </button>
                <label className="text-zinc-400 block">{translate("login.password")}</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 text-right rtl:text-right font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gold hover:scale-[1.01] transition-transform text-black font-black rounded-xl text-center text-xs cursor-pointer shadow-xl shadow-yellow-500/5 mt-2 flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-4.5 h-4.5 animate-spin" />}
              <span>{translate("login.title")}</span>
            </button>
            
            <p className="text-center text-zinc-500 text-[11px] pt-2">
              {isRtl ? "رمز تجربة الإدارة: superadmin | كلمة السر: 123456" : "Demo access: superadmin / 123456"}
            </p>

            <div className="text-center pt-4 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => { setError(""); setSuccess(""); setView("register"); }}
                className="text-zinc-450 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
              >
                {translate("login.registerLink")}
              </button>
            </div>
          </form>
        )}

        {/* VIEW: Register form */}
        {view === "register" && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs font-medium">
            <div className="space-y-1">
              <label className="text-zinc-400 block">{translate("login.fullName")} *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isRtl ? "مثال: عبد الرحمن بن علي" : "John Smith"}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 text-right rtl:text-right"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 block">{translate("login.username")} *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johnsmith"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 text-right rtl:text-right font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 block">{translate("login.email")} *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 text-right rtl:text-right font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-zinc-400 block">{translate("login.phone")} *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="77*******"
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 text-right rtl:text-right font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 block">{translate("login.password")} *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 text-right rtl:text-right font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gold hover:scale-[1.01] transition-transform text-black font-black rounded-xl text-center text-xs cursor-pointer shadow-xl"
            >
              {translate("login.registerTitle")}
            </button>

            <div className="text-center pt-4 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => { setError(""); setSuccess(""); setView("login"); }}
                className="text-zinc-450 hover:text-white transition-colors cursor-pointer text-xs"
              >
                {isRtl ? "لديك حساب بالفعل؟ سجل دخولك" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        )}

        {/* VIEW: Password recovery info */}
        {view === "recover" && (
          <form onSubmit={handleRecover} className="space-y-4 text-xs font-semibold">
            <p className="text-zinc-400 text-[11px] leading-relaxed mb-4">
              {isRtl 
                ? "يرجى كتابة اسم الدخول الخاص بك (المسجل سابقاً) ورقم الهاتف المتطابق. في حال مطابقتها سيتم التحقق الفوري لتعيين كلمة مرور جديدة."
                : "Enter your registered username and mobile number. Upon direct validation, you can supply your new password instantly."}
            </p>

            <div className="space-y-1">
              <label className="text-zinc-400 block">{translate("login.username")}</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johnsmith"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block">{translate("login.phone")}</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77*******"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gold text-black font-black rounded-xl text-xs cursor-pointer"
            >
              {isRtl ? "التحقق من صحة البيانات" : "Verify Information"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setError(""); setView("login"); }}
                className="text-zinc-450 hover:text-white text-xs cursor-pointer"
              >
                {isRtl ? "العودة لتسجيل الدخول" : "Return to login"}
              </button>
            </div>
          </form>
        )}

        {/* VIEW: Reset new password screen */}
        {view === "reset" && (
          <form onSubmit={handleResetNow} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-zinc-400 block">{isRtl ? "اكتب كلمة المرور الجديدة" : "Specify New Password"}</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-555 text-white font-black rounded-xl text-xs cursor-pointer"
            >
              {isRtl ? "تثبيت كود المرور الجديد" : "Apply New Password"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
