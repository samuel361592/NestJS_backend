# Backend - NestJS API

本專案為使用 [NestJS](https://nestjs.com/) + TypeORM + MySQL 打造的後端 API 系統，支援 JWT 驗證、角色權限控管與貼文 CRUD 功能，並整合 Swagger API 文件與 Postman 測試流程。

---

## 環境變數設定

請在專案根目錄建立 `.env` 或 `.env.test` 檔案，範例如下：

```env
DATABASE_URL=mysql://root:123456@localhost:3306/fullstackdb
JWT_SECRET=my-secret-key
```
若為測試環境，請建立 .env.test，並將資料庫名稱改為 fullstackdb_test 或其他自訂名稱。

JWT_SECRET 將用於產生與驗證使用者的 Access Token。

安裝依賴
```bash
npm install
```
啟動伺服器
開發環境：
```bash
npm run start:dev
測試環境（使用 .env.test）：
```
```bash
cross-env NODE_ENV=test npm run start:dev
```
TypeORM Migration 操作
產生 Migration 檔案：
```bash
npx typeorm migration:generate src/migrations/init --dataSource src/data-source.ts
```
執行 Migration 建立資料表：
```bash
npx tsx ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts
```
認證與權限系統
使用者註冊後可登入並獲得 JWT Token。

所有需驗證的路由皆須於 headers 加入 Authorization: Bearer <token>。

使用者擁有角色資料，可由 admin 指派角色。

管理者（admin）可編輯角色與使用者權限。

API 測試方式
可使用 Postman 或 Swagger UI 測試下列路由，登入取得 JWT Token 後，即可操作需授權的功能。

Auth 認證
| 方法	| 路由	| 說明 |
| ---- | ---- | ---- |
| POST |	/auth/register |	使用者註冊 |
| POST |	/auth/login |	使用者登入 |
| GET	| /auth/profile |	取得個人資料（需登入） |

Role 角色管理
| 方法 |	路由 |	權限 |	說明 |
| ---- | ---- | ---- | ---- |
| GET |	/roles |	admin |	取得所有角色 |
| POST |	/roles |	admin |	新增角色 |
| GET |	/roles/:id |	admin |	查詢角色 |
| PATCH |	/roles/:id |	admin |	更新角色 |
| DELETE |	/roles/:id |	admin |	刪除角色 |

User 使用者管理
| 方法 |	路由 |	權限 |	說明 |
| ---- | ---- | ---- | ---- |
| GET |	/users |	admin |	取得所有使用者 |
| PATCH |	/users/:id/role |	admin |	指派使用者角色 |

Post 貼文功能
| 方法 |	路由 |	存取條件 |	說明 |
| ---- | ---- | ---- | ---- |
| GET |	/posts |	無需登入 |	取得所有貼文 |
| GET |	/posts/:id |	無需登入 |	查詢單篇貼文 |
| POST |	/posts |	登入 |	建立貼文 |
| PATCH |	/posts/:id |	作者本人 |	編輯自己的貼文 |
| DELETE |	/posts/:id |	作者本人 |	刪除自己的貼文 |

API 文件
啟動後可透過 Swagger UI 瀏覽完整 API 文件：

http://localhost:3001/api

注意事項
migration 失敗時可清除 migrations/ 後重新產生。

請分開管理 .env 與 .env.test，避免開發與測試資料衝突。

部分路由需管理者權限，請先於資料庫建立 admin 角色並指派。

作者
本專案由 samuel 開發，作為學習與實作 NestJS + TypeORM + MySQL 的完整後端系統練習。
