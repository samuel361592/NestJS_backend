# 使用 Node.js 18 作為基礎映像
FROM node:20-slim

# 設定容器內的工作目錄
WORKDIR /app

# 複製相依檔案並安裝
COPY package*.json ./
RUN npm install

# 複製整個專案
COPY . .

# 編譯 Nest 專案（會生成 dist 目錄）
RUN npm run build

# 暴露預設 port
EXPOSE 3001

# 執行應用程式
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]