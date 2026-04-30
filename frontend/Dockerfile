FROM node:22-alpine AS base

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY frontend/package.json frontend/package-lock.json* ./

# Bağımlılıkları kur
RUN npm ci

# Kaynak kodu kopyala
COPY frontend/ ./

# Copy course content so MDX sections are available at build and runtime
COPY content/ ./content/

# Production build
RUN npm run build

EXPOSE 3000
 
CMD ["npm", "start"]
