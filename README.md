# Sport Store Platform

Khung dự án full-stack website bán đồ thể thao, gồm:

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL Neon
- ORM: Prisma
- Monorepo: `frontend` và `backend`

> Đây là skeleton ban đầu. Auth, phân quyền, thanh toán, upload ảnh và logic nghiệp vụ chi tiết được để lại dưới dạng điểm mở rộng.

## Cấu trúc

```text
sport-store-platform/
  frontend/
    src/app/
    src/components/
    src/lib/api.ts
  backend/
    prisma/schema.prisma
    prisma/seed.ts
    src/prisma/
    src/modules/
  .env.example
  package.json
```

## Backend modules

Backend đã có các module:

`auth`, `users`, `products`, `categories`, `brands`, `cart`, `orders`, `coupons`, `reviews`, `favorites`, `reports`.

API dùng global prefix:

```text
http://localhost:3001/api
```

CORS mặc định cho frontend:

```text
http://localhost:3000
```

## Frontend pages

Frontend đã có các route:

- `/`
- `/products`
- `/products/[slug]`
- `/cart`
- `/checkout`
- `/login`
- `/register`
- `/profile`
- `/orders`
- `/admin/dashboard`
- `/admin/products`
- `/admin/categories`
- `/admin/brands`
- `/admin/orders`
- `/admin/users`
- `/admin/reports`

Frontend gọi API qua `frontend/src/lib/api.ts` và biến môi trường:

```text
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Cài đặt

Yêu cầu:

- Node.js 20+
- npm 9+
- PostgreSQL Neon database

Cài dependencies từ thư mục gốc:

```bash
npm install
```

## Kết nối Neon

1. Tạo project trên Neon.
2. Tạo database, ví dụ `sport_store`.
3. Copy connection string dạng pooled hoặc direct.
4. Tạo file env cho backend:

```bash
cp backend/.env.example backend/.env
```

5. Cập nhật `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/sport_store?sslmode=require"
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="change-me"
PORT=3001
```

6. Tạo file env cho frontend:

```bash
cp frontend/.env.local.example frontend/.env.local
```

7. Cập nhật `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## Prisma

Generate Prisma Client:

```bash
npm run prisma:generate
```

Chạy migration:

```bash
npm run prisma:migrate
```

Seed dữ liệu mẫu:

```bash
npm run prisma:seed
```

Schema hiện có các model:

`User`, `Category`, `Brand`, `Product`, `ProductVariant`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Coupon`, `Review`, `Favorite`.

## Chạy dự án

Chạy frontend và backend cùng lúc:

```bash
npm run dev
```

Hoặc chạy riêng:

```bash
npm run dev:frontend
npm run dev:backend
```

URL mặc định:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api`

- Thêm phân trang, tìm kiếm, upload ảnh sản phẩm và checkout flow.

