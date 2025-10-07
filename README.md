# انبار یار (Anbaryar) - سیستم مدیریت موجودی داروخانه

یک اپلیکیشن مدرن برای مدیریت موجودی داروخانه با قابلیت‌های پیشرفته.

## 🚀 ویژگی‌ها

- 📊 **مدیریت موجودی:** مدیریت کامل موجودی داروها
- 📁 **واردات/صادرات Excel:** پشتیبانی از فایل‌های Excel
- 🔍 **جستجو و فیلتر:** جستجوی پیشرفته و فیلتر کردن
- 📱 **رابط کاربری مدرن:** طراحی زیبا و کاربرپسند
- 📈 **گزارش‌گیری:** تولید گزارش‌های مختلف
- 🧮 **شمارش فیزیکی:** امکان شمارش فیزیکی موجودی

## 🛠️ تکنولوژی‌ها

- **Frontend:** React Native + Expo
- **Routing:** Expo Router
- **State Management:** Zustand
- **File Processing:** XLSX
- **Testing:** Jest
- **Deployment:** Railway

## 📦 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18.x
- npm یا yarn
- Expo CLI

### نصب
```bash
npm install
```

### اجرای محلی
```bash
# شروع development server
npm start

# اجرای روی وب
npm run web

# build برای production
npm run build
```

## 🌐 Deploy روی Railway

این پروژه برای deploy روی Railway آماده شده است:

1. **Build Command:** `npm run build`
2. **Output Directory:** `dist`
3. **Node.js Version:** 18.x

### تنظیمات خودکار Railway
- Railway به طور خودکار تنظیمات build را تشخیص می‌دهد
- از Dockerfile برای client-side routing استفاده می‌کند
- Caddy web server برای serving static files

## 📁 ساختار پروژه

```
├── app/                    # صفحات اپلیکیشن (Expo Router)
├── components/             # کامپوننت‌های قابل استفاده مجدد
├── services/              # سرویس‌های backend
├── models/                # مدل‌های داده
├── viewmodels/            # View Models
├── hooks/                 # Custom hooks
├── constants/             # ثابت‌ها
├── assets/                # فایل‌های استاتیک
├── __tests__/             # تست‌ها
├── Dockerfile             # تنظیمات Docker
├── Caddyfile              # تنظیمات Caddy
└── package.json           # وابستگی‌ها
```

## 🧪 تست

```bash
npm test
```

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 👨‍💻 توسعه‌دهنده

**samhd913** - [GitHub](https://github.com/samhd913)

---

**انبار یار** - راه‌حل مدرن برای مدیریت موجودی داروخانه