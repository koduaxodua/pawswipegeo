import { useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, HeartHandshake, MapPin, ShieldCheck, Search, PawPrint } from 'lucide-react';
import { useLocale } from '@/contexts/Locale';

const INDEXABLE_ROUTES = new Set(['/', '/about', '/safety', '/how-it-works']);

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'mipove.me - Find and help homeless pets in Georgia',
    description:
      'mipove.me helps people in Georgia share, find, and safely contact each other about homeless, lost, or adoptable pets.',
  },
  '/about': {
    title: 'About mipove.me - Pet rescue information platform',
    description:
      'Learn how mipove.me supports pet rescue, adoption, and responsible community reporting for dogs and cats in Georgia.',
  },
  '/safety': {
    title: 'Safety guide - Helping pets responsibly',
    description:
      'Safety guidance for contacting caretakers, meeting responsibly, and protecting people, pets, phone numbers, and approximate locations.',
  },
  '/how-it-works': {
    title: 'How mipove.me works - Add, browse, map, and contact',
    description:
      'A simple explanation of how users add pet listings, browse profiles, view approximate map locations, and request listing review.',
  },
};

export function SeoGuard() {
  const { pathname } = useLocation();
  const { locale } = useLocale();

  useEffect(() => {
    const indexable = INDEXABLE_ROUTES.has(pathname);
    const meta = pageMeta[pathname] ?? pageMeta['/'];
    document.title = indexable ? meta.title : 'mipove.me';
    document.documentElement.lang = indexable ? 'en' : pathname.startsWith('/ka') ? 'ka' : locale;

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = indexable ? 'index,follow' : 'noindex,follow';

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description && indexable) description.content = meta.description;
  }, [locale, pathname]);

  return null;
}

export function HomePage() {
  return (
    <ContentShell>
      <section className="grid gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Community pet rescue in Georgia
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Find, share, and help homeless pets with safer public listings.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            mipove.me is an online information platform for people who find homeless, lost, or adoptable dogs and cats.
            It helps listings become easier to browse, map, and review while keeping contact and location privacy clear.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90">
              Open pet app <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary">
              How it works
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-card/70 p-4 shadow-2xl shadow-black/30">
          <img
            src="/brand/og-image.jpg"
            alt="mipove.me pet listing interface preview"
            className="aspect-[4/5] w-full rounded-[1.4rem] object-cover"
          />
        </div>
      </section>

      <FeatureGrid
        items={[
          {
            icon: Search,
            title: 'Browse real pet profiles',
            text: 'Each listing can include a photo, age, breed, notes, public contact information, and an approximate area.',
          },
          {
            icon: MapPin,
            title: 'Use approximate map locations',
            text: 'Public markers use approximate coordinates so people can understand the area without exposing exact private locations.',
          },
          {
            icon: ShieldCheck,
            title: 'Request review when needed',
            text: 'Users can request that a listing is reviewed or hidden, and admin actions are handled server-side.',
          },
        ]}
      />

      <ArticleBlock
        title="Why the platform exists"
        paragraphs={[
          'Pet rescue often starts with a quick photo, a street name, and a person willing to help. Social posts disappear quickly, group chats become hard to search, and important details can get lost.',
          'mipove.me keeps the useful parts of a pet report in one profile: the animal photo, a short description, public contact details when provided, and an approximate location. The goal is to make community help easier without pretending to be a shelter, clinic, or government service.',
        ]}
      />
    </ContentShell>
  );
}

export function AboutPage() {
  return (
    <ContentShell>
      <ArticleBlock
        title="About mipove.me"
        paragraphs={[
          'mipove.me is a social-purpose technology platform for pet rescue information in Georgia. It is designed for people who see a homeless or lost animal and want to share clear information quickly.',
          'The platform does not sell animals and does not replace professional veterinary, municipal, or emergency services. It simply helps people publish and discover structured pet listings with less friction.',
          'Listings may include user-submitted text, photos, optional contact information, and an approximate public location. Admin review tools are used to hide inappropriate or outdated listings.',
        ]}
      />
      <FeatureGrid
        items={[
          { icon: PawPrint, title: 'Dogs and cats', text: 'The public flow is focused on homeless, lost, or adoptable dogs and cats.' },
          { icon: HeartHandshake, title: 'Community help', text: 'People can like profiles, save them, view details, and contact the listed caretaker when contact data is public.' },
          { icon: ShieldCheck, title: 'Privacy-aware MVP', text: 'Phone visibility, consent text, approximate locations, and deletion requests are built into the current MVP.' },
        ]}
      />
    </ContentShell>
  );
}

export function SafetyPage() {
  return (
    <ContentShell>
      <ArticleBlock
        title="Safety and privacy guide"
        paragraphs={[
          'Never publish someone else’s phone number, home address, or private details unless you have permission. If you add a contact number, it may be visible on the public pet profile.',
          'Use the map to describe the general area where the animal was seen. Avoid exposing a private home, yard, workplace, or route if that information could identify or endanger someone.',
          'When meeting another person about a pet, choose a safe public place when possible, bring another person if needed, and do not transfer an animal if the situation feels unsafe or unclear.',
          'For urgent medical danger, cruelty, or public safety issues, contact the appropriate veterinary, municipal, or emergency service. mipove.me is an information platform, not an emergency responder.',
        ]}
      />
    </ContentShell>
  );
}

export function HowItWorksPage() {
  return (
    <ContentShell>
      <ArticleBlock
        title="How mipove.me works"
        paragraphs={[
          'A user adds a pet listing by uploading a photo, writing a short description, selecting a location, and optionally adding public contact information.',
          'Visitors browse pet profiles in a swipe-style interface, open detailed profiles, save liked pets, and view approximate public locations on the map.',
          'If a listing should be reviewed or removed, users can send a deletion request. Admins can hide listings through server-side tools instead of exposing broad delete access in the browser.',
          'The current MVP uses React, TypeScript, Vite, Tailwind, Supabase, and Vercel. Supabase handles database, storage, and anonymous auth; Vercel hosts the frontend and serverless admin endpoints.',
        ]}
      />
      <div className="mt-8 rounded-2xl border border-border/70 bg-card/70 p-5">
        <h2 className="text-lg font-semibold text-foreground">Typical flow</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          <li>1. Add a clear pet photo and short description.</li>
          <li>2. Select the general area on the map.</li>
          <li>3. Confirm permission for any public contact details.</li>
          <li>4. Browse, save, and contact caretakers responsibly.</li>
        </ol>
      </div>
    </ContentShell>
  );
}

function ContentShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/brand/logo-dark.png" alt="mipove.me" className="h-11 w-11 rounded-2xl object-contain" />
            <div className="leading-tight">
              <span className="block text-lg font-bold">mipove.me</span>
              <span className="text-xs text-muted-foreground">Pet rescue listings in Georgia</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/safety" className="hover:text-foreground">Safety</Link>
            <Link to="/how-it-works" className="hover:text-foreground">How it works</Link>
            <Link to="/app" className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90">
              Open app
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pb-16">{children}</div>
      <footer className="border-t border-border/60 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>mipove.me helps people share pet rescue information responsibly.</span>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/ka/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/app" className="hover:text-foreground">App</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureGrid({ items }: { items: { icon: typeof Search; title: string; text: string }[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map(item => (
        <div key={item.title} className="rounded-2xl border border-border/70 bg-card/70 p-5">
          <item.icon className="mb-4 h-6 w-6 text-primary" />
          <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
        </div>
      ))}
    </section>
  );
}

function ArticleBlock({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <article className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border/70 bg-card/70 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
        {paragraphs.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
