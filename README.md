# ISRAFIL BD SHOP – Premium POS & Shop Management System
> **ইসরাফিল বিডি শপ** – সম্পূর্ণ স্থানীয়, বাণিজ্যিক মানের পয়েন্ট অব সেল (POS) ও রিটেইল শপ ম্যানেজমেন্ট প্ল্যাটফর্ম।

![Tech Stack](https://img.shields.io/badge/Stack-Laravel%20%7C%20React%20%7C%20Tailwind%20%7C%20MySQL-indigo)
![Design Policy](https://img.shields.io/badge/UI%20Policy-Strictly%20NO%20Modals-emerald)
![Currency](https://img.shields.io/badge/Currency-BDT%20(%E0%A7%B3)-blue)
![Timezone](https://img.shields.io/badge/Timezone-Asia%2FDhaka-purple)

---

## 🌟 মূল বৈশিষ্ট্যসমূহ (Key Highlights)

1. **কঠোর নো-মডেল ডিজাইন পলিসি (Strict NO-Dialogs / NO-Modals Policy)**:
   - অ্যাপ্লিকেশনের কোথাও কোনো বিরক্তিকর পপআপ, `window.confirm`, `window.alert` বা ব্লকিং মোডাল ব্যবহার করা হয়নি।
   - সকল CRUD (যোগ, সম্পাদনা, বিস্তারিত) ডেডিকেটেড রাউট ও পেজে সম্পন্ন হয়।
   - ক্ষতিকর অ্যাকশনে ইনলাইন কনফার্মেশন ও স্ট্যাকড রিচ টোস্ট ব্যবহার করা হয়েছে।

2. **দ্বিভাষিক সমর্থন (Full Bilingual Support - Bangla & English)**:
   - ডিফল্ট ভাষা বাংলা (Bengali), সাথে এক ক্লিকে ইংরেজি রূপান্তরের সুবিধা।
   - বাংলা সংখ্যা রূপান্তর (`১২৩৪৫`), মুদ্রা প্রতীক (`৳`) ও ঢাকা টাইমজোন ফরম্যাটিং।

3. **হাই-স্পিড পিওএস টার্মিনাল (High-Speed POS Terminal)**:
   - ইউএসবি/ওয়্যারলেস বারকোড স্ক্যানার সাপোর্ট (অটো এন্টার হ্যান্ডলিং)।
   - ইনস্ট্যান্ট ক্যাটাগরি ফিল্টারিং ও প্রোডাক্ট গ্রিড।
   - মাল্টিপল পেমেন্ট মেথড (Cash, bKash, Nagad, Card) ও লাইভ ভাংতি হিসাব (Change Calculation)।
   - ৩ ধরনের ফরম্যাটে প্রিন্টিং: **58mm Thermal**, **80mm Thermal**, এবং **A4 Invoice Sheet**।

4. **নির্ভুল অ্যাকাউন্টিং ও COGS হিসাব (Accurate COGS & Financial Ledger)**:
   - প্রতিটি বিক্রয়ে পণ্যের গড় ক্রয়মূল্যের (COGS) স্ন্যাপশট সংরক্ষণ, যার ফলে মূল্য পরবর্তীতে পরিবর্তন হলেও অতীত লাভের হিসাব অবিকল থাকে।
   - ক্যাশ ফ্লো অডিট ট্রেইল (ক্যাশ ইন, ক্যাশ আউট, ড্রয়ার ব্যালেন্স)।
   - গ্রাহক বকেয়া (Customer Due) ও সরবরাহকারী দেনা (Supplier Payable) লেজার।

5. **রোবস্ট ইনভেন্টরি ও স্টক সমন্বয় (Inventory & Stock History)**:
   - স্টক আউট, ড্যামেজ ও মেয়াদোত্তীর্ণ সমন্বয় রেকর্ড।
   - লো-স্টক নোটিফিকেশন সিস্টেম।

6. **রোল ও পারমিশন ভিত্তিক নিরাপত্তা (RBAC Security)**:
   - ৩টি রোল: **Super Admin**, **Store Manager**, **Cashier**।
   - প্রতিটি অপারেশনের জন্য অ্যাক্টিভিটি অডিট লগ (IP address, Timestamp, User details সহ)।

---

## 🔑 ডেমো লগইন ক্রেডেনশিয়াল (Demo Login Credentials)

| ভূমিকা (Role) | ইমেইল (Email) | পাসওয়ার্ড (Password) | সুবিধা (Permissions) |
|---|---|---|---|
| **Super Admin** | `admin@israfilbd.com` | `password123` | ফুল সিস্টেম এক্সেস, সেটিংস, কর্মী ব্যবস্থাপনা ও ব্যাকআপ |
| **Store Manager** | `manager@israfilbd.com` | `password123` | পণ্য, স্টক, ক্রয়, খরচ ও রিপোর্ট পরিচালনা |
| **Cashier** | `cashier@israfilbd.com` | `password123` | পিওএস টার্মিনাল বিক্রয়, ইনভয়েস প্রিন্ট ও গ্রাহক এন্ট্রি |

*(লগইন স্ক্রিনে থাকা দ্রুত ডেমো লগইন বাটনে এক ক্লিকেই যেকোনো রোল দিয়ে টেস্ট করা যাবে)*

---

## 🛠️ প্রযুক্তি কাঠামো (Tech Stack)

- **Backend**: PHP 8.2+ / Laravel 11 / Laravel Sanctum
- **Database**: MariaDB / MySQL (25 Optimized Normalized Tables)
- **Frontend**: React 18 / Vite 5 / Tailwind CSS
- **Icons & Charts**: Lucide React / Recharts
- **Fonts**: Hind Siliguri (বাংলা) + Inter (English)
- **Routing**: React Router DOM (v6)

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
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve --port=8000
```

### ৩. ফ্রন্টএন্ড রান করা (Frontend Setup)
```bash
cd ../frontend
npm install
npm run dev
```
ব্রাউজারে ভিজিট করুন: **`http://localhost:5173`**

---

## 🧪 স্বয়ংক্রিয় টেস্ট ও যাচাইকরণ (Automated Verification)

সকল ফিচার টেস্ট চালাতে:
```bash
cd backend
php artisan test
```

ফ্রন্টএন্ড প্রোডাকশন বিল্ড যাচাই করতে:
```bash
cd frontend
npm run build
```

---

## 📁 প্রজেক্ট ডিরেক্টরি কাঠামো (Project Structure)

```
Israfill/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/   # 17 REST API Controllers
│   │   ├── Models/                 # 22 Eloquent Models with relationships
│   │   └── Services/               # PosService, ReportService, GoogleDriveService
│   ├── database/
│   │   ├── migrations/             # 10 migration files (25 tables)
│   │   └── seeders/                # Comprehensive retail demo seed data
│   ├── routes/api.php              # 78 secure RESTful API routes
│   └── tests/Feature/              # Automated API & transaction tests
│
├── frontend/
│   ├── src/
│   │   ├── components/layout/      # Sidebar, TopNavbar, AppLayout
│   │   ├── context/                # Auth, Theme, Language, Toast Providers
│   │   ├── locales/                # bn.js and en.js dictionaries
│   │   ├── pages/                  # 37 Dedicated Pages (Strictly NO Modals)
│   │   │   ├── accounting/         # Accounting Dashboard & Cash Flow
│   │   │   ├── auth/               # Login & Profile with Password Reset
│   │   │   ├── customers/          # List, Add, Details & Due Collection
│   │   │   ├── dashboard/          # Analytics KPIs, 14-day Charts
│   │   │   ├── employees/          # Staff list, Add/Edit & Activity Logs
│   │   │   ├── expenses/           # Expenses, Add & Category Management
│   │   │   ├── inventory/          # Overview, Stock Adjustments, History
│   │   │   ├── pos/                # POS Terminal, Barcode, Thermal Receipts
│   │   │   ├── products/           # CRUD, Barcode generator, Categories, Units
│   │   │   ├── purchases/          # Purchases, Invoices, Payment history
│   │   │   ├── reports/            # Daily/Monthly/Yearly/Valuation Reports
│   │   │   ├── sales/              # Invoices, Returns & Thermal Receipts
│   │   │   ├── settings/           # Shop Profile, Paper size & SQL Dump
│   │   │   └── suppliers/          # Suppliers, Ledgers & Payments
│   │   ├── services/api.js         # Axios interceptor with bearer auth
│   │   ├── App.jsx                 # Full React Route Map
│   │   └── main.jsx                # Root DOM Render
│   ├── vite.config.js              # Reverse proxy & vendor code splitting
│   └── tailwind.config.js          # Design system & tokens
└── rules.md                        # Master commercial project specifications
```

---

## 📄 লাইসেন্স (License)
বাণিজ্যিক ব্যবহারের জন্য উন্মুক্ত (Commercial & Retail Ready).
স্বত্বাধিকারী: **ইসরাফিল বিডি শপ (ISRAFIL BD SHOP)**.
