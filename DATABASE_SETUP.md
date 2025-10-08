# راهنمای راه‌اندازی دیتابیس PostgreSQL

## 🔧 Railway PostgreSQL Setup

### مرحله 1: ایجاد PostgreSQL Service
1. برو به Railway Dashboard
2. روی پروژه خود کلیک کن
3. "New" → "Database" → "PostgreSQL"
4. منتظر بمان تا database ایجاد شود

### مرحله 2: کپی کردن DATABASE_URL
1. روی PostgreSQL service کلیک کن
2. تب "Variables" را باز کن
3. مقدار `DATABASE_URL` را کپی کن

### مرحله 3: اضافه کردن به App Service
1. روی App service کلیک کن
2. تب "Variables" → "New Variable"
3. نام: `DATABASE_URL`
4. مقدار: URL کپی شده از مرحله قبل
5. "Add" کلیک کن

### مرحله 4: Redeploy
1. روی App service کلیک کن
2. "Deploy" کلیک کن
3. منتظر بمان تا deployment کامل شود

## 🔑 Environment Variables

### DATABASE_URL (پیشنهادی)
```
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
```

### متغیرهای جداگانه (جایگزین)
```
PGHOST=postgres.railway.internal
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your-password
PGDATABASE=railway
```

### JWT Secret
```
JWT_SECRET=your-secret-key-change-in-production
```

## ✅ تست کردن

### Health Check
```
GET /api/health
```

### پاسخ موفق:
```json
{
  "status": "OK",
  "database": "Connected",
  "setup": {
    "database": "Database ready"
  }
}
```

## 🚨 عیب‌یابی

### اگر DATABASE_URL کار نمی‌کند:
1. بررسی کن که URL کامل باشد
2. بررسی کن که password درست باشد
3. از متغیرهای جداگانه استفاده کن

### اگر connection timeout می‌شود:
1. بررسی کن که PostgreSQL service running باشد
2. بررسی کن که environment variables درست باشند
3. Railway logs را چک کن

## 📞 پشتیبانی

اگر مشکل داشتید:
1. Railway logs را چک کنید
2. Health check endpoint را تست کنید
3. Environment variables را بررسی کنید
