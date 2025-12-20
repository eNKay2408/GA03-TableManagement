# Hướng dẫn Deploy Project

Dự án này bao gồm 2 phần:
- **Frontend (Client)**: React + Vite - Deploy lên **Vercel**
- **Backend (Server)**: Node.js + Express + MongoDB - Deploy lên **Render**

---

## 📋 Yêu cầu trước khi Deploy

1. **Tài khoản cần thiết:**
   - [GitHub](https://github.com) account
   - [Vercel](https://vercel.com) account (có thể đăng nhập bằng GitHub)
   - [Render](https://render.com) account (có thể đăng nhập bằng GitHub)
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (database trên cloud - miễn phí)

2. **Đẩy code lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

---

## 🗄️ BƯỚC 1: Setup MongoDB Atlas (Database trên Cloud)

### 1.1. Tạo Database Cluster

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Đăng nhập hoặc tạo tài khoản mới
3. Tạo một **New Project** (ví dụ: "TableManagement")
4. Chọn **Build a Database** → Chọn gói **FREE (M0)**
5. Chọn **Provider**: AWS, **Region**: Singapore (hoặc gần bạn nhất)
6. Đặt tên Cluster: `Cluster0` → Click **Create**

### 1.2. Cấu hình Database Access

1. Vào **Database Access** (menu bên trái)
2. Click **Add New Database User**
3. Tạo username/password (VÍ DỤ: `tableadmin` / `StrongPassword123`)
4. **Database User Privileges**: chọn **Read and write to any database**
5. Click **Add User**

### 1.3. Cấu hình Network Access

1. Vào **Network Access** (menu bên trái)
2. Click **Add IP Address**
3. Chọn **Allow Access from Anywhere** (0.0.0.0/0) - để Render có thể kết nối
4. Click **Confirm**

### 1.4. Lấy Connection String

1. Vào **Database** → Click **Connect** trên Cluster của bạn
2. Chọn **Drivers** → **Node.js**
3. Copy **Connection String**, sẽ có dạng:
   ```
   mongodb+srv://tableadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Thay `<password>` bằng password thực tế của bạn
5. Thêm tên database vào cuối (ví dụ: `table_management`):
   ```
   mongodb+srv://tableadmin:StrongPassword123@cluster0.xxxxx.mongodb.net/table_management?retryWrites=true&w=majority
   ```

> ⚠️ **LƯU Ý:** Lưu lại Connection String này, bạn sẽ cần nó cho Backend deployment!

---

## 🖥️ BƯỚC 2: Deploy Backend lên Render

### 2.1. Chuẩn bị Backend

1. **Kiểm tra file `server/package.json`:**
   - Đảm bảo có script `"start": "node src/app.js"`

2. **Tạo file `render.yaml`** (optional - để cấu hình nhanh):
   Tạo file `render.yaml` ở thư mục gốc project:
   ```yaml
   services:
     - type: web
       name: table-management-backend
       env: node
       buildCommand: cd server && npm install
       startCommand: cd server && npm start
       envVars:
         - key: NODE_ENV
           value: production
   ```

### 2.2. Deploy trên Render

1. Truy cập [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → Chọn **Web Service**
3. Connect GitHub repository của bạn
4. Cấu hình như sau:
   - **Name**: `table-management-backend` (hoặc tên bạn muốn)
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Environment Variables** (Click **Advanced** → **Add Environment Variable**):
   Thêm các biến sau:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://tableadmin:StrongPassword123@cluster0.xxxxx.mongodb.net/table_management?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-production-key-change-this
   JWT_EXPIRES_IN=30d
   RESTAURANT_ID=rest_001
   RESTAURANT_NAME=Demo Restaurant
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```

   > ⚠️ **QUAN TRỌNG:**
   > - Thay `MONGODB_URI` bằng connection string từ MongoDB Atlas
   > - Tạo `JWT_SECRET` mạnh (ví dụ: random string dài)
   > - `FRONTEND_URL` sẽ cập nhật sau khi deploy frontend (tạm để `http://localhost:5173` trước)

6. Click **Create Web Service**

7. **Đợi deployment hoàn tất** (~5-10 phút)
8. Sau khi deploy xong, bạn sẽ có URL dạng:
   ```
   https://table-management-backend.onrender.com
   ```

### 2.3. Seed Database (Optional)

Sau khi backend đã deploy, bạn có thể seed dữ liệu mẫu:

1. Vào **Shell** tab trên Render dashboard
2. Chạy lệnh:
   ```bash
   npm run db:seed
   ```

---

## 🌐 BƯỚC 3: Deploy Frontend lên Vercel

### 3.1. Chuẩn bị Frontend

1. **Cập nhật file `client/.env`** (hoặc tạo `.env.production`):
   ```
   VITE_API_URL=https://table-management-backend.onrender.com/api
   ```
   > Thay URL bằng URL backend từ Render

2. **Tạo file `vercel.json`** ở thư mục `client/`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
   > File này đảm bảo React Router hoạt động đúng trên Vercel

### 3.2. Deploy trên Vercel

#### Cách 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import GitHub repository của bạn
4. Cấu hình như sau:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (Vercel tự detect)
   - **Output Directory**: `dist` (Vercel tự detect)

5. **Environment Variables**:
   Click **Environment Variables** và thêm:
   ```
   VITE_API_URL=https://table-management-backend.onrender.com/api
   ```

6. Click **Deploy**

7. Đợi deployment hoàn tất (~2-3 phút)
8. Bạn sẽ có URL dạng:
   ```
   https://table-management-xxxx.vercel.app
   ```

#### Cách 2: Deploy qua Vercel CLI

```bash
# Cài Vercel CLI
npm i -g vercel

# Di chuyển vào thư mục client
cd client

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? N
# - Project name: table-management
# - Directory: ./
# - Override settings? N

# Deploy production
vercel --prod
```

### 3.3. Cập nhật CORS và Backend URL

Sau khi có frontend URL, cập nhật lại Backend:

1. Vào **Render Dashboard** → Web Service của bạn
2. Vào **Environment** tab
3. Cập nhật `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://table-management-xxxx.vercel.app
   ```
4. Click **Save Changes** → Render sẽ tự động redeploy

---

## ✅ BƯỚC 4: Kiểm tra Deployment

### 4.1. Test Backend API

Truy cập các endpoint sau:
- `https://table-management-backend.onrender.com/api/health` → Phải return `{ status: 'ok' }`
- `https://table-management-backend.onrender.com/api/tables` → Phải return danh sách bàn

### 4.2. Test Frontend

1. Truy cập `https://table-management-xxxx.vercel.app`
2. Kiểm tra các tính năng:
   - Xem danh sách bàn
   - Thêm bàn mới
   - Sửa bàn
   - Xem QR Code
   - Download QR

### 4.3. Test QR Code Flow

1. Tạo một bàn mới trên frontend
2. Xem QR Code
3. Scan QR bằng điện thoại
4. Phải mở được trang menu với table ID đúng

---

## 🔧 Troubleshooting

### Lỗi CORS trên Frontend

**Triệu chứng:** Console báo lỗi CORS khi gọi API

**Giải pháp:**
1. Kiểm tra `FRONTEND_URL` trong Backend environment variables
2. Đảm bảo backend đã redeploy sau khi cập nhật env
3. Check `server/src/app.js` có config CORS đúng:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true
   }));
   ```

### Backend không kết nối được MongoDB

**Triệu chứng:** Logs báo lỗi MongoDB connection

**Giải pháp:**
1. Kiểm tra `MONGODB_URI` có đúng format không
2. Kiểm tra password có ký tự đặc biệt → encode URL (ví dụ: `@` → `%40`)
3. Kiểm tra MongoDB Atlas Network Access đã allow 0.0.0.0/0

### Render Free Tier đi ngủ (Cold Start)

**Triệu chứng:** Request đầu tiên chậm (~30s)

**Giải pháp:**
- Render Free tier tự động sleep sau 15 phút không hoạt động
- Request đầu tiên sẽ "đánh thức" service
- Để tránh: nâng cấp lên paid plan hoặc dùng cron job ping định kỳ

### Build fails trên Vercel

**Triệu chứng:** Build lỗi, báo thiếu dependencies

**Giải pháp:**
1. Đảm bảo `client/package.json` có đầy đủ dependencies
2. Check Node version (Vercel dùng Node 18 by default)
3. Xem build logs chi tiết trên Vercel dashboard

---

## 🚀 Deployment URLs Final

Sau khi hoàn thành, bạn sẽ có:

- **Frontend**: `https://table-management-xxxx.vercel.app`
- **Backend API**: `https://table-management-backend.onrender.com/api`
- **Database**: MongoDB Atlas cluster

---

## 📝 Custom Domain (Optional)

### Vercel (Frontend)

1. Vào **Settings** → **Domains**
2. Thêm domain của bạn (ví dụ: `table.yourdomain.com`)
3. Cấu hình DNS theo hướng dẫn của Vercel

### Render (Backend)

1. Vào **Settings** → **Custom Domain**
2. Thêm domain (ví dụ: `api.yourdomain.com`)
3. Cấu hình DNS CNAME record
4. Đợi SSL certificate tự động provision

---

## 🔄 Auto Deploy khi Push Code

Cả Vercel và Render đều hỗ trợ auto-deploy:

- **Vercel**: Tự động deploy khi push lên `main` branch
- **Render**: Tự động deploy khi push lên `main` branch

Để deploy branch khác:
- **Vercel**: Settings → Git → Production Branch
- **Render**: Settings → Branch

---

## 📊 Monitoring

### Vercel Analytics

1. Vào project → **Analytics** tab
2. Xem metrics: visits, performance, errors

### Render Logs

1. Vào web service → **Logs** tab
2. Xem real-time logs
3. Filter by error/warning

---

## 💰 Pricing Notes

- **Vercel Free**: 
  - 100GB bandwidth/month
  - Unlimited deployments
  - Đủ cho demo/personal projects

- **Render Free**:
  - 750 hours/month
  - Sleep after 15 min inactive
  - Đủ cho demo/testing

- **MongoDB Atlas Free (M0)**:
  - 512MB storage
  - Shared cluster
  - Đủ cho development

---

## ✨ Hoàn thành!

Bây giờ bạn đã có:
- ✅ Frontend chạy trên Vercel với HTTPS
- ✅ Backend chạy trên Render với HTTPS
- ✅ Database trên MongoDB Atlas
- ✅ QR Code generation working
- ✅ Auto-deploy khi push code

**URL Demo:**
- Frontend: `https://table-management-xxxx.vercel.app`
- API: `https://table-management-backend.onrender.com/api`

Nhớ update URLs vào báo cáo của bạn! 🎉
