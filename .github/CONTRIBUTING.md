# 🤝 Katkıda Bulunma Rehberi | Contributing Guide

> **Hoş geldiniz!** Bu rehber, Bilgisayar Kavramları topluluğuna katkıda bulunmak isteyen herkes için hazırlanmıştır. Sizi aramızda görmekten mutluluk duyuyoruz! 🎉
Lütfen Türkçe veya İngilizce dil seçeneklerinden birini seçiniz.

> **Welcome!** This guide is designed for anyone who wants to contribute to the Bilgisayar Kavramları community. We're happy to have you join us! 🎉Please choose between Turkish or English.

---

<details open>
<summary><strong>🇹🇷 Türkçe Rehber</strong></summary>

## 💫 Neden Katkıda Bulunmalısınız?

Açık kaynak topluluğuna katkıda bulunmak:
- 🚀 **Becerilerinizi geliştirir** - Gerçek projelerde çalışarak öğrenirsiniz
- 🤝 **Bağlantılar kurarsınız** - Benzer ilgi alanlarına sahip insanlarla tanışırsınız
- 📚 **Deneyim kazanırsınız** - CV'nize ekleyebileceğiniz somut projeler
- 💪 **Topluluğa katkı sağlarsınız** - Herkesin faydalanacağı bir şey inşa edersiniz

**İlk katkınızı yapmaya hazır mısınız? Hadi başlayalım!** 🎯

---

## 🎨 Nasıl Katkıda Bulunabilirsiniz?

### 🐛 Hata Buldum!
Projede bir hata mı buldunuz? Harika! İşte yapmanız gerekenler:

1. **Hemen bir issue açın** - Başkaları da aynı sorunla karşılaşmış olabilir
2. **Sorunu detaylı açıklayın** - Ne bekliyordunuz, ne oldu?
3. **Düzeltmeyi deneyin** - Kodlamaya aşina iseniz, PR gönderin!

**Örnek:** "Repository oluşturma sırasında hata alıyorum"
```
Adımlar:
1. terraform init çalıştırıyorum
2. terraform plan diyorum
3. "token hatası" alıyorum

Beklenen: Plan başarılı olmalı
Gerçekleşen: Token hatası veriyor
```

### ✨ Fikrim Var!
Yeni bir özellik mi istiyorsunuz? Süper!

1. **Önce Discussions'a bakın** - Belki başkaları da aynı şeyi istiyor
2. **Feature Request açın** - Fikrinizi detaylı anlatın
3. **Toplulukla tartışın** - Geri bildirim alın, fikri geliştirin
4. **Kodlamaya başlayın** - Onay aldıktan sonra PR gönderin

**Örnek:** "Otomatik wiki sayfası oluşturma özelliği"
```
Motivasyon:
Her yeni repo için manuel wiki oluşturmak zaman alıyor.

Önerim:
Terraform ile otomatik wiki page template oluşturma

Faydası:
- Zaman tasarrufu
- Standart dokümantasyon
- Daha az manuel iş
```

### 📖 Dokümantasyon İyileştirmesi
Kod yazmak zorunda değilsiniz! Dokümantasyon da çok değerli:

- **README'yi iyileştirin** - Daha açık, daha anlaşılır
- **Örnekler ekleyin** - Nasıl kullanılır gösterin
- **Typo düzeltin** - Küçük ama önemli
- **Türkçe çeviri** - Anadil desteği harika!

### 🎯 İlk Katkı İçin İdeal
Yeni başlıyorsanız, bu işlerle başlayın:

- 🏷️ `good-first-issue` etiketi olan issue'lar
- 📝 Dokümantasyon iyileştirmeleri
- 🐛 Basit hata düzeltmeleri
- 💬 Başkalarının PR'larını inceleme

---

## 🚀 Hızlı Başlangıç (5 Dakikada!)

### 1️⃣ Repository'yi Hazırlayın
```bash
# Repository'yi fork edin (GitHub'da "Fork" butonuna tıklayın)

# Bilgisayarınıza klonlayın
git clone https://github.com/KULLANICI-ADINIZ/github-infra.git
cd 01-github-infra

# Ana repo'yu upstream olarak ekleyin
git remote add upstream https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra.git

```

### 3️⃣ Branch Oluşturun
```bash
# Yeni bir branch oluşturun
git checkout -b feature/benim-harika-ozelligim

# Değişikliklerinizi yapın
# ... kod düzenlemeleri ...

### 4️⃣ Değişiklikleri Gönderin
```bash
# Commit yapın
git add .
git commit -m "feat: harika yeni özellik eklendi"

# GitHub'a gönderin
git push origin feature/benim-harika-ozelligim

# GitHub'da Pull Request açın 🎉
```

**Tebrikler! İlk katkınızı yaptınız!** 🎊


## 📝 Katkı Akışı (Workflow)

### Adım 1: Bir Issue Seçin veya Oluşturun

**Mevcut Issue'lara Bakın:**
- [Issues sayfası](https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra/issues)
- `good-first-issue` etiketi → Yeni başlayanlar için
- `help-wanted` etiketi → Yardım gereken konular

**Issue'ya Yorum Yapın:**
```
Merhaba! Bu issue üzerinde çalışmak istiyorum. 
Yaklaşık [X gün/hafta] içinde PR göndereceğim.
```

**Yeni Issue Açın:**

**Hata Bildirimi Şablonu:**
```markdown
## 🐛 Hata Açıklaması
Kısa ve net açıklama

## 📋 Adımlar
1. Bu komutu çalıştır
2. Şu dosyayı düzenle
3. Hatayı gör

## ✅ Beklenen Davranış
Ne olmasını bekliyordunuz?

## ❌ Gerçekleşen Davranış
Ne oldu?

## 💻 Ortam
- OS: [örn. macOS 13, Ubuntu 22.04]
- Terraform: [örn. v1.5.0]
- Provider: [örn. hashicorp/github v5.0.0]

## 📎 Ekler
- Hata mesajı
- Ekran görüntüsü
- Terraform plan çıktısı
```

**Özellik İsteği Şablonu:**
```markdown
## ✨ Özellik İsteği
Ne istiyorsunuz?

## 🎯 Motivasyon
Neden bu özellik gerekli?
Hangi problemi çözüyor?

## 💡 Önerilen Çözüm
Nasıl implement edilebilir?

## 🔄 Alternatifler
Başka çözümler düşündünüz mü?

## 📚 Ek Bağlam
Başka eklemek istediğiniz var mı?
```

### Adım 2: Branch Oluşturun ve Çalışın

**Branch İsimlendirme:**
```bash
# Özellik eklerken
git checkout -b feature/wiki-automation

# Hata düzeltirken
git checkout -b bugfix/team-permission-fix

# Dokümantasyon
git checkout -b docs/update-contributing-guide

# Refactoring
git checkout -b refactor/simplify-variables
```

**Küçük Commitler Yapın:**
```bash
# Her mantıksal değişiklik için ayrı commit
git add main.tf
git commit -m "feat: add wiki resource"

git add variables.tf
git commit -m "feat: add wiki configuration variables"

git add README.md
git commit -m "docs: document wiki feature"
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
- `style:` → Format (kod davranışı değişmez)
- `refactor:` → Kod iyileştirme
- `test:` → Test ekleme
- `chore:` → Yapı, konfigürasyon

**✅ İyi Örnekler:**
```bash
feat: add automatic wiki page creation

docs: update README with wiki usage examples

fix: resolve team permission conflict on private repos
Fixes #123

refactor: extract repository config to module

test: add validation for repository names

chore: update GitHub provider to v6.0
```

**❌ Kötü Örnekler:**
```bash
update
# Çok genel, ne güncellendiği belli değil

fixed bug
# Hangi bug? Nasıl düzeltildi?

added stuff
# Ne eklendi? Neden?

WIP
# Commit history'de WIP kalmamalı
```

### Adım 4: Pull Request Gönderin

**PR Oluşturma:**
1. GitHub'da repository'nize gidin
2. Sarı banner'da **Compare & pull request**
3. Veya: **Pull requests** → **New pull request** → **compare across forks**

**PR Başlığı:**
```
[TİP] Açıklayıcı başlık

Örnekler:
[FEATURE] Add automatic wiki page creation
[BUGFIX] Fix team permission on private repos
[DOCS] Update installation guide with examples
```

**PR Açıklaması Şablonu:**
```markdown
## 🎯 Bu PR Ne Yapıyor?
[Kısa özet - 1-2 cümle]

## 💡 Neden?
[Bu değişiklik neden gerekli? Hangi problemi çözüyor?]

## 🔧 Değişiklikler
- [ ] Değişiklik 1
- [ ] Değişiklik 2
- [ ] Değişiklik 3

## 🧪 Nasıl Test Edildi?
- [ ] Lokal olarak test edildi
- [ ] terraform fmt çalıştırıldı
- [ ] terraform validate başarılı
- [ ] terraform plan incelendi
- [ ] Manuel test senaryoları yapıldı

## 📸 Ekran Görüntüleri
[Varsa ekran görüntüleri, terraform plan çıktısı]

## 📚 Dokümantasyon
- [ ] README güncellendi
- [ ] Kod yorumları eklendi
- [ ] CHANGELOG güncellendi
- [ ] Kullanım örnekleri eklendi

## 🔗 İlişkili Issue'lar
Task Ticket Number #123
Relates to #456

## ✅ Checklist
- [ ] Kod formatlandı (terraform fmt)
- [ ] Testler geçti
- [ ] Dokümantasyon tamamlandı
- [ ] Breaking change yok (varsa belirtildi)
- [ ] Commit mesajları anlamlı

## 💬 Notlar
[Gözden geçirenler için özel notlar, sorular, vs.]
```

### Adım 5: Code Review Süreci

**Ne Olur:**
1. ✅ **Otomatik Kontroller** - CI/CD pipeline çalışır
2. 👀 **Maintainer İncelemesi** - Kod gözden geçirilir
3. 💬 **Geri Bildirim** - Öneriler ve sorular gelir
4. 🔄 **Güncelleme** - Gerekli değişiklikleri yaparsınız
5. ✨ **Onay** - Kod onaylanır
6. 🎉 **Merge** - Ana branch'e eklenir

**Geri Bildirime Nasıl Yanıt Verilir:**

**Örnek Feedback:**
```
Maintainer: "Bu fonksiyonu daha basit yazabilir miyiz?"

Siz: "Haklısınız! Şöyle değiştirsem daha iyi olur mu:
[kod örneği]

Veya başka bir öneriniz var mı?"
```

**Değişiklikleri Uygulama:**
```bash
# Feedbackleri uygulayın
git add .
git commit -m "refactor: simplify function per review feedback"

# Aynı branch'e push edin
git push origin feature/your-branch

# PR otomatik güncellenir!
```

**İyi PR Davranışları:**
- 🤝 Saygılı ve yapıcı olun
- 🙏 Geri bildirimlere teşekkür edin
- 💬 Anlamadığınız şeyleri sorun
- 🎯 Önerileri deneyin ve deneyimizi paylaşın
- ⏱️ Yanıt vermekte acele etmeyin, düşünün

---

## 📚 Kod Standartları

### Terraform Stili (Örnek)

**✅ İyi Kod:**
```hcl
# 1. Temiz ve okunaklı
resource "github_repository" "docs" {
  name        = "documentation"
  description = "Project documentation and guides"
  visibility  = "public"
  
  # Feature flags
  has_wiki   = true
  has_issues = true
  
  # Templates
  template {
    owner      = "BKT-DevOps"
    repository = "template-docs"
  }
}

# 2. Açıklayıcı değişkenler
variable "enable_branch_protection" {
  description = "Enable branch protection rules for main branch"
  type        = bool
  default     = true
}

# 3. Input validation
variable "repository_name" {
  description = "Name of the repository (lowercase, hyphens only)"
  type        = string
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.repository_name))
    error_message = "Repository name must be lowercase with hyphens only."
  }
}

# 4. Mantıklı yorumlar
# Create team with read access for all organization members
# This ensures everyone can view the repository
resource "github_team" "readers" {
  name        = "readers"
  description = "Read-only access for all members"
  privacy     = "closed"
}
```

**❌ Kötü Kod:**
```hcl
# Kötü format, okunamaz
resource "github_repository" "r" {
name="test"
description="test repo"
visibility="public"
has_wiki=true
has_issues=true}

# Belirsiz değişken
variable "x" {
  type = bool
}

# Validation yok
variable "name" {
  type = string
}

# Yorum yok (karmaşık kod için)
resource "github_team" "t" {
  count = var.create ? 1 : 0
  name  = element(concat(var.names, [""]), count.index)
}
```

### Manuel Test Senaryoları

**Yeni Özellik İçin:**
1. ✅ Feature açık/kapalı durumlarda çalışıyor mu?
2. ✅ Mevcut özellikleri bozmuyor mu?
3. ✅ Hata durumları handle ediliyor mu?
4. ✅ Dokümantasyon doğru mu?

**Hata Düzeltmesi İçin:**
1. ✅ Hata tekrarlanabiliyor muydu?
2. ✅ Artık hata oluşmuyor mu?
3. ✅ Benzer durumlar da düzeltildi mi?
4. ✅ Test senaryosu eklendi mi?

---

## 💡 İpuçları ve Best Practices

### Yeni Başlayanlar İçin

**🌱 Küçük Başlayın:**
- İlk PR'ınız typo düzeltmesi olabilir
- README'ye örnek ekleyebilirsiniz
- Kod yorumu ekleyebilirsiniz
- Bunlar da değerli katkılardır!

**📖 Öğrenin:**
- Başkalarının PR'larını inceleyin
- Discussions'ları takip edin
- Sorular sorun, utanmayın!

**🎯 Odaklanın:**
- Bir seferde bir şey yapın
- Küçük, anlaşılır PR'lar gönderin
- Büyük değişiklikler için önce issue açın

### İleri Seviye İçin

**🏗️ Mimari Kararlar:**
- Breaking change önerecekseniz önce tartışın
- RFC (Request for Comments) açın
- Topluluk görüşünü alın

**♻️ Sürdürülebilirlik:**
- Geriye dönük uyumluluk düşünün
- Deprecation plan yapın
- Migration guide yazın

**📊 Performans:**
- Terraform plan sürelerini test edin
- Resource sayısını optimize edin
- State file boyutunu kontrol edin

---

## ❓ Sık Sorulan Sorular

### 🆕 Yeni Başlayanlar

**S: Hiç açık kaynak katkısı yapmadım, nereden başlamalıyım?**

A: Harika bir başlangıç noktası! Şunları öneririz:
1. `good-first-issue` etiketli issue'ları inceleyin
2. Dokümantasyonda typo düzeltin
3. README'ye kullanım örneği ekleyin
4. Toplulukla Discussions'da sohbet edin

**S: Terraform bilmiyorum, öğrenmem gerek mi?**

A: Kodlamadan da katkıda bulunabilirsiniz:
- Dokümantasyon iyileştirmeleri
- Hata tespiti ve raporlama
- Kullanım senaryoları önerme
- Topluluk desteği sağlama

Terraform öğrenmek isterseniz, küçük değişikliklerle başlayın!

**S: PR'm reddedilirse ne olur?**

A: Endişelenmeyin! Bu normal:
- Maintainer'lar açıklama yapar
- Nedenini anlayın, öğrenin
- Düzeltip tekrar deneyin
- Veya başka bir konu seçin

Reddedilme olumsuz bir şey değil, öğrenme sürecinin parçası!

### 🔧 Teknik Konular

**S: Git conflict çözemiyorum?**

A: Adım adım:
```bash
# 1. Main'i güncelleyin
git checkout main
git pull upstream main

# 2. Branch'inize dönün
git checkout your-branch

# 3. Rebase yapın
git rebase main

# 4. Conflict çıkarsa:
git status  # Hangi dosyalarda?

# 5. Dosyayı düzenleyin, conflict işaretlerini silin
# <<<<<<< HEAD
# =======
# >>>>>>> branch

# 6. Çözümü ekleyin
git add conflicted-file.tf
git rebase --continue

# 7. Push (force gerekebilir)
git push origin your-branch --force-with-lease
```

Hala sorun varsa, issue'da yardım isteyin!

### 🤝 İşbirliği

**S: Aynı issue üzerinde başkası da çalışıyor?**

A: İletişime geçin:
```
Merhaba @kullanici! Ben de bu issue üzerinde çalışıyorum.
İşbirliği yapabilir miyiz? Ben [X kısmı] üzerinde 
çalışıyordum, siz [Y kısmı]nı alabilir misiniz?
```

**S: Maintainer ne kadar sürede yanıt verir?**

A: Genelde 2-5 iş günü. Acil değilse sabırlı olun.
Acilse: Discussions'da veya Discord'da etiketleyin.

**S: PR'ım merge edildi, ne yapmalıyım?**

A: Tebrikler! 🎉
```bash
# 1. Lokal'i güncelleyin
git checkout main
git pull upstream main

# 2. Branch'i silin (opsiyonel)
git branch -d feature/your-branch
git push origin --delete feature/your-branch

# 3. Yeni katkıya başlayın!
```

---

## 🆘 Yardım ve Destek

### Nasıl Yardım Alırsınız?

**💬 GitHub Discussions** (En iyi yol!)
- [Genel sorular](https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra/discussions/categories/q-a)
- [Fikirler](https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra/discussions/categories/ideas)
- [Yardım istekleri](https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra/discussions/categories/help)

**🐛 GitHub Issues**
- Hata bildirimi
- Özellik istekleri
- Teknik sorunlar

**📧 Doğrudan İletişim**
- Acil güvenlik sorunları
- Özel durumlar
- Maintainer'lara direkt mesaj

### Ne Zaman Yardım İsteyin?

Şu durumlarda çekinmeyin:
- ⚠️ Hata mesajını anlamıyorsanız
- ⚠️ Git sorunları yaşıyorsanız
- ⚠️ Yaklaşımınızdan emin değilseniz
- ⚠️ Test nasıl yapılır bilmiyorsanız
- ⚠️ PR sürecinde takıldıysanız
- ⚠️ Herhangi bir şeyi anlamadıysanız

> **💡 Unutmayın:** Aptalca soru yoktur! Sormak öğrenmenin ilk adımıdır.

---

## 🎉 Katkınız Kabul Edildi!

### Sonrası Ne Olur?

**✅ Merge Edildikten Sonra:**
1. **Kutlayın!** 🎊 İlk (veya bir sonraki) açık kaynak katkınız!
2. **Profil:** GitHub profilinizde görünür
3. **Contributors:** Proje contributors listesinde yeriniz var
4. **Deneyim:** CV'nize ekleyebileceğiniz somut bir proje

**🔄 Devam Edin:**
- Daha fazla issue'ya göz atın
- Başkalarının PR'larını inceleyin
- Yeni özellikler önerin
- Mentorluk yapın (yeni gelenlere yardım edin)

### Teşekkürler! 🙏

Her katkı, ne kadar küçük olursa olsun değerlidir:
- ✨ Kod yazmak
- 📖 Dokümantasyon
- 🐛 Hata bildirimi
- 💡 Fikir önerisi
- 💬 Tartışmalara katılım
- 🎨 Tasarım önerileri

**Hepsi topluluğumuzu güçlendirir!**
</details>

---


<details>
<summary><strong>🇬🇧 English Guide</strong></summary>

# 🤝 Contributing Guide

> **Welcome!** This guide is prepared for everyone who wants to contribute to the Bilgisayar Kavramları community. We're happy to see you here! 🎉

---

## 💫 Why Should You Contribute?

Contributing to open source community:
- 🚀 **Develops your skills** - You learn by working on real projects
- 🤝 **Build connections** - Meet people with similar interests
- 📚 **Gain experience** - Concrete projects you can add to your CV
- 💪 **Contribute to community** - Build something everyone will benefit from

**Ready to make your first contribution? Let's get started!** 🎯

---

## 🎨 How Can You Contribute?

### 🐛 I Found a Bug!
Did you find a bug in the project? Great! Here's what you need to do:

1. **Open an issue immediately** - Others may have encountered the same problem
2. **Explain the problem in detail** - What did you expect, what happened?
3. **Try to fix it** - If you're familiar with coding, send a PR!

**Example:** "Getting error while creating repository"
```
Steps:
1. I run terraform init
2. I say terraform plan
3. I get "token error"

Expected: Plan should be successful
Actual: Gives token error
```

### ✨ I Have an Idea!
Do you want a new feature? Super!

1. **Check Discussions first** - Maybe others want the same thing
2. **Open a Feature Request** - Explain your idea in detail
3. **Discuss with community** - Get feedback, develop the idea
4. **Start coding** - Send a PR after approval

**Example:** "Automatic wiki page creation feature"
```
Motivation:
Creating manual wiki for each new repo takes time.

My suggestion:
Automatic wiki page template creation with Terraform

Benefits:
- Time saving
- Standard documentation
- Less manual work
```

### 📖 Documentation Improvement
You don't have to write code! Documentation is also very valuable:

- **Improve README** - Clearer, more understandable
- **Add examples** - Show how to use it
- **Fix typos** - Small but important
- **Turkish translation** - Native language support is great!

### 🎯 Ideal for First Contribution
If you're just starting, start with these tasks:

- 🏷️ Issues with `good-first-issue` label
- 📝 Documentation improvements
- 🐛 Simple bug fixes
- 💬 Reviewing others' PRs

---

## 🚀 Quick Start (In 5 Minutes!)

### 1️⃣ Prepare the Repository
```bash
# Fork the repository (click "Fork" button on GitHub)

# Clone to your computer
git clone https://github.com/YOUR-USERNAME/project-terraform-github.git
cd project-terraform-github

# Add main repo as upstream
git remote add upstream https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra.git
```

### 3️⃣ Create a Branch
```bash
# Create a new branch
git checkout -b feature/my-awesome-feature

# Make your changes
# ... code edits ...

### 4️⃣ Send Changes
```bash
# Commit
git add .
git commit -m "feat: add awesome new feature"

# Push to GitHub
git push origin feature/my-awesome-feature

# Open Pull Request on GitHub 🎉
```

**Congratulations! You made your first contribution!** 🎊

---

## 📝 Contribution Workflow

### Step 1: Choose or Create an Issue

**Check Existing Issues:**
- [Issues page](https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra/issues)
- `good-first-issue` label → For beginners
- `help-wanted` label → Topics needing help

**Comment on Issue:**
```
Hello! I want to work on this issue. 
I will send PR in approximately [X days/weeks].
```

**Open New Issue:**

**Bug Report Template:**
```markdown
## 🐛 Bug Description
Short and clear description

## 📋 Steps
1. Run this command
2. Edit that file
3. See the error

## ✅ Expected Behavior
What did you expect to happen?

## ❌ Actual Behavior
What happened?

## 💻 Environment
- OS: [e.g. macOS 13, Ubuntu 22.04]
- Provider: [e.g. hashicorp/github v5.0.0]

## 📎 Attachments
- Error message
- Screenshot
- Terraform plan output
```

**Feature Request Template:**
```markdown
## ✨ Feature Request
What do you want?

## 🎯 Motivation
Why is this feature necessary?
What problem does it solve?

## 💡 Proposed Solution
How can it be implemented?

## 🔄 Alternatives
Have you thought of other solutions?

## 📚 Additional Context
Anything else you want to add?
```

### Step 2: Create Branch and Work

**Branch Naming:**
```bash
# When adding feature
git checkout -b feature/wiki-automation

# When fixing bug
git checkout -b bugfix/team-permission-fix

# Documentation
git checkout -b docs/update-contributing-guide

# Refactoring
git checkout -b refactor/simplify-variables
```

**Make Small Commits:**
```bash
# Separate commit for each logical change
git add main.tf
git commit -m "feat: add wiki resource"

git add variables.tf
git commit -m "feat: add wiki configuration variables"

git add README.md
git commit -m "docs: document wiki feature"
```

### Step 3: Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` → New feature
- `fix:` → Bug fix
- `docs:` → Documentation
- `style:` → Format (code behavior doesn't change)
- `refactor:` → Code improvement
- `test:` → Add tests
- `chore:` → Build, configuration

**✅ Good Examples:**
```bash
feat: add automatic wiki page creation

docs: update README with wiki usage examples

fix: resolve team permission conflict on private repos
Fixes #123

refactor: extract repository config to module

test: add validation for repository names

chore: update GitHub provider to v6.0
```

**❌ Bad Examples:**
```bash
update
# Too general, not clear what was updated

fixed bug
# Which bug? How was it fixed?

added stuff
# What was added? Why?

WIP
# WIP shouldn't remain in commit history
```

### Step 4: Send Pull Request

**Create PR:**
1. Go to your repository on GitHub
2. Yellow banner **Compare & pull request**
3. Or: **Pull requests** → **New pull request** → **compare across forks**

**PR Title:**
```
[TYPE] Descriptive title

Examples:
[FEATURE] Add automatic wiki page creation
[BUGFIX] Fix team permission on private repos
[DOCS] Update installation guide with examples
```

**PR Description Template:**
```markdown
## 🎯 What Does This PR Do?
[Short summary - 1-2 sentences]

## 💡 Why?
[Why is this change necessary? What problem does it solve?]

## 🔧 Changes
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## 🧪 How Was It Tested?
- [ ] Tested locally
- [ ] Manual test scenarios performed

## 📸 Screenshots
[If any screenshots, terraform plan output]

## 📚 Documentation
- [ ] README updated
- [ ] Code comments added
- [ ] CHANGELOG updated
- [ ] Usage examples added

## 🔗 Related Issues
Task Ticket Number #123
Relates to #456

## ✅ Checklist
- [ ] Tests passed
- [ ] Documentation completed
- [ ] No breaking changes (or noted if yes)
- [ ] Meaningful commit messages

## 💬 Notes
[Special notes for reviewers, questions, etc.]
```

### Step 5: Code Review Process

**What Happens:**
1. ✅ **Automated Checks** - CI/CD pipeline runs
2. 👀 **Maintainer Review** - Code is reviewed
3. 💬 **Feedback** - Suggestions and questions come
4. 🔄 **Update** - You make necessary changes
5. ✨ **Approval** - Code gets approved
6. 🎉 **Merge** - Added to main branch

**How to Respond to Feedback:**

**Example Feedback:**
```
Maintainer: "Can we write this function simpler?"

You: "You're right! Would it be better if I change it like this:
[code example]

Or do you have another suggestion?"
```

**Applying Changes:**
```bash
# Apply feedback
git add .
git commit -m "refactor: simplify function per review feedback"

# Push to same branch
git push origin feature/your-branch

# PR updates automatically!
```

**Good PR Behaviors:**
- 🤝 Be respectful and constructive
- 🙏 Thank for feedback
- 💬 Ask what you don't understand
- 🎯 Try suggestions and share your experience
- ⏱️ Don't rush to respond, think about it

---

## 📚 Code Standards

### Terraform Style (Example)

**✅ Good Code:**
```hcl
# 1. Clean and readable
resource "github_repository" "docs" {
  name        = "documentation"
  description = "Project documentation and guides"
  visibility  = "public"
  
  # Feature flags
  has_wiki   = true
  has_issues = true
  
  # Templates
  template {
    owner      = "Bilgisayar-Kavramlari-Toplulugu"
    repository = "template-docs"
  }
}

# 2. Descriptive variables
variable "enable_branch_protection" {
  description = "Enable branch protection rules for main branch"
  type        = bool
  default     = true
}

# 3. Input validation
variable "repository_name" {
  description = "Name of the repository (lowercase, hyphens only)"
  type        = string
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.repository_name))
    error_message = "Repository name must be lowercase with hyphens only."
  }
}

# 4. Meaningful comments
# Create team with read access for all organization members
# This ensures everyone can view the repository
resource "github_team" "readers" {
  name        = "readers"
  description = "Read-only access for all members"
  privacy     = "closed"
}
```

**❌ Bad Code:**
```hcl
# Bad format, unreadable
resource "github_repository" "r" {
name="test"
description="test repo"
visibility="public"
has_wiki=true
has_issues=true}

# Unclear variable
variable "x" {
  type = bool
}

# No validation
variable "name" {
  type = string
}

# No comment (for complex code)
resource "github_team" "t" {
  count = var.create ? 1 : 0
  name  = element(concat(var.names, [""]), count.index)
}
```

### File Organization

## 🧪 Testing and Validation

### Pre-Commit Checklist

# 4. Git status check
git status
git diff
```

### Final Check Before PR

```bash
# Update from main branch
git checkout main
git pull upstream main
git checkout your-branch
git rebase main

# Final checks
terraform fmt -check -recursive
terraform validate
terraform plan

# Any issues in commits?
git log --oneline

# Push
git push origin your-branch
```

### Manual Test Scenarios

**For New Feature:**
1. ✅ Does it work when feature is on/off?
2. ✅ Does it break existing features?
3. ✅ Are error cases handled?
4. ✅ Is documentation correct?

**For Bug Fix:**
1. ✅ Was the bug reproducible?
2. ✅ Does the error no longer occur?
3. ✅ Were similar cases also fixed?
4. ✅ Was test scenario added?

---

## 💡 Tips and Best Practices

### For Beginners

**🌱 Start Small:**
- Your first PR can be a typo fix
- You can add an example to README
- You can add code comments
- These are also valuable contributions!

**📖 Learn:**
- Review others' PRs
- Follow Discussions
- Ask questions, don't be shy!

**🎯 Focus:**
- Do one thing at a time
- Send small, understandable PRs
- Open an issue first for big changes

### For Advanced Users

**🏗️ Architectural Decisions:**
- Discuss first if suggesting breaking change
- Open RFC (Request for Comments)
- Get community opinion

**♻️ Sustainability:**
- Consider backward compatibility
- Make deprecation plan
- Write migration guide

**📊 Performance:**
- Test Terraform plan times
- Optimize resource count
- Check state file size

---

## ❓ Frequently Asked Questions

### 🆕 Beginners

**Q: I've never contributed to open source, where should I start?**

A: Great starting point! We recommend:
1. Check issues with `good-first-issue` label
2. Fix typo in documentation
3. Add usage example to README
4. Chat with community in Discussions

**Q: What happens if my PR is rejected?**

A: Don't worry! This is normal:
- Maintainers will explain
- Understand the reason, learn
- Fix and try again
- Or choose another topic

Rejection is not negative, it's part of the learning process!

### 🔧 Technical Issues

**Q: I can't resolve Git conflict?**

A: Step by step:
```bash
# 1. Update main
git checkout main
git pull upstream main

# 2. Return to your branch
git checkout your-branch

# 3. Rebase
git rebase main

# 4. If conflict occurs:
git status  # Which files?

# 5. Edit file, remove conflict markers
# <<<<<<< HEAD
# =======
# >>>>>>> branch

# 6. Add solution
git add conflicted-file.tf
git rebase --continue

# 7. Push (may need force)
git push origin your-branch --force-with-lease
```

Still having issues? Ask for help in the issue!

### 🤝 Collaboration

**Q: Someone else is also working on the same issue?**

A: Get in touch:
```
Hello @user! I'm also working on this issue.
Can we collaborate? I was working on [X part], 
could you take [Y part]?
```

**Q: How long does maintainer respond?**

A: Usually 2-5 business days. Be patient if not urgent.
If urgent: Tag in Discussions or Discord.

**Q: My PR was merged, what should I do?**

A: Congratulations! 🎉
```bash
# 1. Update local
git checkout main
git pull upstream main

# 2. Delete branch (optional)
git branch -d feature/your-branch
git push origin --delete feature/your-branch

# 3. Start new contribution!
```

---

## 🆘 Help and Support

### How to Get Help?

**💬 GitHub Discussions** (Best way!)
- [General questions](https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra/discussions/categories/q-a)
- [Ideas](https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra/discussions/categories/ideas)
- [Help requests](https://github.com/Bilgisayar-Kavramlari-Toplulugu/github-infra/discussions/categories/help)

**🐛 GitHub Issues**
- Bug reports
- Feature requests
- Technical problems

**📧 Direct Contact**
- Urgent security issues
- Private matters
- Direct message to maintainers

### When to Ask for Help?

Don't hesitate in these situations:
- ⚠️ If you don't understand the error message
- ⚠️ If you're having Git problems
- ⚠️ If you're unsure about your approach
- ⚠️ If you don't know how to test
- ⚠️ If you're stuck in PR process
- ⚠️ If you don't understand anything

> **💡 Remember:** There are no stupid questions! Asking is the first step of learning.

---

## 🎉 Your Contribution Was Accepted!

### What Happens Next?

**✅ After Merge:**
1. **Celebrate!** 🎊 Your first (or next) open source contribution!
2. **Profile:** Visible on your GitHub profile
3. **Contributors:** You have a place in project contributors list
4. **Experience:** A concrete project you can add to your CV

**🔄 Continue:**
- Check out more issues
- Review others' PRs
- Suggest new features
- Mentor (help newcomers)

### Thank You! 🙏

Every contribution, no matter how small, is valuable:
- ✨ Writing code
- 📖 Documentation
- 🐛 Bug reporting
- 💡 Idea suggestions
- 💬 Participating in discussions
- 🎨 Design suggestions

**All of them strengthen our community!**

---

## 📜 License

All contributions you make to this project will be published under the license specified in the `LICENSE` file in the repository. By contributing, you agree to this license.

---

**Last updated:** November 10, 2025

**Happy coding!** 🚀