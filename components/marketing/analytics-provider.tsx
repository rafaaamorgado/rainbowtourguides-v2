'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { useEffect, useState } from 'react';

const COOKIE_CONSENT_KEY = 'cookie_consent';
const CONSENT_UPDATED_EVENT = 'cookie-consent-updated';

export function AnalyticsProvider() {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const syncConsentFromStorage = () => {
      const consent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      setConsentGiven(consent === 'granted');
    };

    syncConsentFromStorage();
    window.addEventListener(CONSENT_UPDATED_EVENT, syncConsentFromStorage);

    return () => {
      window.removeEventListener(CONSENT_UPDATED_EVENT, syncConsentFromStorage);
    };
  }, []);

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!consentGiven || !gaId) {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}
