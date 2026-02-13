import 'client-only';

export const COOKIE_CONSENT_KEY = 'cookie_consent';
export const CONSENT_UPDATED_EVENT = 'cookie-consent-updated';

export type ConsentValue = 'granted' | 'denied';
export type ConsentSnapshot = ConsentValue | null;
type ConsentStorageValue = 'granted' | 'denied';

declare global {
  interface Window {
    gtag?: (
      action: 'consent',
      state: 'default' | 'update',
      params: {
        ad_storage: ConsentStorageValue;
        analytics_storage: ConsentStorageValue;
        ad_user_data: ConsentStorageValue;
        ad_personalization: ConsentStorageValue;
        wait_for_update?: number;
      },
    ) => void;
  }
}

export function getCookieConsentSnapshot(): ConsentSnapshot {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (value === 'granted' || value === 'denied') {
    return value;
  }

  return null;
}

export function getCookieConsentServerSnapshot(): ConsentSnapshot {
  return null;
}

export function subscribeCookieConsent(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const onConsentUpdated = () => onStoreChange();
  const onStorageChange = (event: StorageEvent) => {
    if (event.key === COOKIE_CONSENT_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  window.addEventListener('storage', onStorageChange);

  return () => {
    window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    window.removeEventListener('storage', onStorageChange);
  };
}

export function setCookieConsent(value: ConsentValue) {
  if (typeof window === 'undefined') {
    return;
  }

  const win = window as Window & { dataLayer?: unknown[] };
  const consentState: ConsentStorageValue =
    value === 'granted' ? 'granted' : 'denied';
  const consentPayload = {
    ad_storage: consentState,
    analytics_storage: consentState,
    ad_user_data: consentState,
    ad_personalization: consentState,
  };

  if (typeof win.gtag === 'function') {
    win.gtag('consent', 'update', consentPayload);
  } else {
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(['consent', 'update', consentPayload]);
  }

  window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT));
}
