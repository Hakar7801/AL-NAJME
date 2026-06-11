/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Building2, Camera, Upload, AlertCircle, CheckCircle2, RefreshCw, X, ShieldAlert 
} from "lucide-react";
import { EWallet, CartItem } from "../types.js";

interface CheckoutSectionProps {
  items: CartItem[];
  total: number;
  translate: (key: string) => string;
  lang: string;
  wallets: EWallet[];
  onSubmitReservation: (details: {
    paymentMethod: "transfer" | "wallet";
    walletName?: string;
    transferNumber?: string;
    receiptImage?: string; // base64 representation
    fullName: string;
    phone: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
  transferReceiveNumber: string;
  receiptReceiveNumber: string;
}

export default function CheckoutSection({
  items,
  total,
  translate,
  lang,
  wallets,
  onSubmitReservation,
  onCancel,
  transferReceiveNumber,
  receiptReceiveNumber
}: CheckoutSectionProps) {
  const isRtl = lang === "ar";
  
  // Checkout flow state
  const [payMethod, setPayMethod] = useState<"transfer" | "wallet">("transfer");
  const [selectedWallet, setSelectedWallet] = useState<string>("kuraimi");
  const [transferRef, setTransferRef] = useState("");
  const [notes, setNotes] = useState("");
  
  // Client details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Base64 image upload/camera states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File drag-and-drop / upload helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert(isRtl ? "حجم الصورة كبير جداً، يرجى اختيار ملف أقل من 8 ميجابايت" : "Image is too large. Max 8MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Instant Camera Captures using WebRTC MediaStreams
  const startCamera = async () => {
    setCameraActive(true);
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera activation error", err);
      setCameraError(isRtl ? "تعذر فتح الكاميرا في المتصفح الحالي. يرجى رفع الملف من المعرض." : "Camera blocked or unsupported.");
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Grab Base64 jpeg representation compressed automatically
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setUploadedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone) {
      alert(isRtl ? "يرجى إكمال بيانات العميل أولاً" : "Customer contact info is required");
      return;
    }

    if (payMethod === "transfer" && !transferRef.trim()) {
      alert(isRtl ? "يرجى تعبئة رقم أو رمز الحوالة المالية" : "Please submit transfer reference code");
      return;
    }

    if (payMethod === "wallet" && !uploadedImage) {
      alert(isRtl ? "يرجى رفع صورة سند الإيداع أو التقاط السند بالكاميرا لتأكيد الحجز" : "Please attach deposit receipt image first");
      return;
    }

    onSubmitReservation({
      paymentMethod: payMethod,
      walletName: payMethod === "wallet" ? selectedWallet : undefined,
      transferNumber: payMethod === "transfer" ? transferRef : undefined,
      receiptImage: payMethod === "wallet" ? (uploadedImage || undefined) : undefined,
      fullName: customerName,
      phone: customerPhone,
      notes: notes
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-right rtl:text-right ltr:text-left animate-fade-in" id="checkout-section-panel">
      
      {/* Title */}
      <h2 className="text-2xl font-black text-slate-100 flex items-center justify-between gap-2 mb-6 border-b border-zinc-800 pb-3">
        <span>{translate("reservation.title")}</span>
        <button 
          onClick={onCancel}
          className="text-zinc-500 hover:text-white text-xs font-bold px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer"
        >
          {isRtl ? "العودة للسلة" : "Back to Cart"}
        </button>
      </h2>

      {/* Booking summary items list */}
      <div className="dark-card p-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 mb-6">
        <h4 className="text-zinc-500 text-xs font-bold mb-3">{isRtl ? "مراجعة العناصر المحجوزة" : "Items in Reservation"}</h4>
        <div className="divide-y divide-zinc-900">
          {items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-200">
                  {item.type === "product" ? (isRtl ? item.productDetail?.nameAr : item.productDetail?.nameEn) : `رقم مميز ${item.vipDetail?.number}`}
                </span>
                <span className="text-zinc-550 mr-2">x{item.quantity}</span>
              </div>
              <span className="font-mono text-zinc-300 font-bold">${item.priceOnOrder * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-900 pt-3 mt-2 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-200">{translate("cart.total")}</span>
          <span className="text-base font-black text-rose-500 font-mono">
            ${total.toLocaleString()}
            <span className="text-xs text-zinc-400 font-bold ml-1">
              (≈ {(total * 530).toLocaleString()} ريال يمني)
            </span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Customer details contact */}
        <div className="dark-card p-5 rounded-2xl border border-zinc-800">
          <h3 className="text-sm font-black text-amber-500 inline-flex items-center gap-1.5 mb-4 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>{isRtl ? "1. بيانات المستلم وجوال التواصل" : "1. Customer Contact Details"}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold block">{translate("login.fullName")} *</label>
              <input
                type="text"
                placeholder={isRtl ? "مثال: أحمد عبد الله الكبسي" : "e.g., John Doe"}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full p-2.5 text-xs bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 placeholder-zinc-700 text-right rtl:text-right"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold block">{translate("login.phone")} *</label>
              <input
                type="text"
                placeholder={isRtl ? "مثال: 777644776" : "e.g., 777644776"}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full p-2.5 text-xs bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 placeholder-zinc-700 tracking-wider font-mono text-right rtl:text-right"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Payment options */}
        <div className="dark-card p-5 rounded-2xl border border-zinc-800">
          <h3 className="text-sm font-black text-amber-500 inline-flex items-center gap-1.5 mb-4 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>{isRtl ? "2. طريقة تأكيد حجز المتجر" : "2. Select Booking Payment"}</span>
          </h3>
          
          {/* Tabs for payment selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
               type="button"
               onClick={() => setPayMethod("transfer")}
               className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer ${
                payMethod === "transfer"
                  ? "bg-amber-500/10 border-gold text-amber-500 shadow-lg shadow-amber-500/5"
                  : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-slate-200"
              }`}
            >
              <Building2 className="w-5 h-5 text-amber-500" />
              <span>{isRtl ? "تأكيد بحوالة مالية محلياً" : "Submit Bank/Cash Wire"}</span>
            </button>

            <button
              type="button"
              onClick={() => setPayMethod("wallet")}
              className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer ${
                payMethod === "wallet"
                  ? "bg-amber-500/10 border-gold text-amber-500 shadow-lg shadow-amber-500/5"
                  : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-slate-200"
              }`}
            >
              <Camera className="w-5 h-5 text-amber-550" />
              <span>{isRtl ? "تأكيد عبر محفظة إلكترونية" : "Submit Digital Wallet Receipt"}</span>
            </button>
          </div>

          {/* Conditional Layouts based on method */}
          {payMethod === "transfer" ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200 leading-relaxed text-right">
                  {translate("reservation.transferInstruction").replace("{transferNumber}", transferReceiveNumber)}
                  <br />
                  <span className="text-[10px] text-zinc-550 font-bold">
                    {isRtl 
                      ? "(تنويه: يمكنك الحوالة عبر شركات الصرافة اليمنية كالنجم أو الكريمي أو النجم الفضي... وإدخال كود السند هنا لتأكيد ترحيل الطلب للإدارة فوراً)" 
                      : "(Notice: Transfer via block networks like Al-Najm or Kuraimi, then paste code to commit reservation)"}
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-bold block">{translate("reservation.transferNumberLabel")}</label>
                <input
                  type="text"
                  placeholder={translate("reservation.transferPlaceholder")}
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  className="w-full p-3 font-mono tracking-widest text-xs bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 placeholder-zinc-700 text-right rtl:text-right"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              
              {/* Wallet Select Option */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-bold block">{translate("reservation.walletLabel")}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {wallets.filter(w => w.status === "active").map((wallet) => (
                    <button
                      type="button"
                      key={wallet.id}
                      onClick={() => setSelectedWallet(wallet.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedWallet === wallet.id
                          ? "bg-amber-500/10 border-gold text-amber-500"
                          : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-90 w-full"
                      }`}
                    >
                      <span className="text-[10px] font-black block">{isRtl ? wallet.nameAr : wallet.nameEn}</span>
                      <span className="text-[8px] text-zinc-500 block font-mono">ID: {wallet.depositNumber}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit notification alert info */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-350">
                <p className="leading-relaxed text-right">
                  {translate("reservation.walletInstruction").replace("{depositNumber}", receiptReceiveNumber)}
                </p>
              </div>

              {/* Upload or Camera capture triggers */}
              <div className="space-y-3">
                <label className="text-xs text-zinc-300 font-bold block">{isRtl ? "خطوة السند: ارفع صورة سند الإرسال لتأكيد المراجعة" : "Receipt Verification Line"}</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Uploader drag-and-drop */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border border-dashed border-zinc-800 rounded-2xl p-4 text-center bg-zinc-950 cursor-pointer hover:border-amber-500/50 transition-colors relative"
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <Upload className="w-8 h-8 text-amber-500/70 mx-auto mb-2" />
                    <span className="text-xs text-slate-300 font-bold block">{translate("reservation.uploadReceipt")}</span>
                    <span className="text-[10px] text-zinc-550 block mt-1">{isRtl ? "يمكنك السحب والإفلات أو رفع صورة مباشرة" : "Drag & Drop or browse files"}</span>
                  </div>

                  {/* Browser Live Camera capture interface */}
                  <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-950 flex flex-col items-center justify-center min-h-[120px]">
                    {cameraActive ? (
                      <div className="w-full flex flex-col items-center gap-2">
                        <video 
                          ref={videoRef}
                          className="w-full h-24 object-cover bg-black rounded-lg border border-zinc-800"
                        />
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={capturePhoto}
                            className="px-2.5 py-1 text-[10px] font-bold bg-gold text-black rounded-md cursor-pointer"
                          >
                            {isRtl ? "التقاط السند" : "Capture Source"}
                          </button>
                          <button 
                            type="button"
                            onClick={stopCamera}
                            className="px-2.5 py-1 text-[10px] font-bold bg-red-600 text-white rounded-md cursor-pointer"
                          >
                            {isRtl ? "إلغاء الكاميرا" : "Deactivate"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center w-full">
                        <Camera className="w-8 h-8 text-amber-500/70 mx-auto mb-2" />
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-gold hover:text-white rounded-xl text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
                        >
                          {translate("reservation.captureCamera")}
                        </button>
                        {cameraError && (
                          <span className="text-[10px] text-red-400 block mt-1.5"><ShieldAlert className="inline w-3 h-3 mr-1" />{cameraError}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Display receipt thumbnail preview */}
                {uploadedImage && (
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-black border border-zinc-800 overflow-hidden shrink-0">
                        <img src={uploadedImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-500 block">{isRtl ? "مرفق سند الإيداع جاهز" : "Receipt attachment verified"}</span>
                        <span className="text-[10px] text-zinc-550 block uppercase font-mono">Attachment size: ~{(uploadedImage.length / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="p-1 text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Optional Reservation customer comment notes */}
          <div className="space-y-1.5 mt-5">
            <label className="text-xs text-zinc-400 font-bold block">{isRtl ? "أي ملاحظات إضافية لتسجيل الطلب؟ (اختياري)" : "Additional Notes or special requests (Optional)"}</label>
            <textarea
              placeholder={isRtl ? "مثال: يرجى برمجة الجهاز وتفعيل فور جي قبل الشحن..." : "e.g., please program device to Yemen Mobile 4G..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-xs bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-gold text-slate-100 placeholder-zinc-700 text-right rtl:text-right"
            />
          </div>

        </div>

        {/* Operational Trigger Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 py-4 text-xs font-bold rounded-xl gold-gradient text-black hover:scale-[1.01] transition-transform shadow-xl shadow-amber-500/10 cursor-pointer"
          >
            {translate("reservation.submitButton")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white transition-colors text-xs font-bold text-zinc-400 cursor-pointer"
          >
            {isRtl ? "إلغاء وإعادة تصفح المعرض" : "Cancel"}
          </button>
        </div>

      </form>
    </div>
  );
}
