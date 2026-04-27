import { useLocale } from '@/contexts/Locale';

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex items-center bg-secondary/60 backdrop-blur rounded-full p-0.5 border border-border/50 text-xs font-bold">
      <button
        onClick={() => setLocale('ka')}
        className={`px-3 py-1 min-h-8 rounded-full transition ${
          locale === 'ka'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={locale === 'ka'}
      >
        ქარ
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 min-h-8 rounded-full transition ${
          locale === 'en'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  );
}
