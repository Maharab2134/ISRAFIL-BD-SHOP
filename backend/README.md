# Israfil BD Shop - Backend API & Server Documentation
> **প্রিমিয়াম রিটেইল ও পিওএস (Point of Sale) ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম - ব্যাকএন্ড গাইড**  
> Developed with **Laravel 11 / 12**, **Laravel Sanctum**, **MariaDB / MySQL**, and **Google Drive Cloud Storage**.

---

## 📌 সূচিপত্র (Table of Contents)
1. [প্রজেক্ট ওভারভিউ (Project Overview)](#-প্রজেক্ট-ওভারভিউ-project-overview)
2. [সিস্টেমের প্রয়োজনীয়তা (Prerequisites)](#-সিস্টেমের-প্রয়োজনীয়তা-prerequisites)
3. [ইনস্টলেশন ও সেটআপ গাইড (Step-by-Step Installation)](#-ইনস্টলেশন-ও-সেটআপ-গাইড-step-by-step-installation)
4. [ডাটাবেস মাইগ্রেশন ও সিডিং - রিয়েল ডাটা সেটআপ (Zero Demo Data)](#-ডাটাবেস-মাইগ্রেশন-ও-সিডিং---রিয়েল-ডাটা-সেটআপ)
5. [ডিফল্ট লগইন ক্রেডেনশিয়াল (Default Staff Credentials)](#-ডিফল্ট-লগইন-ক্রেডেনশিয়াল-default-staff-credentials)
6. [ব্যাকএন্ড সার্ভার চালু করা (Running the Server)](#-ব্যাকএন্ড-সার্ভার-চালু-করা-running-the-server)
7. [টেস্টিং গাইড (Running Automated Tests)](#-টেস্টিং-গাইড-running-automated-tests)
8. [ঐচ্ছিক ডেমো ডাটা সিডার (Optional Demo Seeder)](#-ঐচ্ছিক-ডেমো-ডাটা-সিডার-optional-demo-seeder)
9. [গুগল ড্রাইভ ইমেজ ক্লাউড সেটআপ (Google Drive Storage)](#-গুগল-ড্রাইভ-ইমেজ-ক্লাউড-সেটআপ-google-drive-storage)
10. [প্রোডাকশন ডেপ্লয়মেন্ট চেকলিস্ট (Production Deployment)](#-প্রোডাকশন-ডেপ্লয়মেন্ট-চেকলিস্ট-production-deployment)

---

## 🚀 প্রজেক্ট ওভারভিউ (Project Overview)

**Israfil BD Shop** ব্যাকএন্ড সম্পূর্ণ RESTful API আর্কিটেকচারে তৈরি একটি উচ্চ-ক্ষমতাসম্পন্ন রিটেইল ও পিওএস ব্যাকএন্ড। এটি অফলাইন ও অনলাইন পয়েন্ট অফ সেল (POS), বারকোড স্ক্যানিং, ডুয়াল-কারেন্সি/বাংলা-ইংরেজি লোকালাইজেশন, ইনভেন্টরি ট্র্যাকিং, সাপ্লায়ার ও কাস্টমার লেজার খতিয়ান, কিস্তি/বাকির হিসাব, অটো-থার্মাল প্রিন্ট রসিদ এবং লাভ-ক্ষতির অ্যানালিটিক্স সরবরাহ করে।

### প্রধান বৈশিষ্ট্যসমূহ:
- **Zero Dummy Data Guarantee**: প্রোডাকশন রেডি ডাটাবেস। কোনো ডামি পণ্য বা ডামি সেলস ইনভয়েস ছাড়াই ফ্রেশ ইনস্টল হয়।
- **Role-Based Access Control (RBAC)**: সুপার অ্যাডমিন, ম্যানেজার এবং ক্যাশিয়ার—৩টি নির্ধারিত ভূমিকা এবং ২০টি গ্র্যানুলার পারমিশন।
- **POS Engine with Stock Lock & Validation**: রিয়েল-টাইম স্টক ডিটেকশন, নেগেটিভ স্টক প্রতিরোধ, ক্যাশ মেমো ও ট্রানজেকশন জেনারেশন।
- **Cloud & Local Storage**: পণ্য ও প্রোফাইলের ছবি স্বয়ংক্রিয়ভাবে লোকাল স্টোরেজ অথবা গুগল ড্রাইভ ক্লাউডে সংরক্ষণ।
- **Bilingual Core**: প্রতিটি বিভাগ ও ক্যাটাগরি সম্পূর্ণ দ্বিভাষিক (বাংলা এবং ইংরেজি)।

---

## 💻 সিস্টেমের প্রয়োজনীয়তা (Prerequisites)

ব্যাকএন্ড রান করার পূর্বে সার্ভার বা লোকাল মেশিনে নিচের প্যাকেজগুলো নিশ্চিত করুন:

- **PHP**: `^8.2` বা `^8.3`
- **Composer**: `^2.5`
- **Database**: `MariaDB 10.6+` অথবা `MySQL 8.0+`
- **প্রয়োজনীয় PHP এক্সটেনশনসমূহ**:
  - `pdo_mysql`
  - `mbstring`
  - `openssl`
  - `tokenizer`
  - `xml`
  - `ctype`
  - `json`
  - `bcmath`
  - `curl`
  - `gd` বা `imagick` (ছবি রিসাইজ ও প্রসেসিংয়ের জন্য)

---

## 🛠️ ইনস্টলেশন ও সেটআপ গাইড (Step-by-Step Installation)

### ধাপ ১: প্রজেক্ট ডিরেক্টরিতে প্রবেশ করুন
```bash
cd /path/to/Israfill/backend
```

### ধাপ ২: কম্পোজার ডিপেন্ডেন্সি ইনস্টল করুন
```bash
composer install --no-interaction --prefer-dist --optimize-autoloader
```

### ধাপ ৩: এনভায়রনমেন্ট ফাইল তৈরি করুন
`.env.example` থেকে কপি করে `.env` ফাইল তৈরি করুন:
```bash
cp .env.example .env
```

### ধাপ ৪: অ্যাপলিকেশন সিক্রেট কি জেনারেট করুন
```bash
php artisan key:generate
```

### ধাপ ৫: ডাটাবেস কনফিগার করুন
আপনার `.env` ফাইলে ডাটাবেস সংক্রান্ত তথ্য আপডেট করুন:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=israfil_shop
DB_USERNAME=root
DB_PASSWORD=your_password

# লিনাক্সে যদি ইউনিক্স সকেট (MariaDB/MySQL) ব্যবহার করেন:
# DB_SOCKET=/tmp/mysql.sock
```

> **ডাটাবেস তৈরি করুন (যদি পূর্বে না থাকে):**
> ```sql
> CREATE DATABASE israfil_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```

### ধাপ ৬: স্টোরেজ লিংক তৈরি করুন
লোকাল সার্ভারে আপলোড করা প্রোডাক্ট ছবি ব্রাউজার থেকে সরাসরি ভিউ করার জন্য পাবলিক স্টোরেজ সিমলিংক তৈরি করুন:
```bash
php artisan storage:link
```

---

## 📦 ডাটাবেস মাইগ্রেশন ও সিডিং - রিয়েল ডাটা সেটআপ

> ⚠️ **গুরুত্বপূর্ণ (Real Production Data Only - Zero Demo Data):**  
> এই সিস্টেমে কোনো ডামি পণ্য (Dummy Products), নকল সেলস অর্ডার (Fake Sales) বা কাল্পনিক পারচেজ ডাটা যুক্ত করা হবে না। শুধুমাত্র ব্যবসায় পরিচালনার জন্য প্রয়োজনীয় বাস্তব কনফিগারেশন, রোলস, স্টাফ অ্যাকাউন্ট, পরিমাপের ইউনিট, খরচের খাত এবং সাধারণ কাস্টমার অ্যাকাউন্ট সিড হবে।

ডাটাবেস সম্পূর্ণ ফ্রেশ করে প্রাথমিক রিয়েল সেটআপ করতে কমান্ডটি রান করুন:

```bash
php artisan migrate:fresh --seed
```

### ডিফল্ট সিডারে যা যা অন্তর্ভুক্ত থাকে:
1. **২০টি পারমিশন (System Permissions)**:
   - `manage-users`, `manage-roles`, `manage-products`, `manage-categories`, `manage-purchases`, `manage-sales`, `pos-access`, `manage-customers`, `manage-suppliers`, `manage-expenses`, `manage-returns`, `view-reports`, `manage-settings`, ইত্যাদি।
2. **৩টি মৌলিক রোল (Standard Roles)**:
   - `super-admin`: সর্বময় ক্ষমতা ও কনফিগারেশন নিয়ন্ত্রণ।
   - `manager`: ইনভেন্টরি, পারচেজ, সেলস, কাস্টমার, সাপ্লায়ার ও রিপোর্ট অ্যাক্সেস।
   - `cashier`: পিওএস টার্মিনাল ও সেলস ইনভয়েস অ্যাক্সেস।
3. **৩টি অফিসিয়াল স্টাফ অ্যাকাউন্ট (Staff Accounts)**:
   - সুপার অ্যাডমিন, ব্রাঞ্চ ম্যানেজার ও ক্যাশিয়ার।
4. **৬টি প্রমিত পরিমাপের একক (Standard Units)**:
   - `pcs` (পিস), `kg` (কেজি), `pkt` (প্যাকেট), `box` (বক্স), `ltr` (লিটার), `dzn` (ডজন)।
5. **৮টি নিয়মিত ব্যবসার খরচের খাত (Expense Categories)**:
   - দোকান ভাড়া (Shop Rent), বিদ্যুৎ ও ইউটিলিটি বিল (Electricity & Utilities), কর্মচারীর বেতন ও ভাতা (Staff Salaries), পরিবহন ও যাতায়াত খরচ (Transport), ইন্টারনেট ও ফোন বিল (Internet & Phone), চা-নাস্তা ও আপ্যায়ন (Entertainment & Tea), দোকান মেরামত ও রক্ষণাবেক্ষণ (Maintenance & Repairs), অন্যান্য বিবিধ ব্যয় (Miscellaneous)।
6. **ডিফল্ট ওয়াক-ইন কাস্টমার (Default Walk-in Customer)**:
   - নাম: `ওয়াক-ইন কাস্টমার (Walk-in Customer)`, ফোন: `01700000000` (দ্রুত কাউন্টার বিক্রয়ের জন্য)।
7. **দোকানের প্রাথমিক সেটিংস (Shop & POS Settings)**:
   - দোকানের নাম: `ISRAFIL BD SHOP`, মুদ্রার প্রতীক: `৳` (BDT), ৮০০ মিমি থার্মাল রিসিপ্ট মেমো ফুটার ও প্রিন্টার ফরম্যাট।

---

## 🔑 ডিফল্ট লগইন ক্রেডেনশিয়াল (Default Staff Credentials)

সিস্টেম সিড করার পর আপনি নিচের ক্রেডেনশিয়ালগুলো ব্যবহার করে সরাসরি লগইন করতে পারবেন:

| ভূমিকা (Role) | ইমেইল (Email) | পাসওয়ার্ড (Password) | প্রবেশাধিকার (Access Scope) |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@israfilbd.com` | `admin123` | ফুল সিস্টেম, ইউজার ব্যবস্থাপনা, রিপোর্ট, সেটিংস |
| **Store Manager** | `manager@israfilbd.com` | `manager123` | পণ্য তালিকা, স্টক এন্ট্রি, ক্রয়, বিক্রয়, খরচ, কাস্টমার |
| **POS Cashier** | `cashier@israfilbd.com` | `cashier123` | পিওএস টার্মিনাল কাউন্টার, রসিদ প্রিন্ট, সেলস হিস্ট্রি |

> 🔒 *সতর্কতা: লাইভ প্রোডাকশনে যাওয়ার সাথে সাথে প্রতিটি অ্যাকাউন্টের ডিফল্ট পাসওয়ার্ড পরিবর্তন করে নিন।*

---

## ⚡ ব্যাকএন্ড সার্ভার চালু করা (Running the Server)

ডেভেলপমেন্ট মোডে সার্ভার চালু করতে:
```bash
php artisan serve --host=127.0.0.1 --port=8000
```
সার্ভার সফলভাবে চালু হলে API এন্ডপয়েন্টসমূহ `http://127.0.0.1:8000/api` এ উপলব্ধ হবে।

---

## 🧪 টেস্টিং গাইড (Running Automated Tests)

ব্যাকএন্ডে পিওএস চেকআউট, স্টক হ্রাস-বৃদ্ধি, বারকোড স্ক্যানিং, রোল পারমিশন এবং কাস্টমার ব্যালেন্স যাচাইয়ের জন্য কমপ্রিহেনসিভ অটোমেটেড ফিচার টেস্ট রয়েছে।

সবগুলো টেস্ট একসাথে রান করতে:
```bash
./vendor/bin/phpunit
```
অথবা আর্টিসান টেস্ট রানার দিয়ে:
```bash
php artisan test
```

শুধুমাত্র মূল পিওএস ও শপ এপিআই ফিচার টেস্ট চালাতে:
```bash
./vendor/bin/phpunit tests/Feature/IsrafilShopApiTest.php
```

---

## 🧪 ঐচ্ছিক ডেমো ডাটা সিডার (Optional Demo Seeder)

যদি আপনি লোকাল ইন্টারফেস বা ড্যাশবোর্ড গ্রাফসমূহ টেস্টিংয়ের উদ্দেশ্যে কিছু কাল্পনিক ডেমো পণ্য ও বিক্রয় দেখতে চান, তবে আলাদাভাবে এই ডেমো সিডারটি রান করতে পারেন:

```bash
php artisan db:seed --class=DemoDataSeeder
```
*(রিয়েল প্রোডাকশনে এই কমান্ডটি কখনোই রান করবেন না)*

---

## ☁️ গুগল ড্রাইভ ইমেজ ক্লাউড সেটআপ (Google Drive Storage)

পণ্যের ছবি এবং ডকুমেন্ট সরাসরি গুগল ড্রাইভে স্টোর করার জন্য নিচের কনফিগারেশনটি `.env` ফাইলে যুক্ত করতে পারেন:

```env
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
GOOGLE_DRIVE_ACCESS_TOKEN=your_oauth_access_token
GOOGLE_DRIVE_API_KEY=your_google_api_key
```

> 💡 **নোট:** যদি গুগল ড্রাইভের ক্রেডেনশিয়াল খালি রাখা হয়, সিস্টেম স্বয়ংক্রিয়ভাবে লোকাল ডিস্ক স্টোরেজে (`storage/app/public/products`) ছবি সেভ করবে। কোনো ধরনের এরর হবে না।

---

## 🚀 প্রোডাকশন ডেপ্লয়মেন্ট চেকলিস্ট (Production Deployment)

প্রোডাকশন সার্ভারে (Ubuntu/Nginx/Apache) ডেপ্লয় করার সময় নিচের ধাপগুলো অনুসরণ করুন:

1. **ফাইল পারমিশন ঠিক করুন:**
   ```bash
   sudo chown -R www-data:www-data storage bootstrap/cache
   sudo chmod -R 775 storage bootstrap/cache
   ```

2. **ক্যাশিং অপ্টিমাইজেশন চালান:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **এনভায়রনমেন্ট প্রোডাকশন সেট করুন:**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   ```

4. **Nginx কনফিগারেশন স্নsnippet:**
   ```nginx
   server {
       listen 80;
       server_name api.israfilbd.com;
       root /var/www/Israfill/backend/public;

       index index.php;

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

## 📞 সাপোর্ট ও যোগাযোগ (Support & Maintenance)
যেকোনো কারিগরি সহায়তা বা আপডেটের জন্য ইসরাফিল বিডি শপ ডেভেলপমেন্ট টিমের সাথে যোগাযোগ করুন।
- **Email**: `admin@israfilbd.com`
- **License**: Proprietary Retail & POS Software Suite.
