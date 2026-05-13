# OWASP Top 10 Güvenlik Denetim Raporu — BE-23

**Proje:** LearnOps MVP  
**Sprint:** Sprint 8  
**Kart:** BE-23 — Security Review: OWASP Top 10  
**Tarih:** 12 Mayıs 2026  
**Branch:** `release` (HEAD: `545a594`)  
**Bağımlılık:** BE-27 tamamlandı (110/110 test geçti) → BE-23 başlandı  
**Ortam:** Staging — `learnops-staging.findmywayapp.com`

---

## OWASP Top 10 Nedir?

OWASP (Open Web Application Security Project), web uygulamalarındaki en yaygın 10 güvenlik açığını A01'den A10'a kadar numaralandırarak yayınlar. A01 en sık görülen ve en kritik risktir. BE-23 kabul kriteri bu standart checklist'i referans almaktadır.

---

## Özet

| Madde | Durum | Yöntem |
|---|---|---|
| A01 — Broken Access Control | ✅ Test edildi, bulgu yok | BE-27 otomatik testler + kod analizi |
| A02 — Cryptographic Failures | ✅ Test edildi, bulgu yok | Manuel test + kod incelemesi |
| A03 — Injection | ✅ Test edildi, bulgu yok | Kod taraması |
| A04 — Insecure Design | ✅ Test edildi, bulgu yok | BE-27 otomatik testler + kod analizi |
| A05 — Security Misconfiguration | ✅ Test edildi, bulgu yok | Manuel test + kod incelemesi |
| A06 — Vulnerable Components | ⚪ Kapsam dışı | Bkz. gerekçe |
| A07 — Auth & Session Failures | ✅ Test edildi, bulgu yok | BE-27 otomatik testler + kod analizi |
| A08 — Software Integrity Failures | ⚪ Kapsam dışı | Bkz. gerekçe |
| A09 — Logging & Monitoring | ⚪ Kapsam dışı | Bkz. gerekçe |
| A10 — SSRF | ⚪ Uygulanamaz | Bkz. gerekçe |
| **Sonuç** | **0 kritik açık** | **Production deploy engelleyici bulgu yok** |

---

## A01 — Broken Access Control

**Neden yapıldı?**
LearnOps çok kullanıcılı bir platformdur. Her kullanıcı yalnızca kendi enrollment, progress, quiz attempt ve profil verisine erişebilmeli; başka kullanıcıların kaynaklarına erişememeli. Cookie-only auth mimarisinin tüm endpoint'lerde tutarlı uygulandığı ve IDOR (Insecure Direct Object Reference) saldırılarına karşı korumalı olduğu doğrulanmalıydı.

**Ne bulundu?**
Bulgu yok. Tüm endpoint'ler geçerli cookie olmadan 401 döndürüyor. Kullanıcı A, kullanıcı B'nin hiçbir kaynağına erişemiyor. Enrollment, progress, quiz attempt ve OAuth hesabı izolasyonu eksiksiz.

**Olmasaydı ne olurdu?**
Bir kullanıcı başka kullanıcıların quiz sonuçlarını, kurs ilerlemesini veya hesap bilgilerini görebilirdi. KVKK açısından kişisel veri ihlali oluşurdu.

### Backend Auth Kontrolleri

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| Cookie olmadan 401 döner (14 endpoint) | ✅ PASSED | BE-27: `test_missing_cookie_401` × 14 |
| Süresi dolmuş token reddedilir | ✅ PASSED | BE-27: `test_expired_token_401` × 14 |
| Refresh token access olarak kullanılamaz | ✅ PASSED | BE-27: `test_refresh_token_as_access_401` × 14 |
| Geçersiz JWT imzası reddedilir | ✅ PASSED | BE-27: `test_invalid_signature_401` × 14 |
| Authorization header dikkate alınmaz | ✅ PASSED | BE-27: `test_authorization_header_ignored_401` × 14 |
| Silinmiş kullanıcı token'ı 404 döner | ✅ PASSED | BE-27: `test_ghost_user_404` × 14 |

### IDOR Kontrolleri

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| Başkasının enrollment listesi görülemez | ✅ PASSED | BE-27: `test_enrollment_list_no_cross_contamination` |
| Başkasının section progress'i değiştirilemez | ✅ PASSED | BE-27: `test_user_a_cannot_complete_user_b_section` |
| Başkasının quiz attempt'i okunamaz | ✅ PASSED | BE-27: `test_user_a_cannot_read_user_b_attempt_detail` |
| Başkasının attempt'i submit edilemez | ✅ PASSED | BE-27: `test_user_a_cannot_submit_user_b_attempt` |
| Başkasının enrollment progress'i okunamaz | ✅ PASSED | BE-27: `test_user_a_cannot_read_user_b_course_progress` |
| Başkasının OAuth hesabı silinemez | ✅ PASSED | BE-27: `test_user_a_cannot_delete_user_b_oauth_account` |
| Kayıtsız kullanıcı quiz başlatamaz | ✅ PASSED | BE-27: `test_quiz_attempt_requires_enrollment` |
| URL query param ile başkasının dashboard'u görülemez | ✅ PASSED | BE-27: `test_dashboard_query_param_injection` |
| Kayıtsız kursun section'ı tamamlanamaz | ✅ PASSED | `progress_service.py` — enrollment check, 400 döner |

### Frontend Auth Zinciri

| Kontrol | Sonuç | Detay |
|---|---|---|
| 401 → refresh → başarısız → /login redirect | ✅ PASSED | `api.ts` interceptor → `AuthProvider` → `router.replace(routes.login)` |
| `setOnAuthFailure` callback doğru bağlanmış | ✅ PASSED | `auth-provider.tsx:16` |
| Results sayfası 401 → login redirect | ✅ PASSED | `quiz/[quizId]/results/page.tsx` — status 401 → `router.push(routes.login)` |

### Tasarım Kararı — Section Tamamlama Ön Koşulu

Kayıtlı kullanıcı, section'ları tamamlamadan quiz URL'ine direkt erişerek quiz başlatabilmektedir. Enrollment kontrolü geçiyor — bu bir yetki ihlali değil. MVP kapsamında (FR-14, TC-QUIZ-01) section completion ön koşulu tanımlanmamış. **Intentional design decision. Post-MVP v1.1.0 backlog'a alındı.**

**Sonuç: ✅ 0 kritik açık.**

---

## A02 — Cryptographic Failures

**Neden yapıldı?**
JWT token'larının JavaScript ile okunabilmesi en yaygın kimlik bilgisi çalma yöntemlerinden biridir. Token'ların httpOnly cookie'de saklandığı ve JS erişimine kapalı olduğu canlı staging ortamında doğrulanmalıydı. HTTPS zorunluluğu token'ların ağ üzerinde şifresiz iletilmediğini garanti eder.

**Ne bulundu?**
Bulgu yok. `document.cookie` komutu staging'de boş string döndürdü — token'lar JS'ten erişilemiyor. HTTP ile erişimde GCP load balancer HTTPS'e yönlendiriyor.

**Olmasaydı ne olurdu?**
Token'lar JavaScript ile okunabilseydi, XSS açığı olan herhangi bir üçüncü taraf script kullanıcı oturumunu çalabilirdi. HTTP trafiğe izin verilseydi token'lar ağ dinleme ile ele geçirilebilirdi.

| Kontrol | Sonuç | Detay |
|---|---|---|
| access_token ve refresh_token httpOnly cookie'de | ✅ PASSED | `HttpOnly; Secure; SameSite=Strict` |
| `document.cookie` → JS erişimi engelli | ✅ PASSED | TC-SEC-03: Staging DevTools Console — çıktı `''` |
| HTTPS zorunlu | ✅ PASSED | TC-SEC-05: HTTP ile erişimde GCP load balancer HTTPS'e yönlendiriyor |
| OAuth access_token DB'ye yazılmıyor | ✅ PASSED | Veri minimizasyonu — gereksiz hassas veri saklanmıyor |

**Not:** `Strict-Transport-Security` (HSTS) response header'ı staging'de mevcut değil. HSTS olsaydı tarayıcı HTTP isteklerini sunucuya göndermeden önce kendi kendine HTTPS'e çevirirdi — mevcut GCP korumasından daha güçlü. Post-MVP v1.1.0 INF iyileştirmesi olarak kayıt altına alındı.

**Sonuç: ✅ 0 kritik açık.**

---

## A03 — Injection

**Neden yapıldı?**
SQL Injection saldırısında kötü niyetli kullanıcı girdisi veritabanına doğrudan komut olarak iletilir; tüm veri okunabilir veya silinebilir. LearnOps ORM kullandığını beyan ediyor — bunu bağımsız olarak doğrulamak gerekiyordu. MDX içerik server-side render edildiğinden XSS vektörü de bu madde kapsamında incelendi.

**Ne bulundu?**
Bulgu yok. Tüm veritabanı sorguları SQLAlchemy ORM construct'ları ile yazılmış, tek `text()` kullanımı sabit bir health check sorgusudur. MDX içeriği kullanıcı girdisi değil, ekip tarafından oluşturulmuş ve seed edilen dosyalar.

**Olmasaydı ne olurdu?**
Raw SQL kullanılsaydı kullanıcı adı veya parola alanlarına enjekte edilen SQL komutları tüm kullanıcı tablosunu dışarı sızdırabilirdi. XSS açığı olsaydı zararlı script içeren bir section sayfası kullanıcı token'larını çalabilirdi.

**Yöntem:** PowerShell ile tüm backend Python dosyaları tarandı.

```
Get-ChildItem -Path backend/app -Recurse -Include "*.py" |
  Select-String -Pattern "\.execute\(|\.text\("
```

| Kontrol | Sonuç | Detay |
|---|---|---|
| Raw SQL string kullanımı | ✅ YOK | Tüm `execute()` çağrıları ORM construct'ları (`select()`, `delete()` vb.) |
| `text()` kullanımı | ✅ GÜVENLİ | `main.py:98`: `text("SELECT 1")` — sabit literal, kullanıcı girdisi yok |
| MDX XSS riski | ✅ YOK | `next-mdx-remote/rsc` server-side render; içerik seed'li dosyalar |

**Sonuç: ✅ 0 bulgu.**

---

## A04 — Insecure Design

**Neden yapıldı?**
Quiz sisteminde en kritik güvenlik gereksinimi `correct_index`'in quiz başlatma aşamasında client'a sızdırılmamasıdır. Bunun yanı sıra iş mantığı bypass senaryoları güvenlik açığı oluşturabilir: aynı anda 2 attempt açmak, süre dolduktan sonra cevap göndermek, başkasının hesabını silmek. CSRF korumasının SameSite=Strict cookie ile sağlandığı doğrulandı.

**Ne bulundu?**
Bulgu yok. `correct_index` attempt başlatma response'unda kesinlikle yok. Tüm iş mantığı bypass senaryoları backend tarafından engelleniyor.

**Olmasaydı ne olurdu?**
`correct_index` sızsaydı kullanıcı quiz sorularının cevaplarını görerek %100 skora ulaşabilirdi. CSRF koruması olmasaydı, kullanıcı farklı bir sitedeyken arka planda enrollment veya hesap silme işlemi tetiklenebilirdi.

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| CSRF — SameSite=Strict cookie | ✅ PASSED | httpOnly + SameSite=Strict kombinasyonu |
| `correct_index` attempt başlatmada GÖNDERİLMEZ | ✅ PASSED | TC-SEC-01 + BE-27: `test_correct_index_absent_in_attempt_response` |
| `correct_index` submit sonrası döner (NF-05, MVP kararı) | ✅ PASSED | `test_correct_index_present_after_submit` — sonuç ekranı için gerekli |
| Duplicate enrollment engellenir (409) | ✅ PASSED | BE-27: `test_duplicate_enrollment_returns_409` |
| Aynı anda 2 aktif attempt engellenir | ✅ PASSED | BE-27: `test_cannot_start_second_active_attempt` |
| Geç submit reddedilir (+30sn tolerans) | ✅ PASSED | BE-27: `test_late_submission_rejected` |
| `is_active: false` sorular attempt'e dahil edilmez | ✅ PASSED | BE-27: `test_inactive_questions_excluded_from_attempt` |
| Son OAuth bağlantısı silinemez | ✅ PASSED | BE-27: `test_last_oauth_account_deletion_rejected` |

**Sonuç: ✅ 0 kritik açık.**

---

## A05 — Security Misconfiguration

**Neden yapıldı?**
Yanlış yapılandırılmış CORS, farklı bir origin'den gelen kötü niyetli isteklerin kullanıcı adına işlem yapmasına izin verebilir. Rate limiting yokluğunda auth endpoint'leri brute-force saldırılarına açık kalır. FE-22 sonrası `GET /courses/{slug}` artık her section açılışında browser'dan çağrıldığından bu endpoint'in de rate limit kapsamında olduğu ayrıca doğrulandı.

**Ne bulundu?**
Bulgu yok. CORS origin'leri GCP Secret Manager'dan okunuyor, wildcard yok. Auth endpoint'leri 10 req/min ile sınırlandırılmış — staging'de 11. istekte 429 döndü. `GET /courses/{slug}` genel API limitine (100 req/min) tabi.

**Olmasaydı ne olurdu?**
CORS wildcard olsaydı herhangi bir siteden kullanıcı adına API isteği atılabilirdi. Rate limiting olmasaydı botlar saniyeler içinde binlerce OAuth isteği göndererek sistemi çökertebilirdi.

| Kontrol | Sonuç | Detay |
|---|---|---|
| CORS — wildcard `*` yok | ✅ PASSED | `settings.allowed_origins` env-var driven; default sadece localhost |
| CORS — `allow_credentials: True` + explicit origins | ✅ PASSED | Browser wildcard+credentials kombinasyonunu reddeder |
| CORS — staging/prod origin GCP Secret Manager'dan | ✅ PASSED | Koda hard-coded değer yok |
| Rate limiting — `/auth/*` → 10 req/min | ✅ PASSED | TC-SEC-04: Staging'de 11. istekte `429 Too Many Requests` |
| Rate limiting — `/v1/*` genel API → 100 req/min | ✅ PASSED | `RateLimiterMiddleware` tüm endpoint'leri kapsıyor |
| `GET /courses/{slug}` FE-22 sonrası — rate limit kapsamında | ✅ PASSED | Genel API limitine tabi |

**Sonuç: ✅ 0 kritik açık.**

---

## A06 — Vulnerable and Outdated Components

**Neden kapsam dışı?**
Bu madde bilinen CVE içeren kütüphanelerin tespitini kapsar ve genellikle `pip-audit` veya Dependabot gibi araçlarla taranır. LearnOps'ta tüm bağımlılıklar Poetry lock dosyasıyla pinlenmiş; yeni kütüphane eklenmesi PR sürecinden ve 2 CODEOWNER onayından geçiyor. Automated scanning ayrı bir CI görevi gerektirir, BE-23 backend security review kartının kapsamı dışındadır.

**Post-MVP v1.1.0:** `pip-audit` CI entegrasyonu backlog'a alındı.

**Sonuç: ⚪ Kapsam dışı.**

---

## A07 — Identification and Authentication Failures

**Neden yapıldı?**
Oturum yönetimi hataları saldırganların başka kullanıcı kimliğine bürünmesine yol açabilir. Token tip karışıklığı (refresh token'ın access olarak kullanılması), geçersiz imzalı token'ların kabulü ve logout sonrası token geçerliliği kritik senaryolardır. Auth zincirinin uçtan uca çalıştığı hem otomatik testler hem de kod analizi ile doğrulandı.

**Ne bulundu?**
Bulgu yok. Refresh token access olarak reddediliyor, geçersiz imzalar reddediliyor, 401 alındığında sistem /login'e yönlendiriyor.

**Olmasaydı ne olurdu?**
Refresh token ile korumalı endpoint'lere erişilebilseydi süresi dolmuş access token'ı olan saldırgan sisteme girmeye devam edebilirdi. Auth zinciri eksik olsaydı unauthenticated kullanıcılar korumalı sayfalara erişebilirdi.

| Kontrol | Sonuç | Detay |
|---|---|---|
| HTTPBearer kullanılmıyor — cookie-only auth | ✅ PASSED | `get_current_user` dependency httpOnly cookie okur |
| Refresh token access olarak kullanılamaz | ✅ PASSED | BE-27: `test_refresh_token_as_access_401` |
| Geçersiz JWT imzası reddedilir | ✅ PASSED | BE-27: `test_invalid_signature_401` |
| Logout cookie temizler (Max-Age=0) | ✅ PASSED | TC-AUTH-07 kapsamında doğrulandı |
| 401 → refresh → başarısız → /login redirect | ✅ PASSED | `api.ts` interceptor + `AuthProvider` — kod analizi ile doğrulandı |
| Token blacklist — in-memory | ℹ️ BİLİNEN | Cloud Run single instance'da işlevsel. Multi-instance safe değil. Post-MVP Redis. |

**Sonuç: ✅ 0 kritik açık.**

---

## A08 — Software and Data Integrity Failures

**Neden kapsam dışı?**
Bu madde CI/CD pipeline güvenliği, artifact bütünlüğü ve tedarik zinciri saldırılarını kapsar. Bu alanlar INF ekibinin sorumluluğundadır (INF-05, INF-07 kartları). BE-23 backend uygulama güvenliği review kartıdır.

**Sonuç: ⚪ Kapsam dışı — INF ekibi sorumluluğu.**

---

## A09 — Security Logging and Monitoring

**Neden kapsam dışı?**
Log ve monitoring altyapısı INF-07 kartının konusudur. Bu sprint'te BE-23 kapsamında aktif test yapılmamıştır.

**Sonuç: ⚪ Kapsam dışı — INF-07 kartı.**

---

## A10 — Server-Side Request Forgery (SSRF)

**Neden uygulanamaz?**
SSRF saldırısında saldırgan sunucuyu kendi adına iç ağa veya cloud metadata servislerine (örn. GCP `169.254.169.254`) istek atmaya zorlar. Bu saldırı ancak kullanıcı girdisiyle URL fetch eden bir endpoint varsa mümkündür. LearnOps'ta böyle bir endpoint bulunmamaktadır; OAuth callback URL'leri sabit ve provider'da kayıtlıdır. Mimari olarak bu risk mevcut değildir.

**Sonuç: ⚪ N/A — Platform mimarisi gereği uygulanamaz.**

---

## FE-22 Sonrası `GET /courses/{slug}` Özel Değerlendirmesi

**Neden yapıldı?**
FE-22 öncesinde bu endpoint yalnızca Next.js build zamanında çağrılıyordu. FE-22 sonrasında `useCourseDetail(slug)` hook'u her section sayfası açılışında browser'dan çağırıyor. Kullanım örüntüsü değiştiğinden abuse senaryosu ve veri sızıntısı riski ayrıca değerlendirilmesi gerekiyordu.

**Ne bulundu?**
Bulgu yok. Rate limiting kapsamında, response yalnızca public alanları içeriyor.

**Olmasaydı ne olurdu?**
Rate limit kapsamı dışında olsaydı bir kullanıcı bot ile saniyeler içinde binlerce istek göndererek backend'i yorabilirdi. Response'da fazladan alan olsaydı iç sistem bilgisi sızabilirdi.

| Kontrol | Sonuç | Detay |
|---|---|---|
| Rate limiting kapsıyor | ✅ PASSED | 100 req/min genel API limiti |
| Response whitelist — fazladan alan yok | ✅ PASSED | `CourseDetail` schema: yalnızca public alanlar |
| `courseId` artık static HTML'e gömülmüyor | ✅ İYİLEŞME | React Query cache'inde — attack surface azalması |

---

## Suite 8 Manuel Güvenlik Test Sonuçları

| TC ID | Başlık | Öncelik | Sonuç | Yöntem |
|---|---|---|---|---|
| TC-SEC-01 | `correct_index` network'te yok | Critical | ✅ PASSED | BE-27 otomatik |
| TC-SEC-02 | IDOR — başkasının attempt'i 403 | Critical | ✅ PASSED | BE-27 otomatik |
| TC-SEC-03 | httpOnly cookie JS erişilemiyor | Critical | ✅ PASSED | Staging DevTools Console |
| TC-SEC-04 | Rate limit — 11. istekte 429 | Major | ✅ PASSED | Staging DevTools Console |
| TC-SEC-05 | HTTPS zorunlu | Major | ✅ PASSED | Staging browser testi |
| TC-SEC-06 | URL injection user_id yok sayılır | Critical | ✅ PASSED | BE-27 otomatik |

**6/6 test geçti. Tüm Critical TC'ler yeşil.**

---

## Bug Fix

| Dosya | Değişiklik | Satır |
|---|---|---|
| `backend/app/services/quiz_service.py` | `HTTP_422_UNPROCESSABLE_ENTITY` → `HTTP_422_UNPROCESSABLE_CONTENT` | 190 |

---

## Post-MVP v1.1.0 Backlog

| # | Kalem |
|---|---|
| 1 | Section tamamlama quiz ön koşulu — BE + FE guard |
| 2 | HSTS header — Frontend Cloud Run'dan `Strict-Transport-Security` |
| 3 | Redis tabanlı token blacklist — multi-instance safe |
| 4 | Automated dependency scanning — `pip-audit` / Dependabot |

---

## Karar

> **BE-23 OWASP Top 10 denetimi tamamlandı. Test edilen 7 maddede 0 kritik açık. 3 madde kapsam dışı veya mimari olarak uygulanamaz. Production deploy engelleyici bulgu bulunmamaktadır.**


