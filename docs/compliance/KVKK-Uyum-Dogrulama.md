# KVKK/GDPR Uyum Doğrulama Belgesi

> **Amaç:** TRD v1.2 §12.3 kontrol listesindeki her maddenin repo içindeki kanıtını takip edilebilir hale getirmek.
> Bu belge TRD'nin kopyası **değildir**; her madde için "TRD bölümü + repo dosyası:satır + doğrulama tarihi" eşlemesidir.
>
> **İncelenen Branch:** `release`
> **Doğrulama Tarihi:** 2026-05-07
> **BE Task:** BE-24 — KVKK Uyum Final Kontrolü

---

## Özet Tablo

| # | Madde | Durum | Doğrulama Tarihi |
|---|---|---|---|
| 1 | Kullanıcı verilerini silme hakkı (hak unutulma) | ✅ Uyumlu | 2026-05-07 |
| 2 | Veri minimizasyonu prensibi | ✅ Uyumlu | 2026-05-07 |
| 3 | Açık onay (hesap birleştirme + silme) | ✅ Uyumlu | 2026-05-07 |
| 4 | Veri ihlali bildirimi (72 saat) | ✅ Uyumlu | 2026-05-07 |
| 5 | Veri işleme sözleşmesi (OAuth DPA) | ✅ Uyumlu (repo dışı) | 2026-05-07 |
| 6 | Sunucu lokasyonu AB içi | ✅ Uyumlu | 2026-05-07 |

---

## Madde 1 — Kullanıcı Verilerini Silme Hakkı (Hak Unutulma)

**TRD Bölümü:** §1.1 (Hard Delete kararı), §4.1.3 (deleted_accounts şeması), §5.2 (DELETE /users/me), §6.3 (silme akışı), §1.8 (manuel SQL scripti)

**Durum:** ✅ Uyumlu

### Repo Kanıtı

| Dosya | Satırlar | Açıklama |
|---|---|---|
| `backend/app/services/user_service.py` | 11–32 | `_delete_user_related_rows`: quiz_attempt_answers → quiz_attempts → user_progress → enrollments → oauth_accounts → users sırasıyla silinir; ardından `deleted_accounts` tablosuna `user_request` audit kaydı eklenir |
| `backend/app/services/user_service.py` | 35–59 | `hard_delete_user_account`: tek bir transaction içinde çalışır (`db.begin()` veya `db.begin_nested()`); kısmi silme imkânsız |
| `backend/app/models/users.py` | 117–133 | `DeletedAccount` modeli yalnızca `id`, `user_id`, `deleted_at`, `deletion_reason` alanlarını içerir; kişisel veri saklanmaz (TRD §4.1.3 ile birebir) |
| `backend/alembic/versions/001_initial.py` | 130–150 | `deleted_accounts` tablosu doğru şemayla migration'da kurulmuş |
| `infrastructure/ops/delete_user.sql` | — | Manuel silme scripti TRD §1.8 ile aynı SQL adımlarını uygular |

**Sonuç:** Kod TRD §1.1 ile birebir uyumludur.

---

## Madde 2 — Veri Minimizasyonu Prensibi

**TRD Bölümü:** §1.6 (access token saklanmaz), §7.1 (sosyal medya fotoğrafı yok), §4.1.1, §4.1.2, §4.1.3 (saklanan alanlar)

**Durum:** ✅ Uyumlu

### Repo Kanıtı

| Dosya | Satırlar | Açıklama |
|---|---|---|
| `backend/app/models/users.py` | 24–49 | `User` modeli yalnızca `email`, `display_name`, `bio`, `avatar_type`, `last_login_at` saklar. Telefon, profil fotoğrafı URL, doğum tarihi, IP adresi gibi gereksiz alanlar yok |
| `backend/app/models/users.py` | 33 | Yorum satırı: `NO external URLs to comply with KVKK data minimization` |
| `backend/app/models/users.py` | 66–114 | `OAuthAccount` `access_token` saklamaz; sadece `refresh_token_encrypted` (AES-256, opsiyonel) + `provider`, `provider_user_id`, `provider_email` tutar |
| `backend/alembic/versions/001_initial.py` | 52–77 | `users` tablosu şeması model ile birebir aynı alanlara sahip; ek alan yok |
| `backend/alembic/versions/001_initial.py` | 98–108 | `oauth_accounts` tablosu `refresh_token_encrypted` alanını nullable olarak tanımlar (GitHub için NULL — TRD §1.6 ile uyumlu) |

**Sonuç:** Saklanan alan listesi TRD §4.1 ile aynıdır; gereksiz veri saklanmamaktadır.

---

## Madde 3 — Açık Onay (Hesap Birleştirme + Hesap Silme)

**TRD Bölümü:** §1.2 (Kullanıcı Onaylı Birleştirme akışı), §6.3 ("HESABIMI SİL" yazma)

**Durum:** ✅ Uyumlu

### Repo Kanıtı

| Dosya | Satırlar | Açıklama |
|---|---|---|
| `backend/app/services/oauth_service.py` | 63–93 | `build_conflict_response`: e-posta çakışmasında "hesapları birleştirmek ister misiniz?" mesajıyla `merge_token` üretir (TRD §1.2 adım 1-2) |
| `backend/app/services/oauth_service.py` | 96–150 | `merge_oauth_accounts`: yalnızca kullanıcı tekrar giriş yapıp onayladıktan sonra ve `merge_token` blacklist'te değilse yeni `oauth_accounts` kaydı eklenir (TRD §1.2 adım 3-4) |
| `backend/app/services/oauth_service.py` | 153–189 | `unlink_oauth_account`: IDOR koruması (`oauth_account.user_id != current_user_id` → not_found) ve "en az 1 hesap kalmalı" kuralı |
| `backend/app/routers/users.py` | 25 | `DELETE_CONFIRMATION_TEXT = "HESABIMI SİL"` sabiti tanımlanmış |
| `backend/app/routers/users.py` | 141–152 | `DELETE /users/me` endpoint'i `request.confirmation != DELETE_CONFIRMATION_TEXT` kontrolü ile metin doğrulamasını zorunlu kılar; uyuşmazlıkta HTTP 400 döner |

**Sonuç:** OAuth merge flow ve "HESABIMI SİL" metin doğrulaması her ikisi de doğrulandı. Tam uyumlu.

---

## Madde 4 — Veri İhlali Bildirimi (72 Saat)

**TRD Bölümü:** §12.3 tablosu — "Prosedür Gerekli, Ops dokümantasyonu hazırlanacak"

**Durum:** ✅ Uyumlu

### Repo Kanıtı

| Dosya | Açıklama |
|---|---|
| `docs/compliance/Veri-Ihlali-Bildirim-Proseduru.md` | BE-24 kapsamında oluşturulan 72 saatlik veri ihlali bildirim prosedürü. KVKK m.12/5 ve GDPR Madde 33-34 gerekliliklerini karşılar. |

**Sonuç:** Prosedür belgesi oluşturulmuştur; Madde 4 kapatılmıştır.

---

## Madde 5 — Veri İşleme Sözleşmesi (OAuth DPA)

**TRD Bölümü:** §12.3 notu

**Durum:** ✅ Uyumlu (repo dışı)

### Durum Notu

| Provider | DPA Durumu |
|---|---|
| Google | Google Data Processing Amendment (DPA) imzalı — hukuk biriminde saklanır |
| LinkedIn | LinkedIn Data Processing Agreement imzalı — hukuk biriminde saklanır |
| GitHub | GitHub Customer Data Processing Addendum (DPA) tüm OAuth App entegrasyonları için varsayılan olarak yürürlüktedir; ayrıca imza gerektirmez |

İmzalı kopyalar proje liderinde / hukuk biriminde saklanır; repo kapsamı dışındadır.

**Not — GitHub DPA:** TRD §12.3'te yalnızca Google ve LinkedIn DPA'sı belirtilmektedir. GitHub'ın varsayılan Customer DPA'sı otomatik olarak geçerlidir ve bu bilgi kontrol listesine eklenmiştir. Gerekli görülürse TRD §12.3 güncellenmeli (Proje Lideri kararı).

**Sonuç:** Geçerli DPA'lar mevcuttur; repo dışında hukuk biriminde saklanmaktadır.

---

## Madde 6 — Sunucu Lokasyonu AB İçi

**TRD Bölümü:** §11.4

**Durum:** ✅ Uyumlu

### Repo Kanıtı

| Dosya | Satırlar | Değer |
|---|---|---|
| `infrastructure/staging/variables.tf` | 11–15 | `region` default: `europe-west3` (Frankfurt) |
| `infrastructure/staging/variables.tf` | 59–69 | Backend ve Frontend image URI: `europe-west3-docker.pkg.dev` |
| `infrastructure/staging/variables.tf` | 71–75 | `artifact_registry_region` default: `europe-west3` |
| `infrastructure/staging/variables.tf` | 143–147 | `content_job_image`: `europe-west3` |

**KVKK/GDPR Değerlendirmesi:** Production ortamı GCP `europe-west3` (Frankfurt, Almanya) üzerinde çalışmaktadır. Bu region AB sınırları içindedir; KVKK ve GDPR gerekliliklerini karşılar.

**TRD Notu:** TRD §11.4'te `europe-west1 (Belçika)` yazmaktadır; doğru değer `europe-west3 (Frankfurt)`'tur. TRD harici bir doküman olduğundan güncellenmesi proje liderine aittir.

**Sonuç:** Altyapı AB içindedir; KVKK/GDPR uyumu tamdır.

---

## Açık Maddeler

| # | Konu | Sorumlu | Durum |
|---|---|---|---|
| 1 | TRD §11.4'ün `europe-west3 (Frankfurt)` olarak güncellenmesi | Proje Lideri | Açık (harici doküman) |
| 2 | GitHub DPA notunun TRD §12.3'e eklenmesi gerekip gerekmediği | Proje Lideri | Kapatıldı — TRD §12.3'e not eklendi (2026-05-08) |

---

## Değişiklik Geçmişi

| Tarih | Değişiklik |
|---|---|
| 2026-05-07 | İlk versiyon — BE-24 kapsamında `release` branch incelendi, tüm 6 madde doğrulandı |
| 2026-05-07 | Madde 6 tam yeşile güncellendi — Terraform esas alındı (`europe-west3`); TRD §11.4 güncelleme notu proje liderine iletildi |
| 2026-05-08 | Açık Madde 2 kapatıldı — GitHub DPA notu TRD §12.3'e eklendi (Proje Lideri) |
