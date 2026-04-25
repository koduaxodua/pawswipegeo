# Pet Rescue Georgia

მიუსაფარი ძაღლებისა და კატების მიკედლების პლატფორმა საქართველოში — სვაიპის სტილის აპი [Pet Rescue Georgia](https://www.facebook.com/profile.php?id=61566471334047)-სთვის.

## 🛠 ტექნოლოგიები

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel

## 🚀 ლოკალურად გაშვება

```bash
bun install
cp .env.example .env.local   # შეავსე Supabase URL და anon key
bun run dev
```

ბრაუზერში გახსენი http://localhost:8080

> Supabase-ის გარეშეც მუშაობს — დროებით ინახავს `localStorage`-ში.

## 🗄 Supabase setup

1. [supabase.com](https://supabase.com)-ზე შექმენი ახალი პროექტი
2. **Project Settings → API** გადააკოპირე `URL` და `anon public` key → `.env.local`
3. სქემის გაშვება ერთ-ერთი გზით:
   - **Dashboard**: SQL Editor → New query → ჩასვი `supabase/migrations/0001_init.sql`-ის შიგთავსი → Run
   - **CLI**: `supabase link --project-ref <ref> && supabase db push`
4. **Authentication → Sign In / Providers → Anonymous Sign-Ins → Enable** ⚠️ აუცილებელია — ანონიმური მომხმარებლები ფარულად შემოდიან, ცხოველის ატვირთვა მუშაობს login-ის გარეშე

ცხრილები:
- `pets` — ცხოველების ლისტინგები (RLS: საჯარო `available` ცხოველებზე)
- `swipes` — მომხმარებლის like/dislike ისტორია (RLS: მხოლოდ საკუთარი)
- Storage bucket `pet-photos` — ფოტოების ატვირთვა

## ▲ Vercel deploy

```bash
# პირველად — Vercel CLI-ით
bun add -g vercel
vercel link
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

ან Dashboard-დან: Import Project → GitHub რეპო → Environment Variables-ში დაამატე ორივე `VITE_SUPABASE_*` ცვლადი.

`vercel.json` უკვე გაწყობილია SPA rewrites-ისთვის.

## 📜 Scripts

| Command | რას აკეთებს |
|---|---|
| `bun run dev` | dev server `:8080`-ზე |
| `bun run build` | production build → `dist/` |
| `bun run preview` | წინასწარი ნახვა build-ის |
| `bun run lint` | ESLint |
| `bun test` | Vitest ტესტები |

## 🗂 პროექტის სტრუქტურა

```
src/
├─ pages/        — გვერდები (Index, Favorites, AddDog, Missions, Terms)
├─ components/   — Logo, SwipeCard, BottomNav, MapSheet, ...
│  └─ ui/        — shadcn/ui პრიმიტივები
├─ hooks/        — useDogs, useLikedDogs, useTheme, ...
├─ data/         — mock data + ტიპები
├─ lib/          — supabase client, utils
public/brand/   — ლოგო (dark / light)
supabase/       — DB მიგრაციები
```
