# Quick Deployment Checklist

## Chuẩn bị trước khi deploy
- [ ] Có tài khoản GitHub, Vercel, Render, MongoDB Atlas
- [ ] Code đã push lên GitHub repository

## MongoDB Atlas Setup
- [ ] Tạo cluster (Free M0)
- [ ] Tạo database user với password
- [ ] Cho phép Network Access từ anywhere (0.0.0.0/0)
- [ ] Lưu lại MongoDB connection string

## Backend Deploy (Render)
- [ ] Tạo Web Service mới trên Render
- [ ] Kết nối GitHub repo
- [ ] Set Root Directory = `server`
- [ ] Thêm Environment Variables:
  - `NODE_ENV=production`
  - `MONGODB_URI=<your-mongodb-atlas-uri>`
  - `JWT_SECRET=<random-strong-secret>`
  - `FRONTEND_URL=http://localhost:5173` (tạm thời)
- [ ] Deploy và lưu lại backend URL

## Frontend Deploy (Vercel)
- [ ] Tạo Project mới trên Vercel
- [ ] Kết nối GitHub repo
- [ ] Set Root Directory = `client`
- [ ] Framework = Vite
- [ ] Thêm Environment Variable:
  - `VITE_API_URL=<your-render-backend-url>/api`
- [ ] Deploy và lưu lại frontend URL

## Hoàn thiện
- [ ] Cập nhật `FRONTEND_URL` trên Render với URL Vercel thực tế
- [ ] Test frontend + backend hoạt động
- [ ] Test QR code generation và scanning
- [ ] Seed database nếu cần (từ Render shell: `npm run db:seed`)

## URLs cuối cùng
- Frontend: `https://________.vercel.app`
- Backend: `https://________.onrender.com`
