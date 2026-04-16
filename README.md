<div align="center">

# 🚀 LearnOps

[![GitHub](https://img.shields.io/badge/GitHub-Bilgisayar--Kavramlari--Toplulugu-181717?style=flat-square&logo=github)](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.132+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)

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

- [Docker Desktop 4.37+](https://docs.docker.com/get-docker/) (Docker Engine + Compose v2 birlikte gelir)
- [Git 2.47+](https://git-scm.com/)
- [Python 3.13.x](https://www.python.org/) + [Poetry 2.3.x](https://python-poetry.org/)
- [Node.js 22 LTS](https://nodejs.org/)
- [age 1.x](https://age-encryption.org/) — `.env.age` şifre çözme için zorunlu
- Google / LinkedIn / GitHub OAuth uygulama credentials

### Başlangıç

```bash
git clone https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops.git
cd project-learnops

# develop branch'e geç
git checkout develop && git pull origin develop

# Ortam değişkenlerini çöz (.env.age → .env)
./encrypt-env-file.sh decrypt

# Tüm servisleri ayağa kaldır (Backend + Frontend + PostgreSQL)
cd infrastructure/develop
docker compose up --build
```

> **Not:** `.env` dosyası proje kökünde oluşur (`project-learnops/.env`).  
> Docker Compose bu dosyayı otomatik olarak okur; başka bir yere taşımayın.

Servisler ayağa kalktıktan sonra:

| Servis    | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000      |
| Backend   | http://localhost:8000      |
| API Docs  | http://localhost:8000/docs |

### İçerik Seed (İlk Kurulum)

```bash
# Kurs ve section verilerini veritabanına yükle
docker compose exec backend python backend/scripts/seed_content.py --env development

# Quiz sorularını veritabanına yükle
docker compose exec backend python backend/scripts/seed_quiz.py --env development
```

## 💻 Kullanım

```bash
# infrastructure/develop/ dizininden çalıştırılır

# Tüm servisleri başlat
docker compose up

# Yalnızca arka planda çalıştır
docker compose up -d

# Yalnızca DB'yi başlat (backend/frontend lokal çalıştırılıyorsa)
docker compose up -d db

# Servisleri durdur
docker compose down

# Logları izle
docker compose logs -f backend
docker compose logs -f frontend
```

### Veritabanı Migration

```bash
# backend/ dizininden çalıştırılır (poetry shell aktifken)

# Mevcut migration'ları uygula
poetry run alembic upgrade head

# Yeni migration oluştur
poetry run alembic revision --autogenerate -m "açıklama"

# Geri al
poetry run alembic downgrade -1
```

## 📁 Proje Yapısı

```
project-learnops/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # GitHub Actions CI/CD pipeline
│   │   └── content-validate.yml  # İçerik PR doğrulama job'ı
│   └── CONTRIBUTING.md
├── backend/                       # FastAPI uygulaması (Python 3.13)
│   ├── app/
│   │   ├── main.py                # Uygulama giriş noktası
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/                # SQLAlchemy ORM modelleri
│   │   ├── schemas/               # Pydantic request/response şemaları
│   │   ├── routers/               # API endpoint tanımları
│   │   ├── services/              # İş mantığı (OAuth, JWT, Quiz, Progress)
│   │   └── middleware/            # Auth & rate limiter middleware
│   ├── scripts/
│   │   ├── seed_content.py        # MDX → DB (courses + sections)
│   │   ├── seed_quiz.py           # quiz.json → DB (quizzes + questions)
│   │   └── validate_content.py   # PR öncesi içerik doğrulama
│   ├── alembic/                   # Veritabanı migration dosyaları
│   ├── tests/                     # Backend testleri
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── poetry.lock
├── content/                       # MDX kurs içerikleri
│   └── courses/
│       └── [kurs-slug]/
│           ├── meta.json          # Kurs metadata
│           ├── quiz.json          # Kurs quiz soruları
│           └── sections/          # MDX ders dosyaları (10, 20, 30... sıralı)
├── docs/                          # Proje dokümantasyonu
├── frontend/                      # Next.js 16+ uygulaması (App Router)
│   ├── app/
│   │   ├── (auth)/                # Giriş & OAuth callback
│   │   ├── dashboard/             # Ana dashboard
│   │   ├── courses/               # Kurs listesi & detay & section
│   │   ├── quiz/                  # Quiz & sonuç ekranları
│   │   └── profile/               # Profil yönetimi
│   ├── components/                # Yeniden kullanılabilir UI bileşenleri
│   ├── lib/                       # API client, auth helpers, MDX loader
│   ├── public/avatars/            # 10 sistem avatarı (SVG)
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── infrastructure/
│   ├── bootstrap/                 # GCP proje bootstrap Terraform kodu
│   ├── bootstrap-after-run/       # Bootstrap sonrası uygulanan config
│   ├── develop/                   # Lokal development Docker Compose
│   │   └── docker-compose.yml
│   ├── staging/                   # Staging ortamı Terraform workspace
│   ├── ops/
│   │   └── delete_user.sql        # KVKK manuel silme scripti
│   └── README.md
├── .env.age                       # Şifreli lokal development env (Git'e commit edilir)
├── .env.example                   # Şablon (gerçek değer YOK — commit edilir)
├── .nvmrc                         # Node.js versiyon sabitleme (22 LTS)
├── .pre-commit-config.yaml        # betterleaks + hook'lar
├── .python-version                # Python versiyon sabitleme (3.13.x)
├── CHANGELOG.md                   # git-cliff otomatik üretir
├── CODE_OF_CONDUCT.md
├── LICENSE
├── README.md
├── cliff.toml                     # git-cliff CHANGELOG konfigürasyonu
├── commitlint.config.js           # Conventional commit doğrulama
└── encrypt-env-file.sh            # age şifreleme/çözme scripti
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

- **Frontend:** Next.js 16 (App Router), SSG + client-side fetch, MDX render
- **Backend:** FastAPI (Python 3.13), async SQLAlchemy 2.0, Alembic migration, Poetry
- **Veritabanı:** PostgreSQL 17+
- **Production:** GCP Cloud Run (BE + FE) + Cloud SQL
- **CI/CD:** GitHub Actions → GCP Artifact Registry → Cloud Run
- **IaC:** Terraform 1.9.x (GCP, europe-west3)

## 🧪 Test

```bash
# Backend testleri (backend/ dizininden)
poetry run pytest tests/ --cov --cov-report=term

# Frontend testleri (frontend/ dizininden)
npm test

# Lint kontrolü
poetry run ruff check app/          # Backend
cd frontend && npm run lint          # Frontend

# İçerik doğrulama (PR öncesi)
poetry run python backend/scripts/validate_content.py
```

## 🗂️ Branch Stratejisi

| Branch    | Amaç                                      |
|-----------|-------------------------------------------|
| `main`    | Production — otomatik deploy tetikler     |
| `release` | Release adayı — staging ortamı            |
| `develop` | Aktif geliştirme branch'i                 |

Her PR `develop` branch'ine açılır. Staging deploy'u PR açıldığında otomatik tetiklenir.

## 🤝 Katkıda Bulunma

Katkıda bulunmak için lütfen [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) dosyasını inceleyin.

Yeni bir kurs içeriği eklemek için:
1. `content/courses/` altında kebab-case slug ile klasör oluştur
2. `meta.json`, `quiz.json` ve `sections/` altında MDX dosyalarını ekle
3. PR aç — seed scriptleri deployment sırasında otomatik çalışır

## 📚 Dokümantasyon

- [Proje Tanımı & MVP Kapsamı](docs/Project-Definition.md)
- [Mimari Genel Bakış](docs/Architecture-Overview.md)
- [Geliştirme Akışı](docs/Development-Workflow.md)
- [API Referansı](http://localhost:8000/docs) _(local)_

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır — detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

**Proje Yöneticisi:** [@lerkush](https://github.com/lerkush) · **Codeowners:** [@flovearth](https://github.com/flovearth) · [@lerkush](https://github.com/lerkush)

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

- [Docker Desktop 4.37+](https://docs.docker.com/get-docker/) (includes Docker Engine + Compose v2)
- [Git 2.47+](https://git-scm.com/)
- [Python 3.13.x](https://www.python.org/) + [Poetry 2.3.x](https://python-poetry.org/)
- [Node.js 22 LTS](https://nodejs.org/)
- [age 1.x](https://age-encryption.org/) — required to decrypt `.env.age`
- Google / LinkedIn / GitHub OAuth application credentials

### Getting Started

```bash
git clone https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops.git
cd project-learnops

# Switch to develop branch
git checkout develop && git pull origin develop

# Decrypt environment variables (.env.age → .env)
./encrypt-env-file.sh decrypt

# Start all services (Backend + Frontend + PostgreSQL)
cd infrastructure/develop
docker compose up --build
```

> **Note:** The `.env` file is created at the project root (`project-learnops/.env`).  
> Docker Compose reads it automatically — do not move it elsewhere.

Once running:

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000      |
| Backend   | http://localhost:8000      |
| API Docs  | http://localhost:8000/docs |

### Seed Content (First-time Setup)

```bash
# Seed course and section data
docker compose exec backend python backend/scripts/seed_content.py --env development

# Seed quiz questions
docker compose exec backend python backend/scripts/seed_quiz.py --env development
```

## 💻 Usage

```bash
# Run from infrastructure/develop/ directory

# Start all services
docker compose up

# Run in background
docker compose up -d

# Start only the database (if running backend/frontend locally)
docker compose up -d db

# Stop services
docker compose down

# Follow logs
docker compose logs -f backend
docker compose logs -f frontend
```

### Database Migrations

```bash
# Run from backend/ directory (with poetry shell active)

# Apply existing migrations
poetry run alembic upgrade head

# Create a new migration
poetry run alembic revision --autogenerate -m "description"

# Roll back
poetry run alembic downgrade -1
```

## 📁 Project Structure

```
project-learnops/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # GitHub Actions CI/CD pipeline
│   │   └── content-validate.yml  # Content PR validation job
│   └── CONTRIBUTING.md
├── backend/                       # FastAPI application (Python 3.13)
│   ├── app/
│   │   ├── main.py                # Application entry point
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/                # SQLAlchemy ORM models
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── routers/               # API endpoint definitions
│   │   ├── services/              # Business logic (OAuth, JWT, Quiz, Progress)
│   │   └── middleware/            # Auth & rate limiter middleware
│   ├── scripts/
│   │   ├── seed_content.py        # MDX → DB (courses + sections)
│   │   ├── seed_quiz.py           # quiz.json → DB (quizzes + questions)
│   │   └── validate_content.py   # Pre-PR content validation
│   ├── alembic/                   # Database migration files
│   ├── tests/                     # Backend tests
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── poetry.lock
├── content/                       # MDX course content
│   └── courses/
│       └── [course-slug]/
│           ├── meta.json          # Course metadata
│           ├── quiz.json          # Course quiz questions
│           └── sections/          # MDX lesson files (ordered 10, 20, 30...)
├── docs/                          # Project documentation
├── frontend/                      # Next.js 16+ application (App Router)
│   ├── app/
│   │   ├── (auth)/                # Login & OAuth callback
│   │   ├── dashboard/             # Main dashboard
│   │   ├── courses/               # Course list, detail & section pages
│   │   ├── quiz/                  # Quiz & results screens
│   │   └── profile/               # Profile management
│   ├── components/                # Reusable UI components
│   ├── lib/                       # API client, auth helpers, MDX loader
│   ├── public/avatars/            # 10 system avatars (SVG)
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── infrastructure/
│   ├── bootstrap/                 # GCP project bootstrap Terraform code
│   ├── bootstrap-after-run/       # Post-bootstrap applied config
│   ├── develop/                   # Local development Docker Compose
│   │   └── docker-compose.yml
│   ├── staging/                   # Staging environment Terraform workspace
│   ├── ops/
│   │   └── delete_user.sql        # GDPR manual deletion script
│   └── README.md
├── .env.age                       # Encrypted local development env (committed to Git)
├── .env.example                   # Template (no real values — committed to Git)
├── .nvmrc                         # Node.js version pin (22 LTS)
├── .pre-commit-config.yaml        # betterleaks + hooks
├── .python-version                # Python version pin (3.13.x)
├── CHANGELOG.md                   # Auto-generated by git-cliff
├── CODE_OF_CONDUCT.md
├── LICENSE
├── README.md
├── cliff.toml                     # git-cliff CHANGELOG configuration
├── commitlint.config.js           # Conventional commit validation
└── encrypt-env-file.sh            # age encrypt/decrypt script
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

- **Frontend:** Next.js 16 (App Router), SSG + client-side fetch, MDX rendering
- **Backend:** FastAPI (Python 3.13), async SQLAlchemy 2.0, Alembic migrations, Poetry
- **Database:** PostgreSQL 17+
- **Production:** GCP Cloud Run (BE + FE) + Cloud SQL
- **CI/CD:** GitHub Actions → GCP Artifact Registry → Cloud Run
- **IaC:** Terraform 1.9.x (GCP, europe-west3)

## 🧪 Testing

```bash
# Backend tests (from backend/ directory)
poetry run pytest tests/ --cov --cov-report=term

# Frontend tests (from frontend/ directory)
npm test

# Lint checks
poetry run ruff check app/          # Backend
cd frontend && npm run lint          # Frontend

# Content validation (before opening a PR)
poetry run python backend/scripts/validate_content.py
```

## 🗂️ Branch Strategy

| Branch    | Purpose                                        |
|-----------|------------------------------------------------|
| `main`    | Production — triggers automatic deployment     |
| `release` | Release candidate — staging environment        |
| `develop` | Active development branch                      |

All PRs are opened against `develop`. Staging deployment is triggered automatically when a PR is opened.

## 🤝 Contributing

Please see [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) for contribution guidelines.

To add new course content:
1. Create a kebab-case slug folder under `content/courses/`
2. Add `meta.json`, `quiz.json`, and MDX files under `sections/`
3. Open a PR — seed scripts run automatically at deployment

## 📚 Documentation

- [Project Definition & MVP Scope](docs/Project-Definition.md)
- [Architecture Overview](docs/Architecture-Overview.md)
- [Development Workflow](docs/Development-Workflow.md)
- [API Reference](http://localhost:8000/docs) _(local)_

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

**Project Manager:** [@lerkush](https://github.com/lerkush) · **Codeowners:** [@flovearth](https://github.com/flovearth) · [@lerkush](https://github.com/lerkush)

</details>