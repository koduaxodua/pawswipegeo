import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Locale = 'ka' | 'en';

const STORAGE_KEY = 'pawswipe_locale';

const detectLocale = (): Locale => {
  if (typeof window === 'undefined') return 'ka';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'ka' || stored === 'en') return stored;
  // Auto-detect: Georgian browsers → ka, everyone else → en
  const lang = (navigator.language || 'en').toLowerCase();
  return lang.startsWith('ka') ? 'ka' : 'en';
};

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey, params?: Record<string, string | number>) => string;
}

const Ctx = createContext<LocaleCtx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  };

  const t: LocaleCtx['t'] = (key, params) => {
    const entry = TRANSLATIONS[key];
    let str: string = entry ? entry[locale] : key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocale must be inside LocaleProvider');
  return ctx;
}

// Translation helper export — saves boilerplate at call sites
export function useT() {
  return useLocale().t;
}

// === Translations ===
const TRANSLATIONS = {
  // App
  'app.title':              { ka: 'Pet Rescue Georgia', en: 'Pet Rescue Georgia' },
  'app.tagline':            { ka: 'მიუსაფარი ცხოველების მიკედლება', en: 'Adopt a homeless pet' },

  // Navigation
  'nav.swipe':              { ka: 'სვაიპი', en: 'Swipe' },
  'nav.favorites':          { ka: 'მოწონებული', en: 'Liked' },
  'nav.add':                { ka: 'დამატება', en: 'Add' },
  'nav.missions':           { ka: 'მისიები', en: 'Missions' },
  'nav.terms':              { ka: 'პირობები', en: 'Terms' },

  // Index page
  'index.allSwiped.title':  { ka: 'ყველა ცხოველი ნანახია!', en: "You've seen them all!" },
  'index.allSwiped.stats':  { ka: '❤️ მოწონებული: {liked} · ✕ გამოტოვებული: {disliked}', en: '❤️ Liked: {liked} · ✕ Skipped: {disliked}' },
  'index.allSwiped.hint':   { ka: 'შეგიძლია გამოტოვებულები დააბრუნო ან ახალი ცხოველი დაამატო', en: 'You can bring back skipped pets or add a new one' },
  'index.resetDisliked':    { ka: 'გამოტოვებულების დაბრუნება', en: 'Bring back skipped' },
  'index.action.skip':      { ka: 'გამოტოვება', en: 'Skip' },
  'index.action.like':      { ka: 'მოწონება', en: 'Like' },
  'index.action.map':       { ka: 'რუკა', en: 'Map' },
  'index.toast.liked':      { ka: '{name} მოწონებულია! ❤️', en: '{name} liked! ❤️' },
  'index.toast.reset':      { ka: 'გამოტოვებული ცხოველები დაბრუნდა 🔄', en: 'Skipped pets restored 🔄' },

  // Swipe card
  'card.like':              { ka: 'მომწონს ❤️', en: 'LIKE ❤️' },
  'card.nope':              { ka: 'შემდეგი ✕', en: 'NOPE ✕' },
  'card.tapHint':           { ka: 'შეეხე დეტალებისთვის', en: 'Tap for details' },

  // Favorites
  'favorites.title':        { ka: 'ჩემი არჩევანი', en: 'My picks' },
  'favorites.tab.liked':    { ka: 'მოწონებული ({n})', en: 'Liked ({n})' },
  'favorites.tab.disliked': { ka: 'გამოტოვებული ({n})', en: 'Skipped ({n})' },
  'favorites.empty.liked.title':    { ka: 'ჯერ არაფერი მოგწონებია', en: 'No likes yet' },
  'favorites.empty.liked.sub':      { ka: 'სვაიპე მარჯვნივ ან დააჭირე ❤️, რომ მოიწონო ცხოველი', en: 'Swipe right or tap ❤️ to like a pet' },
  'favorites.empty.disliked.title': { ka: 'არცერთი ცხოველი არ გამოგიტოვებია', en: "You haven't skipped any" },
  'favorites.empty.disliked.sub':   { ka: 'აქ აისახება ის ცხოველები, რომლებსაც მარცხნივ სვაიპავ', en: 'Pets you swipe left will appear here' },
  'favorites.move.toDisliked':      { ka: 'გადატანა გამოტოვებულებში', en: 'Move to skipped' },
  'favorites.move.toLiked':         { ka: 'გადატანა მოწონებულებში', en: 'Move to liked' },
  'favorites.delete':       { ka: 'წაშლა', en: 'Delete' },

  // AddDog form
  'addDog.title':           { ka: 'ცხოველის დამატება', en: 'Add a pet' },
  'addDog.photo':           { ka: 'ფოტო *', en: 'Photo *' },
  'addDog.upload':          { ka: 'ფოტოს ატვირთვა', en: 'Upload photo' },
  'addDog.upload.hint':     { ka: 'მაქს. 10MB, ავტო-კომპრესია', en: 'Max 10MB, auto-compressed' },
  'addDog.uploading':       { ka: 'მუშავდება...', en: 'Processing...' },
  'addDog.field.name':      { ka: 'სახელი *', en: 'Name *' },
  'addDog.field.namePh':    { ka: 'მაგ: ბობი', en: 'e.g. Bobby' },
  'addDog.field.age':       { ka: 'ასაკი', en: 'Age' },
  'addDog.field.agePh':     { ka: 'მაგ: 2 წელი', en: 'e.g. 2 years' },
  'addDog.field.breed':     { ka: 'ჯიში', en: 'Breed' },
  'addDog.field.breedPh':   { ka: 'მაგ: ნარევი', en: 'e.g. Mixed' },
  'addDog.field.gender':    { ka: 'სქესი', en: 'Sex' },
  'addDog.gender.male':     { ka: '♂ მამრობითი', en: '♂ Male' },
  'addDog.gender.female':   { ka: '♀ მდედრობითი', en: '♀ Female' },
  'addDog.field.personality':   { ka: 'ხასიათი', en: 'Personality' },
  'addDog.field.personalityPh': { ka: 'მაგ: მეგობრული, მშვიდი', en: 'e.g. friendly, calm' },
  'addDog.field.health':    { ka: 'ჯანმრთელობა', en: 'Health' },
  'addDog.field.healthPh':  { ka: 'მაგ: აცრილი, ჯანმრთელი', en: 'e.g. vaccinated, healthy' },
  'addDog.field.description':   { ka: 'აღწერა', en: 'Description' },
  'addDog.field.descriptionPh': { ka: 'მოკლე აღწერა ცხოველის შესახებ...', en: 'Short description of the pet...' },
  'addDog.field.caretakerName':   { ka: 'თქვენი სახელი', en: 'Your name' },
  'addDog.field.caretakerNamePh': { ka: 'მაგ: ნინო', en: 'e.g. Nina' },
  'addDog.field.phone':     { ka: 'საკონტაქტო ნომერი *', en: 'Contact phone *' },
  'addDog.field.phonePh':   { ka: '+995 5XX XX XX XX', en: '+995 5XX XX XX XX' },
  'addDog.submit':          { ka: 'ცხოველის დამატება', en: 'Add the pet' },
  'addDog.submitting':      { ka: 'იტვირთება...', en: 'Uploading...' },
  'addDog.toast.success':   { ka: '{name} წარმატებით დაემატა! 🐾', en: '{name} added successfully! 🐾' },
  'addDog.toast.requiredFields': { ka: 'გთხოვთ შეავსოთ სავალდებულო ველები და აირჩიოთ ლოკაცია რუკაზე', en: 'Please fill required fields and pick a location on the map' },
  'addDog.toast.notImage':  { ka: 'გთხოვთ აირჩიოთ სურათი', en: 'Please select an image' },
  'addDog.toast.tooBig':    { ka: 'სურათი ძალიან დიდია (მაქს. 10MB)', en: 'Image too large (max 10MB)' },
  'addDog.toast.uploaded':  { ka: 'ფოტო ატვირთულია ({size}KB) ✓', en: 'Photo uploaded ({size}KB) ✓' },
  'addDog.toast.failed':    { ka: 'ფოტოს დამუშავება ვერ მოხერხდა', en: 'Image processing failed' },
  'addDog.toast.addFailed': { ka: 'დამატება ვერ მოხერხდა: {error}', en: 'Could not add: {error}' },
  'addDog.gender.value.male':   { ka: 'მამრობითი', en: 'Male' },
  'addDog.gender.value.female': { ka: 'მდედრობითი', en: 'Female' },

  // Dog detail
  'detail.section.description':  { ka: 'აღწერა', en: 'Description' },
  'detail.section.personality':  { ka: 'ხასიათი', en: 'Personality' },
  'detail.section.health':       { ka: 'ჯანმრთელობა', en: 'Health' },
  'detail.section.caretaker':    { ka: 'მიმკედლებელი', en: 'Caretaker' },
  'detail.label.age':            { ka: 'ასაკი', en: 'Age' },
  'detail.label.gender':         { ka: 'სქესი', en: 'Sex' },
  'detail.label.location':       { ka: 'ლოკაცია', en: 'Location' },
  'detail.label.breed':          { ka: 'ჯიში', en: 'Breed' },
  'detail.deleteRequest':        { ka: 'წაშლის თხოვნის გაგზავნა', en: 'Request deletion' },
  'detail.deleteRequest.cancel': { ka: 'წაშლის თხოვნა გაგზავნილია — გაუქმება', en: 'Deletion requested — cancel' },
  'detail.deleteRequest.toast':  { ka: '🗑 წაშლის თხოვნა გაგზავნილია', en: '🗑 Deletion requested' },
  'detail.deleteRequest.cancelToast': { ka: 'წაშლის თხოვნა გაუქმდა', en: 'Deletion request cancelled' },

  // Map
  'map.title':              { ka: 'ცხოველები რუკაზე ({n})', en: 'Pets on map ({n})' },
  'map.locating':           { ka: 'მდებარეობის ძებნა...', en: 'Locating you...' },
  'map.list.nearby':        { ka: 'შენთან ახლოს', en: 'Near you' },
  'map.list.all':           { ka: 'ცხოველების სია', en: 'All pets' },
  'map.popcard.hint':       { ka: 'დააჭირე → სრული პროფილი', en: 'Tap → full profile' },
  'map.fromYou':            { ka: 'შენგან', en: 'from you' },
  'map.unitMeters':         { ka: 'მ', en: 'm' },
  'map.unitKm':             { ka: 'კმ', en: 'km' },
  'map.recenter':           { ka: 'ჩემი მდებარეობა', en: 'My location' },

  // Tutorial
  'tutorial.skip':          { ka: 'გამოტოვება', en: 'Skip' },
  'tutorial.next':          { ka: 'შემდეგი', en: 'Next' },
  'tutorial.start':         { ka: 'დაწყება', en: 'Get started' },
  'tutorial.s1.title':      { ka: 'მოგესალმებით 🐾', en: 'Welcome 🐾' },
  'tutorial.s1.desc':       { ka: 'Pet Rescue Georgia — სვაიპით იპოვე შენი ახალი ოთხფეხა მეგობარი.', en: 'Pet Rescue Georgia — swipe to find your new four-legged friend.' },
  'tutorial.s2.title':      { ka: 'მარჯვნივ — მომწონს', en: 'Right — Like' },
  'tutorial.s2.desc':       { ka: 'სვაიპე ბარათი მარჯვნივ ან დააჭირე ❤️ ღილაკს, რომ მოიწონო ცხოველი. იპოვი მათ "მოწონებულ" გვერდზე.', en: 'Swipe the card right or tap ❤️ to like a pet. Find them on the "Liked" page.' },
  'tutorial.s3.title':      { ka: 'მარცხნივ — შემდეგი', en: 'Left — Next' },
  'tutorial.s3.desc':       { ka: 'სვაიპე მარცხნივ ან დააჭირე ✕ ღილაკს, რომ შემდეგზე გადახვიდე.', en: 'Swipe left or tap ✕ to move to the next pet.' },
  'tutorial.s4.title':      { ka: 'ცხოველის დამატება', en: 'Add a pet' },
  'tutorial.s4.desc':       { ka: 'ქვედა მენიუში "+" ღილაკი — თუ იცნობ მიუსაფარ ცხოველს, აიტვირთე მისი ფოტო და მონაცემები. ყველა მომხმარებელი ნახავს.', en: 'Tap "+" in the bottom menu — if you know a homeless pet, upload its photo and details. Everyone will see it.' },

  // Admin
  'admin.title':            { ka: 'ადმინ რეჟიმი', en: 'Admin mode' },
  'admin.subtitle':         { ka: 'გვერდის რეფრეშზე გაქრება', en: 'Disappears on page refresh' },
  'admin.exit':             { ka: 'გასვლა', en: 'Exit' },
  'admin.heading':          { ka: 'წაშლის თხოვნები ({n})', en: 'Delete requests ({n})' },
  'admin.empty.title':      { ka: 'წაშლის თხოვნები არ არის.', en: 'No delete requests.' },
  'admin.empty.sub':        { ka: 'მომხმარებლები ცხოველის პროფილიდან გზავნიან თხოვნებს.', en: 'Users send requests from a pet profile.' },
  'admin.clearAll':         { ka: 'სიის გასუფთავება', en: 'Clear list' },
  'admin.clearAll.confirm': { ka: 'ყველა თხოვნის გასუფთავება?', en: 'Clear all requests?' },
  'admin.profile':          { ka: 'პროფილი', en: 'Profile' },
  'admin.delete':           { ka: 'წაშლა', en: 'Delete' },
  'admin.deleting':         { ka: 'იშლება...', en: 'Deleting...' },
  'admin.delete.confirm':   { ka: 'დარწმუნებული ხარ, რომ გინდა "{name}"-ის სამუდამოდ წაშლა?', en: 'Are you sure you want to permanently delete "{name}"?' },
  'admin.modeOn':           { ka: '🔓 ადმინ რეჟიმი ჩართულია', en: '🔓 Admin mode unlocked' },
  'admin.cleared':          { ka: 'სია გასუფთავდა', en: 'List cleared' },
  'admin.deleted.db':       { ka: '{name} წაშლილია DB-დან ✓', en: '{name} deleted from DB ✓' },
  'admin.deleted.local':    { ka: '{name} წაშლილია (ლოკალურად)', en: '{name} deleted (locally)' },
  'admin.delete.rls':       { ka: 'წაშლა DB-დან ვერ მოხერხდა', en: 'Delete from DB failed' },
  'admin.delete.rlsDesc':   { ka: 'RLS პოლისი მხოლოდ ატვირთვის ავტორს უშვებს. გამოიყენე Supabase Studio.', en: 'RLS only allows the original uploader. Use Supabase Studio.' },

  // LocationPicker
  'loc.title':              { ka: 'ლოკაცია *', en: 'Location *' },
  'loc.useGPS':             { ka: 'მიმდინარე ლოკაცია', en: 'Current location' },
  'loc.locating':           { ka: 'იძებნება...', en: 'Locating...' },
  'loc.search':             { ka: 'მისამართის ძებნა...', en: 'Search address...' },
  'loc.searching':          { ka: 'იძებნება...', en: 'Searching...' },
  'loc.noResults':          { ka: 'შედეგები არ მოიძებნა', en: 'No results' },
  'loc.gpsFailed':          { ka: 'ლოკაცია ვერ მოიძებნა', en: 'Could not get location' },
  'loc.gpsBlocked':         { ka: 'GPS დაბლოკილია ბრაუზერში', en: 'GPS is blocked in the browser' },
  'loc.selected':           { ka: 'არჩეული:', en: 'Selected:' },

  // Missions
  'missions.title':         { ka: 'მისიები', en: 'Missions' },
  'missions.soon.badge':    { ka: 'შემუშავება მიმდინარეობს', en: 'In development' },
  'missions.soon.text':     { ka: 'ჩელენჯები, XP და ლიდერბორდი მალე ჩაირთვება.', en: 'Challenges, XP, and leaderboard coming soon.' },

  // Misc
  'common.cancel':          { ka: 'გაუქმება', en: 'Cancel' },
  'common.confirm':         { ka: 'დადასტურება', en: 'Confirm' },
  'common.back':            { ka: 'უკან', en: 'Back' },
  'common.close':           { ka: 'დახურვა', en: 'Close' },
  'common.loading':         { ka: 'იტვირთება...', en: 'Loading...' },
  'common.error':           { ka: 'შეცდომა', en: 'Error' },

  // Ad banner
  'ad.skipIn':              { ka: 'რეკლამა · გამოტოვება {seconds} წმ-ში', en: 'Ad · skip in {seconds}s' },
  'ad.skip':                { ka: 'გამოტოვება', en: 'Skip' },

  // 404
  'notFound.title':         { ka: 'გვერდი ვერ მოიძებნა', en: 'Page not found' },
  'notFound.back':          { ka: 'მთავარზე დაბრუნება', en: 'Back home' },
} as const;

export type TKey = keyof typeof TRANSLATIONS;
