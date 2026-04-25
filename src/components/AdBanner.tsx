import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { useLocale } from '@/contexts/Locale';

interface AdBannerProps {
  onDismiss: () => void;
}

// Replace with your real AdSense publisher ID & slot.
const ADSENSE_CLIENT = 'ca-pub-0000000000000000';
const ADSENSE_SLOT = '0000000000';

const isAdSenseConfigured =
  ADSENSE_CLIENT !== 'ca-pub-0000000000000000' && ADSENSE_SLOT !== '0000000000';

const SKIP_SECONDS = 3;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdBanner({ onDismiss }: AdBannerProps) {
  const { locale } = useLocale();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [skipIn, setSkipIn] = useState(SKIP_SECONDS);

  useEffect(() => {
    if (!isAdSenseConfigured || pushed.current) return;
    try {
      if (typeof window !== 'undefined' && Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // adsense not loaded yet — fallback shown below
    }
  }, []);

  useEffect(() => {
    if (skipIn <= 0) return;
    const id = setInterval(() => setSkipIn(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [skipIn]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 rounded-3xl glass-strong overflow-hidden flex flex-col"
    >
      {/* Top label */}
      <div className="flex-shrink-0 pt-3 pb-1 text-center text-[10px] uppercase tracking-wider text-foreground/50">
        {locale === 'en' ? 'Ad' : 'რეკლამა'}
      </div>

      {/* Middle scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col items-center justify-center text-center gap-3">
        {isAdSenseConfigured && (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '200px' }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}

        <PawPrint className="h-10 w-10 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground leading-snug">
          {locale === 'en' ? 'Best food for your pet 🐾' : 'ცხოველების საუკეთესო საკვები 🐾'}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed">
          {locale === 'en'
            ? 'High-quality food and accessories for your four-legged friend'
            : 'მაღალი ხარისხის საკვები და აქსესუარები შენი ოთხფეხა მეგობრისთვის'}
        </p>
        <span className="text-[10px] text-muted-foreground/60">
          {locale === 'en' ? '(ad slot)' : '(სარეკლამო ადგილი)'}
        </span>
      </div>

      {/* Sticky bottom continue button — always visible */}
      <div className="flex-shrink-0 px-4 pt-2 pb-4 border-t border-border/30">
        <button
          onClick={onDismiss}
          disabled={skipIn > 0}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {skipIn > 0
            ? locale === 'en'
              ? `Skip in ${skipIn}s`
              : `გამოტოვება ${skipIn} წმ-ში`
            : locale === 'en'
            ? 'Continue →'
            : 'გაგრძელება →'}
        </button>
      </div>
    </motion.div>
  );
}
