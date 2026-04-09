const course_list = [
  {
    id: 1,
    slug: "aws-certified-solutions-architect",
    title: "AWS Certified Solutions Architect Associate",
    description:
      "AWS üzerinde yüksek erişilebilir, güvenli ve ölçeklenebilir sistemler tasarlamayı öğren. IAM, VPC, EC2, S3, RDS, ELB, Auto Scaling, Route 53 ve Well-Architected prensipleriyle sertifikasyon odaklı sağlam bir temel oluştur.",
    category: "Cloud & DevOps",
    difficulty: "Intermediate",
    duration_minutes: 720,
    is_published: true,
    created_at: "2026-03-15T10:30:00Z",
  },
  {
    id: 2,
    slug: "docker-for-beginners",
    title: "Docker ile Konteyner Temelleri",
    description:
      "Docker'ın temel mantığını, image ve container yaşam döngüsünü, volume, network, Dockerfile, docker compose ve geliştirme ortamlarında pratik kullanım senaryolarını adım adım öğren.",
    category: "Containers & DevOps",
    difficulty: "Beginner",
    duration_minutes: 300,
    is_published: true,
    created_at: "2026-02-10T08:00:00Z",
  },
  {
    id: 3,
    slug: "advanced-nodejs",
    title: "İleri Seviye Node.js",
    description:
      "Node.js tarafında event loop, stream yapısı, memory yönetimi, performans analizi, ölçeklenebilir servis mimarisi, hata yönetimi ve production best practice konularına derinlemesine odaklan.",
    category: "Backend Engineering",
    difficulty: "Advanced",
    duration_minutes: 540,
    is_published: false,
    created_at: "2026-01-25T14:45:00Z",
  },
  {
    id: 4,
    slug: "react-with-nextjs-app-router",
    title: "React ve Next.js App Router",
    description:
      "Next.js App Router ile modern frontend mimarisi kur. Server Component, Client Component, veri çekme stratejileri, caching, layout yapısı, route segment mantığı ve production dağıtım pratiklerini öğren.",
    category: "Frontend Engineering",
    difficulty: "Intermediate",
    duration_minutes: 480,
    is_published: true,
    created_at: "2026-03-28T12:15:00Z",
  },
  {
    id: 5,
    slug: "postgresql-complete-guide",
    title: "PostgreSQL Uçtan Uca Rehber",
    description:
      "PostgreSQL’de temel sorgulardan index stratejilerine, transaction yönetiminden performans optimizasyonuna kadar veritabanı tarafını uygulamalı şekilde öğren. Backend ve DevOps ekipleri için üretim ortamı bakış açısı içerir.",
    category: "Database & Backend",
    difficulty: "Intermediate",
    duration_minutes: 600,
    is_published: true,
    created_at: "2026-02-05T09:20:00Z",
  },
  {
    id: 6,
    slug: "kubernetes-fundamentals",
    title: "Kubernetes Temelleri ve Uygulama Dağıtımı",
    description:
      "Kubernetes cluster mantığını, Pod, Deployment, Service, ConfigMap, Secret, Ingress, namespace, resource limitleri ve rolling update süreçlerini öğren. Konteyner orkestrasyonu için güçlü bir giriş kursu.",
    category: "Kubernetes & DevOps",
    difficulty: "Intermediate",
    duration_minutes: 660,
    is_published: true,
    created_at: "2026-02-20T11:00:00Z",
  },
];

export default course_list;
