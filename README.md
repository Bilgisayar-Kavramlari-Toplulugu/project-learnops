<div align="center">

# 🚀 LearnOps

[![GitHub](https://img.shields.io/badge/GitHub-Bilgisayar--Kavramlari--Toplulugu-181717?style=flat-square&logo=github)](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)

**Part of [Bilgisayar Kavramları Topluluğu](https://github.com/Bilgisayar-Kavramlari-Toplulugu)**

</div>

---

<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>
<br>

> **ÖNEMLİ:** Bu repository **LearnOps — Topluluk Eğitim Platformu** projesinin ana reposudur. Detaylı teknik gereksinimler için [`docs/Project-Definition.md`](docs/Project-Definition.md) dosyasına bakın.

## 📖 Hakkında

**LearnOps**, DevOps alanında kaliteli, ücretsiz ve Türkçe eğitim içerikleri sunan açık kaynak kodlu bir öğrenme yönetim platformudur. Topluluk odaklı bir yaklaşımla geliştirilen platform; MDX tabanlı kurs içerikleri, quiz sistemi, ilerleme takibi ve OAuth ile kolay giriş imkânı sunar.

**Vizyon:** Türkiye'nin en kapsamlı DevOps öğrenme platformu olarak topluluğu güçlendirmek ve nitelikli DevOps mühendislerinin yetişmesine katkıda bulunmak.

### ✨ Temel Özellikler (MVP)

- 🔐 Google, LinkedIn ve GitHub ile OAuth 2.0 girişi
- 📚 MDX tabanlı kurs içerikleri (Git'te saklanır, build-time render)
- 📊 Section bazlı ilerleme takibi ve progress bar
- 🧪 Zamanlı quiz sistemi (%70 geçme eşiği, sonuç inceleme)
- 🏠 Kişiselleştirilmiş dashboard (devam eden kurslar, istatistikler)
- 🔒 KVKK/GDPR uyumlu hesap yönetimi (hard delete + audit log)
- 🎨 Baş harfi ve sistem avatarı seçeneği

## 🚀 Kurulum

### Gereksinimler

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- [Git](https://git-scm.com/)
- Google / LinkedIn / GitHub OAuth uygulama credentials (`.env` için)

### Başlangıç

```bash
git clone https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops.git
cd project-learnops

# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenleyerek OAuth credentials ve JWT_SECRET değerlerini gir

# Tüm servisleri ayağa kaldır (Backend + Frontend + PostgreSQL)
docker compose up --build
```

Servisler ayağa kalktıktan sonra:

| Servis    | URL                   |
|-----------|-----------------------|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:8000 |
| API Docs  | http://localhost:8000/docs |

### İçerik Seed (İlk Kurulum)

```bash
# Kurs ve section verilerini veritabanına yükle
docker compose exec backend python scripts/seed_content.py --env development
```

## 💻 Kullanım

```bash
# Tüm servisleri başlat
docker compose up

# Yalnızca arka planda çalıştır
docker compose up -d

# Servisleri durdur
docker compose down

# Logları izle
docker compose logs -f backend
docker compose logs -f frontend
```

### Veritabanı Migration

```bash
# Mevcut migration'ları uygula
docker compose exec backend alembic upgrade head

# Yeni migration oluştur
docker compose exec backend alembic revision --autogenerate -m "açıklama"
```

## 📁 Proje Yapısı

```
project-learnops/
├── backend/                  # FastAPI uygulaması (Python 3.11+)
│   ├── app/
│   │   ├── main.py           # Uygulama giriş noktası
│   │   ├── models/           # SQLAlchemy ORM modelleri
│   │   ├── schemas/          # Pydantic request/response şemaları
│   │   ├── routers/          # API endpoint tanımları
│   │   ├── services/         # İş mantığı (OAuth, JWT, Quiz, Progress)
│   │   └── middleware/       # Auth & rate limiter middleware
│   ├── alembic/              # Veritabanı migration dosyaları
│   ├── tests/                # Backend testleri
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Next.js 14+ uygulaması (App Router)
│   ├── app/                  # Sayfa bileşenleri
│   │   ├── (auth)/           # Giriş & OAuth callback
│   │   ├── dashboard/        # Ana dashboard
│   │   ├── courses/          # Kurs listesi & detay & section
│   │   ├── quiz/             # Quiz & sonuç ekranları
│   │   └── profile/          # Profil yönetimi
│   ├── components/           # Yeniden kullanılabilir UI bileşenleri
│   ├── lib/                  # API client, auth helpers, MDX loader
│   ├── public/avatars/       # 10 sistem avatarı (SVG)
│   ├── next.config.ts
│   └── Dockerfile
├── content/                  # MDX kurs içerikleri
│   └── courses/
│       └── [kurs-slug]/
│           ├── meta.json     # Kurs metadata
│           └── sections/     # MDX ders dosyaları
├── scripts/
│   ├── seed_content.py       # İçerik seed scripti
│   └── ops/
│       └── delete_user.sql   # KVKK manuel silme scripti
├── docs/                     # Proje dokümantasyonu
├── .github/
│   ├── workflows/ci.yml      # GitHub Actions CI/CD pipeline
│   └── CONTRIBUTING.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🏗️ Teknik Mimari

```
[Kullanıcı]
    │
    ▼
[Next.js Frontend]  ──/api/*──▶  [FastAPI Backend]  ──▶  [PostgreSQL]
   (Cloud Run)        proxy        (Cloud Run)              (Cloud SQL)
        │                               │
        └───── build-time ──────────────┘
              MDX içerik okuma
```

- **Frontend:** Next.js 14 (App Router), SSG + client-side fetch, MDX render
- **Backend:** FastAPI (Python 3.11), async SQLAlchemy, Alembic migration
- **Veritabanı:** PostgreSQL 15+
- **Production:** GCP Cloud Run (BE + FE) + Cloud SQL
- **CI/CD:** GitHub Actions → GCP Artifact Registry → Cloud Run

## 🧪 Test

```bash
# Backend testleri
docker compose exec backend pytest tests/ --cov --cov-report=term

# Frontend testleri
docker compose exec frontend npm test

# Lint kontrolü
docker compose exec backend ruff check app/
docker compose exec frontend npm run lint
```

## 🗂️ Branch Stratejisi

| Branch    | Amaç                                      |
|-----------|-------------------------------------------|
| `main`    | Production — otomatik deploy tetikler     |
| `release` | Release adayı — staging ortamı            |
| `develop` | Aktif geliştirme branch'i                 |

Her PR `develop` branch'ine açılır. Staging deploy'u PR açıldığında otomatik tetiklenir.

## 🤝 Katkıda Bulunma

Katkıda bulunmak için lütfen [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) dosyasını inceleyin.

Yeni bir kurs içeriği eklemek için:
1. `content/courses/` altında klasör oluştur
2. `meta.json` ve MDX dosyalarını ekle
3. PR aç — seed script deployment sırasında otomatik çalışır

## 📚 Dokümantasyon

- [Proje Tanımı & MVP Kapsamı](docs/Project-Definition.md)
- [Mimari Genel Bakış](docs/Architecture-Overview.md)
- [Geliştirme Akışı](docs/Development-Workflow.md)
- [API Referansı](http://localhost:8000/docs) _(local)_

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır — detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

**Proje Lideri:** [@flovearth](https://github.com/flovearth)

</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>
<br>

> **IMPORTANT:** This repository is the main repository for **LearnOps — Community Learning Platform**. See [`docs/Project-Definition.md`](docs/Project-Definition.md) for detailed technical requirements.

## 📖 About

**LearnOps** is an open-source learning management platform offering high-quality, free, Turkish-language DevOps education. Built with a community-first approach, the platform features MDX-based course content, a quiz system, progress tracking, and easy OAuth login.

**Vision:** To become Turkey's most comprehensive DevOps learning platform and contribute to the growth of skilled DevOps engineers within the community.

### ✨ Key Features (MVP)

- 🔐 OAuth 2.0 login via Google, LinkedIn, and GitHub
- 📚 MDX-based course content (stored in Git, rendered at build-time)
- 📊 Section-level progress tracking with progress bar
- 🧪 Timed quiz system (70% pass threshold, result review)
- 🏠 Personalized dashboard (in-progress courses, stats)
- 🔒 KVKK/GDPR-compliant account management (hard delete + audit log)
- 🎨 Initials avatar and selectable system avatar

## 🚀 Installation

### Requirements

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- [Git](https://git-scm.com/)
- Google / LinkedIn / GitHub OAuth application credentials (for `.env`)

### Getting Started

```bash
git clone https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops.git
cd project-learnops

# Set up environment variables
cp .env.example .env
# Edit .env and fill in your OAuth credentials and JWT_SECRET

# Start all services (Backend + Frontend + PostgreSQL)
docker compose up --build
```

Once running:

| Service   | URL                   |
|-----------|-----------------------|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:8000 |
| API Docs  | http://localhost:8000/docs |

### Seed Content (First-time Setup)

```bash
docker compose exec backend python scripts/seed_content.py --env development
```

## 💻 Usage

```bash
# Start all services
docker compose up

# Run in background
docker compose up -d

# Stop services
docker compose down

# Follow logs
docker compose logs -f backend
docker compose logs -f frontend
```

### Database Migrations

```bash
# Apply existing migrations
docker compose exec backend alembic upgrade head

# Create a new migration
docker compose exec backend alembic revision --autogenerate -m "description"
```

## 📁 Project Structure

```
project-learnops/
├── backend/                  # FastAPI application (Python 3.11+)
│   ├── app/
│   │   ├── main.py           # Application entry point
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # API endpoint definitions
│   │   ├── services/         # Business logic (OAuth, JWT, Quiz, Progress)
│   │   └── middleware/       # Auth & rate limiter middleware
│   ├── alembic/              # Database migration files
│   ├── tests/                # Backend tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Next.js 14+ application (App Router)
│   ├── app/                  # Page components
│   │   ├── (auth)/           # Login & OAuth callback
│   │   ├── dashboard/        # Main dashboard
│   │   ├── courses/          # Course list, detail & section pages
│   │   ├── quiz/             # Quiz & results screens
│   │   └── profile/          # Profile management
│   ├── components/           # Reusable UI components
│   ├── lib/                  # API client, auth helpers, MDX loader
│   ├── public/avatars/       # 10 system avatars (SVG)
│   ├── next.config.ts
│   └── Dockerfile
├── content/                  # MDX course content
│   └── courses/
│       └── [course-slug]/
│           ├── meta.json     # Course metadata
│           └── sections/     # MDX lesson files
├── scripts/
│   ├── seed_content.py       # Content seeding script
│   └── ops/
│       └── delete_user.sql   # GDPR manual deletion script
├── docs/                     # Project documentation
├── .github/
│   ├── workflows/ci.yml      # GitHub Actions CI/CD pipeline
│   └── CONTRIBUTING.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🏗️ Technical Architecture

```
[User]
  │
  ▼
[Next.js Frontend]  ──/api/*──▶  [FastAPI Backend]  ──▶  [PostgreSQL]
   (Cloud Run)        proxy        (Cloud Run)              (Cloud SQL)
       │                               │
       └───── build-time ──────────────┘
             MDX content reading
```

- **Frontend:** Next.js 14 (App Router), SSG + client-side fetch, MDX rendering
- **Backend:** FastAPI (Python 3.11), async SQLAlchemy, Alembic migrations
- **Database:** PostgreSQL 15+
- **Production:** GCP Cloud Run (BE + FE) + Cloud SQL
- **CI/CD:** GitHub Actions → GCP Artifact Registry → Cloud Run

## 🧪 Testing

```bash
# Backend tests
docker compose exec backend pytest tests/ --cov --cov-report=term

# Frontend tests
docker compose exec frontend npm test

# Lint check
docker compose exec backend ruff check app/
docker compose exec frontend npm run lint
```

## 🗂️ Branch Strategy

| Branch    | Purpose                                        |
|-----------|------------------------------------------------|
| `main`    | Production — triggers automatic deployment     |
| `release` | Release candidate — staging environment        |
| `develop` | Active development branch                      |

All PRs are opened against `develop`. Staging deployment is triggered automatically when a PR is opened.

## 🤝 Contributing

Please see [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) for contribution guidelines.

To add new course content:
1. Create a folder under `content/courses/`
2. Add `meta.json` and MDX files
3. Open a PR — the seed script runs automatically at deployment

## 📚 Documentation

- [Project Definition & MVP Scope](docs/Project-Definition.md)
- [Architecture Overview](docs/Architecture-Overview.md)
- [Development Workflow](docs/Development-Workflow.md)
- [API Reference](http://localhost:8000/docs) _(local)_

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

**Project Lead:** [@flovearth](https://github.com/flovearth)

</details>