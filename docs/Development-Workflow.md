<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>
<br>

Bu belge, LearnOps projesindeki geliştirme süreçleri, standartları ve iş akışları için bir rehberdir.

---

## 🚀 Başlangıç

### Ön Koşullar

- [Git](https://git-scm.com/) (lokal makinenizde kurulu olmalı)
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) v2+
- GitHub hesabı ve proje reposuna erişim izni
- Google / LinkedIn / GitHub OAuth uygulama credentials (`.env` için)

### İlk Kurulum

```bash
# 1. Repoyu fork'layın (GitHub'da "Fork" butonuna tıklayın)

# 2. Lokal'e klonlayın
git clone https://github.com/KULLANICI-ADINIZ/project-learnops.git
cd project-learnops

# 3. Upstream'i ekleyin
git remote add upstream https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops.git

# 4. Ortam değişkenlerini ayarlayın
cp .env.example .env
# .env dosyasını açıp gerekli değerleri doldurun (aşağıya bakın)

# 5. Servisleri başlatın
docker compose up --build

# 6. İlk kurulumda içerikleri seed edin
docker compose exec backend python scripts/seed_content.py --env development
```

### Gerekli Ortam Değişkenleri (`.env`)

| Değişken | Açıklama | Zorunlu |
|---|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı string'i | ✅ |
| `JWT_SECRET` | JWT imzalama anahtarı (min 32 karakter) | ✅ |
| `TOKEN_ENCRYPTION_KEY` | Refresh token AES-256 anahtarı (32 byte) | ✅ |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google OAuth credentials | ✅ |
| `LINKEDIN_CLIENT_ID` / `SECRET` | LinkedIn OAuth credentials | ✅ |
| `GITHUB_CLIENT_ID` / `SECRET` | GitHub OAuth credentials | ✅ |
| `ALLOWED_ORIGINS` | CORS izin verilen domainler | ✅ |
| `ENVIRONMENT` | `development` / `staging` / `production` | ✅ |

> **İpucu:** `JWT_SECRET` ve `TOKEN_ENCRYPTION_KEY` için kriptografik rastgele değer üretmek üzere `openssl rand -hex 32` komutunu kullanabilirsiniz.

### Servisler Ayağa Kalktıktan Sonra

| Servis | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API Dokümantasyonu | http://localhost:8000/docs |
| DB (direkt bağlantı) | localhost:5432 |

---

## 🔄 İş Akışı

### 1. Issue Seçin veya Oluşturun

Tüm işler (yeni özellikler, hata düzeltmeleri, dokümantasyon, kurs içeriği) GitHub Issues üzerinden takip edilir.

- [Issues sayfasına](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/issues) göz atın
- `good-first-issue` etiketi yeni başlayanlar için idealdir
- Çalışmak istediğiniz issue'ya yorum bırakın: *"Bu issue üzerinde çalışmak istiyorum, ~X gün içinde PR göndereceğim."*
- Yeni bir iş yapmak istiyorsanız önce issue açın, tartışın, sonra kodlamaya başlayın

### 2. Branch Oluşturun

Her issue için `develop` branch'inden yeni bir branch oluşturun:

```bash
# Develop'u güncel tutun
git checkout develop
git pull upstream develop

# Yeni branch oluşturun
git checkout -b feature/42-quiz-timer-pause
```

**Branch İsimlendirme Kuralı:**

```
<tip>/<issue-no>-<kisa-aciklama>

feature/42-quiz-timer-pause
bugfix/87-oauth-callback-redirect
docs/15-update-api-examples
content/33-add-docker-course
refactor/61-progress-service-cleanup
```

> ⚠️ **Önemli:** Tüm PR'lar `develop` branch'ine açılır. `main` veya `release` branch'lerine doğrudan PR açmayın.

### 3. Geliştirin ve Commit Yapın

Değişikliklerinizi küçük, mantıksal parçalara bölün. Her anlamlı değişiklik için ayrı commit atın.

**Commit Mesajı Formatı (Conventional Commits):**

```
<tip>(<kapsam>): <konu>

Örnekler:
feat(quiz): add pause button to quiz timer
fix(auth): resolve redirect loop on first OAuth login
docs(api): add quiz submit request/response examples
content(docker): add volumes and networking section
test(progress): add concurrent completion edge cases
chore(deps): update FastAPI to 0.110.0
```

**Tipler:** `feat` · `fix` · `docs` · `content` · `style` · `refactor` · `test` · `chore`

**Kapsam Örnekleri:** `auth` · `quiz` · `dashboard` · `enrollment` · `progress` · `content` · `ui`

### 4. Testleri Çalıştırın

PR açmadan önce tüm testlerin geçtiğinden emin olun:

```bash
# Backend testleri
docker compose exec backend pytest tests/ --cov --cov-report=term

# Backend lint
docker compose exec backend ruff check app/
docker compose exec backend ruff format --check app/

# Frontend testleri
docker compose exec frontend npm test

# Frontend lint & tip kontrolü
docker compose exec frontend npm run lint
docker compose exec frontend npm run type-check
```

### 5. Pull Request Açın

```bash
# Branch'inizi push edin
git push origin feature/42-quiz-timer-pause
```

GitHub'da `develop` branch'ine PR açın. PR başlığı ve açıklaması için [CONTRIBUTING.md](../.github/CONTRIBUTING.md) dosyasındaki şablonu kullanın.

PR açıklamasında mutlaka ilgili issue'yu referans gösterin:
```
Closes #42
```

### 6. Code Review ve Merge

- CI/CD pipeline otomatik olarak tetiklenir (test + lint)
- Maintainer kodu inceler, geri bildirim verebilir
- İstenen değişiklikleri yapın, aynı branch'e push edin (PR otomatik güncellenir)
- Onay alındıktan sonra `develop` branch'ine merge edilir

---

## 🌿 Branch Stratejisi

```
main ──────────────────────────────────────────────► Production deploy
  ▲
  │ (release PR)
  │
release ───────────────────────────────────────────► Staging deploy
  ▲
  │ (merge PR)
  │
develop ───────────────────────────────────────────► Aktif geliştirme
  ▲   ▲   ▲
  │   │   │
feat bug docs  ← Tüm katkı branch'leri buraya PR açar
```

| Branch | Amaç | Kilit mi? | Deploy |
|---|---|---|---|
| `main` | Production kodu | ✅ Doğrudan push yok | GCP Production (otomatik) |
| `release` | Release adayı | ✅ Doğrudan push yok | GCP Staging (otomatik) |
| `develop` | Aktif geliştirme | ⬜ PR ile merge | — |
| `feature/*` | Yeni özellik | ⬜ | — |
| `bugfix/*` | Hata düzeltmesi | ⬜ | — |
| `docs/*` | Dokümantasyon | ⬜ | — |
| `content/*` | Kurs içeriği | ⬜ | — |

### Release Süreci

```bash
# 1. develop → release PR açılır (release adayı hazır olduğunda)
# 2. Staging ortamında son kontroller yapılır
# 3. release → main PR açılır
# 4. Merge sonrası GitHub Actions otomatik production deploy başlatır
# 5. DB migration (alembic upgrade head) ve content seed otomatik çalışır
```

---

## 🏗️ Proje Yapısı

```
project-learnops/
├── backend/                  # FastAPI uygulaması
│   ├── app/
│   │   ├── main.py           # Uygulama giriş noktası, router kayıtları
│   │   ├── models/           # SQLAlchemy ORM modelleri
│   │   ├── schemas/          # Pydantic request/response şemaları
│   │   ├── routers/          # HTTP endpoint tanımları (ince katman)
│   │   ├── services/         # İş mantığı (oauth, jwt, quiz, progress)
│   │   └── middleware/       # Auth & rate limiter
│   ├── alembic/              # DB migration dosyaları
│   ├── tests/                # Pytest test dosyaları
│   └── requirements.txt
│
├── frontend/                 # Next.js uygulaması
│   ├── app/                  # Sayfalar (App Router)
│   ├── components/           # Yeniden kullanılabilir UI bileşenleri
│   ├── lib/                  # API client, auth helpers, MDX loader
│   └── public/avatars/       # 10 sistem avatarı (SVG)
│
├── content/                  # MDX kurs içerikleri (Git'te yaşar)
│   └── courses/
│       └── [kurs-slug]/
│           ├── meta.json     # Kurs metadata
│           └── sections/     # MDX ders dosyaları
│
├── scripts/
│   ├── seed_content.py       # MDX → PostgreSQL seed scripti
│   └── ops/delete_user.sql   # KVKK manuel silme scripti
│
├── docs/                     # Proje dokümantasyonu
├── .github/
│   ├── workflows/ci.yml      # GitHub Actions pipeline
│   └── CONTRIBUTING.md
└── docker-compose.yml
```

---

## 📋 Kod Standartları

### Backend (Python / FastAPI)

- **Tip hint'leri** tüm fonksiyon imzalarında zorunludur
- **İş mantığı `services/` katmanında**, router'larda yalnızca HTTP bağlama kodu bulunur
- **Hata durumları** açık `HTTPException` ile döndürülür
- **Lint:** `ruff check` ve `ruff format` — CI'da zorunlu
- **Tip kontrolü:** `mypy` — CI'da zorunlu
- Her yeni endpoint veya servis için **test yazılır** (`tests/` altına)

### Frontend (TypeScript / Next.js)

- **TypeScript strict mode** aktif — `any` kullanımından kaçının
- **Props tipleri** her component için tanımlanır
- **Loading, error ve empty state** her veri çeken component'te yönetilir
- **API çağrıları** yalnızca `lib/api.ts` üzerinden yapılır
- **Lint:** `eslint` + `prettier` — CI'da zorunlu
- Dashboard gibi kullanıcıya özgü veriler **client-side fetch** ile alınır, SSR yapılmaz

### MDX Kurs İçeriği

- `id` alanı frontmatter'da **bir kez belirlenir, asla değiştirilmez**
- Dosya adı ve başlık değişebilir, `id` değişmez
- `meta.json` formatına uygun olarak doldurulur
- Her yeni kurs `is_published: false` ile başlar, hazır olduğunda `true` yapılır

### Commit Mesajları

[Conventional Commits](https://www.conventionalcommits.org/) standardına uyulur. CI'da lint kontrolü yapılır.

---

## 🧪 Test Stratejisi

### Backend Testleri

```bash
# Tüm testleri çalıştır ve coverage raporu al
docker compose exec backend pytest tests/ --cov=app --cov-report=term-missing

# Belirli bir modülü test et
docker compose exec backend pytest tests/test_quiz.py -v

# Belirli bir test fonksiyonunu çalıştır
docker compose exec backend pytest tests/test_auth.py::test_oauth_callback -v
```

Kritik test kapsamları:
- `test_auth.py` — OAuth callback, token üretimi, logout, refresh
- `test_quiz.py` — Attempt oluşturma, submit, süre kontrolü, `correct_index` güvenliği
- `test_progress.py` — Section tamamlama, progress hesaplama, kurs tamamlanma

### Frontend Testleri

```bash
# Tüm testleri çalıştır
docker compose exec frontend npm test

# Watch modunda çalıştır (geliştirme sırasında)
docker compose exec frontend npm run test:watch
```

### Veritabanı Migration

```bash
# Yeni migration oluştur
docker compose exec backend alembic revision --autogenerate -m "add_quiz_pause_field"

# Migration'ları uygula
docker compose exec backend alembic upgrade head

# Son migration'ı geri al
docker compose exec backend alembic downgrade -1

# Migration geçmişini gör
docker compose exec backend alembic history
```

> ⚠️ Migration dosyalarını elle düzenlemekten kaçının. `autogenerate` ile oluşturun, oluşan dosyayı gözden geçirin.

---

## ⚙️ CI/CD Pipeline

Her `push` ve `pull_request` olayında GitHub Actions otomatik çalışır:

```
push / PR açıldı
       │
       ├─► test-backend  → pytest + coverage
       ├─► test-frontend → npm test + build
       └─► lint          → ruff + mypy + eslint
                │
                │ Tüm kontroller ✅
                │
       ┌────────▼──────────────────────────────┐
       │  PR ise → Staging deploy (develop'a)  │
       │  main'e merge ise → Production deploy │
       └───────────────────────────────────────┘
```

PR'ınız merge edilmeden önce tüm CI kontrollerin yeşil olması gerekir.

---

## 🐛 Hata Ayıklama

### Sık Karşılaşılan Sorunlar

**`docker compose up` sonrası backend başlamıyor:**
```bash
# DB sağlık kontrolünü bekleyin veya logları inceleyin
docker compose logs backend
docker compose logs db
```

**Alembic migration hatası:**
```bash
# Migration durumunu kontrol edin
docker compose exec backend alembic current
docker compose exec backend alembic history

# Gerekirse sıfırlayın (sadece local dev'de!)
docker compose down -v
docker compose up --build
docker compose exec backend alembic upgrade head
```

**OAuth callback çalışmıyor (local):**
- OAuth uygulamanızın callback URL'inin `http://localhost:3000/callback` olarak ayarlandığından emin olun
- `.env` dosyasındaki `CLIENT_ID` ve `CLIENT_SECRET` değerlerini kontrol edin

**MDX içerik görünmüyor:**
```bash
# Seed script'ini yeniden çalıştırın
docker compose exec backend python scripts/seed_content.py --env development
```

### Logları İzleme

```bash
# Tüm servisler
docker compose logs -f

# Yalnızca backend
docker compose logs -f backend

# Yalnızca frontend
docker compose logs -f frontend
```

---

## 📚 Ek Kaynaklar

- [Proje Tanımı](Project-Definition.md)
- [Mimari Genel Bakış](Architecture-Overview.md)
- [Katkıda Bulunma Rehberi](../.github/CONTRIBUTING.md)
- [FastAPI Dokümantasyonu](https://fastapi.tiangolo.com)
- [Next.js App Router Dokümantasyonu](https://nextjs.org/docs/app)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

<p align="right"><i>Bu belge LearnOps MVP v1.2 gereksinim dokümanı esas alınarak hazırlanmıştır.</i></p>

</details>

---

<details>
<summary><strong>🇬🇧 English</strong></summary>
<br>

This document is a guide for development processes, standards, and workflows in the LearnOps project.

---

## 🚀 Getting Started

### Prerequisites

- [Git](https://git-scm.com/) installed on your local machine
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) v2+
- A GitHub account with access to the project repository
- Google / LinkedIn / GitHub OAuth application credentials (for `.env`)

### Initial Setup

```bash
# 1. Fork the repository (click "Fork" on GitHub)

# 2. Clone locally
git clone https://github.com/YOUR-USERNAME/project-learnops.git
cd project-learnops

# 3. Add upstream
git remote add upstream https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops.git

# 4. Configure environment variables
cp .env.example .env
# Open .env and fill in the required values (see table below)

# 5. Start all services
docker compose up --build

# 6. Seed content on first setup
docker compose exec backend python scripts/seed_content.py --env development
```

### Required Environment Variables (`.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | JWT signing key (min 32 chars) | ✅ |
| `TOKEN_ENCRYPTION_KEY` | Refresh token AES-256 key (32 bytes) | ✅ |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google OAuth credentials | ✅ |
| `LINKEDIN_CLIENT_ID` / `SECRET` | LinkedIn OAuth credentials | ✅ |
| `GITHUB_CLIENT_ID` / `SECRET` | GitHub OAuth credentials | ✅ |
| `ALLOWED_ORIGINS` | CORS allowed domains | ✅ |
| `ENVIRONMENT` | `development` / `staging` / `production` | ✅ |

> **Tip:** Use `openssl rand -hex 32` to generate cryptographically random values for `JWT_SECRET` and `TOKEN_ENCRYPTION_KEY`.

### After Services Start

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| DB (direct) | localhost:5432 |

---

## 🔄 Workflow

### 1. Choose or Create an Issue

All work (features, bug fixes, documentation, course content) is tracked through GitHub Issues.

- Browse the [Issues page](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/issues)
- The `good-first-issue` label is ideal for newcomers
- Comment on the issue you want to work on: *"I'd like to work on this, I'll send a PR in ~X days."*
- For new work, open an issue first, discuss it, then start coding

### 2. Create a Branch

Create a new branch from `develop` for each issue:

```bash
# Keep develop up to date
git checkout develop
git pull upstream develop

# Create your branch
git checkout -b feature/42-quiz-timer-pause
```

**Branch Naming Convention:**

```
<type>/<issue-no>-<short-description>

feature/42-quiz-timer-pause
bugfix/87-oauth-callback-redirect
docs/15-update-api-examples
content/33-add-docker-course
refactor/61-progress-service-cleanup
```

> ⚠️ **Important:** All PRs target the `develop` branch. Do not open PRs directly to `main` or `release`.

### 3. Develop and Commit

Break your changes into small, logical pieces. Make a separate commit for each meaningful change.

**Commit Message Format (Conventional Commits):**

```
<type>(<scope>): <subject>

Examples:
feat(quiz): add pause button to quiz timer
fix(auth): resolve redirect loop on first OAuth login
docs(api): add quiz submit request/response examples
content(docker): add volumes and networking section
test(progress): add concurrent completion edge cases
chore(deps): update FastAPI to 0.110.0
```

**Types:** `feat` · `fix` · `docs` · `content` · `style` · `refactor` · `test` · `chore`

**Scope examples:** `auth` · `quiz` · `dashboard` · `enrollment` · `progress` · `content` · `ui`

### 4. Run Tests

Make sure all tests pass before opening a PR:

```bash
# Backend tests
docker compose exec backend pytest tests/ --cov --cov-report=term

# Backend lint
docker compose exec backend ruff check app/
docker compose exec backend ruff format --check app/

# Frontend tests
docker compose exec frontend npm test

# Frontend lint & type check
docker compose exec frontend npm run lint
docker compose exec frontend npm run type-check
```

### 5. Open a Pull Request

```bash
# Push your branch
git push origin feature/42-quiz-timer-pause
```

Open a PR to the `develop` branch on GitHub. Use the PR title and description template from [CONTRIBUTING.md](../.github/CONTRIBUTING.md).

Always reference the related issue in the PR description:
```
Closes #42
```

### 6. Code Review and Merge

- CI/CD pipeline triggers automatically (tests + lint)
- A maintainer reviews the code and may leave feedback
- Apply requested changes and push to the same branch (PR updates automatically)
- After approval, the PR is merged into `develop`

---

## 🌿 Branch Strategy

```
main ──────────────────────────────────────────────► Production deploy
  ▲
  │ (release PR)
  │
release ───────────────────────────────────────────► Staging deploy
  ▲
  │ (merge PR)
  │
develop ───────────────────────────────────────────► Active development
  ▲   ▲   ▲
  │   │   │
feat bug docs  ← All contribution branches open PRs here
```

| Branch | Purpose | Protected? | Deploy |
|---|---|---|---|
| `main` | Production code | ✅ No direct push | GCP Production (automatic) |
| `release` | Release candidate | ✅ No direct push | GCP Staging (automatic) |
| `develop` | Active development | ⬜ Merge via PR | — |
| `feature/*` | New feature | ⬜ | — |
| `bugfix/*` | Bug fix | ⬜ | — |
| `docs/*` | Documentation | ⬜ | — |
| `content/*` | Course content | ⬜ | — |

### Release Process

```bash
# 1. Open PR: develop → release (when release candidate is ready)
# 2. Final checks on staging environment
# 3. Open PR: release → main
# 4. After merge, GitHub Actions automatically triggers production deploy
# 5. DB migration (alembic upgrade head) and content seed run automatically
```

---

## 🏗️ Project Structure

```
project-learnops/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py           # App entry point, router registration
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # HTTP endpoint definitions (thin layer)
│   │   ├── services/         # Business logic (oauth, jwt, quiz, progress)
│   │   └── middleware/       # Auth & rate limiter
│   ├── alembic/              # DB migration files
│   ├── tests/                # Pytest test files
│   └── requirements.txt
│
├── frontend/                 # Next.js application
│   ├── app/                  # Pages (App Router)
│   ├── components/           # Reusable UI components
│   ├── lib/                  # API client, auth helpers, MDX loader
│   └── public/avatars/       # 10 system avatars (SVG)
│
├── content/                  # MDX course content (lives in Git)
│   └── courses/
│       └── [course-slug]/
│           ├── meta.json     # Course metadata
│           └── sections/     # MDX lesson files
│
├── scripts/
│   ├── seed_content.py       # MDX → PostgreSQL seed script
│   └── ops/delete_user.sql   # GDPR manual deletion script
│
├── docs/                     # Project documentation
├── .github/
│   ├── workflows/ci.yml      # GitHub Actions pipeline
│   └── CONTRIBUTING.md
└── docker-compose.yml
```

---

## 📋 Coding Standards

### Backend (Python / FastAPI)

- **Type hints** are required on all function signatures
- **Business logic lives in `services/`** — routers contain only HTTP binding code
- **Error cases** are returned with explicit `HTTPException`
- **Lint:** `ruff check` and `ruff format` — enforced in CI
- **Type checking:** `mypy` — enforced in CI
- **Tests are written** for every new endpoint or service (`tests/` directory)

### Frontend (TypeScript / Next.js)

- **TypeScript strict mode** is active — avoid using `any`
- **Prop types** are defined for every component
- **Loading, error, and empty states** are handled in every data-fetching component
- **All API calls** go through `lib/api.ts`
- **Lint:** `eslint` + `prettier` — enforced in CI
- User-specific data (dashboard, progress) is fetched **client-side** — no SSR for these pages

### MDX Course Content

- The `id` field in frontmatter is **set once and never changed**
- File names and titles can change — `id` cannot
- Fill in `meta.json` following the defined format
- Every new course starts with `is_published: false`, set to `true` when ready

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. Lint is checked in CI.

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests with coverage report
docker compose exec backend pytest tests/ --cov=app --cov-report=term-missing

# Test a specific module
docker compose exec backend pytest tests/test_quiz.py -v

# Run a specific test function
docker compose exec backend pytest tests/test_auth.py::test_oauth_callback -v
```

Critical test coverage areas:
- `test_auth.py` — OAuth callback, token generation, logout, refresh
- `test_quiz.py` — Attempt creation, submit, time validation, `correct_index` security
- `test_progress.py` — Section completion, progress calculation, course completion

### Frontend Tests

```bash
# Run all tests
docker compose exec frontend npm test

# Run in watch mode (during development)
docker compose exec frontend npm run test:watch
```

### Database Migrations

```bash
# Create a new migration
docker compose exec backend alembic revision --autogenerate -m "add_quiz_pause_field"

# Apply migrations
docker compose exec backend alembic upgrade head

# Revert the last migration
docker compose exec backend alembic downgrade -1

# View migration history
docker compose exec backend alembic history
```

> ⚠️ Avoid editing migration files by hand. Generate with `autogenerate`, then review the output file.

---

## ⚙️ CI/CD Pipeline

GitHub Actions runs automatically on every `push` and `pull_request` event:

```
push / PR opened
       │
       ├─► test-backend  → pytest + coverage
       ├─► test-frontend → npm test + build
       └─► lint          → ruff + mypy + eslint
                │
                │ All checks ✅
                │
       ┌────────▼──────────────────────────────────┐
       │  PR → Staging deploy (on develop branch)  │
       │  Merge to main → Production deploy        │
       └───────────────────────────────────────────┘
```

All CI checks must be green before a PR can be merged.

---

## 🐛 Troubleshooting

### Common Issues

**Backend doesn't start after `docker compose up`:**
```bash
# Wait for DB health check or inspect logs
docker compose logs backend
docker compose logs db
```

**Alembic migration error:**
```bash
# Check migration state
docker compose exec backend alembic current
docker compose exec backend alembic history

# Reset if needed (local dev only!)
docker compose down -v
docker compose up --build
docker compose exec backend alembic upgrade head
```

**OAuth callback not working (local):**
- Make sure your OAuth app's callback URL is set to `http://localhost:3000/callback`
- Double-check `CLIENT_ID` and `CLIENT_SECRET` values in `.env`

**MDX content not showing:**
```bash
# Re-run the seed script
docker compose exec backend python scripts/seed_content.py --env development
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

---

## 📚 Additional Resources

- [Project Definition](Project-Definition.md)
- [Architecture Overview](Architecture-Overview.md)
- [Contributing Guide](../.github/CONTRIBUTING.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

<p align="right"><i>This document is based on the LearnOps MVP v1.2 technical requirements specification.</i></p>

</details>
