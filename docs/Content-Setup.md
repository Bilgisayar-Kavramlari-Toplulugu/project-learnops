# İçerik Ekibi Kurulum ve Çalışma Rehberi

> Bu doküman yalnızca içerik ekibine özeldir.
> Geliştirici kurulum rehberi (`learnops_gelistirici_rehberi_v1.0`) ile karıştırılmamalıdır.

---

## 1. Rol Bazlı Kurulum

### 1.1 Backend Üyeleri (P1, P2, P3)

Zaten sahip olduklarınız: Git, Docker Desktop, Python 3.13, Poetry, VSCode

**Ek adım — VSCode MDX eklentisi:**

VSCode açıldığında sağ altta "Install Recommended Extensions" bildirimi çıkar.
`unifiedjs.vscode-mdx` eklentisini kurun. Bu eklenti `.vscode/extensions.json`'da tanımlıdır.

---

### 1.2 Frontend Üyeleri (P4, P5)

Zaten sahip olduklarınız: Git, Docker Desktop, Node.js 22, VSCode

**Ek kurulum zorunludur.**

**Python 3.13 kurulumu:**

Windows: https://python.org/downloads → Python 3.13.x indirin.
Kurulum sırasında **"Add Python to PATH"** kutusunu işaretleyin.

```powershell
# Doğrulama
python --version   # Python 3.13.x çıkmalı
```

**Poetry 2.3.x kurulumu:**

```powershell
pip install poetry
poetry --version   # Poetry 2.3.x çıkmalı
```

**Backend bağımlılıkları:**

```powershell
cd backend
poetry config virtualenvs.in-project true
poetry install
```

---

### 1.3 Infra Üyesi (P6)

```powershell
python --version        # 3.13.x olmalı
poetry --version        # 2.3.x olmalı
docker compose version  # 2.x olmalı
```

---

## 2. İlk Repo Kurulumu (Herkes İçin)

```powershell
# 1. Repoyu klonla
git clone https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops.git
cd project-learnops

# 2. Develop branch'e geç
git checkout develop
git pull origin develop

# 3. .env dosyasını oluştur
copy .env.example .env
```

**.env dosyasında doldurulması gereken minimum alanlar:**

```dotenv
POSTGRES_USER=learnops
POSTGRES_PASSWORD=localdev123
POSTGRES_DB=learnops
DATABASE_URL=postgresql+asyncpg://learnops:localdev123@localhost:5432/learnops
ENVIRONMENT=development
```

> JWT, OAuth ve diğer alanlar içerik çalışması için gerekli değildir.
> Diğer değerleri ekip liderinden alın.

```powershell
# 4. Sadece DB'yi başlat (full stack gerekmez)
cd infrastructure/develop
copy ..\..\env .env    # docker-compose .env'i kendi dizininde arar
docker compose up -d db

# 5. Migration uygula (ilk kurulumda bir kez)
cd ../../backend
poetry run alembic upgrade head

# 6. Seed testi (CNT-00 tamamlandıktan sonra)
cd ..
poetry run python scripts/seed_content.py --env development
```

---

## 3. Branch Adlandırma

İçerik ekibi için standart format:

```
content/CNT-XX-kurs-adi
```

**Örnekler:**

```powershell
git checkout -b content/CNT-02-linux-temelleri
git checkout -b content/CNT-06-cicd-giris
git checkout -b content/CNT-00-scripts
```

> ⚠️ `feature/ISSUE-xxx` formatı yazılım ekibine aittir.
> İçerik ekibi kesinlikle `content/CNT-XX` formatını kullanır. Karıştırılmamalıdır.

---

## 4. MDX Önizleme Stratejisi

| Yöntem | Nasıl | Ne Gösterir | Ne Göstermez |
|--------|-------|-------------|--------------|
| **VSCode MDX** (Hızlı) | Ctrl+Shift+V | Başlıklar, listeler, kod blokları | Platform stili, next-mdx-remote componentleri |
| **Full Stack** (Gerçek Görünüm) | `docker compose up -d` → http://localhost:3000 | Tüm platform stili, gerçek render | — |

**MVP pratik karar:** Yazarlar VSCode'da yazar ve seed testi yapar.
IL, staging'de görsel review yaparak son onayı verir. Tam stack kurulumu isteğe bağlıdır.

---

## 5. Kritik Kurallar

### 5.1 `id` Alanı — ASLA Değiştirilemez

```yaml
---
id: "linux-001-nedir"    # ← Bu alan bir kez yazılır, sonsuza dek sabit kalır
title: "Linux Nedir?"
order: 10
order_index: 10
---
```

`id` değişirse `user_progress` tablosundaki kayıtlar bu ID'yi bulamaz ve
tüm kullanıcıların ilerleme verisi o section için **sıfırlanır**.

- Dosya adı değişebilir ✅
- Başlık değişebilir ✅
- **`id` değişmez** ❌

---

### 5.2 `order` Kuralı — 10'ar Artar

```
✅ Doğru:  10, 20, 30, 40...
❌ Yanlış: 1, 2, 3, 4...
```

10'ar artış sayesinde araya yeni section eklemek için her zaman boşluk bulunur.
Örneğin 10 ile 20 arasına 15 eklenebilir — tüm dosyaları yeniden numaralandırmak gerekmez.

> `order` ve `order_index` her zaman aynı değeri alır. İkisi birlikte yazılır.

---

### 5.3 `course_slug` Eşleşmesi

`quiz.json` içindeki `course_slug` değeri `meta.json` içindeki `slug` ile
**birebir** aynı olmalıdır. Tek karakter fark CI'ı patlatır.

```json
// meta.json
{ "slug": "linux-temelleri" }

// quiz.json
{ "course_slug": "linux-temelleri" }  ← birebir aynı olmalı
```

---

### 5.4 `is_published` Kuralı

Her kurs `is_published: false` ile başlar.
Yalnızca IL onayından sonra `true` yapılır.

`false` olan kurslar DB'ye yazılır ama frontend'de görünmez —
taslak çalışmalarınızı güvenle commit edebilirsiniz.

---

### 5.5 Seed Olmadan PR Açılmaz

PR açmadan önce şu komutlar hatasız çalışmalıdır:

```powershell
poetry run python scripts/validate_content.py    # CNT-00 sonrası aktif
poetry run python scripts/seed_content.py --env development
```

---

## 6. Referans Şablon

Yeni kurs açarken `content/courses/_ornek-kurs/` dizinini kopyalayın:

```
_ornek-kurs/
├── meta.json                        ← Kurs metadata
├── quiz.json                        ← Quiz soruları
└── sections/
    ├── 010-giris.mdx                ← İlk section (order: 10)
    └── 020-temel-kavramlar.mdx      ← İkinci section (order: 20)
```

**Kopyaladıktan sonra yapılacaklar:**

1. Dizin adını kurs slug'ınızla değiştirin
2. `meta.json` içindeki `slug` ve `title` alanlarını güncelleyin
3. `quiz.json` içindeki `course_slug`'ı `meta.json` slug'ıyla eşleştirin
4. Her section'ın `id` alanını master plandaki format kuralına göre belirleyin (bkz. İçerik Master Planı §4.2)
5. `is_published: false` ile başlayın

---

## 7. Frontmatter ID Format Kuralı

```
[konu-kodu]-[sıra-3-hane]-[slug]
```

| Kurs | Konu Kodu | Örnek |
|------|-----------|-------|
| Linux Temelleri | `linux` | `linux-001-nedir` |
| Git ve Versiyon Kontrolü | `git` | `git-004-branch` |
| Docker Temelleri | `docker` | `docker-008-compose` |
| CI/CD Giriş | `cicd` | `cicd-007-deploy` |
| Kubernetes Temelleri | `k8s` | `k8s-010-kubectl` |
| Terraform ile IaC | `tf` | `tf-004-state` |
| GitHub Actions İleri | `gha` | `gha-007-oidc` |
| Cloud Native Kavramlar | `cn` | `cn-002-12factor` |
| Kubernetes İleri | `k8s-adv` | `k8s-adv-001-rbac` |
| Monitoring & Observability | `obs` | `obs-002-prometheus` |
| DevSecOps Temelleri | `sec` | `sec-006-supply` |
| SRE Kavramları | `sre` | `sre-003-budget` |

---

## 8. Commit Mesajı Formatı

```
content(kapsam): açıklama (#CNT-XX)
```

**Örnekler:**

```
content(linux): add linux-temelleri sections 1-8 (#CNT-02)
content(docker): add docker-temelleri quiz 15 questions (#CNT-04)
fix(content): correct quiz explanation linux q3 (#CNT-08)
```

---
