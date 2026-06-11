/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User Configuration and Roles
export type UserRole = "user" | "admin" | "super-admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  category: "phones" | "accessories" | "maintenance" | "programming";
  images: string[]; // Base64 or local paths
  price: number; // in USD or YER
  descriptionEn: string;
  descriptionAr: string;
  specsEn: string; // newline separated or json
  specsAr: string;
  status: "available" | "unavailable";
  quantity: number;
  ratings: Rating[];
}

export interface VipNumber {
  id: string;
  number: string;
  price: number;
  provider: "Yemen Mobile" | "Sabafon" | "YOU" | "Y";
  status: "available" | "sold";
  category: "platinum" | "gold" | "silver" | "normal";
}

export interface CartItem {
  productId?: string;
  vipNumberId?: string;
  type: "product" | "vip_number";
  quantity: number;
  priceOnOrder: number;
  // Temporary fields for visual representation
  productDetail?: Product;
  vipDetail?: VipNumber;
}

export interface Order {
  id: string;
  userId: string;
  userFullName: string;
  userPhone: string;
  items: CartItem[];
  total: number;
  paymentMethod: "transfer" | "wallet";
  walletName?: string; // "jeeb" | "kuraimi" | "banky" | "jawaly"
  transferNumber?: string; // For transfer method
  receiptImage?: string; // base64 receipt image
  status: "pending" | "approved" | "declined";
  createdAt: string;
  notes?: string;
}

export interface EWallet {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  depositNumber: string;
  status: "active" | "inactive";
}

export interface SocialLink {
  id: string;
  platform: string; // Facebook, Instagram, YouTube, TikTok, Telegram, X, Snapchat, etc.
  url: string;
  status: "active" | "inactive";
}

export interface SiteSettings {
  siteNameAr: string;
  siteNameEn: string;
  addressAr: string;
  addressEn: string;
  coordinates: {
    lat: number;
    lng: number;
    embedUrl: string;
  };
  contactPhones: string[];
  transferReceiveNumber: string;
  receiptReceiveNumber: string;
  socialLinks: SocialLink[];
  currencies: {
    usdToYer: number;
  };
  twoFactorEnabled: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  actorUsername: string;
  actorRole: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface TranslationSet {
  code: string; // "ar" | "en" | etc.
  name: string;
  direction: "rtl" | "ltr";
  translations: Record<string, string>;
}
