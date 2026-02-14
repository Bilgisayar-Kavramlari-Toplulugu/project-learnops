# Geliştirme Akışı (Örnek)
<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>
<br>

Bu belge, Projedeki geliştirme süreçleri, standartları ve iş akışları için bir rehberdir.

## İş Akışı

1.  **Issues:** Tüm işler (yeni özellikler, hatalar, görevler) GitHub Issues üzerinden takip edilmelidir. Her iş için bir issue oluşturulmalıdır.
2.  **Branches:** Her issue için `main` branch'inden yeni bir özellik (feature) branch'i oluşturulmalıdır. Branch isimlendirme kuralı: `feature/issue-no-kisa-aciklama` (Örn: `feature/123-add-user-login`).
3.  **Pull Requests (PRs):** Tüm kod değişiklikleri PR üzerinden `main` branch'ine birleştirilmelidir. PR açarken ilgili issue'yu referans gösterin (`Task Ticket Number #123`).
4.  **Kod İnceleme (Code Review):** Her PR, proje lideri veya belirlenmiş en az bir kıdemli geliştirici tarafından onaylanmalıdır.

## Kod Standartları

- Her repository'de tanımlanan kodlama standartlarına ve linting kurallarına uyun.
- Anlaşılır ve açıklayıcı commit mesajları yazın.
- Yeni eklenen veya değiştirilen özellikler için testler yazın.
- Yaptığınız değişikliklerle ilgili dokümantasyonu (README, Wiki vb.) güncelleyin.

## Başlangıç

- **Ön Koşullar:**
  - Git'in lokal makinenizde kurulu olması.
  - Proje repolarına erişim izninizin olması.
- **Kurulum:**
  - İlgili repoyu klonlayın.
  - Reponun `README.md` dosyasındaki kurulum adımlarını takip edin.
  - İlk görevleriniz için size atanan "initial setup issue"yu inceleyin.

</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

<br>


This document is a guide for development processes, standards, and workflows in the Project project.

## Workflow

1.  **Issues:** All work (new features, bugs, tasks) should be tracked through GitHub Issues. An issue should be created for each piece of work.
2.  **Branches:** A new feature branch should be created from the `main` branch for each issue. Branch naming convention: `feature/issue-no-short-description` (e.g., `feature/123-add-user-login`).
3.  **Pull Requests (PRs):** All code changes must be merged into the `main` branch through PRs. When opening a PR, reference the related issue (`Task Ticket Number #123`).
4.  **Code Review:** Each PR must be approved by the project lead or at least one designated senior developer.

## Coding Standards

- Follow the coding standards and linting rules defined in each repository.
- Write clear and descriptive commit messages.
- Write tests for newly added or modified features.
- Update the documentation (README, Wiki, etc.) related to your changes.

## Getting Started

- **Prerequisites:**
  - Git must be installed on your local machine.
  - You must have access permissions to the project repositories.
- **Setup:**
  - Clone the relevant repository.
  - Follow the setup steps in the repository's `README.md` file.
  - Review the "initial setup issue" assigned to you for your first tasks.

</details>