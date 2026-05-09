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
npm ci
cp .env.example .env.local   # შეავსე Supabase URL და anon key
npm run dev
```

ბრაუზერში გახსენი http://localhost:8080

> Supabase-ის გარეშეც მუშაობს — დროებით ინახავს `localStorage`-ში.

ალტერნატივა: `pnpm install && pnpm dev` ან `yarn && yarn dev` ან `bun install && bun run dev`.

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

### საჭირო Environment Variables

Frontend (client):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Server-only (Vercel Functions / Admin / Cron):

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_PASSWORD_HASH=pbkdf2_sha256$210000$<salt>$<derived-hash>
ADMIN_SESSION_SECRET=<at-least-32-random-characters>
```

### Deploy ნაბიჯები (Dashboard რეკომენდებული)

1. Vercel → **Import Project** → აირჩიე GitHub repo `koduaxodua/pawswipegeo`
2. Framework იქნება auto-detected როგორც **Vite**
3. Build config:
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**-ში დაამატე ზემოთ ჩამოთვლილი ცვლადები (Production/Preview)
5. Deploy

CLI ვარიანტი:

```bash
npm i -g vercel
vercel link
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_PASSWORD_HASH
vercel env add ADMIN_SESSION_SECRET
vercel --prod
```

`vercel.json` კონფიგურირებულია SPA rewrite-ებისთვის და `/api/cron/delete-hidden-pets` cron-ზე.

## 📜 Scripts

| Command | რას აკეთებს |
|---|---|
| `npm run dev` | dev server `:8080`-ზე |
| `npm run build` | production build → `dist/` |
| `npm run preview` | წინასწარი ნახვა build-ის |
| `npm run lint` | ESLint |
| `npm run test` | Vitest ტესტები |

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
