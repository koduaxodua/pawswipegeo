import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TRANSLATABLE_DOG_FIELDS } from '@/hooks/useTranslatedDog';
import { isPersistedPetId } from '@/hooks/useDeleteRequests';
import { pickPhotoFrameRatio } from '@/components/AdaptivePetPhoto';

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), 'utf8');
}

function listFiles(dir: string): string[] {
  const full = join(root, dir);
  return readdirSync(full).flatMap(name => {
    const path = join(full, name);
    const relative = `${dir}/${name}`.replace(/\\/g, '/');
    if (statSync(path).isDirectory()) return listFiles(relative);
    return relative;
  });
}

describe('privacy/security hardening', () => {
  it('adds restrictive pets RLS without broad update/delete policies', () => {
    const sql = read('supabase/migrations/0002_privacy_security_hardening.sql');

    expect(sql).toContain('create policy "Public can view available pets"');
    expect(sql).toContain("using (status = 'available')");
    expect(sql).toContain('create policy "Authenticated can update own pets"');
    expect(sql).toContain('using (created_by = auth.uid())');
    expect(sql).toContain('public_location');
    expect(sql).not.toMatch(/create policy[\s\S]+for delete[\s\S]+on public\.pets/i);
    expect(sql).not.toMatch(/for update[\s\S]+auth\.role\(\)\s*=\s*'authenticated'/i);
  });

  it('requires contact information acknowledgement in the add pet form', () => {
    const source = read('src/pages/AddDog.tsx');

    expect(source).toContain('contactConsent');
    expect(source).toContain('contactConsentAcknowledgedAt');
    expect(source).toContain('ნომერი საჯაროდ გამოჩნდება ცხოველის პროფილზე');
    expect(source).toContain('ვეთანხმები და ვადასტურებ');
    expect(source).not.toContain('type="checkbox"');
  });

  it('uses public pet coordinates in public UI instead of exact database coordinates', () => {
    const useDogs = read('src/hooks/useDogs.ts');
    const locations = read('src/data/locations.ts');

    expect(useDogs).toContain(".from('pets_public')");
    expect(useDogs).toContain("'location'");
    expect(useDogs).toContain('public_lat');
    expect(useDogs).toContain('public_lng');
    expect(useDogs).not.toContain(".select('*')");
    expect(useDogs).not.toContain("'contact_consent_acknowledged_at'");
    expect(locations.indexOf('publicLat')).toBeLessThan(locations.indexOf('dog.lat'));
  });

  it('does not send contact names, phone numbers, or locations to translation provider', () => {
    expect(TRANSLATABLE_DOG_FIELDS).toEqual([
      'age',
      'breed',
      'personality',
      'health',
      'description',
    ]);
  });

  it('has a Georgian privacy route and footer link', () => {
    expect(read('src/App.tsx')).toContain('/ka/privacy');
    expect(read('src/pages/Terms.tsx')).toContain('/ka/privacy');
  });

  it('keeps the previous homepage on root and moves the English ad content to /2', () => {
    const app = read('src/App.tsx');
    const homepage = read('src/pages/ContentPages.tsx');
    const homepageV2 = read('src/pages/ContentPagesV2.tsx');
    const nav = read('src/components/BottomNav.tsx');
    const html = read('index.html');

    expect(app).toContain('path="/" element={<HomePage />}');
    expect(app).toContain('path="/app" element={<Index />}');
    expect(app).toContain('path="/about" element={<AboutPage />}');
    expect(app).toContain('path="/safety" element={<SafetyPage />}');
    expect(app).toContain('path="/how-it-works" element={<HowItWorksPage />}');
    expect(app).toContain('path="/2" element={<HomePageV2 />}');
    expect(app).toContain('path="/2/about" element={<AboutPageV2 />}');
    expect(app).toContain('path="/2/safety" element={<SafetyPageV2 />}');
    expect(app).toContain('path="/2/how-it-works" element={<HowItWorksPageV2 />}');
    expect(app).toContain('path="/ka" element={<GeorgianLandingPage />}');
    expect(nav).toContain("path: '/app'");
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('Find and help homeless pets in Georgia');
    expect(homepage).toContain('იპოვე ან დაამატე ცხოველი.');
    expect(homepage).toContain('აპის გახსნა');
    expect(homepageV2).toContain('Georgian pet rescue community');
    expect(homepageV2).toContain('Open App');
    expect(homepageV2).toContain('Find, Adopt, Help.');
    expect(homepageV2).not.toMatch(/[\u10A0-\u10FF]/);
  });

  it('keeps app and form pages out of AdSense inventory', () => {
    const index = read('src/pages/Index.tsx');
    const consent = read('src/lib/privacyConsent.ts');
    const html = read('index.html');
    const app = read('src/App.tsx');

    expect(index).not.toContain('AdBanner');
    expect(index).not.toContain('showAd');
    expect(consent).toContain("['/2', '/2/about', '/2/safety', '/2/how-it-works']");
    expect(consent).toContain('options: { allowAds?: boolean }');
    expect(consent).toContain('window.__mipoveLoadAdsense?.()');
    expect(html).toContain('__mipoveCanLoadAds');
    expect(html).toContain('__MIPOVE_ADS_ALLOWED_PATHS__');
    expect(consent).toContain('isAdsAllowedOnCurrentPage()');
    expect(app).toContain('SeoGuard');
    expect(read('src/pages/Missions.tsx')).not.toMatch(/coming soon|In development|under construction/i);
  });

  it('keeps consent UI simple without granular checkboxes', () => {
    const source = read('src/components/CookieConsent.tsx');

    expect(source).toContain('ვეთანხმები');
    expect(source).toContain('მხოლოდ აუცილებელი');
    expect(source).toContain('Privacy choices');
    expect(source).toContain('allowAds');
    expect(source).toContain('/ka/privacy');
    expect(source).not.toContain('type="checkbox"');
  });

  it('keeps the logo admin shortcut as navigation to server-side login only', () => {
    const source = read('src/components/TopLeftBrand.tsx');

    expect(source).toContain('ADMIN_TAP_COUNT = 10');
    expect(source).toContain("navigate('/admin-login')");
    expect(source).not.toContain('AdminMode');
  });

  it('does not place server-only admin secrets in frontend source', () => {
    const frontend = listFiles('src')
      .filter(file => !file.startsWith('src/test/'))
      .filter(file => /\.(ts|tsx|js|jsx)$/.test(file))
      .map(read)
      .join('\n');

    expect(frontend).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(frontend).not.toContain('ADMIN_PASSWORD_HASH');
    expect(frontend).not.toContain('ADMIN_SESSION_SECRET');
  });

  it('tracks hidden pets and configures 90-day cleanup through a protected cron', () => {
    const migration = read('supabase/migrations/0004_hidden_pet_retention.sql');
    const hidePetApi = read('api/admin/hide-pet.ts');
    const cronApi = read('api/cron/delete-hidden-pets.ts');
    const vercelConfig = read('vercel.json');
    const privacy = read('src/pages/PrivacyKa.tsx');

    expect(migration).toContain('hidden_at timestamptz');
    expect(migration).toContain('pets_set_hidden_at');
    expect(hidePetApi).toContain("status: 'hidden'");
    expect(hidePetApi).toContain('hidden_at: hiddenAt');
    expect(cronApi).toContain('RETENTION_DAYS = 90');
    expect(cronApi).toContain('CRON_SECRET');
    expect(cronApi).toContain(".from('pets')");
    expect(cronApi).toContain('.delete()');
    expect(cronApi).toContain('.remove(storagePaths)');
    expect(vercelConfig).toContain('/api/cron/delete-hidden-pets');
    expect(privacy).toContain('90 დღის შემდეგ');
  });

  it('routes public delete clicks into admin review requests without deleting pets', () => {
    const hook = read('src/hooks/useDeleteRequests.ts');
    const detailSheet = read('src/components/DogDetailSheet.tsx');
    const favorites = read('src/pages/Favorites.tsx');
    const requestApi = read('api/pet-deletion-requests.ts');

    expect(hook).toContain("fetch('/api/pet-deletion-requests'");
    expect(hook).toContain("throw new Error('non_persisted_pet')");
    expect(hook).toContain('previously failed request can be submitted again');
    expect(detailSheet).toContain('canRequestPetDeletion');
    expect(detailSheet).toContain('Demo profiles cannot be sent for admin review.');
    expect(favorites).toContain('handleDeletionRequest');
    expect(favorites).toContain('requestDelete(dog.id)');
    expect(favorites).toContain("t('detail.deleteRequest')");
    expect(requestApi).toContain('pet_deletion_requests');
    expect(requestApi).toContain('duplicate: true');
    expect(requestApi).not.toContain("from('pets')");
    expect(requestApi).not.toContain('.delete()');
  });

  it('recognizes Supabase UUID pet ids as persisted records', () => {
    expect(isPersistedPetId('8e2a4e92-7a8a-4b5f-bb78-8d4b3772cc2a')).toBe(true);
    expect(isPersistedPetId('1')).toBe(false);
  });

  it('uses adaptive lightly cropped frames for pet images', () => {
    expect(pickPhotoFrameRatio(0.66)).toBeCloseTo(2 / 3);
    expect(pickPhotoFrameRatio(1)).toBe(1);
    expect(pickPhotoFrameRatio(1.8)).toBeCloseTo(16 / 9);

    expect(read('src/components/DogDetailSheet.tsx')).toContain('mode="detail"');
    expect(read('src/components/SwipeCard.tsx')).toContain('mode="card"');
    expect(read('src/pages/AddDog.tsx')).toContain('mode="preview"');
    expect(read('src/components/AdaptivePetPhoto.tsx')).toContain('object-contain');
    expect(read('src/components/AdaptivePetPhoto.tsx')).toContain('card: 1.16');
    expect(read('src/components/AdaptivePetPhoto.tsx')).toContain('detail: 1.08');
    expect(read('src/components/DogDetailSheet.tsx')).not.toContain('h-56 sm:h-72 object-cover');
  });

  it('links pet detail sheets to a focused map view', () => {
    const index = read('src/pages/Index.tsx');
    const detailSheet = read('src/components/DogDetailSheet.tsx');
    const mapSheet = read('src/components/MapSheet.tsx');
    const favorites = read('src/pages/Favorites.tsx');

    expect(detailSheet).toContain('onShowOnMap');
    expect(detailSheet).toContain('Show on map');
    expect(index).toContain('handleShowDogOnMap');
    expect(index).toContain('focusedDogId={mapFocusDogId}');
    expect(mapSheet).toContain('focusedDogId?: string | null');
    expect(mapSheet).toContain('setSelectedId(focusedDogId)');
    expect(favorites).toContain('handleShowDogOnMap');
    expect(favorites).toContain('<MapSheet');
  });

  it('separates Georgian UX from English ad content and improves app controls', () => {
    const georgianLanding = read('src/pages/GeorgianLandingPage.tsx');
    const cardFooter = read('src/components/CardFooterActions.tsx');
    const tutorial = read('src/components/SwipeTutorialV2.tsx');
    const skeleton = read('src/components/SkeletonCardStack.tsx');
    const swipeCard = read('src/components/SwipeCard.tsx');
    const vercel = read('vercel.json');
    const robots = read('public/robots.txt');
    const migration = read('supabase/migrations/0005_public_pets_view_hidden_at_hardening.sql');

    expect(georgianLanding).toContain('to="/app"');
    expect(georgianLanding).toContain('to="/add"');
    expect(georgianLanding).toContain('to="/missions"');
    expect(cardFooter).toContain('onLike');
    expect(cardFooter).toContain('onMap');
    expect(cardFooter).toContain('onNope');
    expect(tutorial).toContain('pawswipe_tutorial_seen_v2');
    expect(skeleton).toContain('[2, 1, 0]');
    expect(swipeCard).toContain('caretakerPhone');
    expect(swipeCard).toContain('has phone');
    expect(vercel).toContain('"source": "/ka"');
    expect(vercel).toContain('"source": "/missions"');
    expect(vercel).toContain('X-Robots-Tag');
    expect(robots).toContain('Disallow: /ka');
    expect(robots).toContain('Disallow: /missions');
    expect(migration).toContain('create or replace view public.pets_public');
    expect(migration).not.toMatch(/\n\s+hidden_at,/);
    expect(migration).not.toMatch(/\n\s+lat,/);
    expect(migration).not.toMatch(/\n\s+lng,/);
  });

  it('supports keyboard arrow shortcuts on the swipe screen', () => {
    const index = read('src/pages/Index.tsx');

    expect(index).toContain("event.key === 'ArrowLeft'");
    expect(index).toContain("runAnimatedSwipe('left')");
    expect(index).toContain("event.key === 'ArrowRight'");
    expect(index).toContain("runAnimatedSwipe('right')");
    expect(index).toContain("event.key === 'ArrowUp'");
    expect(index).toContain('setSelectedDog(currentDog)');
    expect(index).toContain("event.key === 'ArrowDown'");
    expect(index).toContain('setSelectedDog(null)');
    expect(index).toContain('isTextEditingTarget');
  });

  it('animates keyboard and button swipes in the selected direction', () => {
    const index = read('src/pages/Index.tsx');
    const swipeCard = read('src/components/SwipeCard.tsx');

    expect(index).toContain('swipeExitDirection');
    expect(index).toContain('setSwipeExitDirection(direction)');
    expect(index).toContain('setActiveSwipeDirection(direction)');
    expect(index).toContain('PROGRAMMATIC_SWIPE_MS');
    expect(index).toContain('exitDirection={swipeExitDirection}');
    expect(index).toContain('activeSwipeDirection={activeSwipeDirection}');
    expect(swipeCard).toContain('exitDirection?:');
    expect(swipeCard).toContain('activeSwipeDirection?:');
    expect(swipeCard).toContain('animate(x');
    expect(swipeCard).toContain("x: exitDirection === 'left' ? -420 : 420");
    expect(swipeCard).toContain("rotate: exitDirection === 'left' ? -18 : 18");
  });

  it('normalizes server-side Supabase URL to the project origin', () => {
    const source = read('api/_admin.ts');

    expect(source).toContain('normalizeSupabaseUrl(process.env.SUPABASE_URL)');
    expect(source).toContain('normalizeSupabaseUrl(process.env.VITE_SUPABASE_URL)');
    expect(source).toContain('return url.origin');
    expect(source).toContain('/\\/rest\\/v1\\/?$/');
  });
});
