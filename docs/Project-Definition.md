# Projenin Tanımı

<details open>

<summary><strong>🇹🇷 Türkçe</strong></summary>

<br>

Bu belge **LearnOps — Topluluk Eğitim Platformu** projesinin amacını, hedeflerini ve kapsamını tanımlar.

---

## 🎯 Proje Amacı

**LearnOps**, DevOps alanında kaliteli, ücretsiz ve Türkçe eğitim içerikleri sunan açık kaynak kodlu bir öğrenme yönetim platformudur.

Platform, topluluk odaklı bir yaklaşımla geliştirilmektedir. Hedef; DevOps öğrenmek isteyen herkesin erişebileceği, modern, interaktif ve ölçeklenebilir bir eğitim deneyimi sunmaktır.

**Vizyon:** Türkiye'nin en kapsamlı DevOps öğrenme platformu olmak ve DevOps topluluğunu güçlendirerek nitelikli mühendislerin yetişmesine katkıda bulunmak.

---

## 🔑 Ana Hedefler

**Birincil Hedefler:**
- DevOps konusunda kaliteli, güncel ve erişilebilir Türkçe eğitim içerikleri oluşturmak
- Topluluk katkısıyla sürekli gelişen, açık kaynak bir öğrenme ekosistemi inşa etmek
- Kullanıcıların kendi hızlarında öğrenebilecekleri esnek ve takip edilebilir bir platform sağlamak
- Açık kaynak prensipleriyle şeffaf ve işbirlikçi bir geliştirme süreci yürütmek

**İkincil Hedefler:**
- DevOps topluluğunu büyütmek ve güçlendirmek
- Öğrenme sürecini ölçülebilir hale getirmek (ilerleme takibi, quiz, tamamlama)
- Kullanıcı deneyimini ön planda tutan modern bir arayüz sunmak
- Ölçeklenebilir ve sürdürülebilir bir teknik altyapı kurmak

**Teknik Başarı Kriterleri (MVP):**
- API yanıt süresi p95 < 500ms
- Sayfa ilk yükleme (LCP) < 2.5 saniye
- KVKK/GDPR tam uyumu
- Test coverage > %80 (backend)

---

## 🗺️ Kapsam

### ✅ MVP (v1.0) Kapsamında

**Kimlik ve Kullanıcı Yönetimi**
- Google, LinkedIn ve GitHub ile OAuth 2.0 girişi (otomatik kayıt dahil)
- Kullanıcı profili yönetimi (görünen ad, biyografi, avatar)
- Birden fazla OAuth hesabını tek profile bağlama (kullanıcı onaylı)
- KVKK/GDPR uyumlu hesap silme (hard delete + audit log)
- Baş harfi avatarı ve 10 sistem avatarından seçim

**Kurs ve İçerik Sistemi**
- MDX tabanlı kurs içerikleri (Git'te saklanır, build-time render)
- Kategori, zorluk ve arama ile filtrelenebilir kurs listeleme (SSG)
- Kurs detay sayfası (açıklama, section listesi, tahmini süre)
- Section bazlı içerik görüntüleme ve navigasyon (Önceki / Sonraki)

**İlerleme ve Kayıt**
- Tek tıkla kursa kayıt
- Section bazlı ilerleme takibi (eşit ağırlıklı progress bar)
- Kurs tamamlanma: tüm section'lar tamamlandığında otomatik işaretleme

**Quiz Sistemi**
- Her kurs için bir quiz (yapılandırılabilir süre, varsayılan 20 dakika)
- Randomize soru sırası; `correct_index` submit öncesi client'a gönderilmez
- Anında değerlendirme, skor ve geçti/kaldı sonucu (varsayılan %70 eşiği)
- Sonuç inceleme: doğru/yanlış/cevapsız renk kodlaması, açıklamalar
- Sınırsız tekrar hakkı

**Dashboard ve Navigasyon**
- Kişiselleştirilmiş dashboard: hoşgeldin kartı, devam eden kurslar, istatistikler
- Boş durum (Empty State): kayıtlı kurs yokken yönlendirme CTA'sı
- Sol sidebar navigasyon (Dashboard · Kurslarım · Tüm Kurslar · Profil)
- Mobil uyumlu hamburger menü (< 768px)
- "Devam Et" butonu: kaldığı son section'a yönlendirme

**Altyapı ve Güvenlik**
- Docker Compose ile lokal geliştirme ortamı
- GCP Cloud Run (Backend + Frontend) + Cloud SQL (PostgreSQL) — production
- GitHub Actions CI/CD pipeline (test → lint → build → deploy)
- JWT tabanlı kimlik doğrulama (access: 15dk / refresh: 7 gün, httpOnly cookie)
- Rate limiting: `/auth/*` 10 istek/dk · Genel API 100 istek/dk
- HTTPS zorunluluğu, CORS, CSRF koruması

### ❌ Kapsam Dışında (MVP'de Yok)

| Özellik | Planlanan Versiyon |
|---|---|
| Admin Paneli (UI) | v2.0 |
| Video İçerik Desteği | v2.0 |
| Sertifika Sistemi | v2.0 |
| Rozet / Başarı Sistemi | v2.0 |
| Leaderboard | v2.0 |
| Redis Önbellekleme | v2.0 |
| Ödeme / Premium İçerik | v2.0+ |
| Mobil Uygulama (iOS/Android) | v3.0 |

> MVP'de admin işlemleri için dokümante edilmiş SQL script'leri kullanılır (`ops/delete_user.sql`).

---

## 🏗️ Teknik Yığın (Tech Stack)

| Katman | Teknoloji |
|---|---|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python 3.11+), SQLAlchemy (async), Alembic |
| **Veritabanı** | PostgreSQL 15+ |
| **İçerik** | MDX, next-mdx-remote, Git |
| **Auth** | OAuth 2.0 (Google · LinkedIn · GitHub), JWT |
| **Altyapı** | GCP Cloud Run, Cloud SQL, Artifact Registry |
| **CI/CD** | GitHub Actions, Docker Compose |

---

## 🗓️ MVP Sprint Planı

| Sprint | Konu |
|---|---|
| Sprint 1 | Proje altyapısı (Docker Compose, CI/CD, DB migration) |
| Sprint 2 | OAuth giriş/kayıt akışı (Google + LinkedIn + GitHub) |
| Sprint 3 | Kullanıcı profili, avatar sistemi, hesap yönetimi |
| Sprint 4 | İçerik sistemi (MDX yapısı, seed script, kurs listeleme) |
| Sprint 5 | Kurs detay, section görüntüleme, ilerleme takibi |
| Sprint 6 | Quiz sistemi (attempt, submit, sonuç inceleme) |
| Sprint 7 | Dashboard, sol sidebar navigasyon, genel UI/UX |
| Sprint 8 | Güvenlik review, performans optimizasyonu, production deploy |

---

## 👥 Proje Ekibi

**Proje Lideri:** [@flovearth](https://github.com/flovearth)

**Takım Üyeleri:**
<!-- Takım üyelerini buraya ekleyin -->
 - [Takım Bilgisi için Tıklayınız](Team.md)
 <br>

---

## 🔗 İlgili Bağlantılar
- [Mimari Genel Bakış](Architecture-Overview.md)
- [Geliştirme Akışı](Development-Workflow.md)
- [Katkıda Bulunma Rehberi](../.github/CONTRIBUTING.md)
- [Repository Ana Sayfası](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops)

---
</details>

# Project Defitiniton

<details>
<summary><strong>🇬🇧 English</strong></summary>
<br>



This document defines the purpose, goals, and scope of **LearnOps — Community Learning Platform**.

---

## 🎯 Project Purpose

**LearnOps** is an open-source learning management platform that provides high-quality, free, Turkish-language DevOps education.

Built with a community-first approach, the platform aims to deliver a modern, interactive, and scalable learning experience accessible to anyone who wants to learn DevOps.

**Vision:** To become Turkey's most comprehensive DevOps learning platform and contribute to the growth of skilled engineers within the community.

---

## 🔑 Key Objectives

**Primary Objectives:**
- Create high-quality, up-to-date, and accessible Turkish DevOps educational content
- Build a continuously evolving, open-source learning ecosystem driven by community contributions
- Provide a flexible and trackable platform where users can learn at their own pace
- Run a transparent and collaborative development process guided by open-source principles

**Secondary Objectives:**
- Grow and strengthen the DevOps community
- Make the learning process measurable (progress tracking, quizzes, course completion)
- Deliver a modern interface that prioritizes user experience
- Build a scalable and maintainable technical infrastructure

**Technical Success Criteria (MVP):**
- API response time p95 < 500ms
- Page first load (LCP) < 2.5 seconds
- Full KVKK/GDPR compliance
- Test coverage > 80% (backend)

---

## 🗺️ Scope

### ✅ In Scope — MVP (v1.0)

**Identity & User Management**
- OAuth 2.0 login via Google, LinkedIn, and GitHub (with automatic registration)
- User profile management (display name, bio, avatar)
- Linking multiple OAuth accounts to a single profile (user-confirmed)
- KVKK/GDPR-compliant account deletion (hard delete + audit log)
- Initials avatar and selection from 10 system avatars

**Course & Content System**
- MDX-based course content (stored in Git, rendered at build-time)
- Filterable course listing by category, difficulty, and search (SSG)
- Course detail page (description, section list, estimated duration)
- Section-level content display and navigation (Previous / Next)

**Progress & Enrollment**
- One-click course enrollment
- Section-level progress tracking (equal-weight progress bar)
- Course completion: automatic marking when all sections are done

**Quiz System**
- One quiz per course (configurable duration, default 20 minutes)
- Randomized question order; `correct_index` is never sent to client before submit
- Instant evaluation with score and pass/fail result (default 70% threshold)
- Result review: color-coded correct/wrong/unanswered with explanations
- Unlimited retakes

**Dashboard & Navigation**
- Personalized dashboard: welcome card, in-progress courses, stats
- Empty state: CTA to browse courses when no enrollments exist
- Left sidebar navigation (Dashboard · My Courses · All Courses · Profile)
- Mobile-friendly hamburger menu (< 768px)
- "Continue" button: navigates to the last visited section

**Infrastructure & Security**
- Docker Compose for local development environment
- GCP Cloud Run (Backend + Frontend) + Cloud SQL (PostgreSQL) — production
- GitHub Actions CI/CD pipeline (test → lint → build → deploy)
- JWT-based authentication (access: 15min / refresh: 7 days, httpOnly cookie)
- Rate limiting: `/auth/*` 10 req/min · General API 100 req/min
- HTTPS enforcement, CORS, CSRF protection

### ❌ Out of Scope (Not in MVP)

| Feature | Planned Version |
|---|---|
| Admin Panel (UI) | v2.0 |
| Video Content Support | v2.0 |
| Certificate System | v2.0 |
| Badge / Achievement System | v2.0 |
| Leaderboard | v2.0 |
| Redis Caching | v2.0 |
| Payments / Premium Content | v2.0+ |
| Mobile App (iOS/Android) | v3.0 |

> In MVP, admin operations are handled via documented SQL scripts (`ops/delete_user.sql`).

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python 3.11+), SQLAlchemy (async), Alembic |
| **Database** | PostgreSQL 15+ |
| **Content** | MDX, next-mdx-remote, Git |
| **Auth** | OAuth 2.0 (Google · LinkedIn · GitHub), JWT |
| **Infrastructure** | GCP Cloud Run, Cloud SQL, Artifact Registry |
| **CI/CD** | GitHub Actions, Docker Compose |

---

## 🗓️ MVP Sprint Plan

| Sprint | Focus |
|---|---|
| Sprint 1 | Project infrastructure (Docker Compose, CI/CD, DB migration) |
| Sprint 2 | OAuth login/registration flow (Google + LinkedIn + GitHub) |
| Sprint 3 | User profile, avatar system, account management |
| Sprint 4 | Content system (MDX structure, seed script, course listing) |
| Sprint 5 | Course detail, section display, progress tracking |
| Sprint 6 | Quiz system (attempt, submit, result review) |
| Sprint 7 | Dashboard, left sidebar navigation, overall UI/UX |
| Sprint 8 | Security review, performance optimization, production deployment |

---

## 👥 Project Team

**Project Lead:** [@flovearth](https://github.com/flovearth)

**Team Members:**
<!-- Add team members here -->
- [Team Information](Team.md)
<br>
---

## 🔗 Related Links

- [Architecture Overview](Architecture-Overview.md)
- [Development Workflow](Development-Workflow.md)
- [Contributing Guide](../.github/CONTRIBUTING.md)
- [Repository Home](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops)

---

<p align="right"><i>This document is based on the LearnOps MVP v1.2 technical requirements specification.</i></p>

</details>
