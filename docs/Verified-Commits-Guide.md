# 🔐 Verified Commits Kurulum Rehberi

## 📖 İçindekiler

- [macOS Kurulumu](#-macos-kurulumu)
- [Windows Kurulumu](#-windows-kurulumu)
- [Linux Kurulumu](#-linux-kurulumu)
- [IDE Entegrasyonu](#-ide-entegrasyonu)
- [SSH ile Alternatif Yöntem](#-ssh-ile-imzalama-alternatif)

---

## 🍎 macOS Kurulumu

### 1. Homebrew ve GPG Kurulumu
```bash
# Homebrew kontrolü
brew --version

# Homebrew yoksa kur
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# GPG ve pinentry-mac yükle
brew install gnupg pinentry-mac
```

### 2. GPG Anahtarı Oluştur
```bash
gpg --full-generate-key
```

**Seçenekler:**
- Anahtar Tipi: `(1) RSA and RSA`
- Boyut: `4096`
- Geçerlilik: `0` (sınırsız)
- İsim: GitHub profil adın
- Email: **GitHub hesabındaki email** (önemli!)

### 3. Anahtarını GitHub'a Ekle
```bash
# Anahtarlarını listele
gpg --list-secret-keys --keyid-format=long

# Çıktı örneği:
# sec   rsa4096/ABC123DEF456 2024-01-01 [SC]
# ABC123DEF456 = KEY_ID'n

# Public key'i kopyala (KEY_ID'ni değiştir)
gpg --armor --export ABC123DEF456
```

**GitHub'a ekle:**
1. https://github.com/settings/keys
2. **New GPG key**
3. Anahtarı yapıştır

### 4. Git Konfigürasyonu
```bash
# Homebrew path otomatik bulma (M-series ve Intel uyumlu)
echo "pinentry-program $(brew --prefix)/bin/pinentry-mac" > ~/.gnupg/gpg-agent.conf

# GPG agent'ı yeniden başlat
gpgconf --kill gpg-agent

# Git ayarları (KEY_ID'ni değiştir)
git config --global user.signingkey ABC123DEF456
git config --global commit.gpgsign true
git config --global gpg.program gpg

# Terminal için GPG_TTY
echo 'export GPG_TTY=$(tty)' >> ~/.zshrc
source ~/.zshrc
```

### 5. Test
```bash
# GPG test
echo "test" | gpg --clearsign

# Git test
git commit --allow-empty -m "Test: Verified commit"
git log --show-signature -1
```

### Sorun Giderme (macOS)

**"Inappropriate ioctl for device" hatası:**
```bash
export GPG_TTY=$(tty)
```

**Şifre popup çıkmıyor:**
```bash
# pinentry-mac kontrolü
brew list pinentry-mac

# gpg-agent.conf kontrolü
cat ~/.gnupg/gpg-agent.conf

# Agent'ı yeniden başlat
gpgconf --kill gpg-agent
```

---

## 🪟 Windows Kurulumu

### 1. Gerekli Programları Kur

**Git for Windows:**
- İndir: https://gitforwindows.org/
- Kurulum sırasında "Git from the command line" seçeneğini işaretle

**GPG4Win:**
- İndir: https://www.gpg4win.org/
- Kurulum sırasında **Kleopatra** bileşenini seç

### 2. GPG Anahtarı Oluştur

**Kolay Yol - Kleopatra ile:**
1. Kleopatra'yı aç
2. **File → New OpenPGP Key Pair**
3. İsim ve GitHub email'ini gir
4. **Advanced Settings → Key Material → RSA 4096 bit**
5. **Create**

**Komut Satırı ile:**
```bash
gpg --full-generate-key

# Seçenekler:
# - (1) RSA and RSA
# - 4096
# - 0 (sınırsız)
# - GitHub email'ini kullan
```

### 3. Anahtarını GitHub'a Ekle

**Kleopatra ile:**
1. Anahtarına sağ tıkla → **Export**
2. **Armor** seçeneğini işaretle
3. Dosyayı aç, içeriği kopyala

**Komut Satırı ile:**
```bash
# Anahtarları listele
gpg --list-secret-keys --keyid-format=long

# Export et (KEY_ID'ni değiştir)
gpg --armor --export YOUR_KEY_ID
```

**GitHub'a ekle:**
1. https://github.com/settings/keys → **New GPG key**
2. Anahtarı yapıştır

### 4. Git Konfigürasyonu
```bash
# PowerShell veya Git Bash'te çalıştır
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
git config --global gpg.program "C:/Program Files (x86)/GnuPG/bin/gpg.exe"
```

**GPG path'i bulmak için:**
```bash
where gpg
```

### 5. Test
```bash
git commit --allow-empty -m "Test: Verified commit"
git log --show-signature -1
```

### Sorun Giderme (Windows)

**GPG şifre sormuyor:**
- Kleopatra → Settings → GnuPG System
- "Use pinentry" aktif olmalı

**"No secret key" hatası:**
```bash
# KEY_ID'yi kontrol et
gpg --list-secret-keys --keyid-format=long
git config --global user.signingkey
```

---

## 🐧 Linux Kurulumu

### 1. GPG Kurulumu
```bash
# Sistem güncelle
sudo apt update && sudo apt upgrade -y

# GPG yükle
sudo apt install gnupg2 -y

# Doğrula
gpg --version
```

### 2. GPG Anahtarı Oluştur
```bash
gpg --full-generate-key
```

**Seçenekler:**
- Anahtar Tipi: `(1) RSA and RSA`
- Boyut: `4096`
- Geçerlilik: `0`
- Email: GitHub email'in

### 3. Anahtarını GitHub'a Ekle
```bash
# Anahtarları listele
gpg --list-secret-keys --keyid-format=long

# Export et (KEY_ID'ni değiştir)
gpg --armor --export YOUR_KEY_ID
```

**GitHub'a ekle:**
https://github.com/settings/keys → **New GPG key**

### 4. Git Konfigürasyonu
```bash
# Git ayarları (KEY_ID'ni değiştir)
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
git config --global gpg.program gpg

# Terminal için GPG_TTY
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc  # veya ~/.zshrc
source ~/.bashrc
```

### 5. Test
```bash
# GPG test
echo "test" | gpg --clearsign

# Git test
git commit --allow-empty -m "Test: Verified commit"
git log --show-signature -1
```

### Sorun Giderme (Linux)

**"Inappropriate ioctl for device" hatası:**
```bash
export GPG_TTY=$(tty)
```

**Pinentry sorunu:**
```bash
# pinentry-tty yükle
sudo apt install pinentry-tty

# Ayarla
echo "pinentry-program /usr/bin/pinentry-tty" >> ~/.gnupg/gpg-agent.conf
gpgconf --kill gpg-agent
```

---

## 🎨 IDE Entegrasyonu

### VS Code

**Ayarlar JSON:**
```json
{
  "git.enableCommitSigning": true
}
```

**Veya UI'dan:**
1. `Ctrl/Cmd + ,` (Settings)
2. "git signing" ara
3. **Enable Commit Signing** ✅

### IntelliJ IDEA / PyCharm

1. **Settings** → **Version Control** → **Git**
2. **Configure GPG Key...** tıkla
3. **Enable commit signing with GPG** ✅
4. Anahtarını seç → **OK**

### Visual Studio

1. **Tools** → **Options**
2. **Source Control** → **Git Global Settings**
3. **Enable commit signing** ✅
4. GPG path ve KEY_ID'ni gir

---

## 🚀 SSH ile İmzalama (Alternatif)

GPG yerine SSH anahtarınla commit imzalayabilirsin (daha kolay!):

### Kurulum
```bash
# SSH formatını aktif et
git config --global gpg.format ssh

# SSH anahtarını belirt
git config --global user.signingkey ~/.ssh/id_ed25519.pub

# Commit imzalamayı aç
git config --global commit.gpgsign true
```

### GitHub Ayarı

1. https://github.com/settings/keys
2. SSH anahtarını eklerken **"Signing Key"** olarak işaretle ✅

---

## 📚 Faydalı Linkler

- [GitHub GPG Documentation](https://docs.github.com/en/authentication/managing-commit-signature-verification)
- [Git GPG Documentation](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)
- [GPG4Win (Windows)](https://www.gpg4win.org/)
- [GPG Suite (macOS)](https://gpgtools.org/)

---

## ❓ Sık Sorulan Sorular

**S: Her commit'te şifre mi soracak?**
C: İlk commit'te sorar, sonra cache'lenir (varsayılan 2 saat).

**S: Eski commit'leri imzalayabilir miyim?**
C: Hayır, sadece yeni commit'ler imzalanır.

**S: GPG mi SSH mi kullanmalıyım?**
C: SSH daha kolay kurulum, GPG daha yaygın. İkisi de aynı "Verified" rozetini verir.

**S: Email farklı olursa ne olur?**
C: GitHub email'i ile GPG email'i aynı olmalı, yoksa verified olmaz!

---

**💡 Not:** Global ayarları yaptıktan sonra her commit otomatik imzalanır, `-S` parametresine gerek kalmaz.