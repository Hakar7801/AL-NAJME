/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db.js";
import { User, Product, VipNumber, Order, SiteSettings, EWallet, TranslationSet, CartItem } from "./src/types.js";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "alnajm-mobile-golden-key-royal-palace-2026-secret";

// Express Body Size limits for robust base64 upload matching mobile receipts compression
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Simple In-memory Custom Anti-Flooding Rate Limiter
const loginAttempts: Record<string, { count: number; expireAt: number }> = {};
function loginRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || "unknown-ip";
  const now = Date.now();
  if (loginAttempts[ip]) {
    if (loginAttempts[ip].expireAt < now) {
      // Expired, reset
      loginAttempts[ip] = { count: 1, expireAt: now + 5 * 60 * 1000 }; // 5 mins
    } else {
      loginAttempts[ip].count += 1;
      if (loginAttempts[ip].count > 8) {
        return res.status(429).json({ 
          errorAr: "لقد تجاوزت الحد الأقصى للمحاولات. يرجى الانتظار 5 دقائق وقبل المحاولة مجدداً.",
          errorEn: "Too many login attempts. Please wait 5 minutes." 
        });
      }
    }
  } else {
    loginAttempts[ip] = { count: 1, expireAt: now + 5 * 60 * 1000 };
  }
  next();
}

// Token Verification Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ errorAr: "غير مصرح - الرجاء تسجيل الحساب أو الدخول أولاً", errorEn: "Unauthorized - Please sign in first" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, tokenPayload: any) => {
    if (err) {
      return res.status(403).json({ errorAr: "انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجدداً", errorEn: "Session expired. Please log in again." });
    }
    req.user = tokenPayload;
    next();
  });
}

// Admin Checking Middlewares
function requireAdmin(req: any, res: any, next: any) {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "super-admin")) {
    return res.status(403).json({ errorAr: "صلاحيات غير كافية، هذه الميزة للمشرفين فقط", errorEn: "Access denied. Admins only." });
  }
  next();
}

function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== "super-admin") {
    return res.status(403).json({ errorAr: "صلاحيات فائقة مطلوبة، هذه الميزة للسوبر أدمن فقط", errorEn: "Access denied. Super Admin only." });
  }
  next();
}

// --- API ENDPOINTS ---

// Auth Register
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, fullName, phone } = req.body;
  if (!username || !email || !password || !fullName || !phone) {
    return res.status(400).json({ errorAr: "يرجى تعبئة جميع الحقول المطلوبة", errorEn: "Please fill in all requested fields" });
  }

  const users = db.getUsers();
  const userNameLower = username.toLowerCase().trim();
  const emailLower = email.toLowerCase().trim();

  const userExists = users.find(u => u.username.toLowerCase() === userNameLower || u.email.toLowerCase() === emailLower);
  if (userExists) {
    return res.status(400).json({ errorAr: "اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً", errorEn: "Username or Email is already registered" });
  }

  const newId = "u-" + Math.random().toString(36).substring(2, 9);
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: newId,
    username: userNameLower,
    email: emailLower,
    role: "user",
    fullName: fullName.trim(),
    phone: phone.trim(),
    createdAt: new Date().toISOString()
  };

  const updatedUsers = [...users, newUser];
  const newPasswords = { [newId]: hashedPassword };

  db.saveUsers(updatedUsers, newPasswords);
  db.addLog("Registration", newUser.username, "user", `New client profile registered: ${newUser.fullName} (${newUser.phone})`, req.ip);

  // Generate Session Token
  const token = jwt.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: newUser });
});

// Auth Login
app.post("/api/auth/login", loginRateLimit, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ errorAr: "يرجى إدخال اسم المستخدم وكلمة المرور", errorEn: "Please input username and password" });
  }

  const users = db.getUsers();
  const passwords = db.getPasswords();
  const inputName = username.toLowerCase().trim();

  const user = users.find(u => u.username === inputName || u.email === inputName);
  if (!user) {
    db.addLog("Failed Login", "Anonymous", "guest", `Attempted username: ${inputName}`, req.ip);
    return res.status(400).json({ errorAr: "اسم المستخدم أو كلمة المرور غير صحيحة", errorEn: "Invalid credentials" });
  }

  const hashedPassword = passwords[user.id];
  if (!hashedPassword) {
    return res.status(400).json({ errorAr: "الملف معطل، يرجى التواصل مع الدعم", errorEn: "Profile deactivated" });
  }

  const isMatch = await bcrypt.compare(password, hashedPassword);
  if (!isMatch) {
    db.addLog("Failed Login", user.username, user.role, `Invalid pass key submission`, req.ip);
    return res.status(400).json({ errorAr: "اسم المستخدم أو كلمة المرور غير صحيحة", errorEn: "Invalid credentials" });
  }

  // Generate Token
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  db.addLog("Successful Sign In", user.username, user.role, `Client log in completed`, req.ip);

  // Clear limit on success
  const ip = req.ip || "unknown-ip";
  delete loginAttempts[ip];

  res.json({ token, user });
});

// Restore password helper mock (Returns the secret of user in a secure user recovery screen)
app.post("/api/auth/recover", (req, res) => {
  const { username, phone } = req.body;
  const users = db.getUsers();
  const match = users.find(u => u.username === username.trim().toLowerCase() && u.phone === phone.trim());
  
  if (!match) {
    return res.status(404).json({ 
      errorAr: "لم نجد مستخدم متطابق مع بيانات الإدخال", 
      errorEn: "No user found with specified info." 
    });
  }

  db.addLog("Password Recovery Requested", match.username, match.role, `Verified user profile data for reset code`, req.ip);
  res.json({ 
    success: true, 
    msgAr: `تم التحقق! يحق لك تغيير كلمة المرور فوراً عبر لوحة التحكم أو استخدام الرمز الإرشادي المؤقت: RECOVER-${match.id.toUpperCase()}`,
    msgEn: `Verified! You can change password inside recovery terminal with instructions: RECOVER-${match.id.toUpperCase()}`,
    userId: match.id
  });
});

// Reset Password (direct path after verification or auth)
app.post("/api/auth/reset-now", async (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) return res.status(400).json({ error: "Missing fields" });

  const hashed = await bcrypt.hash(newPassword, 10);
  db.saveUsers(db.getUsers(), { [userId]: hashed });
  db.addLog("Password Override", "Password recovery utility", "guest", `User password updated successfully for ID ${userId}`);
  res.json({ success: true, msgAr: "تم إعادة التعيين بنجاح. يرجى تسجيل الدخول بكودك الجديد", msgEn: "Reset successful. Login now." });
});

// Profile / Current User details
app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const users = db.getUsers();
  const match = users.find(u => u.id === req.user.id);
  if (!match) return res.status(404).json({ errorAr: "المستخدم غير موجود", errorEn: "User profile missing" });
  res.json(match);
});

// --- PRODUCTS ENDPOINTS ---

// Get all products
app.get("/api/products", (req, res) => {
  res.json(db.getProducts());
});

// Create product
app.post("/api/products", authenticateToken, requireAdmin, (req: any, res) => {
  const data = req.body;
  const products = db.getProducts();

  const newProduct: Product = {
    id: "p-" + Math.random().toString(36).substring(2, 9),
    nameAr: data.nameAr || "منتج جديد",
    nameEn: data.nameEn || "New Product",
    category: data.category || "phones",
    images: data.images || [],
    price: Number(data.price) || 0,
    descriptionAr: data.descriptionAr || "",
    descriptionEn: data.descriptionEn || "",
    specsAr: data.specsAr || "",
    specsEn: data.specsEn || "",
    status: data.status || "available",
    quantity: Number(data.quantity) || 1,
    ratings: []
  };

  db.saveProducts([...products, newProduct]);
  db.addLog("Create Product", req.user.username, req.user.role, `Added dynamic store item: ${newProduct.nameAr} (${newProduct.category})`);
  res.status(201).json(newProduct);
});

// Edit product
app.put("/api/products/:id", authenticateToken, requireAdmin, (req: any, res) => {
  const { id } = req.params;
  const data = req.body;
  const products = db.getProducts();
  
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const current = products[index];
  const updated: Product = {
    ...current,
    nameAr: data.nameAr !== undefined ? data.nameAr : current.nameAr,
    nameEn: data.nameEn !== undefined ? data.nameEn : current.nameEn,
    category: data.category !== undefined ? data.category : current.category,
    images: data.images !== undefined ? data.images : current.images,
    price: data.price !== undefined ? Number(data.price) : current.price,
    descriptionAr: data.descriptionAr !== undefined ? data.descriptionAr : current.descriptionAr,
    descriptionEn: data.descriptionEn !== undefined ? data.descriptionEn : current.descriptionEn,
    specsAr: data.specsAr !== undefined ? data.specsAr : current.specsAr,
    specsEn: data.specsEn !== undefined ? data.specsEn : current.specsEn,
    status: data.status !== undefined ? data.status : current.status,
    quantity: data.quantity !== undefined ? Number(data.quantity) : current.quantity
  };

  products[index] = updated;
  db.saveProducts(products);
  db.addLog("Update Product", req.user.username, req.user.role, `Modified store product: ${updated.nameAr}`);
  res.json(updated);
});

// Delete product
app.delete("/api/products/:id", authenticateToken, requireAdmin, (req: any, res) => {
  const { id } = req.params;
  const products = db.getProducts();
  const match = products.find(p => p.id === id);
  if (!match) return res.status(404).json({ error: "Product not found" });

  db.saveProducts(products.filter(p => p.id !== id));
  db.addLog("Delete Product", req.user.username, req.user.role, `Removed store product and associated records: ${match.nameAr}`);
  res.json({ success: true, id });
});

// Submit Rating
app.post("/api/products/:id/rate", authenticateToken, (req: any, res) => {
  const { id } = req.params;
  const { rating, comment, userName } = req.body;
  const products = db.getProducts();

  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const p = products[index];
  const newRating = {
    id: "r-" + Math.random().toString(36).substring(2, 9),
    userId: req.user.id,
    userName: userName || req.user.username,
    rating: Number(rating) || 5,
    comment: comment || "",
    createdAt: new Date().toISOString()
  };

  p.ratings.push(newRating);
  db.saveProducts(products);
  db.addLog("Product Rated", req.user.username, req.user.role, `Reviewed item ${p.nameAr} with ${rating} stars`);
  res.json(p);
});


// --- VIP NUMBERS ENDPOINTS ---

// Get all VIP numbers
app.get("/api/vip-numbers", (req, res) => {
  res.json(db.getVipNumbers());
});

// Create VIP number
app.post("/api/vip-numbers", authenticateToken, requireAdmin, (req: any, res) => {
  const data = req.body;
  const numbers = db.getVipNumbers();

  const isDuplicate = numbers.some(n => n.number === data.number);
  if (isDuplicate) {
    return res.status(400).json({ errorAr: "هذا الرقم مسجل مسبقاً في الموقع", errorEn: "Number is already cataloged" });
  }

  const newNum: VipNumber = {
    id: "vip-" + Math.random().toString(36).substring(2, 9),
    number: data.number,
    price: Number(data.price) || 0,
    provider: data.provider || "Yemen Mobile",
    status: data.status || "available",
    category: data.category || "gold"
  };

  db.saveVipNumbers([...numbers, newNum]);
  db.addLog("Create VIP Number", req.user.username, req.user.role, `Registered premium line: ${newNum.number} (${newNum.provider})`);
  res.status(201).json(newNum);
});

// Edit VIP number
app.put("/api/vip-numbers/:id", authenticateToken, requireAdmin, (req: any, res) => {
  const { id } = req.params;
  const data = req.body;
  const numbers = db.getVipNumbers();

  const index = numbers.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: "Number not found" });

  const current = numbers[index];
  const updated: VipNumber = {
    ...current,
    number: data.number !== undefined ? data.number : current.number,
    price: data.price !== undefined ? Number(data.price) : current.price,
    provider: data.provider !== undefined ? data.provider : current.provider,
    status: data.status !== undefined ? data.status : current.status,
    category: data.category !== undefined ? data.category : current.category
  };

  numbers[index] = updated;
  db.saveVipNumbers(numbers);
  db.addLog("Update VIP Number", req.user.username, req.user.role, `Edited premium line settings: ${updated.number}`);
  res.json(updated);
});

// Delete VIP number
app.delete("/api/vip-numbers/:id", authenticateToken, requireAdmin, (req: any, res) => {
  const { id } = req.params;
  const numbers = db.getVipNumbers();
  const match = numbers.find(n => n.id === id);
  if (!match) return res.status(404).json({ error: "Number not found" });

  db.saveVipNumbers(numbers.filter(n => n.id !== id));
  db.addLog("Delete VIP Number", req.user.username, req.user.role, `Deleted VIP SIM listing: ${match.number}`);
  res.json({ success: true, id });
});


// --- ORDERS ENDPOINTS ---

// Get active orders (Admin views all, normal user views theirs)
app.get("/api/orders", authenticateToken, (req: any, res) => {
  const orders = db.getOrders();
  if (req.user.role === "admin" || req.user.role === "super-admin") {
    return res.json(orders);
  }
  // User only views theirs
  res.json(orders.filter(o => o.userId === req.user.id));
});

// Submit / Create order
app.post("/api/orders", authenticateToken, (req: any, res) => {
  const { items, total, paymentMethod, walletName, transferNumber, receiptImage, notes } = req.body;
  if (!items || !items.length || !total || !paymentMethod) {
    return res.status(400).json({ errorAr: "بيانات سلة الحجز غير مكتملة", errorEn: "Missing cart variables for reservation order" });
  }

  const orders = db.getOrders();
  const products = db.getProducts();
  const vipNumbers = db.getVipNumbers();

  // Validate items & Deduct quantities in available products or mark VIP number as Sold
  const processedItems: CartItem[] = items.map((cartItem: CartItem) => {
    if (cartItem.type === "product") {
      const parentP = products.find(p => p.id === cartItem.productId);
      if (parentP) {
        if (parentP.quantity < cartItem.quantity) {
          throw new Error(`الكمية المتاحة من ${parentP.nameAr} لا تكفي لطلب السلة.`);
        }
        parentP.quantity -= cartItem.quantity;
        if (parentP.quantity <= 0) {
          parentP.status = "unavailable";
        }
      }
    } else {
      const parentNum = vipNumbers.find(n => n.id === cartItem.vipNumberId);
      if (parentNum) {
        if (parentNum.status === "sold") {
          throw new Error(`تعذر الحجز؛ الرقم المميز ${parentNum.number} محجوز مسبقاً.`);
        }
        parentNum.status = "sold";
      }
    }
    return cartItem;
  });

  // Save modified volumes
  db.saveProducts(products);
  db.saveVipNumbers(vipNumbers);

  const newOrder: Order = {
    id: "ord-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    userId: req.user.id,
    userFullName: req.body.userFullName || "عميل النجم",
    userPhone: req.body.userPhone || "7********",
    items: processedItems,
    total: Number(total),
    paymentMethod,
    walletName,
    transferNumber,
    receiptImage, // base64 payload
    status: "pending",
    createdAt: new Date().toISOString(),
    notes: notes || ""
  };

  db.saveOrders([newOrder, ...orders]);
  db.addLog("Create Order", req.user.username, req.user.role, `Successfully checked out booking request: ${newOrder.id} totaling $${newOrder.total}`);
  res.status(201).json(newOrder);
});

// Update order status (Admin approvals/declining)
app.put("/api/orders/:id/status", authenticateToken, requireAdmin, (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body; // approves, declined, pending
  const orders = db.getOrders();

  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return res.status(404).json({ error: "Order not found" });

  orders[index].status = status;
  db.saveOrders(orders);
  db.addLog("Order Status Updated", req.user.username, req.user.role, `Order: ${id} status updated to [${status}]`);
  res.json(orders[index]);
});


// --- MANAGE WALLETS ---
app.get("/api/wallets", (req, res) => {
  res.json(db.getWallets());
});

app.put("/api/wallets", authenticateToken, requireSuperAdmin, (req: any, res) => {
  const wallets = req.body; // Entire list
  if (!Array.isArray(wallets)) return res.status(400).json({ error: "Must be array" });
  db.saveWallets(wallets);
  db.addLog("Update E-Wallets", req.user.username, req.user.role, `Updated digital payment wallets profile config`);
  res.json(wallets);
});


// --- MANAGE USERS ---
app.get("/api/users", authenticateToken, requireAdmin, (req: any, res) => {
  const users = db.getUsers();
  // Filter out passwords
  res.json(users);
});

// Create/Edit/Delete users (Super admin powers)
app.post("/api/users", authenticateToken, requireSuperAdmin, async (req: any, res) => {
  const { username, email, password, role, fullName, phone } = req.body;
  const users = db.getUsers();

  if (users.some(u => u.username === username.trim().toLowerCase())) {
    return res.status(400).json({ errorAr: "اسم المستخدم مكرر بالفعل", errorEn: "Username duplicated" });
  }

  const newId = "u-" + Math.random().toString(36).substring(2, 9);
  const hash = await bcrypt.hash(password || "123456", 10);

  const newUser: User = {
    id: newId,
    username: username.trim().toLowerCase(),
    email: email.trim(),
    role: role || "user",
    fullName: fullName,
    phone: phone,
    createdAt: new Date().toISOString()
  };

  db.saveUsers([...users, newUser], { [newId]: hash });
  db.addLog("Administator Provisioned", req.user.username, req.user.role, `Created new system profile manually: ${fullName} (${role})`);
  res.status(201).json(newUser);
});

app.put("/api/users/:id", authenticateToken, requireSuperAdmin, async (req: any, res) => {
  const { id } = req.params;
  const { role, fullName, phone, password } = req.body;
  const users = db.getUsers();

  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  const current = users[idx];
  current.role = role || current.role;
  current.fullName = fullName || current.fullName;
  current.phone = phone || current.phone;

  const newPassMap: Record<string, string> = {};
  if (password) {
    newPassMap[current.id] = await bcrypt.hash(password, 10);
  }

  db.saveUsers(users, password ? newPassMap : undefined);
  db.addLog("User Profile Changed", req.user.username, req.user.role, `Overrode user configuration for: ${current.fullName}`);
  res.json(current);
});

app.delete("/api/users/:id", authenticateToken, requireSuperAdmin, (req: any, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ errorAr: "لا يمكنك حذف حسابك الحالي الناشط", errorEn: "Cannot delete your active session profile" });
  }

  const users = db.getUsers();
  const match = users.find(u => u.id === id);
  if (!match) return res.status(404).json({ error: "Not found" });

  db.saveUsers(users.filter(u => u.id !== id));
  db.addLog("User Terminated", req.user.username, req.user.role, `Permanently disconnected profile for system user: ${match.fullName}`);
  res.json({ success: true, id });
});


// --- SETTINGS ENDPOINTS ---
app.get("/api/settings", (req, res) => {
  res.json(db.getSettings());
});

app.put("/api/settings", authenticateToken, requireSuperAdmin, (req: any, res) => {
  db.saveSettings(req.body);
  db.addLog("Update Settings", req.user.username, req.user.role, `Modified overall brand, map coordinates, and social handles`);
  res.json(db.getSettings());
});


// --- LANGUAGES ENDPOINTS ---
app.get("/api/languages", (req, res) => {
  res.json(db.getLanguages());
});

app.put("/api/languages", authenticateToken, requireSuperAdmin, (req: any, res) => {
  const languages = req.body;
  if (!Array.isArray(languages)) return res.status(400).json({ error: "Languages must be an array" });
  db.saveLanguages(languages);
  db.addLog("Languages Matrix Update", req.user.username, req.user.role, `Updated translation sets and language toggles`);
  res.json(languages);
});


// --- SECURITY AUDIT LOGS ---
app.get("/api/logs", authenticateToken, requireSuperAdmin, (req, res) => {
  res.json(db.getLogs());
});


// --- SYSTEM DIAGNOSTICS & SYSTEM FILE RETRIEVER ---

// Export Raw DB backup as instant JSON download
app.get("/api/system/backup", authenticateToken, requireSuperAdmin, (req, res) => {
  res.setHeader("Content-disposition", "attachment; filename=alnajm-db-backup.json");
  res.setHeader("Content-type", "application/json");
  res.write(db.exportBackup());
  res.end();
});

// Inspect System files safely
app.get("/api/system/files", authenticateToken, requireSuperAdmin, (req, res) => {
  res.json({
    rootPath: process.cwd(),
    dbPath: path.join(process.cwd(), "data", "db.json"),
    environment: process.env.NODE_ENV || "development",
    portActive: PORT,
    platformSandbox: "Cloud Run Sandbox",
    nodeVersion: process.version
  });
});


// --- VITE AND PRODUCTION SERVING INTEGRATION ---

async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static outputs
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AL-NAJM MOBILE] Running high-octane full-stack engine on http://localhost:${PORT}`);
  });
}

initServer().catch(err => {
  console.error("Critical server bootstrap failure:", err);
});
