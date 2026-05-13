import { useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  HeartHandshake,
  MapPin,
  PawPrint,
  Search,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useLocale } from '@/contexts/Locale';

const AD_CONTENT_ROUTES = new Set(['/', '/about', '/safety', '/how-it-works']);
const INDEXABLE_ROUTES = new Set(['/', '/about', '/safety', '/how-it-works', '/app']);
const CONTENT_AD_SLOT = import.meta.env.VITE_ADSENSE_CONTENT_SLOT || '';

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
  '/app': {
    title: 'mipove.me app - Georgian pet rescue listings',
    description: 'Browse Georgian pet rescue listings, save profiles, and open approximate map locations.',
  },
};

export function SeoGuard() {
  const { pathname } = useLocation();
  const { locale } = useLocale();

  useEffect(() => {
    const indexable = INDEXABLE_ROUTES.has(pathname);
    const adContent = AD_CONTENT_ROUTES.has(pathname);
    const meta = pageMeta[pathname] ?? pageMeta['/'];

    document.title = indexable ? meta.title : 'mipove.me';
    document.documentElement.lang = adContent ? 'en' : pathname.startsWith('/ka') ? 'ka' : locale;

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
      <section className="grid min-h-[70dvh] gap-8 py-10 md:grid-cols-[1fr_0.9fr] md:items-center">
        <div>
          <p className="inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Georgian pet rescue community
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Find, Adopt, Help.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            mipove.me helps people in Georgia share clear, searchable pet rescue listings for homeless, lost, and
            adoptable dogs and cats. The app keeps reports practical: one photo, useful details, optional public
            contact information, and an approximate map area.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/app" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-90 active:scale-[0.98]">
              Open App <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/add" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-border bg-secondary/70 px-6 text-base font-semibold text-foreground transition hover:bg-secondary active:scale-[0.98]">
              Add Pet
            </Link>
          </div>
          <Link to="/ka" className="mt-4 inline-flex text-sm text-muted-foreground underline">
            Georgian version
          </Link>
        </div>

        <Link to="/app" aria-label="Open mipove.me pet rescue app" className="group rounded-[2rem] border border-border/70 bg-card/70 p-3 shadow-2xl shadow-black/30 transition hover:border-primary/40">
          <img
            src="/brand/og-image.jpg"
            alt="mipove.me pet listing interface preview"
            className="aspect-[4/5] max-h-[62dvh] w-full rounded-[1.4rem] object-cover"
          />
          <span className="mt-3 flex items-center justify-center gap-2 rounded-full bg-primary/10 py-3 text-sm font-semibold text-primary transition group-hover:bg-primary/15">
            Start browsing <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>

      <FeatureGrid
        items={[
          {
            icon: Search,
            title: 'Browse structured listings',
            text: 'Profiles can show the animal type, name, age, breed, photo, notes, public contact details, and a general area.',
          },
          {
            icon: MapPin,
            title: 'Use approximate map areas',
            text: 'Public map markers use public coordinates so helpers can understand the area without exposing exact private points.',
          },
          {
            icon: ShieldCheck,
            title: 'Report outdated listings',
            text: 'Visitors can request review when a listing is wrong, duplicated, unsafe, or already resolved.',
          },
        ]}
      />

      <ArticleBlock
        title="A practical rescue directory for everyday people"
        paragraphs={[
          'Pet rescue usually starts with a simple moment: someone sees a dog near a building entrance, a cat beside a shop, or a lost animal moving through a busy street. The person may not run a shelter and may not know the owner, but they can still help by sharing clear information. mipove.me turns that quick report into a structured listing that is easier to browse than a disappearing social post.',
          'The platform is intentionally focused. It is not a shelter, a clinic, a marketplace, or a government service. It is a public information space for animal-related reports. A listing can include a photo, a short description, a general location, and contact information when the person publishing the listing has permission to share it. This keeps the flow useful without forcing people into a complicated account system.',
          'The main app is built for Georgian users, while this English content area explains the mission, safety model, privacy choices, and responsible use of the service. Ads, if approved, are limited to English content pages and are not shown inside the Georgian swipe app, add form, admin screens, or mission guide.',
        ]}
      />

      <ManualAdSlot slot={CONTENT_AD_SLOT} />

      <ArticleBlock
        title="How the app keeps rescue information useful"
        paragraphs={[
          'A good listing answers the first questions a helper usually has: what animal is this, where was it seen, what condition is it in, and who can be contacted. The app uses a card interface so visitors can quickly scan many profiles, save animals they want to follow, open more information, and check the approximate map area when a listing includes coordinates.',
          'Location privacy is part of the product. Exact coordinates may be stored for the listing creator or admin workflow, but public cards and public map markers are designed around public latitude and longitude fields. That means a visitor sees a useful area rather than a private doorway, apartment, workplace, or yard.',
          'The project also includes a review path. If a pet is adopted, returned, duplicated, fake, or unsafe, users can submit a deletion request. Admin moderation hides public listings first and keeps temporary retention rules for review before permanent deletion.',
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
          'mipove.me is a social-purpose pet rescue information platform built for communities in Georgia. It exists because animal help is often fragmented across social networks, private chats, neighborhood groups, and one-time posts that are difficult to search later. The product gives people a simple way to publish a structured listing when they see a homeless, lost, or adoptable dog or cat.',
          'The mission is not to replace shelters, veterinarians, rescue groups, municipal services, or emergency responders. Those services remain essential. mipove.me is a technology layer that helps information move faster between ordinary people: the person who saw the animal, the person who may know the owner, the person who can foster, and the person who can help with transport or basic care.',
          'Structured listings matter because rescue work often fails when details are scattered. A useful report needs a clear photo, a short description, a general area, an explanation of the animal condition, and a safe way to contact the person responsible for the listing. mipove.me keeps these fields together so visitors can make better decisions before calling, meeting, or sharing a profile.',
          'The current product is built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, framer-motion, Supabase, and Vercel. Supabase supports anonymous authentication, database rows, public storage for pet photos, and moderation-related tables. Vercel hosts the site and serverless API routes for admin actions. OpenStreetMap and Leaflet provide the map experience, while Nominatim can support location search. Translation features are limited to public descriptive pet fields.',
          'Privacy is treated as an MVP requirement, not a later decoration. Public pet profiles can include photos, optional contact information, and approximate public locations. Exact location values should not be exposed to ordinary public browsing. Contact warnings remind users that a phone number may be visible on a public profile and should only be shared with permission. Admin hiding uses server-side routes rather than a hidden client-only mode.',
          'The product also tries to make small actions easier. A visitor should not need to understand rescue organizations, database systems, or moderation rules before they can help. They can browse, save a profile, open a map, contact the listed caretaker, or submit a review request when something looks wrong. Those simple actions are the useful part of the platform.',
          'Because the Georgian rescue community is mostly local, the main app experience stays Georgian and direct. The English pages exist to explain the service for search, review, transparency, and advertising compliance. This separation keeps the app familiar for local users while keeping any ad-supported content limited to pages with original English publisher content.',
          'The project is currently small and community-oriented. It is operated as a practical web application, not as a registered shelter or charity. Its impact goal is simple: make it easier for people in Georgia to find, share, and act on animal rescue information without turning the process into a confusing marketplace or a closed social feed.',
          'People can help by adding accurate listings, updating or reporting resolved cases, sharing profiles responsibly, meeting safely, and contacting professional services when an animal needs urgent medical or municipal help. For questions, corrections, or privacy requests, contact kodua.studio@gmail.com.',
        ]}
      />
      <FeatureGrid
        items={[
          { icon: PawPrint, title: 'Focused on dogs and cats', text: 'The MVP is designed around public reports for homeless, lost, or adoptable dogs and cats.' },
          { icon: HeartHandshake, title: 'Built for community action', text: 'Visitors can browse, save, share, map, and contact caretakers when public contact information is available.' },
          { icon: ShieldCheck, title: 'Moderation and privacy', text: 'Approximate locations, contact consent, deletion requests, and server-side admin tools reduce avoidable risk.' },
        ]}
      />
    </ContentShell>
  );
}

export function SafetyPage() {
  return (
    <ContentShell>
      <ArticleBlock
        title="Pet rescue safety guide"
        paragraphs={[
          'Helping an animal should not create unnecessary risk for the person who reports it, the person who responds, the owner, or the animal itself. mipove.me is designed around public information, so every listing should be written with privacy and safety in mind. A helpful listing gives enough detail for someone to understand the situation without exposing a private address, a personal routine, or sensitive information about another person.',
          'Location is one of the most sensitive parts of a rescue report. A street, district, park, or general landmark is usually enough for public browsing. Avoid posting an exact apartment, gate, yard, workplace, or private home unless you clearly want that point to be public and have permission to share it. The app uses public coordinate fields for map display so a listing can remain useful without turning a private point into a public target.',
          'Photos can also contain privacy risk. A photo may show a car plate, a home entrance, a child, a private yard, or a document in the background. Before publishing, choose a photo that identifies the animal clearly and removes unnecessary private context. If your browser or phone provides location metadata, it should be treated carefully. The application may use photo metadata locally to help suggest a location, but public uploads should not depend on hidden metadata for safety.',
          'Write descriptions that are useful and calm. Mention visible condition, behavior, collar or tag details, and whether the animal seems injured, scared, friendly, or aggressive. Do not accuse a person, publish private personal data, or make claims you cannot support. If ownership is uncertain, phrase it as a question or observation rather than a final conclusion.',
          'Contacting strangers requires caution. If a listing includes a phone number, use it only for the purpose of helping with that animal. Do not harass, spam, sell services, or reuse the number elsewhere. If you publish a phone number, make sure it is your number or that you have permission to make it public. If you receive calls, ask clear questions and avoid sharing your home address until trust is established.',
          'A safe first message is short and specific. Explain which listing you are asking about, where you saw it, and what help you can realistically provide. If you are the listing publisher, do not feel pressured to answer unrelated questions or send extra private information. If the conversation turns into a sales pitch, pressure tactic, or request for money unrelated to animal care, stop and use the review path if needed.',
          'Meetings should be planned carefully. When possible, meet in a public or safer place, bring another person, and keep the animal secure with a leash, carrier, or safe vehicle setup. Do not hand over an animal if the other person refuses basic verification, pressures you, asks for suspicious payment, or gives inconsistent information. For lost pets, ask for ownership evidence such as older photos, vaccination records, microchip information, or specific identifying details.',
          'Ownership verification protects both the animal and the person helping. A real owner should usually be able to describe details that are not obvious from the public listing, such as older markings, behavior, vet history, collar details, or the place and time the animal went missing. Avoid publishing every unique identifier in the public description, because some details are useful later for verification.',
          'Veterinary and municipal services remain important. If an animal is injured, poisoned, extremely weak, aggressive from pain, or in immediate danger, a public listing is not enough. Contact a veterinarian, municipal animal service, or emergency service where appropriate. mipove.me can help information reach people, but it is not an emergency responder and cannot guarantee rescue, treatment, adoption, or owner recovery.',
          'For adoption or fostering, use the same caution you would use with any serious responsibility. Ask where the animal will live, whether the person understands food, vaccination, sterilization, transport, and medical costs, and whether follow-up communication is acceptable. A kind tone matters, but safety and animal welfare matter more than speed.',
          'Before meeting someone, check five things: the public listing does not reveal a private address, the contact number is shared with permission, the animal is secured safely, another person knows where you are going, and the meeting purpose is clear. If any of these points feel wrong, slow down and ask for help from a trusted person or professional service.',
          'Deletion and review requests are part of safety. If a listing exposes private data, is fake, has been resolved, or creates risk, use the review path so an admin can hide it. Hidden listings may be retained temporarily for review, abuse prevention, legal/security needs, or technical recovery before permanent deletion under the retention process.',
        ]}
      />
      <FeatureGrid
        items={[
          { icon: MapPin, title: 'Keep places approximate', text: 'Share the useful area, not a private doorway or exact routine.' },
          { icon: Stethoscope, title: 'Use professionals for emergencies', text: 'Urgent medical or cruelty concerns need veterinary, municipal, or emergency help.' },
          { icon: ShieldCheck, title: 'Verify before handoff', text: 'Ask for clear ownership evidence and avoid unsafe or rushed transfers.' },
        ]}
      />
    </ContentShell>
  );
}

export function HowItWorksPage() {
  return (
    <ContentShell>
      <ArticleBlock
        title="How mipove.me helps pet rescue in Georgia"
        paragraphs={[
          'mipove.me is built around a simple flow: add a clear listing, browse nearby animal profiles, read the details, use the approximate map, contact responsibly, and request review when information becomes outdated. The goal is to reduce confusion in community rescue work, not to add another complicated social network.',
          'Step 1: browse pet profiles. The main app presents animals as swipe cards so visitors can move quickly through available listings. A card may include a photo, name, age, breed, general location, and a short hint to open more details. Visitors can like a pet, skip it, or open the map when they want to understand the general area.',
          'Step 2: read details before contacting. A profile can include personality, health notes, description, caretaker name, and caretaker phone when the publisher provided them. These fields are user-submitted, so they should be treated as helpful information rather than verified official records. Read the profile carefully before calling or arranging a meeting.',
          'Step 3: use approximate map locations. Public map markers are designed to show the area where help may be needed, not a guaranteed exact private point. Approximate public coordinates protect people while still helping rescuers understand distance, district, and likely travel time. If a listing seems too vague, contact the caretaker politely for context.',
          'Step 4: contact the caretaker responsibly. A phone number is public only when added to the listing. Use it only for the pet-related purpose. Ask direct questions: where was the animal last seen, is it still there, is it injured, is there a collar, is transport needed, and is there any proof of ownership if someone claims the animal.',
          'Step 5: meet safely and verify details. For lost pets, ask for older photos, vet documents, microchip information, or specific markings. For adoption or fostering, discuss expectations clearly and avoid rushed handoffs. If the animal is frightened or injured, prioritize containment and professional help over speed.',
          'Step 6: request review for outdated or wrong listings. A listing may need to be hidden if the pet was found, adopted, duplicated, fake, or unsafe. Public users can submit a review request. Admin tools then hide listings through server-side routes instead of giving broad delete access to ordinary browser clients.',
          'Frequently asked question: is mipove.me a shelter? No. It is an information platform. It does not physically house animals, provide veterinary treatment, or guarantee rescue outcomes. It helps people share and find information more easily.',
          'Frequently asked question: can I sell pets here? No. The platform is not for commercial sale, breeding, or marketplace activity. Listings should be about homeless, lost, adoptable, or help-needed animals.',
          'Frequently asked question: why are map locations approximate? Exact locations can expose a person, home, workplace, or animal to risk. Approximate locations preserve the practical value of the map while reducing avoidable privacy exposure.',
          'Frequently asked question: what if a pet needs urgent help? Contact the appropriate veterinary, municipal, or emergency service. A listing can spread information, but urgent medical or safety needs should not wait for app activity.',
          "Frequently asked question: why is a phone number sometimes missing? Contact information is optional. Some people may prefer to share information without publishing a number, or they may not have permission to publish another person's number.",
        ]}
      />
      <div className="mt-8 rounded-2xl border border-border/70 bg-card/70 p-5">
        <h2 className="text-lg font-semibold text-foreground">Typical flow</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          <li>1. Add a clear pet photo and short description.</li>
          <li>2. Select the general area on the map.</li>
          <li>3. Confirm permission for any public contact details.</li>
          <li>4. Browse, save, map, and contact caretakers responsibly.</li>
        </ol>
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link to="/app" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground">
          Open App <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/add" className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 font-semibold">
          Add Pet
        </Link>
      </div>
    </ContentShell>
  );
}

function ContentShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const showMobileAppCta = pathname === '/';

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
          <nav className="flex items-center gap-3 text-sm text-muted-foreground sm:gap-5">
            <Link to="/about" className="hidden hover:text-foreground sm:inline">About</Link>
            <Link to="/safety" className="hidden hover:text-foreground sm:inline">Safety</Link>
            <Link to="/how-it-works" className="hidden hover:text-foreground sm:inline">How it works</Link>
            <Link to="/ka" className="hidden hover:text-foreground md:inline">Georgian version</Link>
            <Link to="/app" className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90">
              App
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pb-20">{children}</div>
      {showMobileAppCta && (
        <div className="fixed inset-x-3 bottom-3 z-40 sm:hidden">
          <Link
            to="/app"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-2xl shadow-black/40"
          >
            Open App <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      )}
      <footer className="border-t border-border/60 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>mipove.me helps people share pet rescue information responsibly.</span>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/safety" className="hover:text-foreground">Safety</Link>
            <Link to="/how-it-works" className="hover:text-foreground">How it works</Link>
            <Link to="/ka/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ManualAdSlot({ slot }: { slot: string }) {
  useEffect(() => {
    if (!slot || !window.__mipoveCanLoadAds?.()) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      if (import.meta.env.DEV) console.warn('[adsense] ad push skipped');
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <aside className="my-10 rounded-2xl border border-border/60 bg-card/50 p-4">
      <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Advertisement</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5803703412690830"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
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
