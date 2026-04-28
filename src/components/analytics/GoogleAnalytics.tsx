"use client";

import Script from "next/script";

interface GoogleAnalyticsProps {
  gaId?: string | null;
  gaScript?: string | null;
}

export function GoogleAnalytics({ gaId, gaScript }: GoogleAnalyticsProps) {
  if (!gaId && !gaScript) return null;

  if (gaScript) {
    // Använd custom script om det finns
    return (
      <Script
        id="ga-custom"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: gaScript }}
      />
    );
  }

  // Standard GA4 script
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}
