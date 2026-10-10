# Min Odling – iOS-app

Appen är ett Capacitor-skal som visar den publicerade sajten, plus native-
funktioner som webben inte kan ge: push-notiser, kamera, lokal lagring.

**Status: appen bygger och kör i simulatorn med eget app-skal.** Flikfält i
botten, egen menysida och dold webbnavigering. Push-dialogen verifierad i
simulator; själva leveransen av notiser kräver fysisk enhet.

---

## Snabbstart

```bash
npx cap sync ios                 # efter ändringar i webbappen eller plugins
cd ios/App && pod install        # efter att plugins lagts till/tagits bort
open ios/App/App.xcworkspace     # öppna i Xcode
```

> Öppna alltid **`.xcworkspace`**, aldrig `.xcodeproj` – projektet använder
> CocoaPods.

Bygga från terminalen:

```bash
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  CODE_SIGNING_ALLOWED=NO build
```

### Om `pod install` kraschar

CocoaPods kräver UTF-8-locale. Går det fel med
`Unicode Normalization not appropriate for ASCII-8BIT`:

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install
```

### Varför CocoaPods och inte SPM

Capacitor 8 använder Swift Package Manager som standard, men på den här
maskinen låser sig `xcodebuild` permanent på *"Resolve Package Graph"* –
0 % CPU, ingen timeout, inget felmeddelande. CocoaPods installerar samma
13 beroenden på några sekunder. Byt inte tillbaka utan att testa.

---

## Arkitektur

Webbappen är server-renderad och kan inte paketeras statiskt, så appen laddar
`https://minodling.se` i en webbvy (`server.url` i `capacitor.config.ts`).
Det native-värde som gör appen till mer än en webbläsare ligger i:

| Fil | Roll |
|---|---|
| `capacitor.config.ts` | App-ID, domäner, splash, statusfält |
| `src/lib/native.ts` | Plugin-wrappers som tål att köras på webben |
| `src/components/native/NativeBridge.tsx` | Monteras i layouten; registrerar push, hanterar notistryck |
| `src/lib/apns.ts` | Skickar notiser via APNs – Web Crypto, fungerar på Cloudflare Workers |
| `src/app/api/push/register/route.ts` | Appen registrerar sin enhetstoken |
| `src/app/api/push/send-reminders/route.ts` | Cron-jobb som skickar dagens påminnelser |
| `src/components/native/AppTabBar.tsx` | Flikfält i botten – visas bara i appen |
| `src/app/meny/page.tsx` | "Mer"-fliken; appens egen navigationsyta |
| `www/index.html` | Reservsida när nätet är nere |

### App-skalet

Appen ska inte kännas som en webbsida i en ruta. Därför:

* **Flikfält i botten** med fem flikar: Hem, Växter, Identifiera, Min odling,
  Mer. Kameran lyfts fram i en egen cirkel – det är appens tydligaste nytta.
* **Webbnavigering döljs.** `NativeBridge` sätter `data-native="ios"` på
  `<html>`, och CSS-regeln `[data-native] .hide-in-app` plockar bort
  fraktbannern, sidfoten och hamburgermenyn. Klassen `hide-in-app` kan sättas
  på vad som helst som inte hör hemma i appen.
* **Safe areas** respekteras uppe och nere, gummibandseffekten är avstängd och
  långtryck markerar inte text – små saker som annars avslöjar webbvyn.

`src/lib/native.ts` använder dynamiska importer bakom en `isNative()`-kontroll,
så webbygget drar aldrig in native-koden och sajten fungerar oförändrat i
webbläsaren.

---

## Vad som återstår innan TestFlight

### 1. Databasmigrering

`DeviceToken`-modellen finns i schemat men tabellen är **inte skapad** i
produktionsdatabasen:

```bash
npx prisma migrate dev --name add_device_tokens   # lokalt
npx prisma migrate deploy                          # mot produktion
```

### 2. APNs-nyckel från Apple

Apple Developer → Certificates, Identifiers & Profiles → Keys → **+** →
kryssa i *Apple Push Notifications service* → ladda ner `.p8`-filen
(**går bara att ladda ner en gång**).

Lägg sedan in som secrets på Cloudflare:

```bash
npx wrangler secret put APNS_KEY_ID        # 10 tecken, syns i nyckelns namn
npx wrangler secret put APNS_TEAM_ID       # 10 tecken, uppe till höger i portalen
npx wrangler secret put APNS_PRIVATE_KEY   # hela .p8-filen inkl. BEGIN/END
npx wrangler secret put APNS_BUNDLE_ID     # se.minodling.app
npx wrangler secret put APNS_PRODUCTION    # "false" för TestFlight, "true" i App Store
npx wrangler secret put CRON_SECRET        # valfri slumpsträng
```

> TestFlight-byggen använder APNs **sandbox**. Sätt `APNS_PRODUCTION=false`
> tills appen ligger i App Store, annars kommer inga notiser fram.

### 3. Cron för påminnelser

Lägg till i `wrangler.jsonc`:

```jsonc
"triggers": { "crons": ["0 6 * * *"] }
```

och anropa `/api/push/send-reminders` med `authorization: Bearer $CRON_SECRET`
från en `scheduled`-handler. Kör 06:00 UTC = 07:00/08:00 svensk tid.

### 4. Signering och uppladdning

Öppna `ios/App/App.xcworkspace` i Xcode:

1. **Signing & Capabilities** → välj ditt team, sätt bundle-ID `se.minodling.app`
2. Lägg till **Push Notifications** som capability
3. **Background Modes** → kryssa i *Remote notifications*
4. Välj *Any iOS Device* som mål → **Product → Archive**
5. **Distribute App** → *TestFlight & App Store*

Appikonen behöver också läggas in (`ios/App/App/Assets.xcassets/AppIcon.appiconset`).
Märket finns som SVG i `src/app/icon.svg` och behöver exporteras till PNG i
Apples storlekar.

---

## Begränsningar att känna till

**Push går inte att testa i simulatorn.** APNs kräver en fysisk enhet.
Registreringskoden körs men får aldrig någon token. Verifiera på riktig
hårdvara via TestFlight.

**Kameran finns inte i simulatorn.** `takePhoto()` i `src/lib/native.ts` är
skriven men inte körd mot verklig hårdvara.

**Kameran är ännu inte inkopplad i gränssnittet.** Växtidentifieringssidan
använder fortfarande webbens `<input type="file">`. Det fungerar i appen, men
för att få den native-upplevelse som Apples granskning vill se bör
`takePhoto()` anropas i stället när `isNative()` är sant.

**Googles samtyckesdialog visas inne i appen.** Den är byggd för webb och känns
främmande i ett app-sammanhang. Värt att se över inför App Store-granskning.

**Riktlinje 4.2.** Apple avvisar appar som bara är en inpackad webbplats.
Push-notiser och kamera är det som motiverar appen – se till att de faktiskt
fungerar och syns innan granskning.

---

## Testa mot lokal dev-server

Appen laddar produktionssajten, så lokala ändringar syns inte förrän de är
deployade. För att testa lokalt: peka `server.url` i `capacitor.config.ts` mot
`http://localhost:3000`, sätt `iosScheme: "http"`, och lägg till
`NSAppTransportSecurity.NSAllowsArbitraryLoads` i `Info.plist`.

**Återställ till `https://minodling.se` innan du arkiverar.**

---

## Efter ändringar i webbappen

Appen laddar den publicerade sajten, så en deploy av webben uppdaterar appen
direkt – inget nytt app-bygge behövs. Bara ändringar i native-lagret
(plugins, behörigheter, konfiguration) kräver ny `pod install` och ny build.
