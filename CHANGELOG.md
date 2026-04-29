# Changelog

Bu dosya git-cliff tarafından otomatik oluşturulmaktadır.
Tüm önemli değişiklikler burada belgelenmiştir.

## [Yayınlanmamış]

### ⚙️ Genel
- **changelog:** Update for v1.1.0 — lerkush ([`e7fd2d7`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e7fd2d79e403fadaafda14c3ed273bcad972d5e5))
- **release:** Generate full CHANGELOG.md from v0.2.0 to v1.1.0 — lerkush ([`b5bc571`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b5bc5710c6132c6dd16df7a937932ce0a1da3dfc))
- **release:** Sync develop to release v1.1.0 — lerkush ([`72ed2bf`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/72ed2bfad4bd922788d42cff1d3fce1f3c8859c7))
- Merge release v1.1.0 fixes back into develop — lerkush ([`68e43a3`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/68e43a3822d52141af238638794fe14c1d8b67b1))


### 🐛 Hata Düzeltmeleri
- **auth:** Use frontend proxy for GitHub OAuth redirect URI in staging — karalarmehmet ([`dd90812`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/dd908129fe4c24d618335b872a232ba9f357cbba))


## [1.1.0] — 2026-04-15

### ⚙️ Genel
- Apply lint/format fixes (#FE-05-06-07) — Alper ([`b2f46ad`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b2f46adb7f08e307554c06f999c3d30d6c1af725))
- Remove unusued comments(#FE-05-06-07) — Alper ([`d4cbcd6`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d4cbcd6f2b911dca29cba6b7c52a2540cef85820))
- **auth:** Fix type annotations and formatting for oauth unlinking — maliuyanik ([`5f298c5`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/5f298c52aeaaaccb9901ae5a84d31da4086fb92f))
- Add infrastructure/**/.env to gitignore — karalarmehmet ([`09b9268`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/09b9268b58a12ee6f3442caa3ae5e989b5b024f7))
- **content:** Remove placeholder MDX test courses — karalarmehmet ([`ac8b11c`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/ac8b11ce9db8e337b4e2d3e5f6cc0ca8f8c810f9))
- **infra:** Sync release-1.1.0 changes back to develop — lerkush ([`4c476ff`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/4c476ff0827243eeaab51101a6cbe4d084ad0dce))


### ✅ Testler
- Create users router tests — Alper ([`1ea4520`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1ea4520c366f9bd56c77edd4cccf883bda5d96ad))
- Create /users/me/accoutns endpoint tests — Alper ([`7c55561`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/7c55561e0e6f868fdd514ba8970bfb6f27c8b40a))
- Create users router tests — Alper ([`1d4ee40`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1d4ee403ffc6d9a8e6563da583bfb3ca79347e15))
- Create /users/me/accoutns endpoint tests — Alper ([`3b8c082`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/3b8c082357ea638d84c687a63d9105ff1d2d5911))
- **auth:** Mock settings for github login tests (#BE-06) — belmaaz ([`78f22a8`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/78f22a864015230e175954eb576c65c62a764314))
- Verify CI skip detection with backend change — karalarmehmet ([`03e29fd`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/03e29fdc04984fc63c0c8ce96185ccf56fbdf654))


### 🐛 Hata Düzeltmeleri
- **auth:** Blacklist refresh token after account deletion (#BE-11) — Shamsia ([`2e6f762`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/2e6f762df37b12c7becc127acc80148e3948be44))
- **backend:** Remove role field from user schema — Alper ([`692cd31`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/692cd3164f477f5db156c9cc9b02ac54e997930c))
- **backend:** Update accounts endpoint response — Alper ([`a4a1631`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a4a1631bef8a64383c87e99d4c28cff1306ae9f7))
- Solve ruff check errors — Alper ([`62502b0`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/62502b03ba5162e000d056b974d46eb20d77a722))
- **avatar:** Use .svg extension in InitialsAvatar — Alper ([`c37abcf`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/c37abcf51c33eb29bb4d850b6b9f9a5aa9d4212b))
- **profile:** Use pickTone from InitialsAvatar for initials button bg color in avatar picker — Alper ([`523278c`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/523278cf85c8779dbe5fae7c67780ee1551ce97e))
- **profile:** Eliminate useEffect setState warning by splitting ProfileForm component — Alper ([`b74876f`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b74876f7e28f5428f3650245e803b12660fbfd92))
- User-menu profile icon fix — Alper ([`e163439`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e1634398b8f63e2e7268aab35efed446450564c5))
- Remove backend file changes — Alper ([`ce58172`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/ce58172131c7cfbc202944f0c9e42f665b052c1d))
- **frontend:** Remove role field from dashboardprofile type (#FE-05-06-07) — Alper ([`be3c04c`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/be3c04c0783c594d62bd8770c597c8d71b7951ea))
- **frontend:** Update user name icon logic (#FE-05-06-07) — Alper ([`ad3cc15`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/ad3cc15015f06de86f16957462ef6a3bf72961ff))
- **frontend:** Format document and delete unneccessary comments (#FE-05-06-07) — Alper ([`f4df0d7`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/f4df0d797f5f39e44872b2b69d9d652b174530da))
- **frontend:** Fix initials user name icon (#FE-05-06-07) — Alper ([`690a24b`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/690a24b9ea169e178515456fbeddfdff8cc82ec2))
- **frontend:** Format layout (#FE-05-06-07) — Alper ([`c709a57`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/c709a577de8bed0e557f05c5bc36aab4c1bc89fc))
- **frontend:** Remove unused seed field from initialsavatar (#FE-05-06-07) — Alper ([`a31197f`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a31197f51243abfd662e2b44c640477852c3be91))
- **frontend:** Remove duplicate function (#FE-05-06-07) — Alper ([`c2c2a31`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/c2c2a31feb56a0266886c67dc98e7deb2ac7da1e))
- **frontend:** Format initials-avatar component (#FE-05-06-07) — Alper ([`8cbc265`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8cbc265c6a44b5f2f7c787cc1a5987dc1a5fd0a3))
- **frontend:** Update user name icon show logic (#FE-05-06-07) — Alper ([`9e5a068`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/9e5a0687f3b377306e15eb7a3a4c01efc374e8cc))
- **frontend:** Lint frontend (#FE-05-06-07) — Alper ([`6634c68`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/6634c689daec764b35e15628d8277445258cd002))
- **frontend:** Remove backend file changes (#FE-05-06-07) — Alper ([`1920719`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/19207196e65f144349286131770a03e1c69f62e9))
- **frontend:** Remove unused seed field (#FE-05-06-07) — Alper ([`59cae29`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/59cae2972a7098157d145a82521416b15e553e69))
- **frontend:** Remove unused file (#FE-05-06-07) — Alper ([`e5136d1`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e5136d1c5ea561d985c659e51aa20a1652bf8bae))
- **frontend:** Move initial-name-displayer logic (#FE-05-06-07) — Alper ([`d0edd05`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d0edd05db59c5d7669babcc0a875c24389ad19ac))
- **frontend:** Update avatar-tone-classes (#FE-05-06-07) — Alper ([`d236d40`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d236d40e2f1c28671c0a7969565e0af6eceaeef2))
- **frontend:** Update acc deletion confirmation text (#FE-05-06-07) — Alper ([`71da612`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/71da612c7da068dc47e65942374278cedbdd7d3c))
- **frontend:** Update api.delete request (#FE-05-06-07) — Alper ([`a748200`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a7482006a3c8f6102961ce6699a3b0b8523af549))
- **frontend:** Format document (#FE-05-06-07) — Alper ([`b78ca10`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b78ca10a0e125dee271f5574742add5305499887))
- **frontend:** Add missing width props to system avatar images (#FE-05-06-07) — Alper ([`d193ebc`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d193ebc0afc1fb321aaab99fe48bc3ccf05213b2))
- **frontend:** DashboardLayout review fix FE-05/FE-06/FE-07 (#FE-05) (#FE-06) (#FE-07) — Muhammed Çağrı Kurt ([`d36ea28`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d36ea28dd52950d4f594120bbcc889a023fcdabc))
- **frontend:** Review'deki DasboardLayout ile benzer olduğu için (#FE-05) (#FE-06) (#FE-07) — Muhammed Çağrı Kurt ([`e21ad32`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e21ad32c670240256a6be4205913a2dc464189fa))
- **frontend:** Dashboard error state metin iyileştirmesi (#FE-05, #FE-06, #FE-07) — Muhammed Çağrı Kurt ([`0d11df2`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/0d11df21b669450dbc60a6c871767b0b694531d7))
- **auth:** Store LinkedIn refresh token encrypted in OAuth account — karalarmehmet ([`7b2ac00`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/7b2ac0008696f3f9f1c25a8219a4ca9255912743))
- Linkedin ve github oauth buttons disabled — fatih ([`542cda7`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/542cda7a6f18fab57f67faf6fff13e9ee14e24fd))
- **backend:** Remove role field from user schema — Alper ([`9009400`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/900940043c15359bf0e00d2d7e35841d4cdfe5b2))
- **backend:** Update accounts endpoint response — Alper ([`f5d994e`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/f5d994ea85423977a8d50525a8d05ea5fdf0049c))
- Solve ruff check errors — Alper ([`5c754f8`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/5c754f8cf01083e5228180e4bc7b00e595b15c21))
- **tests:** Resolve authentication and user type issues in tests and oauth endpoints — maliuyanik ([`c991b35`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/c991b352349032bc5f3a96ff8741551a0367c25c))
- **users:** Update db commit to flush in update_me and adjust test assertions for linked accounts — maliuyanik ([`a732f37`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a732f3783d0e61589b94921d1f9cff174fd4ad64))
- **users:** Adjust formatting for db flush in update_me and clean up test file — maliuyanik ([`43ac85f`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/43ac85fe446b7e049cb7cdcbb318848606d41850))
- Restore jti in refresh tokens in tests and ruff formatting — belmaaz ([`1c42ecb`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1c42ecba4e9ecd9d2bfa099476b52bf79853a902))
- Allow bearer auth for delete + jti refresh tokens — Shamsia ([`afec5bb`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/afec5bbc853df65e4ad6c8e069f803c8175cd1a4))
- **content:** Kurs meta verileri ve dizin yapısı PR feedbacklerine göre düzeltildi (#CNT-03) — ismail arıcıoğlu ([`74edffd`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/74edffd921c918ad241c7b95f32904869387b2c4))
- **content:** Kurs meta verileri ve dizin yapısı PR feedbacklerine göre düzeltildi (#CNT-03) — ismail arıcıoğlu ([`abdea7f`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/abdea7f51f9a92f3878ef18f001ea064a0684467))
- **content:** Doğru cevap dağılımı dengelendi (#CNT-03) — ismail arıcıoğlu ([`d342d8b`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d342d8b8557139d8121ead1166e333a6d8907ba6))
- **security:** Replace python-jose with PyJWT to resolve Dependabot alerts #1-#3 — karalarmehmet ([`7ca86d6`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/7ca86d65d55cdf1e3f655e0a26fe26d1d4765843))
- **BE-13:** Use named constraints in UPSERT and remove unused env param — karalarmehmet ([`203ad8f`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/203ad8f1af6491bc519a02ba359a5ca083af41f2))
- **db:** Add missing updated_at columns to courses and sections tables — karalarmehmet ([`a8fef08`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a8fef08beadfeeb02eb80df7f9a8dd962d7c2684))
- **content:** Improve seed_content.py validation and UPSERT — karalarmehmet ([`3493023`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/34930233be5af43a7dc884846938191dfccbf419))
- **model:** Remove duplicate display_order field from Course model — karalarmehmet ([`8dc72f6`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8dc72f65697141937cf9c13816cbfa666bab750e))
- **content:** Replace section UPSERT with delete-insert — karalarmehmet ([`4d246ec`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/4d246ec922328b83ce5f6583eb1f15aaecd24b01))
- **deps:** Add psycopg2-binary for sync seed script engine — karalarmehmet ([`a44c482`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a44c482348b66458540f6ac475e5b351656e18f5))
- **content:** Correct seed script usage instructions for backend dir — karalarmehmet ([`524275c`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/524275c4af452a9c1575fff6aca7a38d92513bec))
- **content:** Use section UPSERT and move psycopg2 to dev — karalarmehmet ([`12cb0ec`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/12cb0ec843b353691f2909805353630141da5df1))
- **deps:** Regenerate poetry.lock after psycopg2 group move — karalarmehmet ([`027853f`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/027853f969a9e37df596667059b55a6c8a3863d7))
- **content:** Skip template dirs and update course_id in section UPSERT — karalarmehmet ([`38d5f21`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/38d5f21e8b17e5e484008ffe5442125ceaac2a98))


### 💅 Stil
- **backend:** Format delete account tests (#BE-11) — Shamsia ([`0457cf5`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/0457cf5cf8ec38c839aa1d0c341e1f76e8890c05))


### 📚 Dokümantasyon
- **content:** Add content team setup guide and mdx rules (#CNT-01) — lerkush ([`5a26ec3`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/5a26ec33c96fb6db5a5069129ad2e357a60a885f))
- **frontend:** Add TODOs and remove comment-outed code (#FE-09) — Alper Akcan ([`05e8e64`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/05e8e64ad5ad5667443e58be13d55cad26a131a9))
- Add Betterleaks CI article — Shamsia ([`d744f5b`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d744f5b5fb18f97731dd651f2da9dfeb86645372))
- **readme:** Update README for v1.1.0 — fix paths, versions, project structure — lerkush ([`99f9f46`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/99f9f46d737df504cae134f133e70ebc38e82ef1))


### 🔁 CI/CD
- Add skip jobs for path-filtered status checks — karalarmehmet ([`2f15f69`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/2f15f695119fe87fb66a3b1fb35daaa410f6291a))


### 🔧 Refactoring
- **frontend:** Remove duplicate function (#FE-05-06-07) — Alper ([`6edd331`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/6edd33154ddc43b61de00b48b7d5bd60b1e72350))
- Migrate OAuth account schemas to users module and update service to use UUID types — maliuyanik ([`1181373`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1181373a8628d63f06cb852478e8f429a0853855))
- **auth:** Improve oauth helper based on review feedback (#BE-06) — belmaaz ([`39b939a`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/39b939ab73e08590f2ed4168b792ddc5f1ce33f6))
- **auth:** Improve oauth helper based on review feedback (#BE-06) — belmaaz ([`e241b5e`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e241b5e125bfecb3ec90f247bd62fcdb7eeea6f9))
- **frontend:** Update Course type (#FE-08) — Alper ([`15019d6`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/15019d63c64abe373cf7d69db6a88b549c63a415))
- **frontend:** Remove unused files (#FE-08) — Alper ([`8028cfc`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8028cfc79bf1f539741037f9445485d3fc87dc10))
- **frontend:** Update courses page return value (#FE-08) — Alper ([`e617f59`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e617f59598767a43d4b199b0eee0652a8bd79571))
- **frontend:** Update type fields and mock data (#FE-08) — Alper Akcan ([`d8f695d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d8f695da031ca3392a50350f2d4adfb48b7def2b))
- **frontend:** Give clickHandler for course-enrollement button (#FE-09) — Alper Akcan ([`5d02726`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/5d027266e044c2b1a340d67a26b804609e832870))
- **frontend:** Replace clickable div with a Link component (#FE-09) — Alper Akcan ([`4e5ef80`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/4e5ef80b4adfaca1c8ea1289a8c65996ac1bfecc))
- **BE-13:** Move seed script to project root and add --env parameter — karalarmehmet ([`88e2465`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/88e2465cfaca3c0c03538918816c0b85fd928e9b))
- Update ensureAuth — süleyman mercan ([`78bd4b9`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/78bd4b923d648140ae6948de10368d3d32d570a0))


### 🚀 Yeni Özellikler
- **backend:** Add hard delete account endpoint with audit log (#BE-11) — Shamsia ([`70ff7f8`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/70ff7f8302018d338d9609e1d28292aa45970ae7))
- Add user profile request/response schemas (#20) — Alper ([`a7d534e`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a7d534ea0741b8dc0e777de0ec8385195e6f7c64))
- Create a new router for users operations (#20) — Alper ([`c93a265`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/c93a26597fd8da17a3a9362d71d4f8f093fa3710))
- Import the new user router in main.py (#20) — Alper ([`9d76d60`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/9d76d6075198d4279be748489cfa4bf11eb6b01f))
- Move get_current_user into shared dependencies — Alper ([`8dfdcde`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8dfdcde8f6a610f4f2e5be89f17241697998c4e3))
- Add a comment for updated_at model control — Alper ([`ee792ac`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/ee792aca0b32b942af68c2cf45a11f8abf24229b))
- Add rate limiting category comment for users patch request — Alper ([`5b88c0a`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/5b88c0aa022b24fcf9bd202865a29fb904836632))
- Realigns the profile-sidebar-button — Alper ([`7b54426`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/7b54426049731dc727b834cbfd2bb9f1d8374171))
- Add profile link at user-menu dropdown — Alper ([`b48680d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b48680dd515157409708f290d7a1c59cd85051c3))
- Update profile-page — Alper ([`8d13402`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8d134020d2b0d2cf19d2af1b1f79fc8b740deaa7))
- **frontend:** Add sekeleton component for dashboardshell (#FE-05-06-07) — Alper ([`1b61be9`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1b61be90c0ca61ed273c85c34a6e9907020c587c))
- **frontend:** Add error state component for dashboard (#FE-05-06-07) — Alper ([`eec3b08`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/eec3b08f2d9dbc5a3c5610401826a56d41f2b69e))
- **frontend:** Import getInitials fxn on initials-avatar component (#FE-05-06-07) — Alper ([`c8c5b6b`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/c8c5b6b617f6abd0ed072dffb66bc250d58b0deb))
- **auth:** Add LinkedIn OAuth login and callback endpoints — karalarmehmet ([`cb98c6d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/cb98c6d6ef7e0bd92d910c008a69e338b56b3667))
- Add user profile request/response schemas (#20) — Alper ([`53a9a80`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/53a9a8088edda1fb85def6ede7324cc095742766))
- Create a new router for users operations (#20) — Alper ([`703b05b`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/703b05b66d35b774759ab74c3d9e1d5136763560))
- Import the new user router in main.py (#20) — Alper ([`b381c90`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b381c9067f69e5f7f590e73be823b803b9ac7d7d))
- Move get_current_user into shared dependencies — Alper ([`4f70d48`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/4f70d48aeacb8fc4681f5ab6e2994c9d0e3bff62))
- Add a comment for updated_at model control — Alper ([`d08ee41`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d08ee411418a1ea17ee734ecbbfcd2ce4948386f))
- Add rate limiting category comment for users patch request — Alper ([`f2eed32`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/f2eed32efa831e4a13735980eab2a55a8194d719))
- **auth:** [BE-12] implement OAuth account unlinking — maliuyanik ([`31198ca`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/31198ca0f9bd034c18d7797a3da7493982ca2888))
- **auth:** Implement GitHub OAuth login flow (#BE-06) — belmaaz ([`962eefd`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/962eefd682e2f968bbbb710518aed249d43f69ea))
- **frontend:** Create fake courses data (#FE-08) — Alper ([`7a44ce7`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/7a44ce77abd8611a34727b7d7bce0bcac652727f))
- **frontend:** Implement courses-filter logic (#FE-08) — Alper ([`d0c992a`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d0c992a91c8dc76974795b953440dc1a706f1936))
- **frontend:** Course-item page (#FE-09) — Alper ([`8bc4dbc`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8bc4dbc12ffaed494f902ca154cd0c57d76c796a))
- **frontend:** Update course-detail page (#FE-09) — Alper ([`a8d97f7`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a8d97f725d0bda8d4b51c56ec5d1c12dbba9f78d))
- **frontend:** Fe-08 ve fe-09 birlikte kurs listesi ve detay sayfası — süleyman mercan ([`3ab25d5`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/3ab25d51af221475c98f3791cb20cbb705a73188))
- **frontend:** Fe-08 ve fe-09 kurs listesi ve detay sayfası — süleyman mercan ([`e1c7d89`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e1c7d896024e131b5bdb254e92bbdbeb838bd421))
- **frontend:** Fe-08 ve fe-09 kurs listesi ve detay sayfası — süleyman mercan ([`80e6f02`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/80e6f0257a20310a18dd26df62e67e6b9b5d975d))
- **db:** Add display_order and fix missing updated_at columns (#BE-14, #BE-13) — belmaaz ([`e4486bf`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e4486bf38645330ae2c3269973a6acb791014f6e))
- **content:** Add validate_content.py, seed_quiz.py and CI content validation — maliuyanik ([`c6c1c06`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/c6c1c0661e7389fce2ed35c5e1dac69081ffa5d7))
- **frontend:** Enable LinkedIn OAuth button — Belma ([`4c0c2a8`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/4c0c2a8e215609a3839c6c8c87558e95640700de))
- **content:** Add kubernetes-temelleri 10 sections + quiz 20 questions (#CNT-05) #44 — lerkush ([`e375dd1`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e375dd1ac5c8015b3642d0644d091e0821b2bf13))
- **db:** Add display_order column to courses table — karalarmehmet ([`80b7c5b`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/80b7c5b1064c858f5e6254a1b8d30344fddd483a))
- **content:** Add sample meta.json and MDX section files — karalarmehmet ([`76be5cb`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/76be5cbbfe154dc0184e4efe5f37185c7eb411af))
- **BE-13:** Add seed_content.py with UPSERT and dry-run support — karalarmehmet ([`d101e33`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d101e33dd6e422cf143ca81dfc9268ff0e36e49b))
- **content:** Add terraform-ile-iac course 8 sections + quiz (#CNT-07) #183 — lerkush ([`0d65b21`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/0d65b21d5633f0be7b93321b4342d596bd4386b1))
- **content:** Add cicd-kavramlarina-giris sections 1-8 and quiz 15 questions (#CNT-06) — Enes Eren Seven ([`62db6ca`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/62db6caba1b74e04f182d6f12d7b995ebb32a528))


## [1.0.0] — 2026-04-03

### 🐛 Hata Düzeltmeleri
- **ci:** Remove branch push from changelog workflow, use GitHub Release (#INF-08) — lerkush ([`dda6609`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/dda6609a8d0a74678663fcecaec71da64db44a3a))
- **ci:** Add tag flag to latest release notes (#INF-08) — lerkush ([`cf5b6cb`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/cf5b6cb80c29005b85d7c8f61d9868902a78bc04))


## [0.2.0] — 2026-04-03

### ⚙️ Genel
- Add gitignore and pin python version to 3.13.11 (BE-03) — lerkush ([`87b38e2`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/87b38e274ca11eeaf631d92ff3a43ed7a4244df0))
- Add poetry dependencies for backend (BE-03) — lerkush ([`5bc03c3`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/5bc03c39ea076290136c8c2a832dd156fcd33c19))
- Add gitignore and pin python version to 3.13.11 (BE-03) — lerkush ([`131e225`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/131e225a6ba1cb5002c360444d55ceebdbce500c))
- Add poetry dependencies for backend (BE-03) — lerkush ([`de6a495`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/de6a495104a8f55b50fee6959660a47d6b27288f))
- Remove leftover database files from PR #60 — lerkush ([`c880fba`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/c880fba0f52b8e7cd0d3694f10a39357666a51ee))
- Pin node 22 and npm engine versions (FE-01) — lerkush ([`451ef2f`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/451ef2fbdd51155909246b522f72cc7e574439fd))
- Remove IDE files — belmaaz ([`fe29ee9`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/fe29ee9d38166dfbfd2fd024c2c746a61d67ccf6))
- Remove .vscode/settings.json from tracking (#99) — lerkush ([`e717c38`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e717c384dcd0a5639a8e5600f8fcb8e18105b920))
- Remove backup file from repo — Shamsia ([`b783533`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b78353371cdf5836460fd438494607ed8a1a402f))
- Remove sensitive env files from repo and update gitignore — Shamsia ([`32d9d94`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/32d9d941d38c444c6c6e817bb329138128e37d5b))
- Update .gitignore files — demir/gulsen ([`5178c3f`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/5178c3f61440153187e82fb26fc1dc4f3e7f1f39))
- Add pre-commit hooks — karalarmehmet ([`a3e8fb1`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a3e8fb1c2cde0178698814484b333f5a8e6eadc7))
- **infra:** Add git-cliff versioning and changelog automation (#INF-08) — lerkush ([`d7ee88e`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d7ee88eaa3adf1773cf30c572ff7a90982ce2f52))
- Add commitlint to precommit — karalarmehmet ([`da6fc73`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/da6fc73add01b62c1750d6fcba9a6bf173acd21c))
- Add commitlint config — karalarmehmet ([`92258b3`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/92258b3e077b786c79f56b0a7a62a38e72fb247d))
- **config:** Update cliff.toml author name and add changelog job to CD (#INF-08) — lerkush ([`6f85fe1`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/6f85fe1c10e5f7920656e417bb3d60a2ca152109))
- **changelog:** Update for v0.2.0 (#INF-08) — lerkush ([`e98bdd1`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e98bdd1d1fb8dc98f3380a4f16c53707e9f70658))


### ✅ Testler
- Add JWT service unit tests (BE-07) — karalarmehmet ([`8a34d74`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8a34d74c8dceeb9b1a474861a71ff35a7706ada5))
- Update /refresh tests to send token via cookie — Alper ([`d583824`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d5838248bd42042c698fac02cb6b844031fe30a2))
- Update /logout tests to cookie-based flow, remove auth header assertions — Alper ([`b91e523`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b91e5234681aa196a2de923bb0d5251c778cc043))


### 🐛 Hata Düzeltmeleri
- Restore features and resolve conflicts by keeping current changes — lerkush ([`0c116d3`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/0c116d399847a008f95632f11fc2da1cdd08f8d9))
- **db:** Resolve conflicts and finalize MVP v1.2 schema — maliuyanik ([`7a56f66`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/7a56f66696a2c9c5e93e7a62bab239cb51957d3d))
- Resolve merge conflicts and revert unrelated files to match develop — maliuyanik ([`ae56802`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/ae56802ac4cd8c480e99ee0eedfb8db87b2e4037))
- **db:** Resolve merge conflicts in courses.py — maliuyanik ([`21d3178`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/21d3178b77966d28a574457e15e9721e4001dbf5))
- **poetry:** Resolve merge conflicts and regenerate lock file — maliuyanik ([`6410b36`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/6410b36df8a02bc362143268c25b7edf7cea8837))
- Add infrastructure/ dir, move docker-compose, add override template (#99) — lerkush ([`91618f1`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/91618f1f3bd86aecd49906b1f9aeaa1e3616173c))
- Address BE-04 review blockers (CORS, token-type validation, atomic OAuth callback, frontend redirect) — Shamsia ([`fadb6cf`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/fadb6cf8b7d3b14869189f4045e9b4185ad9f2f5))
- Finalize BE-04 review follow-ups (user refresh + cookie comments) — Shamsia ([`dd6db09`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/dd6db09a4b5c98ea39c6e81b0b47122c595f3a59))
- **backend:** Resolve linting and line-length issues in alembic migrations — maliuyanik ([`8268dc3`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8268dc37a2dd2623f69df6906efe5aa4e34a55b3))
- Align Dockerfile port with docker-compose (BE-07) — karalarmehmet ([`564ba4c`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/564ba4c5bde6adf4abf56446fbd53614e2e170ad))
- Guard missing sub claim and validate token type in auth router (BE-07) — karalarmehmet ([`0c7a010`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/0c7a01012f32bd4863d38e88b1fa1eef60ebed62))
- Consolidate JWT to single module, fix settings case, hide internal errors (BE-07) — karalarmehmet ([`317e352`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/317e352d94a6e11525966574165760d3205a275e))
- Redact sensitive logs, validate Google response, add auth endpoint tests (BE-07) — karalarmehmet ([`d1c7184`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d1c7184aaef026e4044a6cbf02c765a4f352da1e))
- Separate session secret, add startup validation, fix 200 error response (BE-07) — karalarmehmet ([`781f3aa`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/781f3aa431ad96aa702c7f63b389642551394155))
- Move blacklist_token after sub validation in /refresh — karalarmehmet ([`77804d8`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/77804d8275e28f7d0548ce658b6fcd2fc1039aa8))
- Add healthchecks, named volumes, and dev mount consistency to docker-compose — karalarmehmet ([`7c27bbf`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/7c27bbf296f6527804dd5dfe6f8dbcb0c08e6e70))
- Use node healthcheck for frontend and correct pg_isready fallback user — karalarmehmet ([`7da181d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/7da181d61f2e182ffb89b067fea7c1af7191fa14))
- Wrap useSearchParams in Suspense boundary on callback page — karalarmehmet ([`b701764`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b7017640a3c43bc60ad9fd6243b007dca820b956))
- Wrap useSearchParams in Suspense boundary on callback page — Mehmet Karalar ([`23965a5`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/23965a53f751d7721ffc83020aa874ce23e8ac65))
- Update component location (#17) — Alper ([`626f9cc`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/626f9cc2241e5a0973a80c859648563262495cb1))
- Remove hardcoded css on custom button (#17) — Alper ([`ccde0cb`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/ccde0cb1396abc18568fa36ca74d8da9ebbbc0ec))
- Remove empty p element (#17) — Alper ([`75e7da9`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/75e7da925210fb049495a27ee80207c76e6e0ca6))
- Remove unused use client directive (#17) — Alper ([`e92a055`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e92a055777049dc2137c6d0bd24f6638f1894b7b))
- **middleware:** Add X-RateLimit headers to all responses — belmaaz ([`dc535aa`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/dc535aae0e98a81e2aa4e7c02ae3e76786808dd0))
- **auth:** Reduce SQLAlchemy max_overflow to 15 (max connections 20) — Shamsia ([`cfd23dc`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/cfd23dcbfd78549d580a5e8f200f98536bbde795))
- **auth:** Add TOKEN_ENCRYPTION_KEY to required startup validation — karalarmehmet ([`598171d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/598171d18150781f04248075b82d932cc6066cfb))
- Read refresh token from cookie and set new cookies on refresh/logout — Alper ([`442b7c8`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/442b7c85149a78dcbd3357dd8b65a9f9fdf11f6b))
- Solve ruff check result — Alper ([`58542f7`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/58542f7d7801efcdd11cefd9de995b3ca3b47edf))
- Health check status message fixed — fatih ([`2dead13`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/2dead1373cb061504693004103c94b63ab0cc4c2))
- **db:** Add manual delete user sql script (#151) — maliuyanik ([`18ff909`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/18ff9096f96134813c447538562a9ae73b343221))
- **backend:** Add local auto-migration lifespan event (#150) — maliuyanik ([`b880e16`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b880e169631b25812959ffa050ce81e7ecd2c6bd))
- **backend:** Update main.py for local auto-migration and health check (#150) — maliuyanik ([`a837743`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a837743c704f862d32c2e93fa3f932ef21cc6c82))
- **config:** Improve node_modules check in pre-commit hooks — karalarmehmet ([`5fcbc35`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/5fcbc354a1326c7e188c3f51a47d0da064e98b13))
- **db:** Resolve asyncio.run conflict in alembic env (#BUG-06) — karalarmehmet ([`082d083`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/082d083f7527ab30e4a3582c97a39e10a0f5b5ff))
- **ci:** Remove always() from changelog job condition (#INF-08) — lerkush ([`a006141`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a0061416a9cac446e4a70a94126770f07b0d7eac))


### 💅 Stil
- **middleware:** Fix ruff formatting — belmaaz ([`562d7d4`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/562d7d46c3b4fb99e9a8485dbf2a85aa02a322ae))


### 🔁 CI/CD
- Add betterleaks secrets scan — Shamsia ([`231b554`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/231b55413244495c2550c974988529d1fe7da7ad))
- Add betterleaks secrets scan — Shamsia ([`51bd03d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/51bd03d343d44b34f4fb168962039d8b6bba4657))
- Add betterleaks secrets scan — Shamsia ([`48a39ca`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/48a39ca406a7799d9c54664490ec0c9a4533689d))
- Fix BetterLeaks workflow entrypoint issue — Shamsia ([`334aeef`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/334aeef9628ee48a0728ae789a5e97a5ec50a7c8))


### 🔧 Refactoring
- OAuth callback yeni sablona gore duzenlendi — Muhammed Çağrı Kurt ([`8b0f55c`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8b0f55c6c00c27a341f18061975769f9fca69b39))
- Replace oauth button with the new custom buttons (#17) — Alper ([`bcf98c3`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/bcf98c322333ebe9278dfc1d70e52702ee09824c))
- Refactor api logic with new api related files (#19) — Alper ([`1301240`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/130124023a72c24ecd96818d03fb71553f54d32f))
- Refactor logout logic with custom useAuth hook (#19) — Alper ([`1a43044`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1a43044ad165e709af002908fabf38ebf19c2e98))
- Redirect based on session (#19) — Alper ([`1605591`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1605591d326a93b05f79e719326c4a88ccef44c0))
- Get redirects from predefined routes file (#19) — Alper ([`d1f68f9`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/d1f68f989f934b9f42e203263a79610fde5098fd))
- Format check (#19) — Alper ([`f65a151`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/f65a1518bdafa55040085819308340b15c0dcfe6))
- Move auth-provider under providers folder (#19) — Alper ([`7d3b22e`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/7d3b22e4937496d1885ad3c0964cc247129141f7))
- **backend:** Extract frontend_url variable to reduce duplication (#BUG-13) — Alper ([`f38a20c`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/f38a20c54f8521296a69249c617ac16db6d35288))
- **backend:** Update google-callback endpoint logic  (#BUG-13) — Alper ([`07723f6`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/07723f6c7614b6832f23762c05fc766e5a513c96))
- **frontend:** Define error messages to display caused by oauth fails (#BUG-13) — Alper ([`66ee399`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/66ee39926eef97d3d11a189165d857ed091062c8))
- **frontend:** Delete callback component (#BUG-13) — Alper ([`6c83676`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/6c83676103ac670795eeb4d2b26dd007991dd22a))


### 🚀 Yeni Özellikler
- Add FastAPI app with config, database engine and health endpoint (BE-03) — lerkush ([`278835d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/278835d6876fda217ce09e08e5170bf7a203482f))
- Add backend Dockerfile and dockerignore (BE-03) — lerkush ([`b33adb9`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/b33adb9c2b65b5b23f55575dbcc8882a7827eeb7))
- Add FastAPI app with config, database engine and health endpoint (BE-03) — lerkush ([`75c8464`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/75c84646105e4ec2e19ba097ce3e67112464d2b2))
- Add backend Dockerfile and dockerignore (BE-03) — lerkush ([`ab45a6f`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/ab45a6f3baea94c627fa3d9d9f43fbff7d7a4574))
- **database:** Initialize PostgreSQL schema with Alembic migrations — maliuyanik ([`37d6657`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/37d66577dd6875d0f26067181e629a3f81390059))
- Add v1 prefix to backend routes for proxy compatibility (FE-01) — lerkush ([`1b5fe61`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1b5fe6133912a6a6e1d79615eedec6eef3dd0fc9))
- Initialize Next.js 16 with TypeScript Tailwind and backend proxy (FE-01) — lerkush ([`03abfb9`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/03abfb97e2a1fffc852afef839b5122a06cc168c))
- Add App Router layout and home page (FE-01) — lerkush ([`9f1d25d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/9f1d25d36610873fbe7aaa5e62959186b2d3f395))
- Add frontend Dockerfile (FE-01) — lerkush ([`4ffe456`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/4ffe4568a5f312e7005a06753c6706e2a5d8465c))
- **auth:** Add OAuth account merge flow with conflict detection — belmaaz ([`8addf15`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/8addf1513751fb8a4d8cbb521557a891a0425a4f))
- **auth:** Add oauth merge flow to main.py (based on develop branch) — belmaaz ([`a2da210`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/a2da210d79255077a8c16fc071441ee78f4ac977))
- **db:** Finalize MVP v1.2 schema with hard-delete and audit log compliance — maliuyanik ([`3bdf94d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/3bdf94d41faa2b34530e22e0dd7965ced3c87789))
- Implement Google OAuth service with login and callback endpoints (#BE-04) — Shamsia ([`384afb0`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/384afb0d001ba3a43d7967e1dd989701bbbec1ae))
- **auth:** Implement Google OAuth login and callback endpoints — Shamsia ([`0b36a3d`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/0b36a3d6d4dd411cc7fc65e1602fc38b90772401))
- Finalize Google OAuth flow and sync MVP v1.2 DB schema (BE-04) — Shamsia ([`754e14b`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/754e14b1a1685129122d65855d2ae0f00258a643))
- Add JWT token expiration settings to config (BE-07) — karalarmehmet ([`be628ac`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/be628acf0c096d043dcf52f079da2f1e301a52bb))
- Add auth schemas for token request/response (BE-07) — karalarmehmet ([`1f19b13`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1f19b1357cb0bb7dd173735ff263e85a5275f7f3))
- Add JWT service with create, decode and blacklist (BE-07) — karalarmehmet ([`69001e7`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/69001e7e7a36445408cf352a66f6daad86afae5c))
- Add auth dependency for token validation (BE-07) — karalarmehmet ([`cc049d9`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/cc049d9b1b28004094931c23028379627eb6ad84))
- Add auth router with refresh and logout endpoints (BE-07) — karalarmehmet ([`3c72511`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/3c72511e75995e1a37fac64f5488873ef8104c75))
- Add JWT service with access/refresh tokens and blacklist (BE-07) — Mehmet Karalar ([`e107943`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/e107943a90d49d141e389320c5dea3d648662457))
- **auth:** Implement OAuth account merge flow (BE-08) — belmaaz ([`1e58b85`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/1e58b850f819845dbf32bccbee3a57475f88928c))
- BE-08 account merge flow with OAuth conflict detection — belmaaz ([`9ab5b26`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/9ab5b26613aa9fb91487134886faa10ba4f8dd7d))
- [BE-09] Updat  rate limiting middleware — demir/gulsen ([`58f6ba3`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/58f6ba334927a5a480fa2c94e0863d119011d8fc))
- Create custom oauth buttons and button container (#17) — Alper ([`734fb17`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/734fb17b648014f80fb4ab7efc9966213b4e633a))
- Create auth-provider and wrap the layout with it (#19) — Alper ([`6d8b2ae`](https://github.com/Bilgisayar-Kavramlari-Toplulugu/project-learnops/commit/6d8b2ae80828739d903a8a58f7f2e96b9f4b95d6))


---
