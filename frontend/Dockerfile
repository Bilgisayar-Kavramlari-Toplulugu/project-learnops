FROM node:22-alpine AS base

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package.json package-lock.json* ./

# Bağımlılıkları kur
RUN npm ci

# Kaynak kodu kopyala
COPY . .

# Production build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
