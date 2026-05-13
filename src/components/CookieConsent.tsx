import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import {
  applyPrivacyConsent,
  getPrivacyConsent,
  savePrivacyConsent,
  type PrivacyConsentChoice,
} from '@/lib/privacyConsent';

const ADS_ALLOWED_PATHS = new Set(['/2', '/2/about', '/2/safety', '/2/how-it-works']);

export function CookieConsent() {
  const { pathname } = useLocation();
  const allowAds = ADS_ALLOWED_PATHS.has(pathname);
  const englishUi = allowAds;
  const [choice, setChoice] = useState<PrivacyConsentChoice | null>(() =>
    typeof window === 'undefined' ? null : getPrivacyConsent()
  );

  useEffect(() => {
    applyPrivacyConsent(choice);
  }, [choice, pathname]);

  if (choice) return null;

  const save = (next: { analytics: boolean; ads: boolean }) => {
    const safeChoice = {
      analytics: next.analytics,
      ads: allowAds ? next.ads : false,
    };

    if (import.meta.env.DEV) {
      console.log('[consent] saved', {
        pathname,
        analytics: safeChoice.analytics,
        adsAllowedOnRoute: allowAds,
        adsEnabled: safeChoice.ads,
      });
    }

    setChoice(savePrivacyConsent(safeChoice, { allowAds }));
  };

  return (
    <div className="fixed inset-x-3 bottom-24 z-[90] mx-auto max-w-lg glass-strong rounded-2xl border border-border/60 p-4 shadow-2xl sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">
            {englishUi ? 'Privacy choices' : 'კონფიდენციალურობა'}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {englishUi
              ? 'We use essential storage for the site. Analytics and ads are enabled only after your consent and only on English content pages.'
              : 'საიტის მუშაობისთვის ვიყენებთ აუცილებელ ტექნიკურ შენახვას. ანალიტიკა და რეკლამა ჩაირთვება მხოლოდ თქვენი თანხმობით.'}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => save({ analytics: true, ads: true })}
              className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98] sm:flex-1"
            >
              {englishUi ? 'Accept' : 'ვეთანხმები'}
            </button>
            <button
              type="button"
              onClick={() => save({ analytics: false, ads: false })}
              className="h-10 rounded-full bg-secondary/80 px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              {englishUi ? 'Essential only' : 'მხოლოდ აუცილებელი'}
            </button>
            <Link to="/ka/privacy" className="self-center text-xs text-muted-foreground underline sm:ml-auto">
              {englishUi ? 'Privacy' : 'კონფიდენციალურობა'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
