FROM node:22-alpine AS base

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package.json package-lock.json* ./

# Bağımlılıkları kur
RUN npm ci

# Kaynak kodu kopyala
COPY . .

# Build arg for backend URL
ARG BACKEND_INTERNAL_URL=http://backend:8080
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

# Production build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
