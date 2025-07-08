# Backend - NestJS API
本專案為使用 NestJS + TypeORM + MySQL 打造的後端 API 系統，支援 JWT 驗證、角色權限控管與貼文 CRUD 功能，並整合 Swagger API 文件與 Postman 測試流程。支援本機與 Docker 快速部署。

### 快速啟動（使用 Docker）
一鍵啟動
```
docker-compose up --build
```

啟動後：

NestJS API → http://localhost:3001

Swagger 文件 → http://localhost:3001/api

MySQL 服務 → localhost:3306（帳號密碼見 .env）

### 環境變數設定
請在專案根目錄建立 .env 或 .env.test 檔案，範例如下：

```
DATABASE_URL=mysql://root:123456@mysql:3306/fullstackdb
JWT_SECRET=my-secret-key
```
Docker 中的 MySQL host 為 mysql

若為本機執行則為 localhost

# 開發流程（本機）
### 安裝依賴
```
npm install
```
### 啟動伺服器
開發環境：
```
npm run start:dev
```
### 測試環境（使用 .env.test）：

```
cross-env NODE_ENV=test npm run start:dev
```
# TypeORM Migration
產生 Migration 檔案：

```
npx typeorm migration:generate src/migrations/init --dataSource src/data-source.ts
```
執行 Migration 建立資料表：

```
npx tsx ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts
```
# 認證與權限設計
使用者註冊後可登入並獲得 JWT Token

所有需驗證的路由皆須於 headers 加入：

```
Authorization: Bearer <token>
```
管理者（admin）可新增角色與指派使用者角色

編輯與刪除貼文僅限作者本人或 admin

# API 對照表（Swagger）
Auth 認證
| 方法 |	路由	 | 說明 |
| ---- | ---- | ---- |
| POST	| /auth/register	| 使用者註冊 |
| POST |	/auth/login |	使用者登入 |
| GET |	/auth/profile |	取得登入者資料（需登入） |

Role 角色管理（僅限 admin）
| 方法 |	路由 |	說明 |
| ---- | ---- | ---- |
| GET |	/roles |	取得所有角色 |
| POST |	/roles |	新增角色 |
| GET |	/roles/:id |	取得單一角色 |
| PATCH |	/roles/:id |	更新角色 |
| DELETE |	/roles/:id |	刪除角色 |

User 使用者管理（僅限 admin）
| 方法 |	路由 |	說明 |
| ---- | ----| ---- |
| GET |	/users |	取得所有使用者 |
| PATCH |	/users/:id/roles |	設定使用者角色 |

Post 貼文功能
| 方法 |	路由 |	說明 |
| ---- | ---- | ---- |
| GET |	/posts |	取得所有貼文（無需登入） |
| POST |	/posts |	建立貼文（需登入） |
| GET |	/posts/:id |	根據 ID 取得單篇貼文（無需登入） |
| PATCH |	/posts/:id |	更新貼文（需登入） |
| DELETE |	/posts/:id |	刪除貼文（需登入，僅限作者或 admin） |

Swagger API 文件
啟動後瀏覽 API 文件：
```
http://localhost:3001/api
```
### 注意事項
- migration 失敗時可清除 migrations/ 後重新產生

- 請分開管理 .env 與 .env.test，避免資料衝突

- 請先手動建立 admin 角色於資料庫，才能指派管理員權限

作者
本專案由 samuel 開發，作為學習與實作 NestJS + TypeORM + MySQL + Docker 的完整後端系統練習。
