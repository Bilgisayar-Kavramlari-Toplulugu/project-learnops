import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Kullanım Koşulları ve Gizlilik | LearnOps",
  description:
    "LearnOps kullanım koşulları, gizlilik politikası ve KVKK aydınlatma metni.",
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
                LearnOps
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Kullanım Koşulları ve Gizlilik
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Bu sayfa LearnOps platformunu kullanırken geçerli olan kullanım
                koşullarını, gizlilik esaslarını ve KVKK kapsamında bilgilendirme
                metnini içerir.
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
              Gizlilik ve KVKK
            </a>
          </nav>

          <div className="space-y-12">
            <section id="terms" className="scroll-mt-8 space-y-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Kullanım Koşulları
              </h2>

              <LegalBlock title="1. Platformun amacı">
                LearnOps; DevOps, backend geliştirme, container teknolojileri,
                CI/CD, Linux ve benzeri teknik konularda eğitim içerikleri,
                quizler ve öğrenme takibi sunan bir öğrenme platformudur.
              </LegalBlock>

              <LegalBlock title="2. Hesap oluşturma ve giriş">
                Platforma Google, GitHub veya LinkedIn gibi üçüncü taraf giriş
                sağlayıcılarıyla erişebilirsin. Giriş yaptığında hesabınla ilişkili
                temel profil bilgileri sistem tarafından işlenebilir.
              </LegalBlock>

              <LegalBlock title="3. Kullanıcı sorumlulukları">
                Platformu hukuka aykırı, kötüye kullanım oluşturacak, yanıltıcı
                veya başkalarının haklarını ihlal edecek şekilde kullanmamalısın.
                Hesabının güvenliğinden kullanıcı sorumludur.
              </LegalBlock>

              <LegalBlock title="4. Eğitim içerikleri">
                Platformdaki eğitim içerikleri öğrenme amacıyla sunulur.
                İçeriklerin belirli bir kariyer sonucu, sertifika veya mesleki
                başarı garantisi verdiği taahhüt edilmez.
              </LegalBlock>

              <LegalBlock title="5. Hizmet değişiklikleri">
                LearnOps; platform özelliklerini, kurs içeriklerini, quizleri,
                arayüzü veya erişim yapısını önceden bildirmeksizin güncelleyebilir,
                değiştirebilir veya kaldırabilir.
              </LegalBlock>

              <LegalBlock title="6. Hesap sonlandırma">
                Kullanıcı hesabını kapatma veya sildirme talebinde bulunabilir.
                Teknik, hukuki veya güvenlik gereklilikleri kapsamında bazı kayıtlar
                sınırlı süreyle saklanabilir.
              </LegalBlock>
            </section>

            <section
              id="privacy"
              className="scroll-mt-8 space-y-5 border-t border-slate-200 pt-10 dark:border-slate-800"
            >
              <h2 className="text-2xl font-semibold tracking-tight">
                Gizlilik ve KVKK Aydınlatma Metni
              </h2>

              <LegalBlock title="1. İşlenen veriler">
                Platformu kullandığında görünen ad, e-posta adresi, giriş
                sağlayıcısı bilgisi, kullanıcı kimlik bilgileri, kurs ilerleme
                verileri, quiz sonuçları, tamamlanan kurslar, oturum kayıtları,
                IP adresi ve temel teknik log kayıtları işlenebilir.
              </LegalBlock>

              <LegalBlock title="2. Verilerin işlenme amaçları">
                Kişisel veriler; kullanıcı hesabı oluşturma, güvenli giriş
                sağlama, kurs ilerlemesini takip etme, quiz sonuçlarını gösterme,
                sistem güvenliğini sağlama, hata ayıklama ve platform deneyimini
                geliştirme amaçlarıyla işlenir.
              </LegalBlock>

              <LegalBlock title="3. Hukuki sebep">
                Veriler; hizmetin sunulabilmesi, sözleşmenin kurulması veya ifası,
                veri sorumlusunun meşru menfaati ve ilgili mevzuat kapsamındaki
                yükümlülüklerin yerine getirilmesi hukuki sebeplerine dayanılarak
                işlenebilir.
              </LegalBlock>

              <LegalBlock title="4. Üçüncü taraf giriş servisleri">
                Google, GitHub veya LinkedIn ile giriş yapılması halinde ilgili
                sağlayıcıların ilettiği temel kullanıcı bilgileri kullanılabilir.
                Bu servislerin kendi gizlilik politikaları ayrıca geçerlidir.
              </LegalBlock>

              <LegalBlock title="5. Verilerin paylaşılması">
                Kişisel veriler; yalnızca barındırma, kimlik doğrulama,
                veritabanı, güvenlik ve teknik altyapı hizmetlerinin sağlanması
                amacıyla hizmet alınan üçüncü taraf servis sağlayıcılarla sınırlı
                olarak paylaşılabilir.
              </LegalBlock>

              <LegalBlock title="6. Saklama süresi">
                Veriler hesabın aktif olduğu süre boyunca ve hizmetin güvenli,
                sürdürülebilir şekilde çalışması için gerekli makul süre boyunca
                saklanabilir. Hesap silme taleplerinde veriler uygun ölçüde silinir,
                anonimleştirilir veya erişime kapatılır.
              </LegalBlock>

              <LegalBlock title="7. Çerezler ve oturum yönetimi">
                Platform; kullanıcı oturumlarının yönetimi, güvenli giriş ve temel
                kullanıcı deneyimi için gerekli çerezleri veya benzer teknolojileri
                kullanabilir.
              </LegalBlock>

              <LegalBlock title="8. KVKK kapsamındaki haklar">
                KVKK kapsamında kişisel verilerinin işlenip işlenmediğini öğrenme,
                işlenmişse bilgi talep etme, düzeltilmesini isteme, silinmesini
                talep etme ve ilgili mevzuatta yer alan diğer haklarını kullanma
                hakkına sahipsin.
              </LegalBlock>

              
            </section>
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
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
        {children}
      </p>
    </div>
  );
}