/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { CartItem } from "../types.js";

interface CartModalProps {
  onClose: () => void;
  lang: string;
  translate: (key: string) => string;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, type: "product" | "vip_number", q: number) => void;
  onRemoveItem: (id: string, type: "product" | "vip_number") => void;
  onCheckout: () => void;
  total: number;
}

export default function CartModal({
  onClose,
  lang,
  translate,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  total
}: CartModalProps) {
  const isRtl = lang === "ar";

  const handleQtyChange = (
    id: string, 
    type: "product" | "vip_number", 
    current: number, 
    direction: "up" | "down"
  ) => {
    const nextVal = direction === "up" ? current + 1 : current - 1;
    if (nextVal <= 0) {
      onRemoveItem(id, type);
    } else {
      onUpdateQuantity(id, type, nextVal);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-sidebar-container">
      {/* Backdrop overlay filter */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
        <div className="w-screen max-w-md bg-[#0d0d0d] border-l rtl:border-l-0 rtl:border-r border-zinc-900 shadow-2xl p-6 flex flex-col h-full text-right rtl:text-right ltr:text-left animate-fade-in" id="cart-subframe">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-90 w-full pb-4">
            <h3 className="text-base font-black text-[#e5c158] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <span>{translate("cart.title")}</span>
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Contents Scroll area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4" id="cart-contents-scroll">
            {cartItems.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="text-zinc-600 w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">{translate("cart.empty")}</h4>
                <p className="text-[11px] text-zinc-550 mt-1">{isRtl ? "تصفح قسم الهواتف أو الأرقام المميزة وأضف شيئاً مبهراً!" : "Browse phones or VIP numbers catalog to find prime items"}</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cartItems.map((item) => {
                  const itemId = item.type === "product" ? item.productId! : item.vipNumberId!;
                  const title = item.type === "product" ? (isRtl ? item.productDetail?.nameAr : item.productDetail?.nameEn) : `رقم مميز ${item.vipDetail?.number}`;
                  const image = item.type === "product" 
                    ? (item.productDetail?.images?.[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop&q=60")
                    : "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=100&auto=format&fit=crop&q=60";

                  return (
                    <div 
                      key={`${item.type}-${itemId}`}
                      className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-900 flex gap-3 relative hover:border-[#e5c158]/30 transition-colors"
                    >
                      {/* Thumbnail container */}
                      <div className="w-16 h-16 rounded-lg bg-black border border-zinc-850 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                        <img src={image} referrerPolicy="no-referrer" className="max-h-full object-contain" alt="" />
                      </div>

                      {/* Detail Text Column */}
                      <div className="flex-1 flex flex-col justify-between text-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gold block leading-none mb-1">{item.type}</span>
                          <h4 className="font-extrabold text-[#f1f5f9] line-clamp-1 leading-relaxed">
                            {title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          {/* Price */}
                          <span className="font-mono font-black text-rose-500">
                            ${item.priceOnOrder}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Quantity counters */}
                            <div className="flex items-center rounded-lg bg-black border border-zinc-850 overflow-hidden">
                              <button
                                onClick={() => handleQtyChange(itemId, item.type, item.quantity, "down")}
                                className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-900 border-none cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-3 font-mono font-bold text-slate-100">{item.quantity}</span>
                              <button
                                onClick={() => handleQtyChange(itemId, item.type, item.quantity, "up")}
                                disabled={item.type === "vip_number"} // VIP numbers can't have duplicate volumes
                                className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-900 border-none cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                              >
                                +
                              </button>
                            </div>

                            {/* Trash button */}
                            <button
                              onClick={() => onRemoveItem(itemId, item.type)}
                              className="p-1 text-zinc-550 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing Total checkout footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-zinc-900 pt-4 space-y-4">
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-900 text-xs text-zinc-400 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span>{isRtl ? "عدد العناصر المحمولة:" : "Cart items volume:"}</span>
                  <span className="font-bold text-slate-200">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} {translate("cart.itemCount")}
                  </span>
                </div>
                <div className="w-full h-px bg-zinc-900" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-200">{translate("cart.total")}</span>
                  <span className="text-lg font-black text-rose-500 font-mono">
                    ${total.toLocaleString()}
                    <span className="text-[10px] text-zinc-500 block leading-none mt-1">
                      (≈ {(total * 530).toLocaleString()} ريال يمني)
                    </span>
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={onCheckout}
                className="w-full py-4 text-xs font-black rounded-2xl gold-gradient text-black hover:scale-[1.01] transition-transform duration-200 text-center flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/5"
              >
                <span>{translate("cart.reserveButton")}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
