# 🤝 Katkıda Bulunma Rehberi | Contributing Guide

> **Hoş geldiniz!** Bu rehber, LearnOps topluluğuna katkıda bulunmak isteyen herkes için hazırlanmıştır. Sizi aramızda görmekten mutluluk duyuyoruz! 🎉
> Lütfen Türkçe veya İngilizce dil seçeneklerinden birini seçiniz.

> **Welcome!** This guide is designed for anyone who wants to contribute to the LearnOps community. We're happy to have you join us! 🎉
> Please choose between Turkish or English.

---

<details open>
<summary><strong>🇹🇷 Türkçe Rehber</strong></summary>

## 💫 Neden Katkıda Bulunmalısınız?

Açık kaynak topluluğuna katkıda bulunmak:
- 🚀 **Becerilerinizi geliştirir** — Gerçek projelerde çalışarak öğrenirsiniz
- 🤝 **Bağlantılar kurarsınız** — DevOps topluluğunda benzer ilgi alanlarına sahip insanlarla tanışırsınız
- 📚 **Deneyim kazanırsınız** — CV'nize ekleyebileceğiniz somut, full-stack bir proje
- 💪 **Topluluğa katkı sağlarsınız** — Türkçe DevOps eğitimini herkes için daha iyi hale getirirsiniz

**İlk katkınızı yapmaya hazır mısınız? Hadi başlayalım!** 🎯

---

## 🎨 Nasıl Katkıda Bulunabilirsiniz?

### 🐛 Hata Buldum!
Projede bir hata mı buldunuz? Harika! İşte yapmanız gerekenler:

1. **Önce mevcut issue'lara bakın** — Aynı sorun zaten raporlanmış olabilir
2. **Yeni bir issue açın** — Sorunu detaylı ve tekrarlanabilir şekilde anlatın
3. **Düzeltmeyi deneyin** — Kodlamaya aşinaysanız PR gönderin!

**Örnek:** "Quiz submit sonrası 500 hatası alıyorum"
```
Adımlar:
1. Kursa kayıt oluyorum
2. Quiz'i başlatıyorum
3. Cevapları seçiyorum ve "Gönder"e tıklıyorum
4. 500 Internal Server Error alıyorum

Beklenen: Skor ekranı gelmeli
Gerçekleşen: 500 hatası veriyor

Ortam: Docker Compose, Python 3.11, Node 20
```

### ✨ Fikrim Var!
Yeni bir özellik mi istiyorsunuz? Süper!

1. **Önce Discussions'a bakın** — Belki başkaları da aynı şeyi istiyor
2. **Feature Request açın** — Fikrinizi detaylı anlatın
3. **Toplulukla tartışın** — Geri bildirim alın, fikri geliştirin
4. **Kodlamaya başlayın** — Onay aldıktan sonra PR gönderin

**Örnek:** "Kurs tamamlama sertifikası"
```
Motivasyon:
Kullanıcıların kursu tamamladığında bir başarı belgesi alması
motivasyonu artırabilir.

Önerim:
v2.0 sertifika sistemine zemin hazırlamak için completed_at
alanını kullanan PDF export özelliği.

Faydası:
- Kullanıcı motivasyonu artar
- Paylaşılabilir başarı belgesi
- Topluluğa değer katar
```

### 📖 Kurs İçeriği Katkısı
Kod yazmak zorunda değilsiniz! Kurs içeriği de büyük değer taşır:

- **Yeni DevOps kursu ekleyin** — MDX formatında, `content/courses/` altına
- **Mevcut dersleri güncelleyin** — Güncel araç versiyonları, yeni örnekler
- **Typo ve dil hataları düzeltin** — Küçük ama önemli
- **Quiz soruları ekleyin / iyileştirin** — Daha anlamlı sorular, açıklamalar

### 📝 Dokümantasyon İyileştirmesi
- **README'yi iyileştirin** — Daha açık, daha anlaşılır
- **API örnekleri ekleyin** — Endpoint'lerin nasıl kullanıldığını gösterin
- **Kurulum adımlarını netleştirin** — İlk kurulumu kolaylaştıracak her şey değerlidir

### 🎯 İlk Katkı İçin İdeal
Yeni başlıyorsanız, bu işlerle başlayın:

- 🏷️ `good-first-issue` etiketli issue'lar
- 📝 Dokümantasyon iyileştirmeleri
- 🐛 Basit hata düzeltmeleri
- 📚 Kurs içeriğinde typo düzeltmesi

---

## 🚀 Hızlı Başlangıç

### 1️⃣ Repository'yi Hazırlayın
```bash
# Repository'yi fork edin (GitHub'da "Fork" butonuna tıklayın)

# Bilgisayarınıza klonlayın
git clone https://github.com/KULLANICI-ADINIZ/project-learnops.git
cd project-learnops

# Ana repo'yu upstream olarak ekleyin
git remote add upstream https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops.git
```

### 2️⃣ Geliştirme Ortamını Ayağa Kaldırın
```bash
# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını açıp OAuth credentials ve JWT_SECRET değerlerini gir

# Tüm servisleri başlat (Backend + Frontend + PostgreSQL)
docker compose up --build

# İlk kurulumda içerikleri seed et
docker compose exec backend python backend/scripts/seed_content.py --env development
```

### 3️⃣ Branch Oluşturun
```bash
# develop branch'inden yeni branch oluşturun
git checkout develop
git pull upstream develop
git checkout -b feature/benim-harika-ozelligim

# Değişikliklerinizi yapın
```

### 4️⃣ Değişiklikleri Gönderin
```bash
# Commit yapın
git add .
git commit -m "feat: harika yeni özellik eklendi"

# GitHub'a gönderin
git push origin feature/benim-harika-ozelligim

# GitHub'da develop branch'ine Pull Request açın 🎉
```

**Tebrikler! İlk katkınızı yaptınız!** 🎊

---

## 📝 Katkı Akışı (Workflow)

### Adım 1: Bir Issue Seçin veya Oluşturun

**Mevcut Issue'lara Bakın:**
- [Issues sayfası](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/issues)
- `good-first-issue` etiketi → Yeni başlayanlar için
- `help-wanted` etiketi → Yardım gereken konular
- `content` etiketi → Kurs içeriği katkıları

**Issue'ya Yorum Yapın:**
```
Merhaba! Bu issue üzerinde çalışmak istiyorum.
Yaklaşık [X gün/hafta] içinde PR göndereceğim.
```

**Yeni Issue Şablonları:**

**Hata Bildirimi:**
```markdown
## 🐛 Hata Açıklaması
Kısa ve net açıklama

## 📋 Adımlar
1. Bu sayfaya git
2. Bu butona tıkla
3. Hatayı gör

## ✅ Beklenen Davranış
Ne olmasını bekliyordunuz?

## ❌ Gerçekleşen Davranış
Ne oldu?

## 💻 Ortam
- OS: [örn. macOS 14, Ubuntu 22.04]
- Docker: [örn. 24.0.5]
- Tarayıcı: [örn. Chrome 120] (frontend hataları için)
- Backend/Frontend versiyonu: [git commit SHA]

## 📎 Ekler
- Hata mesajı / stack trace
- Ekran görüntüsü
- `docker compose logs` çıktısı
```

**Özellik İsteği:**
```markdown
## ✨ Özellik İsteği
Ne istiyorsunuz?

## 🎯 Motivasyon
Neden bu özellik gerekli? Hangi problemi çözüyor?

## 💡 Önerilen Çözüm
Nasıl implement edilebilir? (API değişikliği, UI değişikliği vs.)

## 🔄 Alternatifler
Başka çözümler düşündünüz mü?

## 📚 Ek Bağlam
MVP kapsamında mı, v2.0'a mı uygun? Başka eklemek istediğiniz var mı?
```

### Adım 2: Branch Oluşturun ve Çalışın

**Branch İsimlendirme:**
```bash
# Özellik eklerken
git checkout -b feature/quiz-timer-pause

# Hata düzeltirken
git checkout -b bugfix/oauth-callback-redirect

# Dokümantasyon
git checkout -b docs/update-api-examples

# Kurs içeriği
git checkout -b content/add-docker-fundamentals-course

# Refactoring
git checkout -b refactor/progress-service-cleanup
```

> ⚠️ **Önemli:** Tüm PR'lar `develop` branch'ine açılır. `main` veya `release` branch'lerine doğrudan PR açmayın.

**Küçük Commitler Yapın:**
```bash
# Backend değişikliği
git add backend/app/routers/quiz.py
git commit -m "feat(quiz): add pause functionality to quiz timer"

# Frontend değişikliği
git add frontend/components/quiz/Timer.tsx
git commit -m "feat(timer): display pause button on quiz page"

# Test
git add backend/tests/test_quiz.py
git commit -m "test(quiz): add test cases for timer pause"
```

### Adım 3: Commit Mesajları

**Format:**
```
<tip>(<kapsam>): <konu>

<detay>

<footer>
```

**Tipler:**
- `feat:` → Yeni özellik
- `fix:` → Hata düzeltme
- `docs:` → Dokümantasyon
- `content:` → Kurs içeriği ekleme/güncelleme
- `style:` → Format (kod davranışı değişmez)
- `refactor:` → Kod iyileştirme
- `test:` → Test ekleme/güncelleme
- `chore:` → Yapı, konfigürasyon, bağımlılık

**Kapsam Örnekleri:** `auth`, `quiz`, `dashboard`, `enrollment`, `progress`, `content`, `ui`

**✅ İyi Örnekler:**
```bash
feat(quiz): add configurable pass threshold per quiz

fix(auth): resolve OAuth callback redirect on first login
Fixes #42

docs(api): add quiz submit request/response examples

content(python): add loops and conditionals section to python course

refactor(progress): simplify section completion calculation

test(enrollment): add concurrent enrollment edge case tests

chore(deps): update FastAPI to 0.110.0
```

**❌ Kötü Örnekler:**
```bash
update         # Çok genel
fixed bug      # Hangi bug?
changes        # Ne değişti?
WIP            # Commit history'de WIP kalmamalı
```

### Adım 4: Pull Request Gönderin
**PR Başlığı:**

```
[TİP] Açıklayıcı başlık

Örnekler:
[FEATURE] Add pause functionality to quiz timer
[BUGFIX] Fix OAuth redirect loop on first login
[CONTENT] Add Docker Fundamentals course
[DOCS] Update API endpoint examples in README

```

**PR Açıklaması Şablonu:**
```markdown
## 🎯 Bu PR Ne Yapıyor?
[Kısa özet - 1-2 cümle]

## 💡 Neden?
[Bu değişiklik neden gerekli? Hangi issue'yu kapatıyor?]

## 🔧 Değişiklikler
- [ ] Backend: ...
- [ ] Frontend: ...
- [ ] Veritabanı / Migration: ...
- [ ] İçerik: ...
- [ ] Testler: ...

## 🧪 Nasıl Test Edildi?
- [ ] `docker compose up --build` ile lokal test edildi
- [ ] Backend testleri geçti (`pytest tests/`)
- [ ] Frontend testleri geçti (`npm test`)
- [ ] Manuel test senaryoları yapıldı (açıklayın)

## 📸 Ekran Görüntüleri
[Varsa UI değişikliği için ekran görüntüsü]

## 📚 Dokümantasyon
- [ ] README güncellendi (gerekiyorsa)
- [ ] Kod yorumları eklendi
- [ ] API değişikliği varsa belgelendi

## 🔗 İlişkili Issue'lar
Closes #123
Relates to #456

## ✅ Checklist
- [ ] Kodlar formatlandı (`ruff format` / `npm run lint`)
- [ ] Testler geçti
- [ ] Breaking change yok (varsa belirtildi ve migration guide eklendi)
- [ ] Commit mesajları anlamlı ve conventional commit formatında

## 💬 Gözden Geçirenler İçin Notlar
[Özellikle dikkat edilmesini istediğiniz noktalar, sorular]
```

### Adım 5: Code Review Süreci

**Ne Olur:**
1. ✅ **Otomatik Kontroller** — CI/CD pipeline çalışır (test + lint)
2. 👀 **Maintainer İncelemesi** — Kod gözden geçirilir
3. 💬 **Geri Bildirim** — Öneriler ve sorular gelir
4. 🔄 **Güncelleme** — Gerekli değişiklikleri yaparsınız
5. ✨ **Onay** — Kod onaylanır
6. 🎉 **Merge** — `develop` branch'ine eklenir

**Geri Bildirime Nasıl Yanıt Verilir:**
```bash
# Feedback'i uygulayın
git add .
git commit -m "refactor(quiz): simplify score calculation per review"

# Aynı branch'e push edin — PR otomatik güncellenir
git push origin feature/your-branch
```

**İyi PR Davranışları:**
- 🤝 Saygılı ve yapıcı olun
- 🙏 Geri bildirimlere teşekkür edin
- 💬 Anlamadığınız şeyleri sorun
- 🎯 Önerileri deneyin ve deneyiminizi paylaşın

---

## 📚 Kod Standartları

### Backend (FastAPI / Python)

**✅ İyi Kod:**
```python
# 1. Type hint'leri eksiksiz kullanın
async def complete_section(
    section_id_str: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProgressResponse:
    """
    Belirtilen section'ı tamamlandı olarak işaretler.
    Progress yüzdesi ve enrollment completed_at otomatik güncellenir.
    """
    ...

# 2. Service katmanına iş mantığını taşıyın (router'da yapmayin)
# routers/enrollments.py — DOĞRU
@router.post("/progress/sections/{section_id_str}/complete")
async def complete_section(section_id_str: str, ...):
    return await progress_service.complete_section(section_id_str, user.id, db)

# 3. Hata durumlarını net HTTPException ile döndürün
if not enrollment:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Bu kursa kayıtlı değilsiniz.",
    )
```

**❌ Kötü Kod:**
```python
# Tip belirtilmemiş
async def complete_section(section_id, user, db):
    ...

# İş mantığı router'da
@router.post("/progress/sections/{section_id_str}/complete")
async def complete_section(section_id_str: str, ...):
    section = await db.execute(...)   # Burada olmamalı
    section.completed = True          # Burada olmamalı
    ...
```

### Frontend (Next.js / TypeScript)

**✅ İyi Kod:**
```typescript
// 1. Props tiplerini tanımlayın
interface CourseProgressCardProps {
  title: string;
  slug: string;
  progressPercent: number;
  lastSectionIdStr: string;
  lastSectionTitle: string;
}

// 2. Loading ve error state'lerini mutlaka yönetin
const DashboardPage = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!data?.inProgressCourses.length) return <EmptyCoursesState />;
  ...
};

// 3. API çağrılarını lib/api.ts üzerinden yapın
import { api } from "@/lib/api";
const summary = await api.get("/dashboard/summary");
```

### MDX Kurs İçeriği

**✅ Doğru MDX Frontmatter:**
```yaml
---
id: "docker-003-volumes"     # ASLA değiştirme — DB ile bağlantı bu ID ile
title: "Docker Volume Yönetimi"
order: 3
---
```

> ⚠️ **Kritik Kural:** `id` alanı bir kez belirlendikten sonra **asla değiştirilmez**. Dosya adı, başlık değişebilir — `id` değişmez.

**meta.json Formatı:**
```json
{
  "slug": "docker-fundamentals",
  "title": "Docker Temelleri",
  "description": "Container teknolojisini sıfırdan öğrenin.",
  "category": "containerization",
  "difficulty": "beginner",
  "duration_minutes": 90,
  "is_published": true
}
```

---

## 🧪 Test

### Backend Testleri
```bash
# Tüm testleri çalıştır
docker compose exec backend pytest tests/ --cov --cov-report=term

# Belirli bir modülü test et
docker compose exec backend pytest tests/test_quiz.py -v

# Lint kontrolü
docker compose exec backend ruff check app/
docker compose exec backend ruff format --check app/
```

### Frontend Testleri
```bash
# Tüm testleri çalıştır
docker compose exec frontend npm test

# Lint kontrolü
docker compose exec frontend npm run lint

# Type kontrolü
docker compose exec frontend npm run type-check
```

### PR Öncesi Kontrol Listesi
```bash
# 1. Upstream'den güncel al
git checkout develop
git pull upstream develop
git checkout your-branch
git rebase develop

# 2. Servisleri yeniden build et
docker compose up --build

# 3. Testleri çalıştır
docker compose exec backend pytest tests/
docker compose exec frontend npm test

# 4. Lint
docker compose exec backend ruff check app/
docker compose exec frontend npm run lint

# 5. Push
git push origin your-branch
```

### Manuel Test Senaryoları

**Yeni Özellik İçin:**
1. ✅ Özellik açık/kapalı durumlarda beklendiği gibi çalışıyor mu?
2. ✅ Mevcut özellikler bozulmadı mı?
3. ✅ Hata durumları (404, 401, 500) doğru handle ediliyor mu?
4. ✅ Mobil görünüm kontrol edildi mi? (< 768px)

**Quiz Sistemi Değişikliklerinde:**
1. ✅ `correct_index` submit öncesi response'da **yok** mu?
2. ✅ Süre dolduğunda otomatik submit tetikleniyor mu?
3. ✅ Geç gelen submission backend tarafından reddediliyor mu?

**Auth Değişikliklerinde:**
1. ✅ Google / LinkedIn / GitHub callback akışı çalışıyor mu?
2. ✅ Refresh token rotation doğru çalışıyor mu?
3. ✅ Logout sonrası token blacklist'e ekleniyor mu?

---

## 💡 İpuçları ve Best Practices

### Yeni Başlayanlar İçin

**🌱 Küçük Başlayın:**
- İlk PR'ınız bir kurs içeriğindeki typo düzeltmesi olabilir
- API örneklerine yorum ekleyebilirsiniz
- README'ye kullanım örneği ekleyebilirsiniz
- Bunlar da değerli katkılardır!

**📖 Öğrenin:**
- Başkalarının PR'larını inceleyin
- Discussions'ları takip edin
- Sorular sorun — kimse yargılamaz!

**🎯 Odaklanın:**
- Bir seferde tek bir şey değiştirin
- Küçük, anlaşılır PR'lar gönderin
- Büyük değişiklikler için önce issue açın

### İleri Seviye İçin

**🏗️ Mimari Kararlar:**
- Breaking change önerecekseniz önce issue'da tartışın
- Veritabanı şema değişikliklerini her zaman Alembic migration ile yapın
- Security-sensitive değişiklikleri (auth, quiz güvenliği) maintainer'larla koordine edin

**♻️ Geriye Uyumluluk:**
- API'de breaking change'den kaçının
- Zorunluysa versiyonlama planlayın ve belgelendirin

---

## ❓ Sık Sorulan Sorular

**S: Docker olmadan geliştirme yapabilir miyim?**

A: Mümkün, ancak tavsiye edilmez. Backend ve Frontend ayrı ayrı da çalıştırılabilir, ancak Docker Compose ile tüm ortam tek komutla hazır olur ve tutarlı bir geliştirme deneyimi sağlar.

**S: Kurs içeriği eklemek için ne bilmem gerekiyor?**

A: Sadece Markdown/MDX bilmeniz yeterli! `content/courses/` altındaki mevcut kurslara bakarak formatı anlayabilirsiniz. Teknik konu uzmanlığı kod bilgisinden daha önemli.

**S: PR'm reddedilirse ne olur?**

A: Endişelenmeyin — bu normal bir sürecin parçası. Maintainer'lar neden reddedildiğini açıklar. Geri bildirimi anlayın, düzeltin ve tekrar deneyin. Reddedilme öğrenme sürecinin bir parçasıdır!

**S: Git conflict çözemiyorum?**

```bash
git checkout develop
git pull upstream develop
git checkout your-branch
git rebase develop
# Conflict çıkarsa: dosyayı düzenle, conflict işaretlerini sil
git add conflicted-file
git rebase --continue
git push origin your-branch --force-with-lease
```

Hala sorun varsa issue'da veya Discussions'da yardım isteyin!

**S: PR merge edildi, ne yapmalıyım?**

```bash
git checkout develop
git pull upstream develop
git branch -d feature/your-branch
git push origin --delete feature/your-branch
# Yeni katkıya başlayın! 🚀
```

---

## 🆘 Yardım ve Destek

- **💬 GitHub Discussions** — Genel sorular, fikirler, yardım istekleri (en iyi yol!)
- **🐛 GitHub Issues** — Hata bildirimi, özellik istekleri
- **📧 Doğrudan İletişim** — Yalnızca acil güvenlik sorunları için

> **💡 Unutmayın:** Aptalca soru yoktur! Sormak öğrenmenin ilk adımıdır.

---

## 🎉 Katkınız Kabul Edildi!

**✅ Merge Edildikten Sonra:**
- 🎊 GitHub profilinizde görünür
- 🏅 Proje contributors listesinde yeriniz var
- 📄 CV'nize ekleyebileceğiniz somut, full-stack bir proje deneyimi

**Her katkı, ne kadar küçük olursa olsun değerlidir:**
✨ Kod · 📖 Dokümantasyon · 📚 Kurs içeriği · 🐛 Hata bildirimi · 💡 Fikir · 💬 Tartışma

**Hepsi LearnOps'u ve Türkçe DevOps topluluğunu güçlendirir!**

</details>

---

<details>
<summary><strong>🇬🇧 English Guide</strong></summary>

## 💫 Why Should You Contribute?

Contributing to open source:
- 🚀 **Develops your skills** — Learn by working on real projects
- 🤝 **Build connections** — Meet people with similar interests in the DevOps community
- 📚 **Gain experience** — A concrete full-stack project you can add to your CV
- 💪 **Contribute to the community** — Make Turkish DevOps education better for everyone

**Ready to make your first contribution? Let's get started!** 🎯

---

## 🎨 How Can You Contribute?

### 🐛 I Found a Bug!
1. **Check existing issues first** — The same problem might already be reported
2. **Open a new issue** — Describe the problem with steps to reproduce
3. **Try to fix it** — If you're comfortable with code, send a PR!

**Example:** "Getting 500 error after quiz submit"
```
Steps:
1. Enroll in a course
2. Start the quiz
3. Select answers and click "Submit"
4. Get 500 Internal Server Error

Expected: Score screen should appear
Actual: 500 error

Environment: Docker Compose, Python 3.11, Node 20
```

### ✨ I Have an Idea!
1. **Check Discussions first** — Maybe others want the same thing
2. **Open a Feature Request** — Explain your idea in detail
3. **Discuss with community** — Get feedback
4. **Start coding** — Send a PR after approval

### 📖 Course Content Contribution
You don't have to write code! Course content is highly valuable:
- **Add a new DevOps course** — In MDX format, under `content/courses/`
- **Update existing lessons** — New tool versions, better examples
- **Fix typos and language errors** — Small but important
- **Add/improve quiz questions** — More meaningful questions and explanations

### 📝 Documentation Improvement
- Improve README — Clearer, more understandable
- Add API examples — Show how endpoints work
- Clarify installation steps — Everything that makes first setup easier

### 🎯 Ideal for First Contribution
- 🏷️ Issues labeled `good-first-issue`
- 📝 Documentation improvements
- 🐛 Simple bug fixes
- 📚 Typo fixes in course content

---

## 🚀 Quick Start

### 1️⃣ Prepare the Repository
```bash
# Fork the repository (click "Fork" on GitHub)

# Clone to your computer
git clone https://github.com/YOUR-USERNAME/project-learnops.git
cd project-learnops

# Add main repo as upstream
git remote add upstream https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops.git
```

### 2️⃣ Start the Development Environment
```bash
# Set up environment variables
cp .env.example .env
# Edit .env and fill in your OAuth credentials and JWT_SECRET

# Start all services (Backend + Frontend + PostgreSQL)
docker compose up --build

# Seed content on first setup
docker compose exec backend python backend/scripts/seed_content.py --env development
```

### 3️⃣ Create a Branch
```bash
git checkout develop
git pull upstream develop
git checkout -b feature/my-awesome-feature
```

### 4️⃣ Send Changes
```bash
git add .
git commit -m "feat: add awesome new feature"
git push origin feature/my-awesome-feature
# Open Pull Request to develop branch on GitHub 🎉
```

---

## 📝 Contribution Workflow

### Step 1: Choose or Create an Issue

**Check Existing Issues:**
- [Issues page](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/issues)
- `good-first-issue` → For beginners
- `help-wanted` → Topics needing help
- `content` → Course content contributions

**Bug Report Template:**
```markdown
## 🐛 Bug Description
Short and clear description

## 📋 Steps to Reproduce
1. Go to this page
2. Click this button
3. See the error

## ✅ Expected Behavior
## ❌ Actual Behavior

## 💻 Environment
- OS: [e.g. macOS 14, Ubuntu 22.04]
- Docker: [e.g. 24.0.5]
- Browser: [e.g. Chrome 120] (for frontend issues)

## 📎 Attachments
- Error message / stack trace
- Screenshot
- `docker compose logs` output
```

**Feature Request Template:**
```markdown
## ✨ Feature Request
What do you want?

## 🎯 Motivation
Why is this feature necessary? What problem does it solve?

## 💡 Proposed Solution
How can it be implemented?

## 🔄 Alternatives
Have you considered other approaches?

## 📚 Additional Context
Is this MVP scope or v2.0? Anything else to add?
```

### Step 2: Create Branch and Work

**Branch Naming:**
```bash
git checkout -b feature/quiz-timer-pause
git checkout -b bugfix/oauth-callback-redirect
git checkout -b docs/update-api-examples
git checkout -b content/add-docker-fundamentals-course
git checkout -b refactor/progress-service-cleanup
```

> ⚠️ **Important:** All PRs target the `develop` branch. Do not open PRs directly to `main` or `release`.

### Step 3: Commit Messages

**Format:** `<type>(<scope>): <subject>`

**Types:** `feat` · `fix` · `docs` · `content` · `style` · `refactor` · `test` · `chore`

**Scope examples:** `auth`, `quiz`, `dashboard`, `enrollment`, `progress`, `content`, `ui`

**✅ Good Examples:**
```bash
feat(quiz): add configurable pass threshold per quiz
fix(auth): resolve OAuth callback redirect on first login — Fixes #42
content(docker): add volumes and networking sections
test(enrollment): add concurrent enrollment edge case tests
chore(deps): update FastAPI to 0.110.0
```

**❌ Bad Examples:**
```bash
update       # Too generic
fixed bug    # Which bug?
WIP          # Should not remain in commit history
```

### Step 4: Pull Request

**PR Title:**
```
[FEATURE] Add pause functionality to quiz timer
[BUGFIX] Fix OAuth redirect loop on first login
[CONTENT] Add Docker Fundamentals course
[DOCS] Update API endpoint examples
```

**PR Description Template:**
```markdown
## 🎯 What Does This PR Do?
[Short summary — 1-2 sentences]

## 💡 Why?
[Why is this change necessary? Which issue does it close?]

## 🔧 Changes
- [ ] Backend: ...
- [ ] Frontend: ...
- [ ] Database / Migration: ...
- [ ] Content: ...
- [ ] Tests: ...

## 🧪 How Was It Tested?
- [ ] Tested locally with `docker compose up --build`
- [ ] Backend tests passed (`pytest tests/`)
- [ ] Frontend tests passed (`npm test`)
- [ ] Manual test scenarios performed (describe them)

## 🔗 Related Issues
Closes #123
Relates to #456

## ✅ Checklist
- [ ] Code formatted (`ruff format` / `npm run lint`)
- [ ] All tests pass
- [ ] No breaking changes (or documented with migration guide)
- [ ] Commit messages follow conventional commit format

## 💬 Notes for Reviewers
[Points you'd like reviewers to focus on, questions]
```

### Step 5: Code Review Process

1. ✅ **Automated Checks** — CI/CD pipeline runs (tests + lint)
2. 👀 **Maintainer Review** — Code is reviewed
3. 💬 **Feedback** — Suggestions and questions
4. 🔄 **Update** — Apply necessary changes
5. ✨ **Approval** — Code gets approved
6. 🎉 **Merge** — Added to `develop` branch

```bash
# Apply feedback and push — PR updates automatically
git add .
git commit -m "refactor(quiz): simplify score calculation per review"
git push origin feature/your-branch
```

---

## 📚 Code Standards

### Backend (FastAPI / Python)
```python
# ✅ Use type hints throughout
async def complete_section(
    section_id_str: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProgressResponse:
    """Mark the given section as completed. Updates progress % and enrollment."""
    ...

# ✅ Keep business logic in service layer, not routers
# ✅ Return clear HTTPExceptions for error cases
if not enrollment:
    raise HTTPException(status_code=404, detail="You are not enrolled in this course.")
```

### Frontend (Next.js / TypeScript)
```typescript
// ✅ Define prop types
interface CourseProgressCardProps {
  title: string;
  slug: string;
  progressPercent: number;
  lastSectionIdStr: string;
  lastSectionTitle: string;
}

// ✅ Always handle loading, error, and empty states
if (loading) return <DashboardSkeleton />;
if (error) return <ErrorState message={error} />;
if (!data?.inProgressCourses.length) return <EmptyCoursesState />;

// ✅ Use lib/api.ts for all API calls
import { api } from "@/lib/api";
```

### MDX Course Content
```yaml
---
id: "docker-003-volumes"   # NEVER change — DB is linked via this ID
title: "Docker Volume Management"
order: 3
---
```

> ⚠️ **Critical Rule:** The `id` field is set once and **never changed**. File names and titles can change — `id` cannot.

---

## 🧪 Testing

```bash
# Backend tests
docker compose exec backend pytest tests/ --cov --cov-report=term
docker compose exec backend ruff check app/

# Frontend tests
docker compose exec frontend npm test
docker compose exec frontend npm run lint

# Pre-PR checklist
git rebase develop
docker compose up --build
docker compose exec backend pytest tests/
docker compose exec frontend npm test
```

**Key test scenarios for quiz changes:**
1. ✅ `correct_index` is **absent** from response before submit
2. ✅ Auto-submit triggers when timer reaches zero
3. ✅ Late submission is rejected by backend

---

## ❓ Frequently Asked Questions

**Q: Can I develop without Docker?**
A: It's possible but not recommended. Docker Compose gives you the full environment in one command and ensures consistency.

**Q: What do I need to know to add course content?**
A: Just Markdown/MDX! Check existing courses under `content/courses/` for formatting. Subject matter expertise matters more than coding knowledge here.

**Q: What if my PR is rejected?**
A: Don't worry — it's a normal part of the process. Maintainers will explain why. Understand the feedback, fix it, and try again. Rejection is part of learning!

**Q: How do I resolve a Git conflict?**
```bash
git checkout develop && git pull upstream develop
git checkout your-branch && git rebase develop
# Edit conflicted files, remove conflict markers
git add conflicted-file && git rebase --continue
git push origin your-branch --force-with-lease
```

**Q: My PR was merged — what now?**
```bash
git checkout develop && git pull upstream develop
git branch -d feature/your-branch
git push origin --delete feature/your-branch
# Start your next contribution! 🚀
```

---

## 🆘 Help and Support

- **💬 GitHub Discussions** — General questions, ideas, help requests (best option!)
- **🐛 GitHub Issues** — Bug reports, feature requests
- **📧 Direct Contact** — Only for urgent security issues

> **💡 Remember:** There are no stupid questions! Asking is the first step of learning.

---

## 🎉 Your Contribution Was Accepted!

- 🎊 Visible on your GitHub profile
- 🏅 Your name in the project contributors list
- 📄 A concrete full-stack project experience for your CV

**Every contribution, no matter how small, is valuable:**
✨ Code · 📖 Docs · 📚 Course content · 🐛 Bug reports · 💡 Ideas · 💬 Discussions

**All of them strengthen LearnOps and the Turkish DevOps community!**

</details>

---

## 📜 License

All contributions you make to this project will be published under the license specified in the [`LICENSE`](../LICENSE) file. By contributing, you agree to this license.

---

**Son Güncelleme / Last Updated:** February 2026 · **Proje Lideri / Project Lead:** [@flovearth](https://github.com/flovearth)
