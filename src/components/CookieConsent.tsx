import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  applyPrivacyConsent,
  getPrivacyConsent,
  savePrivacyConsent,
  type PrivacyConsentChoice,
} from '@/lib/privacyConsent';

export function CookieConsent() {
  const [choice, setChoice] = useState<PrivacyConsentChoice | null>(() =>
    typeof window === 'undefined' ? null : getPrivacyConsent()
  );

  useEffect(() => {
    applyPrivacyConsent(choice);
  }, [choice]);

  if (choice) return null;

  const save = (next: { analytics: boolean; ads: boolean }) => {
    setChoice(savePrivacyConsent(next));
  };

  return (
    <div className="fixed inset-x-3 bottom-20 z-[90] mx-auto max-w-lg glass-strong rounded-2xl border border-border/60 p-4 shadow-2xl sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">კონფიდენციალურობა</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            საიტის მუშაობისთვის ვიყენებთ მხოლოდ აუცილებელ ტექნიკურ შენახვას. ანალიტიკა და რეკლამა ჩაირთვება მხოლოდ თქვენი თანხმობის შემთხვევაში.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => save({ analytics: true, ads: true })}
              className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98] sm:flex-1"
            >
              ვეთანხმები
            </button>
            <button
              type="button"
              onClick={() => save({ analytics: false, ads: false })}
              className="h-10 rounded-full bg-secondary/80 px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              მხოლოდ აუცილებელი
            </button>
            <a href="/ka/privacy" className="self-center text-xs text-muted-foreground underline sm:ml-auto">
              კონფიდენციალურობა
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
