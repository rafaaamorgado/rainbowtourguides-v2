'use client';

import Script from 'next/script';

const GTM_ID = 'GTM-T8FF7SXH';

const consentModeScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),
      dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  if (f && f.parentNode) {
    f.parentNode.insertBefore(j,f);
  }
})(window,document,'script','dataLayer','${GTM_ID}');
`;

export function ConsentManager() {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="consent-mode" strategy="beforeInteractive">
      {consentModeScript}
    </Script>
  );
}
