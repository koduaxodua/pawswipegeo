export interface PrivacyConsentChoice {
  analytics: boolean;
  ads: boolean;
  decidedAt: string;
}

export const PRIVACY_CONSENT_KEY = 'mipove_privacy_consent_v1';
export const GA_MEASUREMENT_ID = 'G-3VB5CW2P6K';
export const ADSENSE_CLIENT = 'ca-pub-5803703412690830';
const ADS_ALLOWED_PATHS = new Set(['/', '/about', '/safety', '/how-it-works']);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    adsbygoogle?: unknown[];
    __mipoveGaLoaded?: boolean;
    __mipoveAdsLoaded?: boolean;
  }
}

export function getPrivacyConsent(): PrivacyConsentChoice | null {
  try {
    const raw = localStorage.getItem(PRIVACY_CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePrivacyConsent(choice: Omit<PrivacyConsentChoice, 'decidedAt'>): PrivacyConsentChoice {
  const next = { ...choice, decidedAt: new Date().toISOString() };
  localStorage.setItem(PRIVACY_CONSENT_KEY, JSON.stringify(next));
  applyPrivacyConsent(next);
  return next;
}

export function applyPrivacyConsent(choice: PrivacyConsentChoice | null): void {
  const analytics = Boolean(choice?.analytics);
  const ads = Boolean(choice?.ads);
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer?.push(arguments); };
  window.gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: ads ? 'granted' : 'denied',
    ad_user_data: ads ? 'granted' : 'denied',
    ad_personalization: ads ? 'granted' : 'denied',
  });

  if (analytics) loadGoogleAnalytics();
  if (ads && isAdsAllowedOnCurrentPage()) loadGoogleAds();
}

export function isAdsAllowedOnCurrentPage(): boolean {
  if (typeof window === 'undefined') return false;
  return ADS_ALLOWED_PATHS.has(window.location.pathname);
}

function appendScript(src: string, attrs: Record<string, string> = {}): void {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
  document.head.appendChild(script);
}

function loadGoogleAnalytics(): void {
  if (window.__mipoveGaLoaded) return;
  window.__mipoveGaLoaded = true;
  appendScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
  window.gtag?.('js', new Date());
  window.gtag?.('config', GA_MEASUREMENT_ID);
}

function loadGoogleAds(): void {
  if (window.__mipoveAdsLoaded) return;
  window.__mipoveAdsLoaded = true;
  window.adsbygoogle = window.adsbygoogle || [];
  appendScript(
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
    { crossorigin: 'anonymous' }
  );
}
