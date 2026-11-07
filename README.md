# ISRAFIL BD SHOP – Enterprise POS & Super Shop Management System
> **ইসরাফিল বিডি শপ** – বাণিজ্যিক মানের সম্পূর্ণ স্বয়ংসম্পূর্ণ পয়েন্ট অব সেল (POS) ও রিটেইল শপ ইনভেন্টরি ম্যানেজমেন্ট প্ল্যাটফর্ম।  
> Designed for high-volume retail, grocery supermarkets, and departmental stores (handling **1,000+ daily sales transactions** without lag).

![Tech Stack](https://img.shields.io/badge/Stack-Laravel%2011%20%7C%20React%2018%20%7C%20Tailwind-indigo)
![Architecture](https://img.shields.io/badge/Architecture-High--Concurrency%20Scale-success)
![Design Policy](https://img.shields.io/badge/UI%20Policy-Strictly%20NO%20Modals-emerald)
![Resilience](https://img.shields.io/badge/Resilience-Zero--Crash%20ErrorBoundary-orange)
![Currency](https://img.shields.io/badge/Currency-BDT%20(%E0%A7%B3)-blue)
![Timezone](https://img.shields.io/badge/Timezone-Asia%2FDhaka-purple)

---

## 🌟 মূল বৈশিষ্ট্যসমূহ (Key Highlights)

### ১. উচ্চ-ক্ষমতাসম্পন্ন স্কেল ও ১,০০০+ দৈনিক বিক্রয় হ্যান্ডলিং (1,000+ Daily Sales Engine)
- **মাল্টি-কলাম কম্পোজিট ইনডেক্সিং**: ডাটাবেসের `sales`, `sale_items`, `customers`, `products`, `transactions` এবং `stock_movements` টেবিলে অপ্টিমাইজড ইনডেক্স।
- **প্যারালাল কাউন্টার অ্যাটমিক ইনভয়েস**: একাধিক ক্যাশিয়ার একসাথে সেল চেকআউট করলেও কোনো ইনভয়েস নম্বর ডুপ্লিকেট হয় না (`INV-YYYYMMDD-XXXX`)।
- **লাইভ প্রিফিক্স কাস্টমার সার্চ**: মোবাইল নম্বরের প্রথম ৩-৪ সংখ্যা টাইপ করতেই রিয়েল-টাইমে গ্রাহকের নাম, পূর্বের বকেয়া ও লয়্যালটি পয়েন্টস লোড হয়।
- **ক্যাশিয়ার শিফট ক্লিনআপ**: লগআউট বা লগইনে পূর্ববর্তী সেশনের সার্চ কুয়েরি ও ক্যাশ মেমোরি স্বয়ংক্রিয়ভাবে পরিষ্কার হয়।

### ২. জিরো-ক্র্যাশ রেজিলিয়েন্স ও রিয়েল-টাইম এরর রিপোর্টিং (Zero-Crash Architecture)
- প্রোডাকশন-গ্রেড রিয়্যাক্ট `ErrorBoundary` আর্কিটেকচার; যেকোনো ব্রাউজার বা জাভাস্ক্রিপ্ট এররে পুরো ওয়েবসাইট বন্ধ না হয়ে দৃষ্টিনন্দন রিকভারি স্ক্রিন দেখায়।
- যেকোনো আনহ্যান্ডেলড এরর স্বয়ংক্রিয়ভাবে ব্যাকএন্ড এপিআই (`POST /api/system/report-error`) এ প্রেরিত হয়ে `storage/logs/client_errors.log` ফাইলে লগ হয়।
- সুপার অ্যাডমিন টপ নেভবারে তাৎক্ষণিক নোটিফিকেশন পাবেন এবং শপ সেটিংস থেকে এরর বিস্তারিত দেখে এক ক্লিকে সমাধান করতে পারবেন।

### ৩. সেকশন রক্ষণাবেক্ষণ নিয়ন্ত্রণ (Section Maintenance Mode)
- সুপার অ্যাডমিন যেকোনো মডিউল (যেমন: পিওএস, পণ্য, ইনভেন্টরি, হিসাবরক্ষণ ইত্যাদি) সাময়িকভাবে রক্ষণাবেক্ষণে নিতে পারেন।
- অন্যান্য কর্মী বা ক্যাশিয়ার ওই সেকশনে ঢুকলে *"This section will be back for maintenance / রক্ষণাবেক্ষণের জন্য সাময়িকভাবে বন্ধ আছে"* নোটিশ দেখায়।
- সুপার অ্যাডমিনের জন্য একটি ফ্লোটিং অ্যাম্বার "Developer Preview" ব্যানার সক্রিয় থাকে, যার মাধ্যমে লাইভ সাইটে নিরাপদভাবে পরীক্ষা ও কাজ করা যায়।

### ৪. সুপার শপ পাইকারি মূল্য ও লাভ গোপনীয়তা (Wholesale Cost Protection)
- ক্যাশিয়াররা (`role: cashier`) প্রোডাক্ট লিস্ট বা ডিটেইলসে কোনো পাইকারি ক্রয় মূল্য (Cost Price) কিংবা ইউনিট প্রফিট মার্জিন দেখতে পাবে না।
- শুধুমাত্র সুপার অ্যাডমিন এবং যেসব ম্যানেজারের `purchases.view` বা `reports.view` পারমিশন রয়েছে তারা ক্রয় মূল্য ও লাভের হিসাব দেখতে পাবেন।
- ক্যাশিয়ারদের জন্য পণ্য তৈরি, এডিট, ডিলিট এবং বাল্ক ডিলিট বাটন সম্পূর্ণ সুরক্ষিতভাবে নিষ্ক্রিয়।

### ৫. পণ্যের পরিমাপের মান (Measurement Value) ও স্টকের পার্থক্য
- প্রতি প্যাকেটের নেট সাইজ (`measurement_value`, যেমন: ১০০ গ্রাম, ৫০০ গ্রাম, ১ কেজি, ১ লিটার) এবং দোকানে মোট মজুত সংখ্যা (`current_stock`, যেমন: ৫০ পিস) সম্পূর্ণ আলাদা ফিল্ডে সংরক্ষিত।
- ক্যাটাগরির পাশে ডেডিকেটেড `পরিমাপ (Qnty)` কলাম প্রদর্শিত হয়।
- সুপার অ্যাডমিন পরিমাপের একক বা ক্যাটাগরি ডিলিট করলেও বিদ্যমান পণ্যের তথ্য অক্ষত থাকে (নিরাপদ ক্যাসকেডিং)।

### ৬. ভিআইপি লয়্যালটি পয়েন্টস ইঞ্জিন (VIP Loyalty Rewards)
- প্রতি ১০০ টাকার কেনাকাটায় স্বয়ংক্রিয় পয়েন্ট অর্জন।
- পিওএস টার্মিনালে চেকআউটের সময় গ্রাহকের পয়েন্ট রিডিম করে ইনস্ট্যান্ট নগদ ছাড় (যেমন: ১০০ পয়েন্ট = ৳৭৫ ছাড়)।

### ৭. ভিজ্যুয়াল রোল ও পারমিশন ম্যানেজমেন্ট (RBAC System)
- সুপার অ্যাডমিন সরাসরি ইউআই থেকে নতুন ভূমিকা তৈরি ও ২০+ গ্র্যানুলার পারমিশন এক ক্লিকে অন/অফ করতে পারবেন।
- আর্থিক সুরক্ষা: বকেয়া ব্যালেন্স বা বিক্রয় ইতিহাস থাকা গ্রাহক/সরবরাহকারীকে সাধারণ ম্যানেজার ডিলিট করতে পারেন না; শুধুমাত্র সুপার অ্যাডমিনের এই অনুমতি রয়েছে।

### ৮. লাইভ ঢাকা ঘড়ি ও রানিং সেকেন্ডস
- টপ নেভবারে রিয়েল-টাইম সেকেন্ড সহ লাইভ ডিজিটাল ঘড়ি (`hh:mm:ss A`), বর্তমান তারিখ এবং টাইমজোন (`Asia/Dhaka`) প্রদর্শিত হয়।

### ৯. কঠোর নো-মডেল ডিজাইন পলিসি (Strict NO-Dialogs / NO-Modals Policy)
- অ্যাপ্লিকেশনের কোথাও কোনো বিরক্তিকর ব্রাউজার পপআপ, `window.confirm`, `window.alert` বা ব্লকিং মোডাল নেই।
- সকল CRUD (যোগ, সম্পাদনা, বিস্তারিত) ডেডিকেটেড রাউট ও পেজে সম্পন্ন হয়।
- নিরাপদ অ্যাকশনের জন্য ইনলাইন ড্রপডাউন ও স্ট্যাকড রিচ টোস্ট ব্যবহার করা হয়েছে।

### ১০. থার্মাল প্রিন্টিং ও হার্ডওয়্যার বারকোড সাপোর্ট
- **৩টি প্রমিত ফরম্যাটে প্রিন্টিং**:
  - `58mm Thermal Receipt`
  - `80mm Thermal Receipt`
  - `A4 Full-Page Invoice Sheet`
- থার্মাল প্রিন্টে ঝাপসা হওয়া রোধে ক্রিস্প র ভেক্টর SVG বারকোড রেন্ডারিং।
- ইউএসবি/ওয়্যারলেস বারকোড স্ক্যানার অটো-এন্টার ও দ্রুত কিবোর্ড শর্টকাট (`Alt+K` সার্চ, `Enter` চেকআউট, দ্রুত ক্যাশ বাটন `+৳৫০`, `+৳১০০`, `+৳৫০০`, `+৳১০০০`)।

---

## 🔑 ডেমো লগইন ক্রেডেনশিয়াল (Demo Login Credentials)

| ভূমিকা (Role) | ইমেইল (Email) | পাসওয়ার্ড (Password) | সুবিধা (Permissions Scope) |
|---|---|---|---|
| **Super Admin** | `admin@israfilbd.com` | `password123` | ফুল সিস্টেম অ্যাক্সেস, রোল ব্যবস্থাপনা, সেটিংস, মডিউল নিয়ন্ত্রণ ও ব্যাকআপ |
| **Store Manager** | `manager@israfilbd.com` | `password123` | পণ্য, স্টক সমন্বয়, ক্রয়, খরচ ও আর্থিক রিপোর্ট |
| **Cashier** | `cashier@israfilbd.com` | `password123` | পিওএস টার্মিনাল বিক্রয়, ইনভয়েস প্রিন্ট ও ওয়াক-ইন কাস্টমার এন্ট্রি |

*(লগইন স্ক্রিনে থাকা দ্রুত ডেমো লগইন বাটন অথবা রোল-ভিত্তিক পাসওয়ার্ড `admin123`, `manager123`, `cashier123`-ও কাজ করবে)*

---

## 🛠️ প্রযুক্তি কাঠামো (Tech Stack)

- **Backend Engine**: PHP 8.2+ / Laravel 11 / Laravel Sanctum
- **Database Engine**: MariaDB 10.6+ / MySQL 8.0+ (অপ্টিমাইজড কম্পোজিট ইনডেক্স সহ)
- **Frontend SPA**: React 18 / Vite 5 / Tailwind CSS
- **State & Context**: Context API (Auth, Theme, Language, Toast, SystemModule)
- **Icons & Visualization**: Lucide React / Recharts
- **Fonts**: Hind Siliguri (বাংলা) + Inter (English)
- **Media Storage**: Google Drive Cloud Storage অথবা লোকাল পাবলিক ডিস্ক

---

## 🚀 দ্রুত সেটআপ নির্দেশিকা (Quick Setup & Run)

### ১. ডাটাবেজ তৈরি করুন
```bash
mysql -u root -p
CREATE DATABASE israfil_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### ২. ব্যাকএন্ড কনফিগারেশন (Backend Setup)
```bash
cd backend
cp .env.example .env
composer install --no-interaction --prefer-dist --optimize-autoloader
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```
> ব্যাকএন্ড বিস্তারিত নির্দেশিকার জন্য দেখুন: [backend/README.md](backend/README.md)

### ৩. ফ্রন্টএন্ড রান করা (Frontend Setup)
নতুন টার্মিনাল ট্যাবে:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
ব্রাউজারে ভিজিট করুন: **`http://localhost:5173`**

---

## 🧪 স্বয়ংক্রিয় টেস্ট ও প্রোডাকশন বিল্ড যাচাই

ব্যাকএন্ডে পিওএস চেকআউট, স্টক হ্রাস-বৃদ্ধি ও সিকিউরিটি টেস্ট চালাতে:
```bash
cd backend
php artisan test
```

ফ্রন্টএন্ড প্রোডাকশন বান্ডেল টেস্ট করতে:
```bash
cd frontend
npm run build
```

---

## 📁 প্রজেক্ট ডিরেক্টরি কাঠামো (Project Structure)

```
ISRAFIL-BD-SHOP/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Auth, POS, Product, Sale, SystemModule Controllers
│   │   ├── Models/                 # User, Product, Sale, SystemModule, Customer Models
│   │   └── Services/               # PosService, ReportService, GoogleDriveService
│   ├── database/
│   │   ├── migrations/             # 16 migration files (অপ্টিমাইজড ইনডেক্স সহ)
│   │   └── seeders/                # Production-ready real configurations
│   ├── routes/api.php              # 80+ secure RESTful API routes
│   ├── storage/logs/               # Laravel logs & client_errors.log
│   └── README.md                   # বিস্তারিত ব্যাকএন্ড এপিআই গাইড
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # ErrorBoundary, SectionMaintenanceScreen, BackButton
│   │   │   └── layout/             # Sidebar, TopNavbar, AppLayout, MaintenanceBanner
│   │   ├── context/                # Auth, Theme, Language, Toast, SystemModule
│   │   ├── locales/                # bn.js এবং en.js সম্পূর্ণ দ্বিভাষিক শব্দকোষ
│   │   ├── pages/                  # 38+ ডেডিকেটেড স্ক্রিন (Strictly NO Modals)
│   │   │   ├── accounting/         # Accounting Dashboard & Cash Flow
│   │   │   ├── auth/               # Login & Profile Settings
│   │   │   ├── customers/          # List, Add, Details & Due Collection
│   │   │   ├── dashboard/          # Analytics KPIs & 14-day Visual Trends
│   │   │   ├── employees/          # Staff list, Add/Edit & Activity Logs
│   │   │   ├── expenses/           # Expenses & Category Management
│   │   │   ├── inventory/          # Overview, Stock Adjustments, History
│   │   │   ├── pos/                # High-Speed POS Terminal & Thermal Prints
│   │   │   ├── products/           # CRUD, Measurement Value, Barcode & Units
│   │   │   ├── purchases/          # Purchases, Invoices, Payment history
│   │   │   ├── reports/            # Daily/Monthly/Yearly/Stock Valuation Reports
│   │   │   ├── sales/              # Invoices, Returns & Thermal Receipts
│   │   │   ├── settings/           # Shop Profile, Roles/RBAC, Module Controls, SQL Dump
│   │   │   └── suppliers/          # Suppliers, Ledgers & Payments
│   │   ├── services/api.js         # Axios interceptor with bearer auth & error reporting
│   │   ├── App.jsx                 # Full React Route Map with ErrorBoundary
│   │   └── main.jsx                # Root DOM Render
│   ├── vite.config.js              # Reverse proxy & vendor code splitting
│   └── tailwind.config.js          # Design system & dark mode tokens
│
└── README.md                       # মাস্টার প্রজেক্ট ডকুমেন্টেশন
```

---

## 📄 লাইসেন্স ও স্বত্বাধিকার (License & Copyright)
বাণিজ্যিক ব্যবহারের জন্য উন্মুক্ত (Commercial & Retail Ready).  
স্বত্বাধিকারী: **ইসরাফিল বিডি শপ (ISRAFIL BD SHOP)**.
