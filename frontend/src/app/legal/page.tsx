import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Kullanım Koşulları ve Gizlilik | LearnOps",
  description: "LearnOps kullanım koşulları, gizlilik ve KVKK aydınlatma metni.",
};

const updatedAt = "13 Mayıs 2026";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="size-4" />
          Giriş sayfasına dön
        </Link>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-8 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-blue-700 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300">
                <ShieldCheck className="size-3.5" />
                Legal
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Kullanım Koşulları ve Gizlilik
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Bu sayfa LearnOps platformunu kullanırken geçerli olan temel kullanım
                koşullarını, gizlilik esaslarını ve KVKK kapsamında bilgilendirmeyi içerir.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
                Son güncelleme
              </p>
              <p className="mt-1 font-medium">{updatedAt}</p>
            </div>
          </div>

          <nav className="mb-8 grid gap-3 sm:grid-cols-2">
            <a
              href="#terms"
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
            >
              Kullanım Koşulları
            </a>
            <a
              href="#privacy"
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
            >
              Gizlilik ve KVKK Aydınlatma Metni
            </a>
          </nav>

          <div className="space-y-12">
            <section id="terms" className="scroll-mt-8 space-y-5">
              <h2 className="text-2xl font-semibold tracking-tight">Kullanım Koşulları</h2>

              <LegalBlock title="1. Platformun amacı">
                LearnOps; DevOps, yazılım geliştirme ve ilgili teknik konularda eğitim
                içerikleri, kurs ilerleme takibi ve quiz özellikleri sunan bir öğrenme
                platformudur.
              </LegalBlock>

              <LegalBlock title="2. Hesap oluşturma ve giriş">
                Platforma Google, GitHub, LinkedIn veya desteklenen diğer giriş yöntemleriyle
                erişebilirsin. Giriş yaptığında, hesabınla ilişkilendirilen temel profil
                bilgileri platformun çalışması için işlenebilir.
              </LegalBlock>

              <LegalBlock title="3. Kullanıcı sorumlulukları">
                Platformu hukuka aykırı, zararlı, yanıltıcı veya başkalarının haklarını ihlal
                edecek şekilde kullanmamalısın. Hesabının güvenliğinden ve giriş bilgilerinin
                korunmasından sen sorumlusun.
              </LegalBlock>

              <LegalBlock title="4. Eğitim içerikleri">
                Platformdaki içerikler öğrenme amacıyla sunulur. İçeriklerin tamamen hatasız,
                eksiksiz veya belirli bir mesleki sonucu garanti ettiği taahhüt edilmez.
              </LegalBlock>

              <LegalBlock title="5. Hizmette değişiklik">
                LearnOps; içerikleri, özellikleri, quizleri, kurs yapılarını veya platform
                arayüzünü zaman içinde değiştirebilir, geliştirebilir veya kaldırabilir.
              </LegalBlock>

              <LegalBlock title="6. Hesabın kapatılması">
                Platformu kullanmayı bırakabilir veya hesabının silinmesini talep edebilirsin.
                Hesap silme işlemi sonrasında bazı kayıtlar hukuki, güvenlik veya teknik
                zorunluluklar nedeniyle sınırlı süreyle saklanabilir.
              </LegalBlock>
            </section>

            <section id="privacy" className="scroll-mt-8 space-y-5 border-t border-slate-200 pt-10 dark:border-slate-800">
              <h2 className="text-2xl font-semibold tracking-tight">
                Gizlilik ve KVKK Aydınlatma Metni
              </h2>

              <LegalBlock title="1. İşlenen kişisel veriler">
                Platformu kullandığında ad-soyad veya görünen ad, e-posta adresi, giriş
                sağlayıcısı bilgisi, kullanıcı ID bilgileri, kurs ilerleme bilgileri, quiz
                sonuçları, tamamlanan kurslar, işlem zamanı ve teknik günlük kayıtları
                işlenebilir.
              </LegalBlock>

              <LegalBlock title="2. Verilerin işlenme amaçları">
                Kişisel veriler; hesap oluşturma, kullanıcı girişi sağlama, kurs ilerlemesini
                takip etme, quiz sonuçlarını gösterme, platform güvenliğini sağlama, hata
                ayıklama, hizmet kalitesini artırma ve kullanıcı destek taleplerini yönetme
                amaçlarıyla işlenir.
              </LegalBlock>

              <LegalBlock title="3. Hukuki sebep">
                Veriler; hizmetin sunulması için gerekli olması, sözleşmenin kurulması veya
                ifası, veri sorumlusunun meşru menfaati ve ilgili mevzuatta öngörülen
                yükümlülüklerin yerine getirilmesi hukuki sebeplerine dayanılarak işlenebilir.
              </LegalBlock>

              <LegalBlock title="4. Üçüncü taraf giriş sağlayıcıları">
                Google, GitHub veya LinkedIn ile giriş yaptığında, ilgili sağlayıcının
                platforma ilettiği temel hesap bilgileri kullanılabilir. Bu sağlayıcıların
                kendi gizlilik politikaları ayrıca geçerlidir.
              </LegalBlock>

              <LegalBlock title="5. Verilerin aktarılması">
                Kişisel veriler; barındırma, kimlik doğrulama, veritabanı, güvenlik ve teknik
                altyapı hizmetleri kapsamında hizmet sağlayıcılarla sınırlı olarak
                paylaşılabilir. Bunun dışında veriler, yasal zorunluluklar hariç üçüncü
                kişilerle amaç dışı paylaşılmaz.
              </LegalBlock>

              <LegalBlock title="6. Saklama süresi">
                Veriler, hesabın aktif olduğu süre boyunca ve hizmetin gerektirdiği makul süre
                kadar saklanır. Hesap silme talebi sonrasında, teknik ve hukuki zorunluluklar
                dışında kişisel veriler silinir, anonimleştirilir veya erişime kapatılır.
              </LegalBlock>

              <LegalBlock title="7. Çerezler ve oturum bilgileri">
                Platform; oturum yönetimi, güvenli giriş ve temel kullanıcı deneyimi için
                zorunlu çerezler veya benzer teknolojiler kullanabilir. Analitik veya pazarlama
                amaçlı çerezler kullanılması halinde ayrıca bilgilendirme ve gerekli ise onay
                mekanizması sunulur.
              </LegalBlock>

              <LegalBlock title="8. KVKK kapsamındaki hakların">
                KVKK kapsamında kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse
                bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, eksik veya
                yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini talep
                etme ve kanunda yer alan diğer haklarını kullanma hakkına sahipsin.
              </LegalBlock>

              <LegalBlock title="9. İletişim">
                Kişisel verilerinle ilgili taleplerin için platform yöneticisiyle iletişime
                geçebilirsin. Bu bölümde proje yayına alınmadan önce geçerli iletişim e-posta
                adresi belirtilmelidir.
              </LegalBlock>
            </section>
          </div>

          <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            Bu metin genel bir taslaktır. LearnOps ticari olarak yayına alınacaksa veri
            sorumlusu bilgileri, iletişim adresi, altyapı sağlayıcıları ve gerçek veri işleme
            süreçlerine göre gözden geçirilmelidir.
          </div>
        </section>
      </div>
    </main>
  );
}

function LegalBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</p>
    </div>
  );
}