/**
 * Samlar alla Google-taggar i <head> i rätt ordning. Server-renderat så att
 * Consent Mode-defaulten garanterat kör FÖRE AdSense/GA, och så att AdSense-
 * scriptet syns direkt för Googles crawler.
 *
 * Samtycke hanteras av Googles publicerade "European regulations message" (CMP),
 * som via Consent Mode v2 uppdaterar signalerna nedan för EES/UK/CH-besökare.
 * Standard = "denied" tills CMP uppdaterar → inga annons-/analytics-cookies utan
 * samtycke. Utanför EES visas ingen CMP och signalerna förblir "denied"
 * (GA kör då i cookielöst modelleringsläge).
 */
interface GoogleTagsProps {
  gaId?:     string | null;
  gaScript?: string | null;
}

export function GoogleTags({ gaId, gaScript }: GoogleTagsProps) {
  return (
    <>
      {/* 1. Consent Mode v2 – måste köra före alla andra Google-taggar */}
      <script
        id="google-consent-default"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
            gtag('set', 'ads_data_redaction', true);
            gtag('set', 'url_passthrough', true);
          `,
        }}
      />

      {/* 2. Google AdSense */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6174495278181413"
        crossOrigin="anonymous"
      />

      {/* 3. Google Analytics (om konfigurerat) – respekterar Consent Mode ovan */}
      {gaScript ? (
        <script dangerouslySetInnerHTML={{ __html: gaScript }} />
      ) : gaId ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script
            id="ga-init"
            dangerouslySetInnerHTML={{
              __html: `
                gtag('js', new Date());
                gtag('config', '${gaId}', { anonymize_ip: true });
              `,
            }}
          />
        </>
      ) : null}
    </>
  );
}
