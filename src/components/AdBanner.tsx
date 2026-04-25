import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { useLocale } from '@/contexts/Locale';

interface AdBannerProps {
  onDismiss: () => void;
}

// Replace with your real AdSense publisher ID & slot
const ADSENSE_CLIENT = 'ca-pub-0000000000000000';
const ADSENSE_SLOT = '0000000000';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdBanner({ onDismiss }: AdBannerProps) {
  const { locale } = useLocale();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (typeof window !== 'undefined' && Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // adsense not loaded yet — fallback shown below
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl glass-strong p-6 text-center"
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-primary-foreground/50">
        {locale === 'en' ? 'Ad' : 'რეკლამა'}
      </div>

      {/* Real AdSense unit */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '250px' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      {/* Fallback / themed pet-care creative shown when AdSense not active */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <PawPrint className="h-10 w-10 text-primary" />
        <h3 className="text-lg font-semibold text-primary-foreground">
          {locale === 'en' ? 'Best food for your pet 🐾' : 'ცხოველების საუკეთესო საკვები 🐾'}
        </h3>
        <p className="text-sm text-primary-foreground/70 max-w-xs">
          {locale === 'en'
            ? 'High-quality food and accessories for your four-legged friend'
            : 'მაღალი ხარისხის საკვები და აქსესუარები შენი ოთხფეხა მეგობრისთვის'}
        </p>
        <span className="text-xs text-primary-foreground/40">
          {locale === 'en' ? '(Ad slot — pet care)' : '(სარეკლამო ადგილი — pet სფეროს რეკლამები)'}
        </span>
      </div>

      <button
        onClick={onDismiss}
        className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
      >
        {locale === 'en' ? 'Continue →' : 'გაგრძელება →'}
      </button>
    </motion.div>
  );
}
