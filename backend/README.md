# ISRAFIL BD SHOP – Backend Architecture & Server Documentation
> **প্রিমিয়াম রিটেইল ও পিওএস (Point of Sale) শপ ম্যানেজমেন্ট প্ল্যাটফর্ম – ব্যাকএন্ড পূর্ণাঙ্গ নির্দেশিকা**  
> Developed with **Laravel 11 / 12**, **Laravel Sanctum**, **MariaDB / MySQL**, and **Google Drive Cloud Storage**.

---

## 📌 সূচিপত্র (Table of Contents)
1. [প্রজেক্ট ওভারভিউ (Project Overview)](#-প্রজেক্ট-ওভারভিউ-project-overview)
2. [নতুন ফিচার ও আর্কিটেকচারাল আপডেটসমূহ (Recent Key Features & Upgrades)](#-নতুন-ফিচার-ও-আর্কিটেকচারাল-আপডেটসমূহ)
3. [সিস্টেমের প্রয়োজনীয়তা (System Requirements)](#-সিস্টেমের-প্রয়োজনীয়তা-system-requirements)
4. [ধাপে ধাপে ইনস্টলেশন গাইড (Step-by-Step Installation)](#-ধাপে-ধাপে-ইনস্টলেশন-গাইড-step-by-step-installation)
5. [ডাটাবেস মাইগ্রেশন ও রিয়েল ডাটা সিডার (Database Migration & Seeding)](#-ডাটাবেস-মাইগ্রেশন-ও-রিয়েল-ডাটা-সিডার)
6. [ডিফল্ট স্টাফ লগইন ক্রেডেনশিয়াল (Default Staff Credentials)](#-ডিফল্ট-স্টাফ-লগইন-ক্রেডেনশিয়াল)
7. [সার্ভার রান ও ভেরিফিকেশন (Running the Server)](#-সার্ভার-রান-ও-ভেরিফিকেশন)
8. [সম্পূর্ণ RESTful API এন্ডপয়েন্ট রেফারেন্স (Full API Reference)](#-সম্পূর্ণ-restful-api-এন্ডপয়েন্ট-রেফারেন্স)
9. [হাই-কনকারেন্সি ও ১,০০০+ দৈনিক সেলস হ্যান্ডলিং (High-Scale Optimization)](#-হাই-কনকারেন্সি-ও-১০০০-দৈনিক-সেলস-হ্যান্ডলিং)
10. [সিস্টেম সেকশন রক্ষণাবেক্ষণ ও জিরো-ক্র্যাশ এরর লগিং (Maintenance & Error Logging)](#-সিস্টেম-সেকশন-রক্ষণাবেক্ষণ-ও-জিরো-ক্র্যাশ-এরর-লগিং)
11. [গুগল ড্রাইভ ও মিডিয়া হ্যান্ডলিং (Google Drive & Media Storage)](#-গুগল-ড্রাইভ-ও-মিডিয়া-হ্যান্ডলিং)
12. [অটোমেটেড টেস্ট রান করা (Running Automated Tests)](#-অটোমেটেড-টেস্ট-রান-করা)
13. [প্রোডাকশন ডেপ্লয়মেন্ট চেকলিস্ট (Production Deployment Guide)](#-প্রোডাকশন-ডেপ্লয়মেন্ট-চেকলিস্ট)
14. [সমস্যা সমাধান ও ট্রাবলশুটিং (Troubleshooting & FAQs)](#-সমস্যা-সমাধান-ও-ট্রাবলশুটিং)

---

## 🚀 প্রজেক্ট ওভারভিউ (Project Overview)

**ISRAFIL BD SHOP** ব্যাকএন্ড সম্পূর্ণ RESTful API আর্কিটেকচারে নির্মিত একটি বাণিজ্যিক মানের রিটেইল ও পিওএস ব্যাকএন্ড ইঞ্জিন। এটি বড় আকারের সুপার শপ, ডিপার্টমেন্টাল স্টোর এবং চেইন শপের দৈনিক উচ্চ লেনদেন (১,০০০+ দৈনিক ইনভয়েস) নির্বিঘ্নে পরিচালনা করার জন্য ডিজাইন করা হয়েছে।

### প্রধান প্রযুক্তিগত স্তম্ভসমূহ:
- **Zero Dummy Data Guarantee**: সিস্টেমে কোনো ডামি বা ফেক বিক্রয় অর্ডার নেই। ফ্রেশ ইন্সটলেশনে শুধু প্রয়োজনীয় কনফিগারেশন, রোলস ও প্রমিত পরিমাপ একক সিড হয়।
- **Role-Based Access Control (RBAC)**: সুপার অ্যাডমিন, ব্রাঞ্চ ম্যানেজার এবং ক্যাশিয়ার—৩টি স্ট্যান্ডার্ড রোল এবং ২০+ গ্র্যানুলার পারমিশন।
- **Strict Business Confidentiality**: ক্যাশিয়ারদের থেকে পাইকারি ক্রয় মূল্য (Cost Price) এবং ইউনিট প্রফিট মার্জিন সম্পূর্ণ সুরক্ষিত।
- **Zero-Crash Telemetry**: ফ্রন্টএন্ডে কোনো অপ্রত্যাশিত এরর হলে তা সরাসরি ব্যাকএন্ডে লগ হয় এবং সুপার অ্যাডমিনকে তাত্ক্ষণিকভাবে অ্যালার্ট করে।
- **Section Maintenance Engine**: যেকোনো মডিউল (POS, Products, Accounting, Reports ইত্যাদি) সুপার অ্যাডমিন রিয়েল-টাইমে মেইনটেন্যান্সে নিতে পারেন।

---

## 🌟 নতুন ফিচার ও আর্কিটেকচারাল আপডেটসমূহ

### ১. হাই-লোড স্কেলিং ও ১,০০০+ দৈনিক ইনভয়েস হ্যান্ডলিং
- **কম্পোজিট ইনডেক্সিং (`2026_11_06_000015_add_performance_indexes_for_scale.php`)**: `sales`, `sale_items`, `customers`, `products`, `transactions` এবং `stock_movements` টেবিলে মাল্টি-কলাম ইনডেক্স যুক্ত করা হয়েছে। ফলে লক্ষাধিক রেকর্ডেও কুয়েরি মিলি-সেকেন্ডে সম্পন্ন হয়।
- **অ্যাটমিক দৈনিক ইনভয়েস সিকোয়েন্স**: একাধিক কাউন্টারে একসাথে চেকআউট হলেও ইনভয়েস নম্বর ডুপ্লিকেট হয় না (`INV-YYYYMMDD-XXXX`)।
- **ফাস্ট প্রিফিক্স কাস্টমার সার্চ**: পিওএস টার্মিনালে মোবাইল নম্বরের প্রথম ৩-৪ ডিজিট টাইপ করতেই গ্রাহকের নাম ও পূর্বের বকেয়া চলে আসে।

### ২. জিরো-ক্র্যাশ রেজিলিয়েন্স ও ক্লায়েন্ট এরর সেন্ট্রাল লগিং
- ফ্রন্টএন্ডে রিয়্যাক্ট `ErrorBoundary` যুক্ত করা হয়েছে, যা কোনো আনহ্যান্ডেলড জাভাস্ক্রিপ্ট এরর হলে ব্ল্যাংক স্ক্রিন হওয়া রোধ করে।
- ব্যাকএন্ড এন্ডপয়েন্ট `POST /api/system/report-error` এ স্বয়ংক্রিয়ভাবে ক্লায়েন্ট এরর রিপোর্ট জমা হয়।
- এররগুলো `backend/storage/logs/client_errors.log` এবং ক্যাশে সংরক্ষিত থাকে, যা সুপার অ্যাডমিন সেটিংস থেকে সরাসরি দেখতে ও ক্লিয়ার করতে পারেন।

### ৩. সেকশন মেইনটেন্যান্স মোড (Section Maintenance Mode)
- সুপার অ্যাডমিন যেকোনো মডিউলকে রিয়েল-টাইমে রক্ষণাবেক্ষণ মোডে নিতে পারেন (`POST /api/system/modules/toggle`)।
- সাধারণ ব্যবহারকারী বা ক্যাশিয়ার ওই সেকশনে প্রবেশ করলে *"This section will be back for maintenance / রক্ষণাবেক্ষণের জন্য সাময়িকভাবে বন্ধ আছে"* নোটিশ দেখতে পায়।
- সুপার অ্যাডমিনদের জন্য থাকে "Developer Preview Active" ফ্লোটিং ব্যানার, যার মাধ্যমে তারা লাইভ সিস্টেমে টেস্ট ও ডেভেলপ করতে পারেন।

### ৪. সুপার শপ প্রাইজ কনফিডেনশিয়ালিটি (Wholesale Cost Protection)
- ক্যাশিয়াররা (`role: cashier`) প্রোডাক্ট লিস্ট বা প্রোডাক্ট ডিটেইলসে কোনো পাইকারি ক্রয় মূল্য (Cost Price) বা প্রত্যাশিত লাভ (Profit Margin) দেখতে পাবে না।
- শুধুমাত্র সুপার অ্যাডমিন এবং যেসব ম্যানেজারের `purchases.view` বা `reports.view` পারমিশন রয়েছে তারা ক্রয় মূল্য দেখতে পাবেন।
- ক্যাশিয়ারদের জন্য প্রোডাক্ট যোগ, এডিট, ডিলিট এবং বাল্ক ডিলিট অ্যাকশন স্বয়ংক্রিয়ভাবে বন্ধ থাকে।

### ৫. প্রোডাক্ট পরিমাপের মান (Measurement Value) ও স্টকের পার্থক্য
- প্রতি প্যাকেটের নেট ওজন/পরিমাপ (`measurement_value`, যেমন: ১০০ গ্রাম মাখন) এবং দোকানে মোট মজুত সংখ্যা (`current_stock`, যেমন: ৫০ পিস) আলাদা আর্কিটেকচারে রাখা হয়েছে।
- টেবিলের ক্যাটাগরির পাশে ডেডিকেটেড `পরিমাপ (Qnty)` কলাম প্রদর্শিত হয়।
- সুপার অ্যাডমিন ক্যাটাগরি, ব্র্যান্ড ও ইউনিট ডিলিট করতে পারবেন; প্রডাক্ট নষ্ট না হয়ে রিলেশনশিপ নিরাপদে হ্যান্ডেল হয় (Nullable Foreign Keys)।

### ৬. ভিআইপি লয়্যালটি পয়েন্টস ইঞ্জিন (VIP Loyalty Points)
- প্রতি ১০০ টাকার কেনাকাটায় পয়েন্ট জমা এবং পিওএস চেকআউটে ইনস্ট্যান্ট রিডেম্পশন (যেমন: ১০০ পয়েন্ট = ৳৭৫ ছাড়)।
- কাস্টমার লেজারে স্বয়ংক্রিয় পয়েন্ট ব্যালেন্স ও ট্রানজেকশন হিস্ট্রি ট্র্যাকিং।

### ৭. ভিজ্যুয়াল রোল ও পারমিশন ম্যানেজমেন্ট (RBAC GUI)
- সুপার অ্যাডমিন সরাসরি ইউআই থেকে নতুন রোল তৈরি ও পারমিশন টগল করতে পারবেন (`/roles`, `/permissions`)।
- ফাইনান্সিয়াল প্রোটেকশন: যেসব কাস্টমার বা সাপ্লায়ারের বকেয়া ব্যালেন্স বা সেলস হিস্ট্রি আছে, তাদের শুধুমাত্র সুপার অ্যাডমিন ডিলিট করতে পারবেন (ম্যানেজারদের রেস্ট্রিক্ট করা হয়েছে)।

### ৮. ডাইনামিক ফর্ম বিল্ডার, কিউআর কোড ও কাস্টমার রেজিস্ট্রেশন অনুমোদন (Customer Registration Engine)
- **সুপার অ্যাডমিন ডাইনামিক ফর্ম বিল্ডার (`/customers/form-builder`)**: সুপার অ্যাডমিন ড্র্যাগ/ড্রপ স্টাইলে ফর্মের ফিল্ডগুলো অন/অফ করতে পারেন, বাধ্যতামূলক/ঐচ্ছিক নির্ধারণ করতে পারেন এবং নতুন কাস্টম প্রশ্ন/ফিল্ড (Text, Select, Date, Number ইত্যাদি) যোগ করতে পারেন।
- **হাই-রেজোলিউশন QR কোড ও প্রিন্ট-রেডি স্ট্যান্ডি**: মেম্বারশিপ প্রোগ্রামের জন্য স্বয়ংক্রিয় QR কোড জেনারেট হয়, মাঝখানে দোকানের লোগো বসে এবং কাউন্টারে রাখার জন্য ১-ক্লিকে সুন্দর টেবিলটপ স্ট্যান্ডি/ফ্লায়ার প্রিন্ট করা যায়।
- **পাবলিক মোবাইল রেজিস্ট্রেশন পেজ (`/join-customer`)**: গ্রাহকরা মোবাইলে QR কোড স্ক্যান করে সরাসরি আবেদনপত্র পূরণ করতে পারেন।
- **রেজিস্ট্রেশন অনুমোদন ব্যবস্থা (`/customers/approvals`)**: সুপার অ্যাডমিন বা ম্যানেজার এক ক্লিকে একক বা বাল্ক অনুমোদন দিয়ে সরাসরি কাস্টমার প্রোফাইল তৈরি করতে পারেন এবং গ্রাহকের অ্যাকাউন্টে ওয়েলকাম বোনাস পয়েন্ট (যেমন: ৫০ বা ১০০ পয়েন্ট) ক্রেডিট করতে পারেন।

---

## 💻 সিস্টেমের প্রয়োজনীয়তা (System Requirements)

সার্ভারে বা লোকাল মেশিনে নিশ্চিত করুন:
- **PHP**: `^8.2` অথবা `^8.3`
- **Composer**: `^2.5`
- **Database**: `MySQL 8.0+` অথবা `MariaDB 10.6+`
- **প্রয়োজনীয় PHP এক্সটেনশনসমূহ**:
  - `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `curl`, `gd` বা `imagick`
- **Node.js**: `^18.0` (ফ্রন্টএন্ড বিল্ডের জন্য)

---

## 🛠️ ধাপে ধাপে ইনস্টলেশন গাইড (Step-by-Step Installation)

### ধাপ ১: প্রজেক্ট ক্লোন ও ব্যাকএন্ড ফোল্ডারে প্রবেশ
```bash
git clone https://github.com/Maharab2134/ISRAFIL-BD-SHOP.git
cd ISRAFIL-BD-SHOP/backend
```

### ধাপ ২: কম্পোজার ডিপেন্ডেন্সি ইনস্টলেশন
```bash
composer install --no-interaction --prefer-dist --optimize-autoloader
```

### ধাপ ৩: এনভায়রনমেন্ট কনফিগারেশন (`.env`)
ডিফল্ট টেমপ্লেট থেকে `.env` তৈরি করুন:
```bash
cp .env.example .env
```

আপনার `.env` ফাইলে ডাটাবেস ও ইউআরএল সংক্রান্ত তথ্য আপডেট করুন:
```env
APP_NAME="ISRAFIL BD SHOP"
APP_ENV=local
APP_DEBUG=true
APP_TIMEZONE=Asia/Dhaka
APP_URL=http://localhost:8000

# ডাটাবেস কনফিগারেশন
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=israfil_shop
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# লিনাক্সে ইউনিক্স সকেট ব্যবহার করলে (যেমন: MariaDB):
# DB_SOCKET=/run/mysqld/mysqld.sock

# সেশন ও ক্যাশ ড্রাইভার
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# ফ্রন্টএন্ড SPA ইউআরএল ও কর্স (CORS / Sanctum)
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
FRONTEND_URL=http://localhost:5173

# গুগল ড্রাইভ ক্লাউড স্টোরেজ (ঐচ্ছিক)
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_DRIVE_ACCESS_TOKEN=
GOOGLE_DRIVE_API_KEY=
```

### ধাপ ৪: অ্যাপলিকেশন সিক্রেট কি তৈরি
```bash
php artisan key:generate
```

### ধাপ ৫: ডাটাবেস তৈরি করুন
টার্মিনালে MySQL/MariaDB ক্লায়েন্টে প্রবেশ করে ডাটাবেস তৈরি করুন:
```sql
CREATE DATABASE israfil_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### ধাপ ৬: স্টোরেজ সিমলিংক তৈরি
প্রোডাক্ট ও ইউজার প্রোফাইলের ছবি সরাসরি পাবলিক ব্রাউজারে রেন্ডার করার জন্য সিমলিংক বানান:
```bash
php artisan storage:link
```

---

## 📦 ডাটাবেস মাইগ্রেশন ও রিয়েল ডাটা সিডার

ডাটাবেস মাইগ্রেশন রান করে রিয়েল প্রোডাকশন কনফিগারেশন সিড করুন:

```bash
php artisan migrate:fresh --seed
```

> **সতর্কতা:** এই সিডারে কোনো ডামি বা নকল পণ্য ঢোকানো হয় না। এটি একটি ফুল প্রোডাকশন রেডি সেটআপ যাতে নিচের কনফিগারেশনগুলো লোড হয়:

### সিডারে যা যা অন্তর্ভুক্ত থাকে:
1. **২০+ সিস্টেম পারমিশন**:
   - `pos.access`, `products.view`, `products.create`, `products.edit`, `products.delete`, `purchases.view`, `sales.view`, `reports.view`, `settings.manage` ইত্যাদি।
2. **৩টি স্ট্যান্ডার্ড রোল**:
   - `super-admin`: সর্বময় ক্ষমতা ও সিস্টেম রক্ষণাবেক্ষণ।
   - `manager`: ইনভেন্টরি, পারচেজ, সেলস, কাস্টমার, সাপ্লায়ার ও রিপোর্ট।
   - `cashier`: পিওএস টার্মিনাল, রসিদ প্রিন্ট ও বিক্রয় হিস্ট্রি।
3. **৩টি অ্যাক্টিভ অফিসিয়াল স্টাফ অ্যাকাউন্ট**:
   - সুপার অ্যাডমিন, ব্রাঞ্চ ম্যানেজার এবং ক্যাশিয়ার।
4. **প্রমিত পরিমাপের একক (Measurement Units)**:
   - `pcs` (পিস), `kg` (কেজি), `gm` (গ্রাম), `pkt` (প্যাকেট), `box` (বক্স), `ltr` (লিটার), `dzn` (ডজন)।
5. **৮টি নিয়মিত খরচের খাত (Expense Categories)**:
   - দোকান ভাড়া, বিদ্যুৎ ও ইউটিলিটি, কর্মচারীর বেতন, পরিবহন, ইন্টারনেট, আপ্যায়ন, মেরামত, বিবিধ।
6. **ডিফল্ট ওয়াক-ইন কাস্টমার**:
   - নাম: `ওয়াক-ইন কাস্টমার (Walk-in Customer)`, ফোন: `01700000000`।
7. **দোকান ও পিওএস সেটিংস**:
   - কারেন্সি সিম্বল: `৳` (BDT), টাইমজোন: `Asia/Dhaka`, ডিফল্ট প্রিন্টার ফরম্যাট: `80mm Thermal`।

---

## 🔑 ডিফল্ট স্টাফ লগইন ক্রেডেনশিয়াল

সিস্টেম সিড করার পর আপনি নিচের ক্রেডেনশিয়ালগুলো দিয়ে লগইন করতে পারবেন:

| ভূমিকা (Role) | ইমেইল (Email) | পাসওয়ার্ড (Password) | অনুমতি পরিধি (Access Scope) |
|---|---|---|---|
| **Super Admin** | `admin@israfilbd.com` | `password123` | ফুল সিস্টেম, রোলস, সেটিংস, ব্যাকআপ, মডিউল নিয়ন্ত্রণ |
| **Store Manager** | `manager@israfilbd.com` | `password123` | পণ্য, স্টক সমন্বয়, ক্রয়, খরচ ও রিপোর্ট |
| **Cashier** | `cashier@israfilbd.com` | `password123` | পিওএস টার্মিনাল বিক্রয়, কাস্টমার এন্ট্রি, ইনভয়েস প্রিন্ট |

*(সিস্টেমে সুবিধার্থে রোল-ভিত্তিক পাসওয়ার্ড `admin123`, `manager123`, `cashier123`-ও কাজ করবে)*

---

## ⚡ সার্ভার রান ও ভেরিফিকেশন

### ১. ব্যাকএন্ড এপিআই সার্ভার রান করুন
```bash
php artisan serve --host=127.0.0.1 --port=8000
```
সার্ভার চালু হলে এন্ডপয়েন্ট বেস ইউআরএল হবে: `http://127.0.0.1:8000/api`

### ২. ফ্রন্টএন্ড রান করুন
আলাদা টার্মিনাল উইন্ডোতে:
```bash
cd ../frontend
npm install
npm run dev
```
ব্রাউজারে ভিজিট করুন: **`http://localhost:5173`**

---

## 📡 সম্পূর্ণ RESTful API এন্ডপয়েন্ট রেফারেন্স

সবগুলো রুট `routes/api.php` ফাইলে সংরক্ষিত এবং Laravel Sanctum টোকেন দিয়ে সুরক্ষিত:

### ১. অথেনটিকেশন ও প্রোফাইল (Auth)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/login` | ইউজার ক্রেডেনশিয়াল যাচাই ও বেয়ারার টোকেন প্রদান |
| `POST` | `/api/logout` | সক্রিয় সেশন ও টোকেন বাতিল |
| `GET` | `/api/me` | বর্তমান লগইনকৃত ইউজারের ডাটা ও পারমিশন লিস্ট |
| `PUT` | `/api/profile` | নাম, ফোন ও প্রোফাইল তথ্য আপডেট |
| `PUT` | `/api/change-password` | পাসওয়ার্ড পরিবর্তন |

### ২. পিওএস টার্মিনাল ও বিক্রয় (POS & Sales)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/pos/data` | পিওএস গ্রিডের জন্য পণ্য, ক্যাটাগরি ও কাস্টমার তালিকা |
| `POST` | `/api/pos/checkout` | রিয়েল-টাইম স্টক হ্রাস, লয়্যালটি পয়েন্টস সহ সেলস কমপ্লিট |
| `GET` | `/api/sales` | সম্পূর্ণ বিক্রয় ইনভয়েস তালিকা ফিল্টার ও সার্চ সহ |
| `GET` | `/api/sales/{id}` | একক ইনভয়েসের পূর্ণ বিবরণ ও আইটেম লিস্ট |
| `POST` | `/api/sales/{id}/return` | আংশিক বা পূর্ণ বিক্রয় রিটার্ন ও রিফান্ড সমন্বয় |
| `GET` | `/api/sales-returns` | রিটার্নকৃত পণ্যের তালিকা |

### ৩. পণ্য ও ইনভেন্টরি (Products & Inventory)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | পণ্য তালিকা (ক্যাশিয়ারদের জন্য ক্রয়মূল্য হাইড) |
| `POST` | `/api/products` | নতুন পণ্য তৈরি (Measurement Value সহ) |
| `GET` | `/api/products/{id}` | একক পণ্যের বিস্তারিত |
| `POST` | `/api/products/{id}` | পণ্য সম্পাদনা ও ইমেজ আপডেট |
| `DELETE` | `/api/products/{id}` | পণ্য মুছে ফেলা |
| `POST` | `/api/products/bulk-delete` | একাধিক নির্বাচিত পণ্য একসাথে মুছে ফেলা |
| `GET` | `/api/products/barcode/{barcode}` | বারকোড স্ক্যানার দিয়ে পণ্য অনুসন্ধান |
| `POST` | `/api/products/import-json` | জিরো-পারসিস্টেন্স বাল্ক JSON পণ্য ইমপোর্ট |
| `GET` | `/api/inventory/overview` | লো-স্টক, মোট ইনভেন্টরি মূল্য ও স্টক পরিসংখ্যান |
| `POST` | `/api/inventory/adjust` | স্টক ড্যামেজ/ঘাটতি/বৃদ্ধির সমন্বয় |
| `GET` | `/api/inventory/history` | প্রতিটি পণ্যের স্টক মুভমেন্ট লগ |

### ৪. ক্যাটাগরি, ব্র্যান্ড ও ইউনিট
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | সকল ক্যাটাগরি ও পণ্য সংখ্যা |
| `POST` | `/api/categories` | নতুন ক্যাটাগরি তৈরি |
| `POST` | `/api/categories/bulk-delete` | একাধিক ক্যাটাগরি বাল্ক ডিলিট |
| `GET` | `/api/brands` | ব্র্যান্ড তালিকা |
| `POST` | `/api/brands` | ব্র্যান্ড তৈরি |
| `GET` | `/api/units` | পরিমাপের ইউনিটসমূহ (কেজি, গ্রাম, লিটার ইত্যাদি) |
| `POST` | `/api/units` | নতুন ইউনিট যোগ |
| `DELETE` | `/api/units/{id}` | সুপার অ্যাডমিন কর্তৃক ইউনিট ডিলিট |

### ৫. ক্রয় ও সাপ্লায়ার (Purchases & Suppliers)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/purchases` | ক্রয়ের তালিকা ও পেমেন্ট স্ট্যাটাস |
| `POST` | `/api/purchases` | নতুন চালান এন্ট্রি ও স্টক বৃদ্ধি |
| `GET` | `/api/purchases/{id}` | চালানের বিস্তারিত বিবরণ |
| `GET` | `/api/suppliers` | সরবরাহকারী তালিকা ও মোট দেনা |
| `POST` | `/api/suppliers` | নতুন সরবরাহকারী যোগ |
| `POST` | `/api/suppliers/{id}/payment` | সরবরাহকারীকে বকেয়া বিল পরিশোধ |
| `DELETE` | `/api/suppliers/{id}` | সরবরাহকারী ডিলিট (সুপার অ্যাডমিন সুরক্ষাসহ) |

### ৬. কাস্টমার ও লয়্যালটি লেজার (Customers)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | গ্রাহক তালিকা, মোট বকেয়া ও লয়্যালটি পয়েন্টস |
| `POST` | `/api/customers` | নতুন কাস্টমার এন্ট্রি |
| `GET` | `/api/customers/{id}` | কাস্টমার প্রোফাইল, ক্রয় খতিয়ান ও লেজার |
| `PUT` | `/api/customers/{id}` | গ্রাহক তথ্য আপডেট |
| `POST` | `/api/customers/{id}/payment` | গ্রাহকের কাছ থেকে বকেয়া টাকা কালেকশন |
| `DELETE` | `/api/customers/{id}` | কাস্টমার ডিলিট (বকেয়া থাকলে শুধু সুপার অ্যাডমিন) |

### ৭. খরচের হিসাব (Expenses)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | খরচের তালিকা ও ভাউচার |
| `POST` | `/api/expenses` | নতুন খরচ এন্ট্রি |
| `GET` | `/api/expense-categories` | খরচের খাতসমূহ |
| `POST` | `/api/expense-categories` | নতুন খরচের খাত যোগ |

### ৮. অ্যাকাউন্টিং ও আর্থিক রিপোর্ট (Accounting & Reports)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/accounting/summary` | মোট নগদ ক্যাশ, মোট আয়, ব্যয় ও নেট মুনাফা |
| `GET` | `/api/accounting/cash-flow` | দৈনিক ক্যাশ-ইন ও ক্যাশ-আউটের অডিট ট্রেইল |
| `GET` | `/api/accounting/customer-due` | সকল বকেয়াদার গ্রাহকদের তালিকা |
| `GET` | `/api/accounting/supplier-due` | সকল পাওনাদার সরবরাহকারীদের তালিকা |
| `GET` | `/api/reports/daily` | আজকের বিক্রয়, মোট লাভ ও খরচের বিবরণ |
| `GET` | `/api/reports/monthly` | মাসিক আর্থিক পর্যালোচনা |
| `GET` | `/api/reports/yearly` | বাৎসরিক আয়-ব্যয় তুলনা |
| `GET` | `/api/reports/products` | শীর্ষ বিক্রিত পণ্য ও স্টক টার্নওভার রিপোর্ট |
| `GET` | `/api/reports/stock` | ইনভেন্টরি স্টক মূল্যায়ন রিপোর্ট |

### ৯. সিস্টেম সেকশন মেইনটেন্যান্স ও এরর টেলিমেট্রি (System Resilience)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/system/modules` | সকল সেকশনের বর্তমান অবস্থা (Active/Maintenance) |
| `POST` | `/api/system/modules/toggle` | সুপার অ্যাডমিন কর্তৃক যেকোনো সেকশন অন/অফ |
| `POST` | `/api/system/report-error` | ক্লায়েন্ট ক্র্যাশ এরর স্বয়ংক্রিয়ভাবে ব্যাকএন্ডে রিপোর্ট |
| `POST` | `/api/system/errors/clear` | সংরক্ষিত এরর লগ মুছে ফেলা |

### ১০. ভূমিকা, কর্মী ও অডিট লগ (Roles & Employees)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/roles` | সকল ভূমিকা ও অনুমোদিত পারমিশন |
| `POST` | `/api/roles` | নতুন কাস্টম ভূমিকা তৈরি |
| `PUT` | `/api/roles/{id}/permissions` | ভূমিকার পারমিশনসমূহ আপডেট |
| `GET` | `/api/permissions` | ২০+ গ্র্যানুলার সিস্টেম পারমিশনের তালিকা |
| `GET` | `/api/employees` | স্টাফ ও ক্যাশিয়ারদের তালিকা |
| `POST` | `/api/employees` | নতুন কর্মী নিয়োগ ও ভূমিকা নির্ধারণ |
| `GET` | `/api/activity-logs` | নিরাপত্তা অডিট ট্রেইল (IP, টাইম ও ইউজার অ্যাকশন) |

### ১১. সেটিংস ও ব্যাকআপ (Settings & Database)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | দোকানের প্রোফাইল ও প্রিন্টার কনফিগারেশন |
| `POST` | `/api/settings` | দোকানের নাম, ঠিকানা, ভ্যাট ও সেটিংস সংরক্ষণ |
| `POST` | `/api/settings/logo` | দোকানের ইনভয়েস লোগো আপলোড |
| `GET` | `/api/settings/backup` | এক ক্লিকে সম্পূর্ণ ডাটাবেসের SQL ডাম্প ডাউনলোড |
| `GET` | `/api/settings/database/stats` | ডাটাবেস টেবিল ও রেকর্ডের সাইজ বিশ্লেষণ |
| `POST` | `/api/settings/database/clear` | সুপার অ্যাডমিন কর্তৃক ট্রানজেকশন রিসেট |

### ১২. কাস্টমার রেজিস্ট্রেশন, ফর্ম বিল্ডার ও অনুমোদন (Customer Registration Engine)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customer-registration/form` | পাবলিক রেজিস্ট্রেশন ফর্ম ও দোকানের ব্র্যান্ডিং তথ্য |
| `POST` | `/api/customer-registration/submit` | কিউআর স্ক্যান করে গ্রাহকের নতুন আবেদন সাবমিশন |
| `GET` | `/api/customer-registration/admin/form` | ফর্ম বিল্ডারের বর্তমান কনফিগারেশন লোড (অ্যাডমিন) |
| `PUT` | `/api/customer-registration/admin/form` | ডাইনামিক ফিল্ড, ওয়েলকাম পয়েন্ট ও থিম আপডেট |
| `GET` | `/api/customer-registration/admin/requests` | অপেক্ষমান, অনুমোদিত ও বাতিল আবেদনের তালিকা ও কাউন্টার |
| `GET` | `/api/customer-registration/admin/requests/{id}` | একক আবেদনের পূর্ণাঙ্গ বিবরণ ও কাস্টম ফিল্ড ডাটা |
| `POST` | `/api/customer-registration/admin/requests/{id}/approve` | আবেদন অনুমোদন ও স্বয়ংক্রিয় কাস্টমার তৈরি + পয়েন্ট ক্রেডিট |
| `POST` | `/api/customer-registration/admin/requests/{id}/reject` | আবেদন বাতিল ও কারণ প্রদর্শন |
| `POST` | `/api/customer-registration/admin/requests/bulk-approve` | একাধিক নির্বাচিত আবেদন এক ক্লিকে বাল্ক অনুমোদন |
| `POST` | `/api/customer-registration/admin/requests/bulk-reject` | একাধিক নির্বাচিত আবেদন বাল্ক বাতিল |

---

## 📈 হাই-কনকারেন্সি ও ১,০০০+ দৈনিক সেলস হ্যান্ডলিং

সিস্টেমটি উচ্চ ট্রাফিকের দিনে কোনো ধরনের হ্যাং বা স্লোনেস ছাড়াই কাজ করতে পারে:
1. **মাল্টি-কলাম ইনডেক্সিং**:
   - `sales` টেবিলে `(sale_date, created_at)` এবং `(customer_id, sale_date)` ইনডেক্স।
   - `sale_items` টেবিলে `(sale_id, product_id)` ইনডেক্স।
   - `customers` টেবিলে `(phone)` ইনডেক্স।
   - `products` টেবিলে `(barcode)` ও `(category_id, status)` ইনডেক্স।
2. **অ্যাটমিক ট্রানজেকশন ও রো-লেভেল লকিং**:
   - পিওএস চেকআউটের সময় `DB::transaction()` এবং `lockForUpdate()` ব্যবহার করে ইনভেন্টরি স্টক হ্রাস নিশ্চিত করা হয়, যার ফলে নেগেটিভ স্টক বা রেস কন্ডিশনের সুযোগ নেই।
3. **প্যারালাল কাউন্টার সাপোর্ট**:
   - একাধিক ক্যাশিয়ার একসাথে সেল সম্পন্ন করলেও ইনভয়েস নাম্বার জেনারেশন লকড থাকে, কোনো নম্বর ডুপ্লিকেট হয় না।

---

## 🛡️ সিস্টেম সেকশন রক্ষণাবেক্ষণ ও জিরো-ক্র্যাশ এরর লগিং

### সেকশন মেইনটেন্যান্স মেকানিজম:
সুপার অ্যাডমিন যখন কোনো নির্দিষ্ট সেকশনে নতুন ফিচার বা কোড আপডেট করতে চান, তিনি সেটিকে নিষ্ক্রিয় করতে পারেন:
```json
// POST /api/system/modules/toggle
{
  "module": "pos",
  "is_active": false
}
```
- সাথে সাথে ক্যাশিয়ারদের জন্য পিওএস লক হয়ে যাবে এবং মেইনটেন্যান্স স্ক্রিন ভেসে উঠবে।
- সুপার অ্যাডমিনদের অ্যাকাউন্টে একটি অ্যাম্বার ব্যানার প্রদর্শিত হবে: `"Developer Preview Active – You are previewing in maintenance mode"`। ফলে সাধারণ ব্যবহারকারীদের বিঘ্ন না ঘটিয়ে সুপার অ্যাডমিন লাইভ টেস্ট করতে পারবেন।

### ক্লায়েন্ট এরর সেন্ট্রাল ট্র্যাকিং:
- ফ্রন্টএন্ডে যেকোনো জাভাস্ক্রিপ্ট ত্রুটি ঘটলে তা ক্যাচ করে সাথে সাথে ব্যাকএন্ডের `POST /api/system/report-error` এ পাঠিয়ে দেওয়া হয়।
- রিপোর্টটি `storage/logs/client_errors.log` ফাইলে টাইমস্ট্যাম্প সহ জমা থাকে এবং সুপার অ্যাডমিন টপ নেভবারে তাৎক্ষণিক অ্যালার্ট পাবেন।

---

## ☁️ গুগল ড্রাইভ ও মিডিয়া হ্যান্ডলিং

সিস্টেমটি লোকাল ফাইল সিস্টেম এবং ক্লাউড স্টোরেজ দুটোই নির্বিঘ্নে সাপোর্ট করে:
- `.env` ফাইলে `GOOGLE_DRIVE_FOLDER_ID` সেট থাকলে প্রোডাক্ট আপলোডের ছবি স্বয়ংক্রিয়ভাবে গুগল ড্রাইভে আপলোড হবে।
- যদি গুগল ড্রাইভ কনফিগারেশন খালি থাকে, কোনো এরর না দিয়ে সিস্টেম স্বয়ংক্রিয়ভাবে লোকাল ডিস্ক `storage/app/public/products` এ ছবি সংরক্ষণ করবে।
- ফ্রন্টএন্ডের জন্য সার্বজনীন ইমেজ ইউটিলিটি যেকোনো এক্সটার্নাল URL (Cloudinary, Imgur, ড্রাইভ ইত্যাদি) এবং লোকাল স্টোরেজ পাথ স্বয়ংক্রিয়ভাবে ডিটেক্ট ও রেন্ডার করে।

---

## 🧪 অটোমেটেড টেস্ট রান করা

ব্যাকএন্ডে পিওএস চেকআউট, স্টক হ্রাস-বৃদ্ধি, বারকোড স্ক্যানিং, রোল পারমিশন এবং কাস্টমার ব্যালেন্স যাচাইয়ের জন্য ফিচার টেস্ট রয়েছে:

```bash
# আর্টিসান টেস্ট রানার দিয়ে
php artisan test

# শুধুমাত্র পিওএস ও কোর শপ এপিআই ফিচার টেস্ট চালাতে
./vendor/bin/phpunit tests/Feature/IsrafilShopApiTest.php
```

---

## 🚀 প্রোডাকশন ডেপ্লয়মেন্ট চেকলিস্ট

লাইভ সার্ভারে (Ubuntu/Debian, Nginx, PHP 8.2-FPM) ডেপ্লয় করার সময় নিচের নির্দেশিকা অনুসরণ করুন:

### ১. পারমিশন ঠিক করুন
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### ২. ক্যাশিং অপ্টিমাইজেশন
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### ৩. এনভায়রনমেন্ট প্রোডাকশন সেট করুন
```env
APP_ENV=production
APP_DEBUG=false
```

### ৪. Nginx কনফিগারেশন নমুনা
```nginx
server {
    listen 80;
    server_name api.yourshop.com;
    root /var/www/ISRAFIL-BD-SHOP/backend/public;

    index index.php;
    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

---

## ❓ সমস্যা সমাধান ও ট্রাবলশুটিং (Troubleshooting & FAQs)

| সমস্যা (Problem) | কারণ (Cause) | সমাধান (Solution) |
|---|---|---|
| `SQLSTATE[HY000] [2002] Connection refused` | MySQL সার্ভার বন্ধ বা পোর্ট অমিল | MySQL সার্ভিস চালু করুন (`sudo systemctl start mysql`) এবং `.env` চেক করুন। |
| `SQLSTATE[HY000] [2002] No such file or directory` | ইউনিক্স সকেট পাথ মিসিং | `.env` ফাইলে `DB_SOCKET=/run/mysqld/mysqld.sock` যোগ করুন বা `DB_HOST=127.0.0.1` ব্যবহার করুন। |
| ছবি লোড হচ্ছে না (Broken Images) | সিমলিংক তৈরি করা হয়নি | `php artisan storage:link` কমান্ডটি রান করুন। |
| `CORS Error / 419 CSRF Token Mismatch` | Sanctum ডোমেইন অমিল | `.env` ফাইলে `SANCTUM_STATEFUL_DOMAINS` এবং `FRONTEND_URL` সঠিক পোর্টে সেট করুন। |
| ক্লায়েন্ট এরর লগ দেখতে চান | ব্রাউজার ক্র্যাশ ট্রেস | `cat storage/logs/client_errors.log` দেখুন অথবা শপ সেটিংস প্যানেল দেখুন। |

---

## 📞 সাপোর্ট ও সার্বিক তথ্য
- **প্রজেক্ট**: ইসরাফিল বিডি শপ (ISRAFIL BD SHOP)
- **লাইসেন্স**: Commercial Retail & Super Shop POS Management Platform
- **যোগাযোগ**: `admin@israfilbd.com`
