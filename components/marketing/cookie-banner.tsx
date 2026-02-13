'use client';

import { useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import {
  CONSENT_UPDATED_EVENT,
  COOKIE_CONSENT_KEY,
  getCookieConsentServerSnapshot,
  getCookieConsentSnapshot,
  setCookieConsent,
  subscribeCookieConsent,
} from '@/components/marketing/cookie-consent';

export function CookieBanner() {
  const consent = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    getCookieConsentServerSnapshot,
  );

  if (consent) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-[400px]">
      <div className="rounded-2xl border border-white/20 bg-white/90 p-5 shadow-2xl backdrop-blur-xl">
        <p className="text-sm text-zinc-900">
          We use cookies to improve your experience.
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-zinc-300 bg-transparent text-zinc-700 hover:bg-zinc-100"
            onClick={() => setCookieConsent('denied')}
          >
            Decline
          </Button>

          <Button
            type="button"
            className="bg-zinc-900 text-white hover:bg-zinc-800"
            onClick={() => {
              window.localStorage.setItem(COOKIE_CONSENT_KEY, 'granted');
              window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT));
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
