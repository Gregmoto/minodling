"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { readConsent, type CookieConsent } from "@/lib/cookieConsent";

interface AnalyticsScriptsProps {
  gaId?:      string | null;
  gaScript?:  string | null;
  bingId?:    string | null;
}

/**
 * Laddar tracking-scripts villkorligt baserat på cookie-samtycke.
 *
 * - Lyssnar på "cookie-consent-updated"-event för att reagera utan sidomladdning.
 * - Om inget samtycke finns laddas inget.
 * - Google Analytics laddas vid analytics=true
 * - Bing laddas vid marketing=true
 */
export function AnalyticsScripts({ gaId, gaScript, bingId }: AnalyticsScriptsProps) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    // Läs nuvarande samtycke
    setConsent(readConsent());

    // Reagera när användaren ändrar samtycke utan sidomladdning
    function onUpdate(e: Event) {
      setConsent((e as CustomEvent<CookieConsent>).detail);
    }
    window.addEventListener("cookie-consent-updated", onUpdate);
    return () => window.removeEventListener("cookie-consent-updated", onUpdate);
  }, []);

  // Inget samtycke = ingen tracking
  if (!consent) return null;

  return (
    <>
      {/* ── Google Analytics ── */}
      {consent.analytics && (gaId || gaScript) && (
        <>
          {gaScript ? (
            <Script
              id="ga-custom"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: gaScript }}
            />
          ) : gaId ? (
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
                    gtag('config', '${gaId}', {
                      page_path: window.location.pathname,
                      anonymize_ip: true
                    });
                  `,
                }}
              />
            </>
          ) : null}
        </>
      )}

      {/* ── Bing / Microsoft (marknadsföring) ── */}
      {consent.marketing && bingId && (
        <Script
          id="bing-uet"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,t,r,u){
                var f,n,i;
                w[u]=w[u]||[],f=function(){
                  var o={ti:"${bingId}"};
                  o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")
                },
                n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){
                  var s=this.readyState;
                  s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)
                },
                i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)
              })(window,document,"script","//bat.bing.com/bat.js","uetq");
            `,
          }}
        />
      )}
    </>
  );
}
