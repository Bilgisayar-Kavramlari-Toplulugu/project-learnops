# LearnOps Frontend Real Project Structure

Bu dokuman, backend verisi DB'den geldigi zaman frontend tarafinin nasil isleyecegini ozetler.

## 1) Feature-first klasor yapisi

```text
src/
  features/
    dashboard/
      config/
        dashboard-ui.config.ts
      hooks/
        use-dashboard.ts
      mappers/
        dashboard.mapper.ts
      services/
        dashboard.service.ts
      types/
        dashboard-api.types.ts
        dashboard-view.types.ts
```

## 2) Data akis modeli

1. `services/` -> API endpoint cagirilari (raw DTO doner).
2. `mappers/` -> DTO -> UI model donusumu.
3. `hooks/` -> React Query ile fetch/cache/mutation yonetimi.
4. `components/` -> sadece render, network detayi bilmez.

## 3) Neden bu yapi?

- Backend response degisse bile degisiklik sadece `types + mapper` katmaninda kalir.
- UI componentleri stabil kalir.
- Dashboard verisi tek kaynaktan (`services/`) gelir, sahte data katmani yoktur.

## 4) Yeni endpoint ekleme standardi

Ornek: `GET /courses/recommended`

1. `types/dashboard-api.types.ts` icine response type ekle.
2. `services/dashboard.service.ts` icine endpoint + function ekle.
3. `mappers/dashboard.mapper.ts` icinde UI modeline map et.
4. `hooks/use-dashboard.ts` veya ilgili query hook'unda bagla.
