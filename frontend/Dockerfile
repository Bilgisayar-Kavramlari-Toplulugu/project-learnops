FROM node:22-alpine AS base

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY frontend/package.json frontend/package-lock.json* ./

# Bağımlılıkları kur
RUN npm ci

# Kaynak kodu kopyala
COPY frontend/ ./

# Copy course content required for static generation.
# generateStaticParams() in courses/[slug]/sections/[section_id_str]/page.tsx
# calls getAllSectionParams() at build time, which reads all MDX files under
# content/courses/ to pre-render section pages as static HTML.
# Without this, next build fails — no runtime file reads occur after build.
COPY content/ ./content/

# Production build
RUN npm run build

EXPOSE 3000
 
CMD ["npm", "start"]
