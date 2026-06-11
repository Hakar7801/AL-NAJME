/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { 
  User, Product, VipNumber, Order, SiteSettings, EWallet, AuditLog, TranslationSet 
} from "../src/types.js";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface DatabaseState {
  users: User[];
  passwords: Record<string, string>; // userId -> hashedPassword
  products: Product[];
  vipNumbers: VipNumber[];
  orders: Order[];
  wallets: EWallet[];
  settings: SiteSettings;
  languages: TranslationSet[];
  logs: AuditLog[];
}

// Default Seed Translation Keys
const defaultArTranslations = {
  "nav.home": "الرئيسية",
  "nav.phones": "الهواتف الذكية",
  "nav.accessories": "الإكسسوارات",
  "nav.maintenance": "الصيانة",
  "nav.programming": "البرمجة",
  "nav.vipNumbers": "الأرقام المميزة",
  "nav.contact": "اتصل بنا",
  "nav.privacy": "سياسة الخصوصية",
  "nav.terms": "الشروط والأحكام",
  "nav.dashboard": "لوحة التحكم",
  "search.placeholder": "ابحث عن هواتف، إكسسوارات، أرقام مميزة...",
  "search.button": "بحث",
  "cart.title": "سلة الحجز",
  "cart.empty": "سلة الحجز فارغة حالياً.",
  "cart.total": "الإجمالي",
  "cart.reserveButton": "الدفع للحجز والطلب",
  "cart.itemCount": "أصناف",
  "hero.title": "النجم موبايل",
  "hero.subtitle": "بوابتك لكل جديد في عالم الهواتف الذكية والبرمجة والصيانة بحرفية ذهبية بأحدث الأنظمة.",
  "hero.cta": "تصفح المنتجات الرائجة",
  "product.available": "متوفر في المتجر",
  "product.unavailable": "غير متوفر حالياً",
  "product.addToCart": "إضافة للسلة",
  "product.specs": "المواصفات الفنية",
  "product.rating": "التقييمات",
  "product.addRating": "أضف تقييمك",
  "product.price": "السعر",
  "product.quantity": "الكمية المتاحة",
  "reservation.title": "تأكيد الطلب والحجز",
  "reservation.choosePayment": "اختر طريقة الحجز والدفع المقررة",
  "reservation.transfer": "حوالة مالية محلياً",
  "reservation.wallet": "عبر محفظة إلكترونية",
  "reservation.transferInstruction": "يرجى إرسال الحوالة إلى الرقم: {transferNumber}",
  "reservation.transferNumberLabel": "أدخل رقم الحوالة المرسلة لتأكيد العملية:",
  "reservation.transferPlaceholder": "مثال: 569830219",
  "reservation.walletLabel": "اختر المحفظة الإلكترونية لرفع السند:",
  "reservation.walletInstruction": "يرجى إيداع مبلغ الحجز إلى حساب المحفظة المعني بالرقم: {depositNumber}",
  "reservation.uploadReceipt": "رفع صورة سند الإيداع من المعرض:",
  "reservation.captureCamera": "أو التقط صورة السند بالكاميرا مباشرة:",
  "reservation.submitButton": "إرسال الحجز للتثبيت",
  "footer.rights": "جميع الحقوق محفوظة للنجم موبايل 2026 © صنعاء - اليمن",
  "footer.address": "صنعاء - الأصبحي - بجانب سوبر ماركت كارفور - أمام سوق القات",
  "profile.title": "الملف الشخصي للعميل",
  "profile.history": "سجل طلباتي السابقة",
  "status.pending": "قيد المراجعة",
  "status.approved": "مقبول ومثبت",
  "status.declined": "مرفوض",
  "login.title": "تسجيل الدخول",
  "login.registerLink": "ليس لديك حساب؟ سجل الآن",
  "login.registerTitle": "إنشاء حساب جديد",
  "login.username": "اسم المستخدم",
  "login.email": "البريد الإلكتروني",
  "login.password": "كلمة المرور",
  "login.fullName": "الاسم الكامل",
  "login.phone": "رقم الهاتف للتواصل"
};

const defaultEnTranslations = {
  "nav.home": "Home",
  "nav.phones": "Smartphones",
  "nav.accessories": "Accessories",
  "nav.maintenance": "Maintenance",
  "nav.programming": "Programming",
  "nav.vipNumbers": "VIP Numbers",
  "nav.contact": "Contact Us",
  "nav.privacy": "Privacy Policy",
  "nav.terms": "Terms & Conditions",
  "nav.dashboard": "Control Panel",
  "search.placeholder": "Search phones, accessories, VIP numbers...",
  "search.button": "Search",
  "cart.title": "Reservation Cart",
  "cart.empty": "Your shopping cart is currently empty.",
  "cart.total": "Grand Total",
  "cart.reserveButton": "Proceed with Reservation",
  "cart.itemCount": "items",
  "hero.title": "Al-Najm Mobile",
  "hero.subtitle": "Your premier destination for smartphones, expert programming, robust hardware service, and unique VIP SIMs in Sana'a.",
  "hero.cta": "Explore Hot Products",
  "product.available": "In Stock",
  "product.unavailable": "Out of Stock",
  "product.addToCart": "Add to Cart",
  "product.specs": "Technical Specifications",
  "product.rating": "User Ratings",
  "product.addRating": "Leave a Review",
  "product.price": "Price",
  "product.quantity": "Available Qty",
  "reservation.title": "Confirm Reservation Order",
  "reservation.choosePayment": "Select Approved Reservation Payment System",
  "reservation.transfer": "Local Cash Wire/Transfer",
  "reservation.wallet": "via Mobile E-Wallet",
  "reservation.transferInstruction": "Please wire the reservation fund to phone node: {transferNumber}",
  "reservation.transferNumberLabel": "Submit your money transfer reference code here:",
  "reservation.transferPlaceholder": "Example: 569830219",
  "reservation.walletLabel": "Select mobile e-wallet operator:",
  "reservation.walletInstruction": "Please deposit funds to the specific wallet linked to: {depositNumber}",
  "reservation.uploadReceipt": "Upload money deposit receipt image:",
  "reservation.captureCamera": "Or capture receipt snapshot using Camera:",
  "reservation.submitButton": "Submit Order & Receipt for Handover",
  "footer.rights": "All Rights Reserved - Al-Najm Mobile 2026 © Sana'a, Yemen",
  "footer.address": "Sana'a - Al-Asbahi - Beside Carrefour Supermarket - Front of Qat Market",
  "profile.title": "User Profile Page",
  "profile.history": "Your Order History Logs",
  "status.pending": "Pending Verification",
  "status.approved": "Approved & Booked",
  "status.declined": "Declined",
  "login.title": "Account Login",
  "login.registerLink": "Don't have an account? Register now",
  "login.registerTitle": "Register New Profile",
  "login.username": "Username",
  "login.email": "Email Address",
  "login.password": "Password",
  "login.fullName": "Full Professional Name",
  "login.phone": "Mobile Number"
};

// Seed Helper
function generateSeed(): DatabaseState {
  const superId = "u-superadmin-id";
  const adminId = "u-admin-id";
  const user1Id = "u-customer1-id";

  const hashedSuper = bcrypt.hashSync("123456", 10);
  const hashedAdmin = bcrypt.hashSync("123456", 10);
  const hashedUser = bcrypt.hashSync("123456", 10);

  const users: User[] = [
    {
      id: superId,
      username: "superadmin",
      email: "superadmin@alnajm.com",
      role: "super-admin",
      fullName: "النجم السوبر أدمن",
      phone: "777644776",
      createdAt: new Date().toISOString()
    },
    {
      id: adminId,
      username: "admin",
      email: "admin@alnajm.com",
      role: "admin",
      fullName: "مشرف النجم موبايل",
      phone: "775888975",
      createdAt: new Date().toISOString()
    },
    {
      id: user1Id,
      username: "customer1",
      email: "test@alnajm.com",
      role: "user",
      fullName: "أحمد بن علي الكبسي",
      phone: "711516860",
      createdAt: new Date().toISOString()
    }
  ];

  const passwords: Record<string, string> = {
    [superId]: hashedSuper,
    [adminId]: hashedAdmin,
    [user1Id]: hashedUser
  };

  const products: Product[] = [
    {
      id: "p-iphone15-promax",
      nameAr: "آيفون 15 برو ماكس - 256 جيجابايت ذهبي ملكي",
      nameEn: "iPhone 15 Pro Max - 256GB Elegant Gold",
      category: "phones",
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60"
      ],
      price: 1199,
      descriptionAr: "نسخة الوكالة الرسمية الداعمة لشريحتي اتصال، معالج A17 Pro الخارق، هيكل تيتانيوم ذهبي جذاب مقاوم للصدمات.",
      descriptionEn: "Dual eSIM/Nano official stock, A17 Pro ultimate high-speed chipset, robust gold textured titanium premium chassis.",
      specsAr: "الذاكرة: 256GB\nالشاشة: Super Retina XDR 6.7 inch\nالبطارية: 4441 ملل أمبير\nالضمان: عام كامل",
      specsEn: "Memory: 256GB\nScreen: Super Retina XDR 6.7 inch\nBattery: 4441 mAh\nWarranty: 1 Full Year",
      status: "available",
      quantity: 5,
      ratings: [
        { id: "r1", userId: user1Id, userName: "أحمد بن علي الكبسي", rating: 5, comment: "هاتف فاخر جداً وخدمة راقية وسريعة في البرمجة وتفعيل الشريحة", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "p-galaxy-s24",
      nameAr: "سامسونج جالكسي S24 ألترا - 512 جيجابايت أسود بركاني",
      nameEn: "Samsung Galaxy S24 Ultra - 512GB Obsidian Black",
      category: "phones",
      images: [
        "https://images.unsplash.com/photo-1707052959800-47f52554707e?w=500&auto=format&fit=crop&q=60"
      ],
      price: 1299,
      descriptionAr: "الوحش الكوري مزود بقلم S Pen الذكي، كاميرا بدقة 200 ميجابيكسل ذات تقريب سينمائي خارق 100x مع مميزات الذكاء الاصطناعي Galaxy AI.",
      descriptionEn: "S-Pen integrated workspace, cinematic ultra-zoom 100x details with proprietary Galaxy AI assistive workflows, 12GB RAM.",
      specsAr: "الذاكرة: 512GB\nالرام: 12GB\nالكاميرا: 200MP + 50MP + 12MP\nالمعالج: Snapdragon 8 Gen 3",
      specsEn: "Memory: 512GB\nRAM: 12GB\nCamera: 200MP + 50MP + 12MP\nChip: Snapdragon 8 Gen 3",
      status: "available",
      quantity: 3,
      ratings: []
    },
    {
      id: "p-airpods-max",
      nameAr: "سماعة آبل إيربودز ماكس اللاسلكية - لون ذهبي شامبين",
      nameEn: "Apple AirPods Max Wireless - Champagne Gold Edition",
      category: "accessories",
      images: [
        "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=500&auto=format&fit=crop&q=60"
      ],
      price: 499,
      descriptionAr: "شغل الموسيقى وتلاشى من الضوضاء مع عزل فائق للصوت ووسادات أذن معندسة لدقة رنين عالية مكسوة بالذهب الأنيق.",
      descriptionEn: "High-fidelity audio seamlessly matches state-of-the-art Active Noise Cancellation, champagne gold custom-finished design.",
      specsAr: "العزل: نشط بنسبة 100%\nعمر البطارية: 20 ساعة عمل\nمنفذ الشحن: Lightning\nالوزن: 384 جرام",
      specsEn: "Noise Cancellation: Active 100%\nBattery Wear: 20 Operating Hours\nPort: Lightning\nWeight: 384g",
      status: "available",
      quantity: 12,
      ratings: []
    },
    {
      id: "p-charge-anker",
      nameAr: "شاحن أنكر نانو 65 واط ثلاثي المنافذ سريع وعازل للحرارة",
      nameEn: "Anker Prime 65W GaN Multi-Port Fast Charger",
      category: "accessories",
      images: [
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60"
      ],
      price: 45,
      descriptionAr: "شاحن ذكي فائق السرعة يدعم التقنيات المتطورة لشحن الهواتف والحواسيب مع حماية قصوى وذكية ضد التماس الكهربائي لبيئة يمن موبايل.",
      descriptionEn: "Highly efficient GaN smart wall charger with dual USB-C and USB-A slots capable of rapid simultaneous smartphone/notebook topping.",
      specsAr: "القوة الاستيعابية: 65W\nعدد المنافذ: 3 منافذ (2 Type-C, 1 USB)\nالوزن: 110 جرام",
      specsEn: "Total Output: 65W\nPort Count: 3 Ports (2 Type-C, 1 USB-A)\nFeature: Over-heat circuit defense",
      status: "available",
      quantity: 20,
      ratings: []
    },
    {
      id: "p-service-hardware",
      nameAr: "صيانة أجهزة آيفون وسامسونج الصلبة - شاشات وبطاريات أصلية وكالة",
      nameEn: "Precision iPhone & Galaxy Screen/Battery Swap Service",
      category: "maintenance",
      images: [
        "https://images.unsplash.com/photo-1601524909162-be87252be898?w=500&auto=format&fit=crop&q=60"
      ],
      price: 50,
      descriptionAr: "تغيير وتثبيت شاشات الهواتف التالفة وبطاريات ريجينال وكالة مع كادر هندسي متخصص أمام عينك في متجر الأصبحي.",
      descriptionEn: "Instant transparent replacement of high-density glass screens and genuine lithium batteries, supervised by elite mechanics in our store.",
      specsAr: "الضمان: 3 شهور\nمدة العمل: ساعة واحدة بمتجرنا\nالأدوات المتاحة: ماكينات كبس وتبريد ليزر محدثة",
      specsEn: "Official Warranty: 3 Months\nProcessing Speed: Typically 1 hour inside shop\nInfrastructure: High-grade laser separation and thermal laminators",
      status: "available",
      quantity: 999,
      ratings: []
    },
    {
      id: "p-service-program",
      nameAr: "برمجة شاملة وتخطى حسابات جوجل وآيكلود فك شفرات يمن موبايل",
      nameEn: "Software Programming & Carrier Unlock (Yemen Mobile / YOU / Sabafon)",
      category: "programming",
      images: [
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&auto=format&fit=crop&q=60"
      ],
      price: 15,
      descriptionAr: "فك شفرات الهواتف الأمريكية والمحلية، تحديث السوفتوير، إصلاح IMEI، تخطي الـ iCloud والـ Gmail وسامسونج أكاونت بكفاءة ومرونة تامة.",
      descriptionEn: "Official network carrier unlock, bootloader adjustments, IMEI repair, Google FRP bypass, and safe iOS/Android custom flashing services.",
      specsAr: "الأنظمة: iOS 17+, Android 14+\nالشبكات المدعومة: CDMA, GSM, LTE, 5G\nالزمن: فوري بحدود 15 دقيقة",
      specsEn: "Platforms: iOS 17+, Android 14+\nFrequencies: 3G / 4G LTE / 5G\nAverage ETA: Instant 15 minutes processing",
      status: "available",
      quantity: 999,
      ratings: []
    }
  ];

  const vipNumbers: VipNumber[] = [
    {
      id: "vip-1",
      number: "777777770",
      price: 1500,
      provider: "Yemen Mobile",
      status: "available",
      category: "platinum"
    },
    {
      id: "vip-2",
      number: "775555554",
      price: 800,
      provider: "Yemen Mobile",
      status: "available",
      category: "gold"
    },
    {
      id: "vip-3",
      number: "737373737",
      price: 1200,
      provider: "Sabafon",
      status: "available",
      category: "platinum"
    },
    {
      id: "vip-4",
      number: "711111166",
      price: 450,
      provider: "YOU",
      status: "available",
      category: "silver"
    },
    {
      id: "vip-5",
      number: "777644776",
      price: 9999, // Already used as contact, set as sold
      provider: "Yemen Mobile",
      status: "sold",
      category: "platinum"
    }
  ];

  const wallets: EWallet[] = [
    {
      id: "w-kuraimi",
      nameAr: "كريمي جوال (Kuraimi Express)",
      nameEn: "Kuraimi Jawal Mobile Wallet",
      icon: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60",
      depositNumber: "775888975",
      status: "active"
    },
    {
      id: "w-jeeb",
      nameAr: "محفظة جيب الإلكترونية (Jeeb)",
      nameEn: "Jeeb Mobile Wallet app",
      icon: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=100&auto=format&fit=crop&q=60",
      depositNumber: "775888975",
      status: "active"
    },
    {
      id: "w-banky",
      nameAr: "بنكي المتكامل (Banky)",
      nameEn: "Banky Mobile Pay",
      icon: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=100&auto=format&fit=crop&q=60",
      depositNumber: "775888975",
      status: "active"
    },
    {
      id: "w-jawaly",
      nameAr: "محفظتي جوالي (Jawaly)",
      nameEn: "Jawaly Digital wallet",
      icon: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&auto=format&fit=crop&q=60",
      depositNumber: "775888975",
      status: "active"
    }
  ];

  const settings: SiteSettings = {
    siteNameAr: "النجم موبايل",
    siteNameEn: "Al-Najm Mobile",
    addressAr: "صنعاء - الأصبحي - بجانب سوبر ماركت كارفور - أمام سوق القات",
    addressEn: "Sana'a - Al-Asbahi - Next to Carrefour Supermarket - Opposite Qat Market",
    coordinates: {
      lat: 15.2917,
      lng: 44.2048,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15392.20417937397!2d44.2048!3d15.2917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1603db0000000001%3A0x0!2zMTXCsDE3JzMwLjEiTiA0NMKwMTInMTcuMyJF!5e0!3m2!1sar!2sye!4v1700000000000"
    },
    contactPhones: ["777644776", "775888975", "737201461", "711516860"],
    transferReceiveNumber: "775888975",
    receiptReceiveNumber: "775888975",
    socialLinks: [], // Default is empty as specified: "حالياً لا يوجد فيسبوك/إنستغرام/يوتيوب. ويستطيع السوبر أدمن إضافة أي منصة"
    currencies: {
      usdToYer: 530 // average exchange rate for bookings
    },
    twoFactorEnabled: false
  };

  const languages: TranslationSet[] = [
    {
      code: "ar",
      name: "العربية",
      direction: "rtl",
      translations: defaultArTranslations
    },
    {
      code: "en",
      name: "English",
      direction: "ltr",
      translations: defaultEnTranslations
    }
  ];

  const logs: AuditLog[] = [
    {
      id: "l-init",
      action: "System Initialization",
      actorUsername: "System Root",
      actorRole: "super-admin",
      details: "Al-Najm Mobile database launched and fully seeded with high-fidelity products, premium VIP SIM lines, local payment gateways, and translation packs.",
      timestamp: new Date().toISOString()
    }
  ];

  return {
    users,
    passwords,
    products,
    vipNumbers,
    orders: [],
    wallets,
    settings,
    languages,
    logs
  };
}

class DBManager {
  private cache: DatabaseState | null = null;

  constructor() {
    this.ensureDataSetup();
  }

  private ensureDataSetup() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const seed = generateSeed();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf8");
      this.cache = seed;
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf8");
        this.cache = JSON.parse(raw);
        // Ensure integrity
        if (!this.cache || !this.cache.users) {
          throw new Error("Invalid json database format");
        }
      } catch (e) {
        console.error("Corrupted database loading. Rebuilding seed database...", e);
        const seed = generateSeed();
        fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf8");
        this.cache = seed;
      }
    }
  }

  private persist() {
    if (this.cache) {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.cache, null, 2), "utf8");
    }
  }

  // Generic Getters & Setters
  public getUsers(): User[] {
    this.ensureDataSetup();
    return this.cache!.users;
  }

  public getPasswords(): Record<string, string> {
    this.ensureDataSetup();
    return this.cache!.passwords;
  }

  public getProducts(): Product[] {
    this.ensureDataSetup();
    return this.cache!.products;
  }

  public getVipNumbers(): VipNumber[] {
    this.ensureDataSetup();
    return this.cache!.vipNumbers;
  }

  public getOrders(): Order[] {
    this.ensureDataSetup();
    return this.cache!.orders;
  }

  public getWallets(): EWallet[] {
    this.ensureDataSetup();
    return this.cache!.wallets;
  }

  public getSettings(): SiteSettings {
    this.ensureDataSetup();
    return this.cache!.settings;
  }

  public getLanguages(): TranslationSet[] {
    this.ensureDataSetup();
    return this.cache!.languages;
  }

  public getLogs(): AuditLog[] {
    this.ensureDataSetup();
    return this.cache!.logs;
  }

  // Mutators
  public saveUsers(users: User[], passwords?: Record<string, string>) {
    this.ensureDataSetup();
    this.cache!.users = users;
    if (passwords) {
      this.cache!.passwords = { ...this.cache!.passwords, ...passwords };
    }
    this.persist();
  }

  public saveProducts(products: Product[]) {
    this.ensureDataSetup();
    this.cache!.products = products;
    this.persist();
  }

  public saveVipNumbers(vipNumbers: VipNumber[]) {
    this.ensureDataSetup();
    this.cache!.vipNumbers = vipNumbers;
    this.persist();
  }

  public saveOrders(orders: Order[]) {
    this.ensureDataSetup();
    this.cache!.orders = orders;
    this.persist();
  }

  public saveWallets(wallets: EWallet[]) {
    this.ensureDataSetup();
    this.cache!.wallets = wallets;
    this.persist();
  }

  public saveSettings(settings: SiteSettings) {
    this.ensureDataSetup();
    this.cache!.settings = settings;
    this.persist();
  }

  public saveLanguages(languages: TranslationSet[]) {
    this.ensureDataSetup();
    this.cache!.languages = languages;
    this.persist();
  }

  public addLog(action: string, actorUsername: string, actorRole: string, details: string, ipAddress?: string) {
    this.ensureDataSetup();
    const newLog: AuditLog = {
      id: "log-" + Math.random().toString(36).substring(2, 9),
      action,
      actorUsername,
      actorRole,
      details,
      timestamp: new Date().toISOString(),
      ipAddress
    };
    this.cache!.logs.unshift(newLog);
    // Keep logs list trimmed to prevent huge data file over time
    if (this.cache!.logs.length > 500) {
      this.cache!.logs = this.cache!.logs.slice(0, 500);
    }
    this.persist();
  }

  // Export full raw db for backups
  public exportBackup(): string {
    this.ensureDataSetup();
    return JSON.stringify(this.cache, null, 2);
  }
}

export const db = new DBManager();
