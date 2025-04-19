# Backend - NestJS API

本資料夾為使用 [NestJS](https://nestjs.com/) 搭配 TypeORM 與 MySQL 開發的後端服務。支援 JWT 驗證、角色管理與貼文 CRUD。

## 目錄結構

```
backend/
├── src/
│   ├── auth/            # 登入、JWT 驗證、授權守衛
│   ├── entities/        # TypeORM Entity 定義 (User、Post、Role)
│   ├── post/            # 貼文功能模組 (controller、service、dto)
│   ├── user/            # 使用者模組
│   ├── data-source.ts   # TypeORM 資料來源定義
│   └── app.module.ts    # 主模組
├── migrations/          # TypeORM migration 檔案
├── .env                 # 環境變數檔 (正式環境)
├── .env.test            # 測試資料庫環境變數
├── package.json         # 套件與指令設定
├── tsconfig.json        # TypeScript 設定
└── README.md            # 專案說明
```

## 環境變數設定

請在專案根目錄建立 `.env` 或 `.env.test`：

```
DATABASE_URL=mysql://root:123456@localhost:3306/fullstackdb_test
JWT_SECRET=my-secret-key
```

若為測試資料庫，請修改 `fullstack_db_test` 為 `你所自訂的DB名稱`

## 安裝依賴

```bash
npm install
```

## 啟動伺服器

```bash
npm run start:dev
```

或使用測試環境（記得先建立對應資料庫）：

```bash
cross-env NODE_ENV=test npm run start:dev
```

## TypeORM Migration 操作

### 產生 Migration 檔案

```bash
npx typeorm migration:generate src/migrations/init --dataSource src/data-source.ts
```

### 執行 Migration 建立資料表

```bash
npx tsx ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts
```

## 測試 API 功能

以 [Postman](https://www.postman.com/) 測試路由，需先透過 `/auth/login` 登入取得 JWT Token

### 貼文路由：

- `GET /posts`：取得所有貼文
- `GET /posts/:id`：取得單篇貼文
- `POST /posts`：新增貼文（需帶 token）
- `PATCH /posts/:id`：編輯自己的貼文（需帶 token）
- `DELETE /posts/:id`：刪除自己的貼文（需帶 token）

## 注意事項

- 若遷移過程中遇到錯誤，可手動刪除 `migrations` 資料夾並重新生成
- 開發與測試請使用不同資料庫（ex: `.env` 與 `.env.test`）

## 作者

本專案由samuel開發，用於練習 NestJS + TypeORM + MySQL 後端應用開發。
