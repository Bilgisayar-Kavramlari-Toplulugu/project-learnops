# Veri İhlali Bildirim Prosedürü

> **Kapsam:** LearnOps production ortamı (Backend API, Frontend, Cloud SQL, OAuth provider entegrasyonları)
> **Yasal Dayanak:** KVKK m.12/5 ve GDPR Madde 33-34
> **Sürüm:** 1.0
> **Oluşturulma Tarihi:** 2026-05-07
> **Gözden Geçirme Tarihi:** Yılda bir (veya önemli bir ihlal sonrasında)

---

## 1. Kapsam ve Tanımlar

### 1.1 Veri İhlali Nedir?

Bu prosedür kapsamında "veri ihlali"; iletilen, saklanan veya başka bir şekilde işlenen kişisel verilerin kazara veya hukuka aykırı olarak imha edilmesi, kaybolması, değiştirilmesi, yetkisiz açıklanması veya yetkisiz erişime maruz kalması anlamına gelir.

Örnekler:

- Yetkisiz bir kişinin kullanıcı verilerine (e-posta, `display_name`, `bio`, OAuth hesap bilgileri) erişmesi
- Cloud SQL veritabanına yetkisiz erişim veya veri sızıntısı
- `refresh_token_encrypted` gibi şifreli alanların açığa çıkması
- Yanlış yapılandırma nedeniyle kullanıcı verilerinin herkese açık hale gelmesi
- OAuth provider (Google, LinkedIn, GitHub) tarafından bildirilen üçüncü taraf ihlali (LearnOps kullanıcılarını etkileyen)

### 1.2 Uygulama Kapsamı

Bu prosedür aşağıdaki sistemleri kapsar:

- **Backend API:** `backend/` — FastAPI uygulaması, GCP Cloud Run (europe-west3)
- **Frontend:** GCP Cloud Run (europe-west3)
- **Veritabanı:** GCP Cloud SQL — PostgreSQL (europe-west3)
- **Kimlik doğrulama:** Google, LinkedIn, GitHub OAuth entegrasyonları
- **Altyapı:** GCP Artifact Registry, Cloud Logging, Terraform ile yönetilen kaynaklar

### 1.3 Kapsam Dışı

- LearnOps sistemleriyle entegre olmayan üçüncü taraf ihlalleri (kullanıcıları etkilemediği sürece)
- Test ve staging ortamlarındaki olaylar (gerçek kişisel veri içermediği sürece)

---

## 2. Roller ve Sorumluluklar

| Rol | Kişi / Birim | Sorumluluk |
|---|---|---|
| **Veri Sorumlusu** | Proje Lideri (@flovearth) | KVKK Kurumu'na bildirim yapmak, nihai karar mercii |
| **İhlal Müdahale Sorumlusu** | Güvenlik Lideri (atanacak) | Triaj koordinasyonu, ekip toplama, incident kaydı açma |
| **Teknik Müdahale — Backend** | Backend Ekibi | Kök neden analizi, geçici azaltma önlemleri, kanıt koruma |
| **Teknik Müdahale — Altyapı** | Infra Ekibi | GCP log snapshot'ları, key rotation, erişim iptali |
| **Hukuk** | Hukuk Danışmanı (dış) | DPA yükümlülüklerinin değerlendirilmesi, bildirim metni onayı |

---

## 3. Tespit Kanalları

Bir veri ihlali aşağıdaki kanallardan tespit edilebilir:

- **GitHub Security Advisory** — güvenlik araştırmacısı veya ekip üyesi bildirimi
- **GCP Cloud Logging alarmları** — anormal erişim pattern'leri, yetkisiz API çağrıları (INF-07 kapsamında yapılandırılacak)
- **BE-27 / BE-23 güvenlik test bulguları** — IDOR, auth bypass, OWASP taramaları
- **Kullanıcı bildirimi** — hesabında şüpheli aktivite fark eden kullanıcı
- **OAuth provider bildirimi** — Google, LinkedIn veya GitHub'dan gelen ihlal uyarısı
- **Rutin log incelemesi** — `deleted_accounts` audit tablosunda beklenmedik kayıtlar

---

## 4. 0–1. Saat: İlk Triaj

**Hedef:** İhlalin gerçek olup olmadığını ve aciliyetini belirlemek.

### Adımlar

1. **Incident kaydı aç** — GitHub'da private Security Advisory oluştur; başlık, tespit zamanı, tespit kaynağı ve ilk gözlemi not et.
2. **İhlal Müdahale Sorumlusu'nu bildir** — Slack DM veya e-posta ile anında haberdar et; Veri Sorumlusu'nu (Proje Lideri) da bilgilendirin.
3. **Kanıtları koru ve izole et:**
   - GCP Cloud Logging'den ilgili zaman aralığına ait log snapshot'ı al ve güvenli konuma kaydet.
   - `deleted_accounts` tablosunu ve ilgili audit kayıtlarını dışa aktar.
   - Erişim loglarını (API gateway, Cloud Run) kaydet.
4. **Kapsam ilk tahmini yap:** Hangi sistemler etkilendi? Kaç kullanıcı etkilenmiş olabilir? Hangi veri kategorileri açığa çıkmış olabilir?
5. **False positive değerlendirmesi:** Tespit, gerçek bir ihlali mi yoksa yanlış alarm mı işaret ediyor? Gerekiyorsa ek log analizi yap.

---

## 5. 1–24. Saat: Kapsam Belirleme

**Hedef:** İhlalin tam kapsamını, etkilerini ve kök nedenini belirlemek; geçici azaltma önlemlerini almak.

### Adımlar

1. **Etkilenen kullanıcıları tespit et:**
   - Cloud SQL üzerinden etkilenen `user_id` listesini çıkar.
   - `deleted_accounts` tablosunda anomali var mı kontrol et.
2. **Etkilenen veri kategorilerini belirle:**
   - `users` tablosu: `email`, `display_name`, `bio`, `avatar_type`, `last_login_at`
   - `oauth_accounts` tablosu: `provider`, `provider_email`, `provider_user_id`, `refresh_token_encrypted` (AES-256)
3. **Kök neden ön analizi:** Hangi güvenlik açığı veya yapılandırma hatası ihlale yol açtı?
4. **Geçici azaltma önlemleri** (duruma göre uygulanacak):
   - Etkilenen servis hesaplarının GCP IAM anahtarlarını döndür (`gcloud iam service-accounts keys create`)
   - Şüpheli OAuth token'ları iptal et
   - Etkilenen Cloud Run servisine rate-limit uygula veya erişimi geçici olarak kısıtla
   - Gerekiyorsa etkilenen kullanıcıların oturumlarını zorla kapat (refresh token blacklist)
5. **Hukuk danışmanını bilgilendir:** Bildirimin KVKK m.12/5 kapsamında gerekli olup olmadığını değerlendirmesi için özet sun.

---

## 6. 24–72. Saat: KVKK Kurumu Bildirimi

**Hedef:** Yasal süre dolmadan KVKK Kurumu'na resmi bildirimi tamamlamak.

### 6.1 Bildirim Koşulu

KVKK m.12/5 uyarınca, kişisel veri ihlalinin öğrenilmesinden itibaren **en geç 72 saat** içinde KVKK'ya bildirim yapılmalıdır. Bildirimin gecikmesi halinde gecikmesinin gerekçesi belirtilir.

### 6.2 KVKK Veri İhlali Bildirim Formu

- **Form erişim adresi:** [https://kvkk.gov.tr](https://kvkk.gov.tr) → Veri İhlali Bildirimi bölümü
- **Başvuru yöntemi:** KEP (Kayıtlı Elektronik Posta) veya ıslak imzalı dilekçe ile

### 6.3 Bildirimde Yer Alması Gereken Bilgiler

| Alan | Açıklama |
|---|---|
| Veri sorumlusunun kimliği | Proje Lideri iletişim bilgileri |
| İhlalin niteliği | Hangi veri kategorileri, kaç kişi etkilendi |
| İhlalin olası sonuçları | Etkilenen kişiler üzerindeki muhtemel riskler |
| Alınan / alınması planlanan önlemler | Kök neden giderme, azaltma adımları |
| İletişim noktası | İhlal Müdahale Sorumlusu e-posta ve telefon |

### 6.4 Bildirim Metni Şablonu (Türkçe)

```
Sayın KVKK Kurulu,

[TARİH] tarihinde [KISA AÇIKLAMA] niteliğinde bir kişisel veri ihlali tespit
edilmiştir. İhlal, [ETKİLENEN SİSTEM] üzerinde [BAŞLANGIÇ TAHMİNİ] ile
[TESPİT TARİHİ] arasında gerçekleşmiş olup yaklaşık [KULLANICI SAYISI]
kullanıcıyı etkilemektedir.

Etkilenen veri kategorileri: [VERİ KATEGORİLERİ]

Derhal alınan önlemler: [ALINAN ÖNLEMLER]

İhlali öğrenme tarihimiz: [TARİH]

Kişisel verilerin korunmasına ilişkin yasal yükümlülüklerimiz çerçevesinde
bilgilerinize arz ederiz.

[VERİ SORUMLUSU ADI, UNVANI, İLETİŞİM]
```

---

## 7. 72. Saat Sonrası: Etkilenen Kişilere Bildirim

KVKK m.12/5 ve GDPR Madde 34 uyarınca, ihlal etkilenen kişiler için **yüksek risk** oluşturuyorsa bu kişilere de bildirim yapılması zorunludur.

### 7.1 Bildirim Kanalları

- **E-posta:** Etkilenen kullanıcının kayıtlı e-posta adresine bireysel bildirim
- **In-app banner:** Kullanıcı bir sonraki girişinde uygulama içi uyarı gösterilir
- **Dashboard duyurusu:** Gerekli görülmesi halinde tüm kullanıcılara genel bilgilendirme

### 7.2 Kullanıcı Bildirim E-posta Şablonu (Türkçe)

```
Konu: LearnOps Güvenlik Bildirimi — Hesabınızla İlgili Önemli Bilgi

Sayın [KULLANICI ADI],

[TARİH] tarihinde LearnOps sistemlerinde bir güvenlik olayı tespit ettik.
Bu olay, hesabınızı etkilemiş olabilir.

Etkilenmiş olabilecek bilgiler: [VERİ KATEGORİLERİ]

Ne yaptık:
- [ALINAN TEKNİK ÖNLEMLER]

Sizden beklentimiz:
- Diğer platformlarda aynı şifreyi kullanıyorsanız değiştirmenizi öneririz.
- Hesabınızda şüpheli bir aktivite fark ederseniz [İLETİŞİM ADRESİ]
  adresinden bize ulaşın.

Güvenliğinizi ciddiye alıyor ve bu konuda şeffaf olmayı önemsiyor olduğumuzu
belirtmek isteriz.

LearnOps Ekibi
```

---

## 8. Post-mortem ve Kök Neden Raporu

İhlal kapatıldıktan sonra, **en geç 2 hafta** içinde post-mortem tamamlanmalıdır.

### 8.1 Post-mortem Şablonu

```markdown
## İhlal Özeti
- Tarih ve süre:
- Etkilenen sistemler:
- Etkilenen kullanıcı sayısı:
- Etkilenen veri kategorileri:

## Zaman Çizelgesi
- [SAAT]: Tespit
- [SAAT]: Triaj tamamlandı
- [SAAT]: Azaltma önlemleri alındı
- [SAAT]: KVKK bildirimi yapıldı
- [SAAT]: Kullanıcı bildirimi yapıldı
- [SAAT]: Olay kapatıldı

## Kök Neden

## Katkıda Bulunan Faktörler

## Düzeltici Aksiyonlar
| Aksiyon | Sorumlu | Termin |
|---|---|---|

## Gelecekte Önlemek İçin
```

### 8.2 KVKK Kurumu Güncelleme Bildirimi

Başlangıç bildirimindeki bilgiler değişmişse (örn. etkilenen kullanıcı sayısı revize edildiyse) KVKK'ya ek bildirim yapılır.

### 8.3 Kayıt Tutma

- Tüm incident kayıtları `infrastructure/ops/incidents/` dizininde veya GitHub Security Advisory arşivinde saklanır.
- Saklama süresi: **Minimum 5 yıl** (KVKK m.12 ve ilgili ikincil mevzuat gereği)

---

## 9. Test ve Tatbikat

- **Yılda 1 kez** tabletop exercise (masa başı tatbikat) düzenlenir.
- Tatbikatta bu prosedür senaryolar üzerinden test edilir; eksikler güncelleme olarak yansıtılır.
- Tatbikat tarihi ve sonuçları `infrastructure/ops/incidents/` altında kayıt altına alınır.

---

## 10. Referanslar

- KVKK Madde 12/5 — Kişisel veri güvenliğinin ihlali halinde bildirim
- GDPR Madde 33 — Denetim makamına bildirim
- GDPR Madde 34 — Veri sahibine bildirim
- TRD v1.2 §12.3 — KVKK/GDPR Uyum Kontrol Listesi, Madde 4
- [KVKK Veri İhlali Bildirim Formu](https://kvkk.gov.tr)
