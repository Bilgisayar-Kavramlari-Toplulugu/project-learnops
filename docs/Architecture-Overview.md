<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>
<br>

Bu sayfa, LearnOps platformunun yüksek seviyeli mimarisini, ana bileşenlerini ve bu bileşenlerin birbiriyle olan ilişkilerini açıklamaktadır.

---

## Ana Bileşenler

- **Frontend:** Next.js 14+ (App Router) ile geliştirilmiş kullanıcı arayüzü. SSG ile kurs sayfaları, client-side fetch ile dashboard ve ilerleme verisi.
- **Backend API:** FastAPI (Python 3.11+) ile geliştirilmiş REST API. OAuth akışı, quiz değerlendirme, ilerleme hesaplama ve JWT yönetimi burada yaşar.
- **Veritabanı:** PostgreSQL 15+. SQLAlchemy (async) ORM katmanı, Alembic migration yönetimi.
- **İçerik (Git Repo):** Kurs ve section içerikleri MDX formatında Git'te saklanır. Container değildir; frontend build sırasında dosya sistemi üzerinden okunur.
- **Kimlik Doğrulama:** Google, LinkedIn ve GitHub OAuth 2.0 akışı. Kendi JWT üretim ve doğrulama servisi (harici bir auth provider yok).

---

## Sistem Mimarisi

### C4 Seviye 1 — Sistem Bağlamı

```
                        ┌─────────────────────────────────────────────────────┐
                        │                    LearnOps                         │
                        │                                                     │
  [Öğrenci] ──────────► │  ┌──────────────┐       ┌──────────────────────┐  │
                        │  │   Frontend   │──────►│     Backend API      │  │
                        │  │  (Next.js)   │       │     (FastAPI)        │  │
                        │  └──────────────┘       └──────────┬───────────┘  │
                        │                                     │              │
                        │                          ┌──────────▼───────────┐  │
                        │                          │     PostgreSQL DB    │  │
                        │                          └──────────────────────┘  │
                        └──────────────────┬──────────────────────────────────┘
                                           │
               ┌───────────────────────────┼───────────────────────────┐
               │                           │                           │
               ▼                           ▼                           ▼
        [Google OAuth]            [LinkedIn OAuth]             [GitHub OAuth]
```

### C4 Seviye 2 — Container Diyagramı

```
┌─────────────────────────────────────── GCP ──────────────────────────────────────────┐
│                                                                                       │
│   ┌───────────────────────────┐         ┌───────────────────────────────────────┐    │
│   │   Frontend Container      │         │        Backend Container              │    │
│   │   Next.js 14+             │         │        FastAPI (Python 3.11+)         │    │
│   │   Cloud Run               │         │        Cloud Run                      │    │
│   │   Port: 3000              │         │        Port: 8000                     │    │
│   │                           │         │                                       │    │
│   │  • SSG kurs sayfaları     │  /api/* │  • REST API (/v1/*)                  │    │
│   │  • Client-side dashboard  │────────►│  • OAuth callback handler            │    │
│   │  • MDX render             │  proxy  │  • JWT üretim & doğrulama            │    │
│   │  • next.config.ts rewrite │         │  • Quiz değerlendirme                │    │
│   │                           │         │  • Progress hesaplama                │    │
│   └───────────────────────────┘         └───────────────────┬───────────────────┘    │
│                                                             │                        │
│                                         ┌───────────────────▼───────────────────┐    │
│                                         │        PostgreSQL 15+                 │    │
│                                         │        Cloud SQL                      │    │
│                                         │        Port: 5432                     │    │
│                                         │                                       │    │
│                                         │  • users & oauth_accounts            │    │
│                                         │  • courses & sections                │    │
│                                         │  • enrollments & user_progress       │    │
│                                         │  • quizzes, questions, attempts      │    │
│                                         └───────────────────────────────────────┘    │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘

         ┌────────────────────────────────────────────────────────┐
         │  İçerik (Git Repo) — Container Değil                  │
         │  MDX dosyaları                                         │
         │  Frontend build sırasında dosya sistemi üzerinden okunur│
         └────────────────────────────────────────────────────────┘
```

---

## Veri Akışı

### 1. Kullanıcı Girişi (OAuth Akışı)

```
Kullanıcı           Frontend              Backend               OAuth Provider
    │                   │                    │                        │
    │ Login butonuna    │                    │                        │
    │ tıklar ──────────►│                    │                        │
    │                   │ GET /auth/google/  │                        │
    │                   │ login ────────────►│                        │
    │                   │                    │ OAuth URL üret          │
    │                   │◄───────────────────│ (state ile CSRF koruması)
    │                   │                    │                        │
    │ Provider onay     │ Redirect ──────────┼───────────────────────►│
    │ ekranı ◄──────────│                    │                        │
    │ Onaylar ──────────┼────────────────────┼───────────────────────►│
    │                   │                    │◄─── code döner ─────────│
    │                   │                    │                        │
    │                   │        code → token exchange               │
    │                   │        email, ad, profil bilgisi alınır    │
    │                   │                    │                        │
    │                   │        users tablosu kontrol edilir        │
    │                   │        (yoksa otomatik kayıt)              │
    │                   │                    │                        │
    │                   │        JWT access (15dk) +                 │
    │                   │        refresh (7 gün) üretilir            │
    │                   │                    │                        │
    │ Dashboard'a       │◄── httpOnly cookie │                        │
    │ yönlendirilir ◄───│    token set edilir│                        │
```

### 2. Section Tamamlama ve İlerleme Güncelleme

```
Kullanıcı           Frontend              Backend               Veritabanı
    │                   │                    │                       │
    │ "Tamamladım"      │                    │                       │
    │ tıklar ──────────►│                    │                       │
    │                   │ POST /progress/    │                       │
    │                   │ sections/{id}/     │                       │
    │                   │ complete ─────────►│                       │
    │                   │                    │ user_progress         │
    │                   │                    │ completed=true ──────►│
    │                   │                    │                       │
    │                   │                    │ Tüm section'lar       │
    │                   │                    │ tamamlandı mı? ──────►│
    │                   │                    │                       │
    │                   │                    │ Evet → enrollments.   │
    │                   │                    │ completed_at set ────►│
    │                   │                    │                       │
    │ Progress bar      │◄── 200 OK          │                       │
    │ güncellenir ◄─────│    progress_percent│                       │
```

### 3. Quiz Submit Akışı

```
Kullanıcı           Frontend              Backend               Veritabanı
    │                   │                    │                       │
    │ Quiz başlat ─────►│ POST /quizzes/     │                       │
    │                   │ {id}/attempts ────►│                       │
    │                   │                    │ quiz_attempts kaydı   │
    │                   │                    │ oluşturulur ─────────►│
    │                   │◄── sorular döner   │                       │
    │                   │    (correct_index  │                       │
    │ Soruları          │     YOK) ──────────│                       │
    │ yanıtlar          │                    │                       │
    │ Gönder ──────────►│ POST /quiz-        │                       │
    │                   │ attempts/{id}/     │                       │
    │                   │ submit ───────────►│                       │
    │                   │                    │ Süre kontrolü         │
    │                   │                    │ (submitted_at -       │
    │                   │                    │  started_at >         │
    │                   │                    │  duration + 30sn?)    │
    │                   │                    │                       │
    │                   │                    │ Cevaplar              │
    │                   │                    │ değerlendirilir       │
    │                   │                    │ Skor hesaplanır ─────►│
    │                   │                    │                       │
    │ Sonuç ekranı ◄────│◄── skor, passed,   │                       │
    │                   │    correct_index   │                       │
    │                   │    dahil detaylar  │                       │
```

---

## Backend Bileşen Yapısı (FastAPI)

```
backend/app/
│
├── routers/           ← HTTP endpoint tanımları (ince katman, iş mantığı yok)
│   ├── auth.py        → /auth/* — OAuth callback, token refresh, logout
│   ├── users.py       → /users/* — Profil CRUD, hesap silme
│   ├── courses.py     → /courses/* — Listeleme, detay, section meta
│   ├── enrollments.py → /enrollments/* + /progress/* — Kayıt, ilerleme
│   └── quizzes.py     → /quizzes/* + /quiz-attempts/* — Quiz akışı
│
├── services/          ← İş mantığı (router'lardan bağımsız, test edilebilir)
│   ├── oauth_service.py   → Token exchange, userinfo fetch, hesap birleştirme
│   ├── jwt_service.py     → Token üretimi, doğrulama, blacklist kontrolü
│   ├── quiz_service.py    → Randomization, süre doğrulama, skor hesaplama
│   └── progress_service.py → Section tamamlama, progress % güncelleme
│
├── models/            ← SQLAlchemy ORM modelleri (DB şemasının Python temsili)
├── schemas/           ← Pydantic request/response şemaları (API sözleşmesi)
├── middleware/        ← Auth middleware, rate limiter
└── database.py        ← Async engine, session factory, connection pool (min:5 max:20)
```

## Frontend Sayfa Yapısı (Next.js App Router)

```
frontend/app/
│
├── (auth)/
│   ├── login/          → OAuth giriş butonları
│   └── callback/       → OAuth callback handler, token cookie'ye yazılır
│
├── dashboard/          → GET /dashboard/summary — client-side fetch, skeleton loader
│
├── courses/
│   ├── page.tsx         → Kurs listesi (SSG — build-time render)
│   ├── [slug]/
│   │   ├── page.tsx     → Kurs detay (SSG)
│   │   └── [sectionId]/ → Section içeriği (SSG + client-side progress)
│
├── quiz/
│   ├── [quizId]/        → Quiz akışı, geri sayım, sorular
│   └── [quizId]/results/[attemptId]/ → Sonuç inceleme
│
└── profile/             → Profil yönetimi, avatar seçimi, hesap silme
```

---

## Veritabanı Şeması (Özet)

```
users ──────────────────────────────────────────────────────────────────┐
  │  1:N  oauth_accounts (provider bağlantıları)                        │
  │                                                                      │
  │  N:M  courses  ──via──  enrollments (kayıt + progress_percent)      │
  │                │                                                     │
  │                │  1:N  sections  ──via──  user_progress (tamamlama) │
  │                │                                                     │
  │                │  1:1  quizzes                                       │
  │                           │  1:N  questions                          │
  │                           │                                          │
  │  1:N  quiz_attempts ──────┘                                          │
  │           │  1:N  quiz_attempt_answers                               │
  │                                                                      │
  └───────────────────────────────────────────────────────── deleted_accounts (audit log)
```

**Temel Tasarım Kararları:**
- Tüm primary key'ler **UUID** — sıralı ID'den kaynaklanan güvenlik açığı yok
- `sections.section_id_str` — MDX frontmatter `id` ile eşleşir; dosya adı değişse de bu değişmez
- `oauth_accounts.refresh_token_encrypted` — AES-256 ile şifreli (GitHub hariç — token sağlamaz)
- `deleted_accounts` — Hard delete sonrası yalnızca UUID + tarih + sebep; kişisel veri içermez

---

## Güvenlik Mimarisi

| Konu | Uygulama |
|---|---|
| **Kimlik Doğrulama** | OAuth 2.0 (şifre saklanmaz) + JWT (access 15dk / refresh 7gün) |
| **Token Saklama** | httpOnly, Secure, SameSite=Strict cookie |
| **Quiz Güvenliği** | `correct_index` submit öncesi client'a **hiçbir koşulda** gönderilmez |
| **Rate Limiting** | `/auth/*` → 10 istek/dk · Genel API → 100 istek/dk |
| **SQL Injection** | SQLAlchemy ORM parametric query — raw SQL yok |
| **XSS** | MDX server-side render, next-mdx-remote sanitize aktif |
| **CSRF** | SameSite=Strict cookie + Origin header doğrulaması |
| **Veri Silme** | Hard delete transaction — kısmi silme imkânsız |
| **Refresh Token** | AES-256 şifreli saklanır, logout sonrası blacklist'e eklenir |

---

## Deployment Mimarisi

```
  GitHub (main branch)
         │
         ▼
  GitHub Actions CI/CD
  ┌──────────────────────────────────────────┐
  │  1. test-backend  (pytest + coverage)   │
  │  2. test-frontend (npm test + build)    │
  │  3. lint          (ruff + mypy + eslint)│
  └───────────────────┬──────────────────────┘
                      │ Tüm kontroller geçtiyse
                      ▼
  Docker Build & Push → GCP Artifact Registry
  ┌───────────────────────────────────────────┐
  │  europe-west1-docker.pkg.dev/learnops/   │
  │  backend:{git-sha}                       │
  │  frontend:{git-sha}                      │
  └───────────────────┬───────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   alembic upgrade head     │  ← DB migration
         │   seed_content.py          │  ← MDX → PostgreSQL
         └────────────┬───────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
  Cloud Run (Backend)     Cloud Run (Frontend)
  learnops-backend        learnops-frontend
  europe-west1            europe-west1
  min:1 / max:10 inst.    min:1 / max:5 inst.
          │
          ▼
  Cloud SQL (PostgreSQL)
  Cloud SQL Auth Proxy ile güvenli bağlantı
```

**Ortam Farkları:**

| Ortam | Platform | Tetikleyici |
|---|---|---|
| **Development** | Docker Compose (localhost) | Manuel: `docker compose up` |
| **Staging** | GCP Cloud Run + Cloud SQL | PR açıldığında otomatik |
| **Production** | GCP Cloud Run + Cloud SQL | `main` branch'e merge sonrası |

---

## Teknolojiler ve Gerekçeleri

**Next.js 14 (App Router)**
SSG ile kurs sayfaları build-time'da render edilir — içerik değişmediği sürece sunucu yükü sıfır. Client-side fetch yalnızca kullanıcıya özgü veriler (dashboard, progress) için kullanılır. Vercel yerine GCP Cloud Run'da container olarak deploy edilerek tüm altyapı tek platformda konsolide edilir.

**FastAPI (Python 3.11+)**
Native async desteği sayesinde OAuth akışları ve veritabanı işlemleri bloklamadan paralel yürür. Pydantic ile request/response şemaları hem validation hem de otomatik API dokümantasyonu sağlar. Tip güvenliği mypy ile kontrol edilir.

**PostgreSQL 15+**
JSONB desteği quiz `options` alanı için kullanılır. UUID primary key'ler sıralı ID güvenlik açıklarını ortadan kaldırır. GCP Cloud SQL yönetilen servis olduğundan backup, patch ve HA otomatik sağlanır.

**MDX + Git**
İçerikler kod gibi yönetilir: PR ile review, diff ile değişiklik takibi, branch ile hazırlık. Section `id`'leri frontmatter'da sabitlenir — dosya adı değişse de veritabanı bağlantısı kopmaz.

**GCP (Cloud Run + Cloud SQL + Artifact Registry)**
Tüm altyapı tek GCP hesabında — faturalama, erişim ve log izleme tek noktada. `europe-west1` (Belçika) bölgesi hem Türkiye kullanıcılarına makul gecikme hem de GDPR uyumu sağlar. Cloud Run, trafik yokken sıfıra scale-down yapar; min:1 instance ile cold start önlenir.

---

## 🔗 İlgili Bağlantılar

- [Proje Tanımı](Project-Definition.md)
- [Geliştirme Akışı](Development-Workflow.md)
- [Katkıda Bulunma Rehberi](../.github/CONTRIBUTING.md)

---

<p align="right"><i>Bu belge LearnOps MVP v1.2 teknik gereksinim dokümanı esas alınarak hazırlanmıştır.</i></p>

</details>

---

<details>
<summary><strong>🇬🇧 English</strong></summary>
<br>

This page describes the high-level architecture of the LearnOps platform, its main components, and the relationships between them.

---

## Main Components

- **Frontend:** User interface built with Next.js 14+ (App Router). Course pages use SSG; dashboard and progress data use client-side fetch.
- **Backend API:** REST API built with FastAPI (Python 3.11+). Handles OAuth flow, quiz evaluation, progress calculation, and JWT management.
- **Database:** PostgreSQL 15+. SQLAlchemy (async) ORM layer, Alembic migration management.
- **Content (Git Repo):** Course and section content stored as MDX files in Git. Not a container — read from the filesystem during the frontend build.
- **Authentication:** Google, LinkedIn, and GitHub OAuth 2.0 flows. Custom JWT generation and validation service (no external auth provider).

---

## System Architecture

### C4 Level 1 — System Context

```
                        ┌─────────────────────────────────────────────────────┐
                        │                    LearnOps                         │
                        │                                                     │
  [Student]  ─────────► │  ┌──────────────┐       ┌──────────────────────┐  │
                        │  │   Frontend   │──────►│     Backend API      │  │
                        │  │  (Next.js)   │       │     (FastAPI)        │  │
                        │  └──────────────┘       └──────────┬───────────┘  │
                        │                                     │              │
                        │                          ┌──────────▼───────────┐  │
                        │                          │     PostgreSQL DB    │  │
                        │                          └──────────────────────┘  │
                        └──────────────────┬──────────────────────────────────┘
                                           │
               ┌───────────────────────────┼───────────────────────────┐
               │                           │                           │
               ▼                           ▼                           ▼
        [Google OAuth]            [LinkedIn OAuth]             [GitHub OAuth]
```

### C4 Level 2 — Container Diagram

```
┌──────────────────────────────────────── GCP ──────────────────────────────────────────┐
│                                                                                        │
│   ┌───────────────────────────┐          ┌───────────────────────────────────────┐    │
│   │   Frontend Container      │          │        Backend Container              │    │
│   │   Next.js 14+             │          │        FastAPI (Python 3.11+)         │    │
│   │   Cloud Run               │          │        Cloud Run                      │    │
│   │   Port: 3000              │          │        Port: 8000                     │    │
│   │                           │          │                                       │    │
│   │  • SSG course pages       │  /api/*  │  • REST API (/v1/*)                  │    │
│   │  • Client-side dashboard  │─────────►│  • OAuth callback handler            │    │
│   │  • MDX rendering          │  proxy   │  • JWT generation & validation       │    │
│   │  • next.config.ts rewrite │          │  • Quiz evaluation                   │    │
│   │                           │          │  • Progress calculation              │    │
│   └───────────────────────────┘          └───────────────────┬───────────────────┘    │
│                                                              │                        │
│                                          ┌───────────────────▼───────────────────┐    │
│                                          │        PostgreSQL 15+                 │    │
│                                          │        Cloud SQL                      │    │
│                                          │        Port: 5432                     │    │
│                                          │                                       │    │
│                                          │  • users & oauth_accounts            │    │
│                                          │  • courses & sections                │    │
│                                          │  • enrollments & user_progress       │    │
│                                          │  • quizzes, questions, attempts      │    │
│                                          └───────────────────────────────────────┘    │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

         ┌────────────────────────────────────────────────────────┐
         │  Content (Git Repo) — Not a Container                  │
         │  MDX files read from filesystem at build-time          │
         └────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Login (OAuth Flow)

```
User               Frontend              Backend               OAuth Provider
  │                    │                    │                        │
  │ Click login ──────►│                    │                        │
  │                    │ GET /auth/google/  │                        │
  │                    │ login ────────────►│                        │
  │                    │                    │ Generate OAuth URL      │
  │                    │◄───────────────────│ (state for CSRF)        │
  │                    │                    │                        │
  │ Provider consent ◄─│ Redirect ──────────┼───────────────────────►│
  │ Approve ───────────┼────────────────────┼───────────────────────►│
  │                    │                    │◄─── code returned ──────│
  │                    │                    │                        │
  │                    │     code → token exchange                   │
  │                    │     fetch email, name, profile              │
  │                    │                    │                        │
  │                    │     check users table                       │
  │                    │     (auto-register if not found)            │
  │                    │                    │                        │
  │                    │     generate JWT access (15min) +           │
  │                    │     refresh (7 days)                        │
  │                    │                    │                        │
  │ Redirect to       │◄── set httpOnly    │                        │
  │ dashboard ◄────────│    cookie token    │                        │
```

### 2. Section Completion & Progress Update

```
User               Frontend              Backend               Database
  │                    │                    │                       │
  │ Click "Complete" ─►│                    │                       │
  │                    │ POST /progress/    │                       │
  │                    │ sections/{id}/     │                       │
  │                    │ complete ─────────►│                       │
  │                    │                    │ user_progress         │
  │                    │                    │ completed=true ──────►│
  │                    │                    │                       │
  │                    │                    │ All sections done? ──►│
  │                    │                    │                       │
  │                    │                    │ Yes → set             │
  │                    │                    │ enrollments.          │
  │                    │                    │ completed_at ────────►│
  │                    │                    │                       │
  │ Progress bar       │◄── 200 OK          │                       │
  │ updates ◄──────────│    progress_percent│                       │
```

### 3. Quiz Submit Flow

```
User               Frontend              Backend               Database
  │                    │                    │                       │
  │ Start quiz ───────►│ POST /quizzes/     │                       │
  │                    │ {id}/attempts ────►│                       │
  │                    │                    │ Create quiz_attempts  │
  │                    │                    │ record ──────────────►│
  │                    │◄── questions       │                       │
  │                    │    returned        │                       │
  │                    │    (NO correct_    │                       │
  │ Answer questions   │     index) ────────│                       │
  │ Submit ───────────►│ POST /quiz-        │                       │
  │                    │ attempts/{id}/     │                       │
  │                    │ submit ───────────►│                       │
  │                    │                    │ Time check            │
  │                    │                    │ (submitted_at -       │
  │                    │                    │  started_at >         │
  │                    │                    │  duration + 30s?)     │
  │                    │                    │                       │
  │                    │                    │ Evaluate answers      │
  │                    │                    │ Calculate score ─────►│
  │                    │                    │                       │
  │ Results screen ◄───│◄── score, passed,  │                       │
  │                    │    correct_index   │                       │
  │                    │    included        │                       │
```

---

## Backend Component Structure (FastAPI)

```
backend/app/
│
├── routers/           ← HTTP endpoint definitions (thin layer, no business logic)
│   ├── auth.py        → /auth/* — OAuth callback, token refresh, logout
│   ├── users.py       → /users/* — Profile CRUD, account deletion
│   ├── courses.py     → /courses/* — Listing, detail, section meta
│   ├── enrollments.py → /enrollments/* + /progress/* — Enrollment, progress
│   └── quizzes.py     → /quizzes/* + /quiz-attempts/* — Quiz flow
│
├── services/          ← Business logic (independent of routers, testable)
│   ├── oauth_service.py    → Token exchange, userinfo fetch, account merging
│   ├── jwt_service.py      → Token generation, validation, blacklist check
│   ├── quiz_service.py     → Randomization, time validation, score calculation
│   └── progress_service.py → Section completion, progress % update
│
├── models/            ← SQLAlchemy ORM models (Python representation of DB schema)
├── schemas/           ← Pydantic request/response schemas (API contract)
├── middleware/        ← Auth middleware, rate limiter
└── database.py        ← Async engine, session factory, connection pool (min:5 max:20)
```

## Frontend Page Structure (Next.js App Router)

```
frontend/app/
│
├── (auth)/
│   ├── login/          → OAuth login buttons
│   └── callback/       → OAuth callback handler, token written to cookie
│
├── dashboard/          → GET /dashboard/summary — client-side fetch, skeleton loader
│
├── courses/
│   ├── page.tsx         → Course listing (SSG — build-time rendered)
│   ├── [slug]/
│   │   ├── page.tsx     → Course detail (SSG)
│   │   └── [sectionId]/ → Section content (SSG + client-side progress)
│
├── quiz/
│   ├── [quizId]/        → Quiz flow, countdown, questions
│   └── [quizId]/results/[attemptId]/ → Result review
│
└── profile/             → Profile management, avatar selection, account deletion
```

---

## Database Schema (Summary)

```
users ──────────────────────────────────────────────────────────────────────┐
  │  1:N  oauth_accounts (provider connections)                             │
  │                                                                          │
  │  N:M  courses  ──via──  enrollments (enrollment + progress_percent)     │
  │                │                                                         │
  │                │  1:N  sections  ──via──  user_progress (completion)    │
  │                │                                                         │
  │                │  1:1  quizzes                                           │
  │                           │  1:N  questions                              │
  │                           │                                              │
  │  1:N  quiz_attempts ──────┘                                              │
  │           │  1:N  quiz_attempt_answers                                   │
  │                                                                          │
  └────────────────────────────────────────── deleted_accounts (audit log)
```

**Key Design Decisions:**
- All primary keys are **UUID** — eliminates sequential ID security vulnerabilities
- `sections.section_id_str` — matches MDX frontmatter `id`; changing the filename doesn't break the DB link
- `oauth_accounts.refresh_token_encrypted` — AES-256 encrypted (except GitHub — doesn't provide refresh tokens)
- `deleted_accounts` — After hard delete: only UUID + timestamp + reason; contains no personal data

---

## Security Architecture

| Topic | Implementation |
|---|---|
| **Authentication** | OAuth 2.0 (no passwords stored) + JWT (access 15min / refresh 7d) |
| **Token Storage** | httpOnly, Secure, SameSite=Strict cookie |
| **Quiz Security** | `correct_index` is **never** sent to client before submit |
| **Rate Limiting** | `/auth/*` → 10 req/min · General API → 100 req/min |
| **SQL Injection** | SQLAlchemy ORM parametric queries — no raw SQL |
| **XSS** | MDX server-side rendered, next-mdx-remote sanitize active |
| **CSRF** | SameSite=Strict cookie + Origin header validation |
| **Data Deletion** | Hard delete transaction — partial deletion impossible |
| **Refresh Token** | AES-256 encrypted at rest, blacklisted on logout |

---

## Deployment Architecture

```
  GitHub (main branch)
         │
         ▼
  GitHub Actions CI/CD
  ┌──────────────────────────────────────────┐
  │  1. test-backend  (pytest + coverage)   │
  │  2. test-frontend (npm test + build)    │
  │  3. lint          (ruff + mypy + eslint)│
  └───────────────────┬──────────────────────┘
                      │ All checks passed
                      ▼
  Docker Build & Push → GCP Artifact Registry
  ┌───────────────────────────────────────────┐
  │  europe-west1-docker.pkg.dev/learnops/   │
  │  backend:{git-sha}                       │
  │  frontend:{git-sha}                      │
  └───────────────────┬───────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   alembic upgrade head     │  ← DB migration
         │   seed_content.py          │  ← MDX → PostgreSQL
         └────────────┬───────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
  Cloud Run (Backend)     Cloud Run (Frontend)
  learnops-backend        learnops-frontend
  europe-west1            europe-west1
  min:1 / max:10 inst.    min:1 / max:5 inst.
          │
          ▼
  Cloud SQL (PostgreSQL)
  Secure connection via Cloud SQL Auth Proxy
```

**Environment Differences:**

| Environment | Platform | Trigger |
|---|---|---|
| **Development** | Docker Compose (localhost) | Manual: `docker compose up` |
| **Staging** | GCP Cloud Run + Cloud SQL | Automatically on PR open |
| **Production** | GCP Cloud Run + Cloud SQL | Automatically on merge to `main` |

---

## Technologies and Rationale

**Next.js 14 (App Router)**
Course pages are rendered at build-time with SSG — zero server load as long as content doesn't change. Client-side fetch is used only for user-specific data (dashboard, progress). Deployed as a container on GCP Cloud Run instead of Vercel, consolidating the entire infrastructure on a single platform.

**FastAPI (Python 3.11+)**
Native async support lets OAuth flows and database operations run in parallel without blocking. Pydantic schemas provide both request validation and automatic API documentation. Type safety is enforced with mypy.

**PostgreSQL 15+**
JSONB support is used for quiz `options`. UUID primary keys eliminate sequential ID security vulnerabilities. GCP Cloud SQL as a managed service handles backups, patching, and high availability automatically.

**MDX + Git**
Content is managed like code: review via PR, change tracking via diff, staging via branch. Section `id`s are fixed in frontmatter — renaming a file never breaks the database link.

**GCP (Cloud Run + Cloud SQL + Artifact Registry)**
All infrastructure under one GCP account — billing, access control, and log monitoring in one place. `europe-west1` (Belgium) provides reasonable latency for Turkish users and GDPR compliance. Cloud Run scales to zero when idle; min:1 instance prevents cold starts.

---

## 🔗 Related Links

- [Project Definition](Project-Definition.md)
- [Development Workflow](Development-Workflow.md)
- [Contributing Guide](../.github/CONTRIBUTING.md)

---

<p align="right"><i>This document is based on the LearnOps MVP v1.2 technical requirements specification.</i></p>

</details>