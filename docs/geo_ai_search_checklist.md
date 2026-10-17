# Sjekkliste & Målelogg for AI-søk (GEO), Backlinks & Domain Authority

Denne sjekklisten og måleloggen brukes for å spore og øke sannsynligheten for at **KRS VR Arena** blir anbefalt av Gemini, ChatGPT Search, Perplexity og Google AI Overviews når folk søker etter aktiviteter og opplevelser i Kristiansand.

---

## 0. Historisk Målelogg & Scanningsresultater

> [!TIP]
> **Slik kjører du en ny scanning i fremtiden:**
> Be agenten: *«Kjør en ny SEO/GEO-scanning og oppdater måleloggen»*. Agenten vil da kjøre alle sjekkene på nytt (Sitemap, Tranco Domain Rank, Backlinks/Refererende domener, Brønnøysund NACE-status, TripAdvisor/Google-anmeldelser og de 6 faste AI-søkene) og legge til en ny datokolonne i tabellene under for å vise utviklingen (`+/-`).

### A. Overordnet Utvikling over Tid (KPI-er)

| Måleparameter | 15. okt 2026 (Baseline) | 17. okt 2026 (Scan #2) | Endring | Mål (Q4 2026) |
| :--- | :---: | :---: | :---: | :---: |
| **Indekserbare sider i `sitemap.xml` (`krsvr.no`)** | 19 sider | **24 sider** | 🟢 **+5** | 25+ sider |
| **Refererende domener (Backlinks / Omtaler)** | 4 domener | **9 domener** | 🟢 **+5** | 15+ domener |
| **Bekreftede `sameAs`-autoritetslenker i Schema** | 5 lenker | **7 lenker** | 🟢 **+2** | 10+ lenker |
| **Google Maps – Vurdering & Antall anmeldelser** | 5,0 ★ (22 stk) | **5,0 ★ (22 stk)** | ➖ 0 | 5,0 ★ (40+ stk) |
| **TripAdvisor – Vurdering & Antall anmeldelser** | 5,0 ★ (3 stk) | **5,0 ★ (3 stk)** | ➖ 0 | 5,0 ★ (10+ stk) |
| **TripAdvisor – Rangering i Kristiansand** *(Fornøyelse og lek)* | Nr. 7 av 23 | **Nr. 7 av 23** | ➖ 0 | **Topp 3** |
| **AI-søk synlighetsscore** *(Andel av 6 testsøk der vi siteres)* | 2 av 6 (33 %) | **2 av 6 (33 %)** | ➖ 0 | **5 av 6 (83 %)** |
| **Tranco Global Rank for `krsvr.no`** *(Topp 1M-liste)* | Ikke i Topp 1M | **Ikke i Topp 1M** | ➖ | Komme inn på listen |
| **Brønnøysund NACE-kode (Riktig bransje i kataloger)** | ❌ `62.100` (IT) | ❌ **`62.100` (IT)** | ⚠️ Krever Altinn | ✅ `93.299` (Fritid) |

---

### B. Backlinks & Refererende Domener – Autoritetskartlegging (Sist scannet: `17.10.2026`)

Tabellen viser alle eksterne domener som omtaler eller lenker til `krsvr.no`, rangert etter **Global Tranco Rank** (objektivt mål på domeneautoritet/trafikk basert på CrUX, Cloudflare Radar og Majestic) og **Estimert DR (Domain Rating 0–100)**:

| Eksternt Domene | Global Tranco Rank *(lavere = sterkere)* | Est. DR (0–100) | Lenkestatus til `krsvr.no` | Siteres av Gemini AI? | Kategori / Merknad per `17.10.2026` |
| :--- | :---: | :---: | :--- | :---: | :--- |
| **[tripadvisor.com](https://no.tripadvisor.com/Attraction_Review-g190492-d34257006-Reviews-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html)** | **#573** i verden | ~93 | ✅ Aktiv profil + lenke | ✅ Ja | *Fornøyelse og lek i Kristiansand* (Nr. 7 av 23, 5,0★). |
| **[visitnorway.com / .se](https://www.visitnorway.no/)** | **#30 488** i verden | ~82 | ✅ Syndikert via Tellus | ✅ **Ja (Ofte!)** | Automatisk syndikert fra Visit Sørlandet. Siteres direkte av Gemini. |
| **[1881.no](https://www.1881.no/data-programvare-og-utvikling/data-programvare-og-utvikling-agder/data-programvare-og-utvikling-kristiansand-s/krs-vr-arena-as_107699902S0/)** | **#46 211** i verden | ~74 | ⚠️ Kun NAP (Mangler URL/tlf) | Nei | Står under *Data - programvare og -utvikling*. **Må legge inn tlf + URL.** |
| **[1850.no](https://www.1850.no/bedrifter/it/dataprogrammering/agder/kristiansand/krs-vr-arena-as-936605192)** | **#372 404** i verden | ~45 | ✅ Schema `sameAs: www.krsvr.no` | Ja (NAP) | Har riktig tlf og URL, men står under *IT / Dataprogrammering*. |
| **[visitsorlandet.com](https://www.visitsorlandet.com/listing/krs-vr-arena-%E2%80%93-vr-escape-room-%26-mixed-reality-arkade/867197306/)** | **#595 256** i verden | ~58 | ✅ **Direkte Backlink (NO + EN)** | ✅ **Ja (Hovedkilde)** | Offisiell destinasjonsportal for Agder. Har rå `**` i brødtekst som bør fjernes. |
| **[eventguiden.no](https://eventguiden.no/)** | **#4 446 189** i verden | ~32 | ✅ Aktiv profil + lenke | ✅ **Ja (#1 kilde!)** | Svært viktig kilde for Gemini ved søk etter gruppeaktiviteter i Kristiansand. |
| **[lokalebedrifter.no](https://lokalebedrifter.no/bedrift/936318878/krs-vr-arena-as)** | Utenfor Topp 5M | ~20 | ✅ JSON-LD `url: krsvr.no` | Ja (NAP) | Har riktig tlf og URL, men kategorisert som *Softwareutvikling* (`62.100`). |
| **dendagen.no** | Utenfor Topp 5M | ~18 | ✅ Omtale + `krsvr.no` | Ja (NAP) | Indeksert med kontaktinfo, e-post, tlf og beskrivelse av partylounge. |
| **falio.no** | Utenfor Topp 5M | ~15 | ✅ Katalogoppføring | Nei | Henter registerdata fra Brønnøysund (`62.100`). |

---

### C. AI-Søk (GEO) Siteringstest på 6 Kommersielle Søk (Sist scannet: `17.10.2026`)

Disse 6 nøytrale testsøkene (uten å nevne «KRS» i søket) kjøres ved hver scanning for å måle om Gemini / Google AI anbefaler **KRS VR Arena** til potensielle kunder:

| # | Kommersielt Testsøk | Status `17.10.2026` | Plassering / Omtale i AI-svar | Hvilke kilder AI faktisk siterte i svaret | Hva som må til for å bli #1 |
| :-: | :--- | :---: | :--- | :--- | :--- |
| **1** | *«VR Kristiansand»* | ✅ **Anbefalt (#1)** | **Nr. 1** – Egen hovedseksjon som byens dedikerte VR-arena på Lund. | `visitnorway.se`, `krsvr.no`, `eventguiden.no`, `instagram.com` | Vedlikeholde posisjonen. |
| **2** | *«VR Escape Room Kristiansand»* | ✅ **Anbefalt (#1)** | **Nr. 1** – Fremheves som primærleverandør av VR Escape Rooms og Mixed Reality. | `eventguiden.no`, `krsvr.no`, `visitnorway.se` | Oppdatere *«8 spillere»* til *«10 spillere»* på Eventguiden/Tellus. |
| **3** | *«Escape Room Kristiansand»* | ❌ **Ikke nevnt** | Kun fysiske *Escape Room Kristiansand* (Festningsgata/Kirkegata) nevnes. | `visitsorlandet.com`, `kvadraturen.no`, `worldofescapes.com`, `roomescape.com` | Få flere Google/TripAdvisor-anmeldelser som nevner «Escape Room i Kristiansand». |
| **4** | *«Teambuilding Kristiansand innendørs aktiviteter»* | ❌ **Ikke nevnt** | AI lister Escape Kristiansand, X3M Gokart, Klatreverket, Glowing Golf og Kunstsilo. | `eventguiden.no`, `visitsorlandet.com`, `teambuildinger.no`, `spygames.no` | Be om plass på Visit Sørlandets & Eventguidens samleartikler for teambuilding + la Google indeksere nye `/vr-teambuilding`. |
| **5** | *«Utdrikningslag Kristiansand aktiviteter»* | ❌ **Ikke nevnt** | AI lister Høyt & Lavt, X3M Gokart, Skyland, Escape Room og Glowing Golf. | `utdrikningslag.com`, `eventguiden.no`, `visitsorlandet.com`, `skyland.no` | Registrere oppføring på `utdrikningslag.no` / `utdrikningslag.com` + be om omtale i anmeldelser fra utdrikningslag. |
| **6** | *«Innendørs aktiviteter Kristiansand regnværsdag»* | ❌ **Ikke nevnt** | AI lister Aquarama, Kunstsilo, Vitensenteret, X3M Gokart, Lucky Bowl og Glowing Golf. | `sør.com`, `visitsorlandet.com`, `visitnorway.no`, `eventguiden.no` | Kontakte Visit Sørlandet og `sør.com` for å bli lagt inn i deres artikler om *«Ting å gjøre på en regnværsdag i Kristiansand»*. |

---

## 1. Registrering i eksterne kanaler og autoritetskilder

Språkmodeller stoler mest på bedrifter som er bekreftet på tvers av flere uavhengige kilder med identisk **NAP** (*Name, Address, Phone*: KRS VR Arena, Industrigata 12, 4632 Kristiansand, 408 28 302).

### Høyeste prioritet (De AI søker i først)
- [x] **TripAdvisor (Fullført – Aktiv profil, bilder, beskrivelser og widget):**
  - **Direkte oppførings-URL:** [Krs VR Arena på TripAdvisor](https://no.tripadvisor.com/Attraction_Review-g190492-d34257006-Reviews-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html)
  - **Målepunkt / Baseline (15. oktober 2026):**
    - **Rangering:** **Nr. 7 av 23** i kategorien *«Fornøyelse og lek i Kristiansand»*
    - **Vurdering:** 5,0 av 5,0 stjerner
    - **Antall anmeldelser:** 3 anmeldelser (Elisabeth V m.fl.)
    - **Bilder:** 5 profesjonelle bilder lastet opp (dekker familiepakker 8–12 år, ungdom 13+, vennegjeng, teambuilding og utdrikningslag)
  - **Gjennomførte tiltak:**
    - [x] Bilder og optimaliserte bildebeskrivelser lastet opp i profilen.
    - [x] Profilbeskrivelser oppdatert.
    - [x] Offisiell «Rated on Tripadvisor» grønn badge implementert i bunnteksten ([Footer.tsx](file:///Users/ray/antigravity/Krs-VR-Arena-2026-06-11-3bfb1/components/Footer.tsx)).
    - [x] TripAdvisor-lenke integrert i tilbakemeldingsmodulen ([FeedbackForm.tsx](file:///Users/ray/antigravity/Krs-VR-Arena-2026-06-11-3bfb1/components/FeedbackForm.tsx)).
    - [x] TripAdvisor-profilen lagt inn i `sameAs`-strukturen i Schema.org JSON-LD ([layout.tsx](file:///Users/ray/antigravity/Krs-VR-Arena-2026-06-11-3bfb1/app/layout.tsx)).
  - **Neste mål (Effektmåling):**
    - Klatre fra **Nr. 7** opp til **Topp 3** ved å samle inn 5–10 nye anmeldelser via oppfølgings-e-poster og `/feedback`.
- [x] **Visit Sørlandet (visitsorlandet.com – Fullført, live oppføring og backlink til `krsvr.no`):**
  - **Direkte oppførings-URL (NO):** [KRS VR Arena på Visit Sørlandet](https://www.visitsorlandet.com/listing/krs-vr-arena-%E2%80%93-vr-escape-room-%26-mixed-reality-arkade/867197306/)
  - **Direkte oppførings-URL (EN):** [KRS VR Arena on Visit Southern Norway](https://en.visitsorlandet.com/listing/krs-vr-arena-%e2%80%93-vr-escape-room-%26-mixed-reality-arkade/867197306/)
  - **Gjennomførte tiltak:**
    - [x] Oppføring publisert via Tellus DMS med direkte backlink til `https://www.krsvr.no`, telefon (`+47 40 82 83 02`), e-post (`post@krsvr.no`), adresse (`Industrigata 12, 4632 Kristiansand`), åpningstider, priser og bildegalleri.
    - [x] Lagt inn i `sameAs`-strukturen i Schema.org JSON-LD ([layout.tsx](file:///Users/ray/antigravity/Krs-VR-Arena-2026-06-11-3bfb1/app/layout.tsx) og [LandingPage.tsx](file:///Users/ray/antigravity/Krs-VR-Arena-2026-06-11-3bfb1/components/LandingPage.tsx)) for toveis entitetsbekreftelse (Knowledge Graph).
    - [x] Diskret referanselenke («Du finner oss også på Visit Sørlandet») lagt inn under TripAdvisor-badgen i bunnteksten ([Footer.tsx](file:///Users/ray/antigravity/Krs-VR-Arena-2026-06-11-3bfb1/components/Footer.tsx)).
  - **Tips til finpuss i Tellus-portalen:**
    - [ ] Fjern rå `**`-stjerner (Markdown-fettekst) i brødteksten inne i Tellus/Visit Sørlandet-portalen, ettersom Simpleview viser `**Populære 90-minutters opplevelser:**` som synlige stjerner.
- [x] **Visit Norway (visitnorway.no / visitnorway.com – Fullført via Tellus-syndikering):**
  - Automatisk syndikert fra Visit Sørlandet/Tellus DMS (bl.a. synlig i Visit Norways familie- og aktivitetslister for Kristiansand).

### Event- og selskapsportaler (For høyt betalende bedrifter og utdrikningslag)
- [ ] **Utdrikningslag.no:**
  - Registrer oppføring som aktivitet for utdrikningslag i Kristiansand/Agder.
- [x] **Eventguiden.no (Fullført – Indeksert med profil for KRS VR Arena):**
  - Oppføring for grupper, teambuilding og arrangementer er live og indeksert i Google.
- [ ] **Teambuilding.no / Firmatur.no:**
  - Legg inn profil for teambuilding, kickoff og bedriftsarrangementer.
- [ ] **Aktiviteter i Norge / Kvadraturen.no:**
  - Lokale kalendere og arrangementssider i Kristiansand sentrum.

### Norske kataloger & Brønnøysundregistrene (Sjekket 17. oktober 2026 – Viktige avvik funnet!)
- [ ] **VIKTIGST: Endre næringskode (NACE) i Brønnøysundregistrene (Altinn):**
  - **Funn ved oppslag i Enhetsregisteret (`936 318 878` / underenhet `936 605 192`):** Selskapet står fortsatt registrert med **`naeringskode1: 62.100 Dataprogrammeringstjenester`** (fra tiden som *JLS FINANS AS*).
  - **Konsekvens for AI-søk og kataloger:** Fordi 1881.no, Gule Sider, Proff.no, 1850.no og Lokalebedrifter.no henter bransje automatisk fra Brønnøysund, er KRS VR Arena kategorisert som **«Data - programvare og -utvikling» / «IT / Softwareutvikling»** i stedet for underholdning/aktiviteter!
  - **Tiltak (Gratis i Altinn):** Send inn *Samordnet registermelding* i Altinn og endre næringskode til **`93.299 Fritidsvirksomhet ellers`** (evt. `93.210 Drift av fornøyelses- og temaparker`).
- [ ] **1881.no (Sjekket – Feil kategori og mangler telefon/nettside):**
  - **Direkte URL:** [Krs Vr Arena AS på 1881.no](https://www.1881.no/data-programvare-og-utvikling/data-programvare-og-utvikling-agder/data-programvare-og-utvikling-kristiansand-s/krs-vr-arena-as_107699902S0/)
  - **Status nå:**
    - Navn (`Krs Vr Arena AS`) og adresse (`Industrigata 12, 4632 Kristiansand S`) er riktig.
    - **Mangler:** Det står *«Telefonnummer mangler, data er hentet fra offentlige registre»*, og lenke til `krsvr.no` samt åpningstider mangler.
    - **Feil kategori:** Ligger under `/data-programvare-og-utvikling/`.
  - **Tiltak:** Logg inn på [minbedrift.1881.no](https://minbedrift.1881.no/) og legg inn telefon `408 28 302` og `https://www.krsvr.no` (NB: Kun gratis grunnoppføring – takk nei til betalt annonsering).
- [ ] **Gule Sider (Eniro) & 1850.no (Sjekket):**
  - **1850.no URL:** [Krs Vr Arena AS på 1850.no](https://www.1850.no/bedrifter/it/dataprogrammering/agder/kristiansand/krs-vr-arena-as-936605192)
  - **Lokalebedrifter.no URL:** [KRS VR ARENA AS på Lokalebedrifter.no](https://lokalebedrifter.no/bedrift/936318878/krs-vr-arena-as)
  - **Status nå:** Adresse (`Industrigata 12`), telefon (`+47 408 28 302`) og nettside (`www.krsvr.no`) er hentet inn fra Brønnøysund, men står som *«Ubekreftet selskap»* under *«IT / Dataprogrammering»*.
  - **Tiltak:** Når næringskoden i Brønnøysund er oppdatert, oppdateres bransjen automatisk. Sjekk også gratisoppføringen på Gule Sider.
- [ ] **Apple Maps / Apple Business Connect (Sjekket – Ikke registrert som eget sted ennå):**
  - **Status nå:** Adressen `Industrigata 12` og naboen *Krs Urban Dance Center* finnes i kartgrunnlaget, men **KRS VR Arena** ligger ikke inne som et eget verifisert interessepunkt (Place Card) i Apple Maps.
  - **Tiltak (Gratis):** Logg inn med Apple-ID på [Apple Business Connect](https://businessconnect.apple.com/) og opprett/bekreft **KRS VR Arena** (`Industrigata 12, 4632 Kristiansand`, tlf `+47 408 28 302`, `https://www.krsvr.no`, åpningstider og bilder). Dette gir synlighet i Apple Maps, Siri og DuckDuckGo.

### Studentrettede kanaler (13 000+ studenter i Kristiansand)
- [ ] **SiA (Studentsamskipnaden i Agder):**
  - Undersøk mulighet for studentfordel / partneroppføring på SiA sine velkomstsider.
- [ ] **Linjeforeninger ved UiA (Campus Kristiansand):**
  - Send invitasjon til linjeforeningene for semesterstart eller kickoff. En enkelt omtale fra en studentforening gir sterk lokal relevans.

---

## 2. Google Bedriftsprofil (Google Maps) forbedringer

### A. Bilde av butikkfronten / fasaden (Viktig!)
- [ ] **Ta et godt bilde av inngangspartiet og butikkfronten på dagtid:**
  - Bildet bør vise skiltet til KRS VR Arena tydelig, inngangsdøren og gatenummeret (Industrigata 12).
  - Last opp bildet i Google Bedriftsprofil under kategorien **«Utvendig» (Exterior)**.
  - **Hvorfor dette påvirker AI:**
    1. Google Lens og Googles datasyn matcher fasadebildet mot Street View og bekrefter at lokalet er en reell, operativ lokasjon.
    2. Kunder som er på vei dit kjenner igjen bygget umiddelbart.

### B. Google Q&A (Spørsmål og svar) – Skjult gullgruve for AI
Gemini leser direkte fra «Spørsmål og svar»-seksjonen på Google Maps. Du kan selv logge inn og stille de vanligste spørsmålene fra en privat konto, og deretter svare offisielt som eier:
- [ ] **Spørsmål 1:** *«Passer KRS VR Arena for teambuilding og firmaarrangement i Kristiansand?»*
  - **Offisielt svar:** *«Ja, vi tar imot bedrifter, avdelinger og teambuilding-grupper i alle størrelser. Vi tilbyr både VR Escape Room og Mixed Reality Shooter (Spatial Ops), med konkurranseelementer og opplegg tilpasset kolleger.»*
- [ ] **Spørsmål 2:** *«Er dette en god innendørsaktivitet på en regnværsdag i Kristiansand?»*
  - **Offisielt svar:** *«Absolutt! KRS VR Arena er en helinnendørs opplevelsesarena i Kristiansand (Industrigata 12, Lund). Perfekt aktivitet uansett vær for vennegjenger, studenter, kolleger og familier.»*
- [ ] **Spørsmål 3:** *«Hva gjør man ved utdrikningslag hos dere?»*
  - **Offisielt svar:** *«Vi har skreddersydde opplegg for utdrikningslag med actionfylt Mixed Reality-skyting og samarbeidsoppgaver i VR Escape Room. En sikker vinner for hele gjengen!»*

### C. Månedlige Google-oppdateringer (Innlegg)
- [ ] Legg ut et kort innlegg i Google Maps hver 2.–3. uke (f.eks. sesongåpning for julebord, regnværstips, studentkveld). Innleggene indekseres av Gemini i sanntid.

---

## 3. Strategi for kundeanmeldelser (Reviews)

### Hvorfor anmeldelser er nøkkelen til AI-søk
Når en bruker spør Gemini: *«Beste aktiviteter for utdrikningslag i Kristiansand»*, gjør Gemini et semantisk søk i anmeldelsestekstene.
- En anmeldelse med bare «Gøy sted, 5 stjerner!» gir minimal verdi for AI-søk.
- En anmeldelse som nevner **hva gruppen gjorde, hvem de var, og hvor det var**, blir sitert direkte av Gemini.

### Rangering av plattformer etter effekt akkurat nå:
1. **Prioritet 1: Google Maps Reviews (Høyest effekt)**
   - Gemini eies av Google og henter sanntidsdata direkte herfra ved nesten alle lokale spørsmål.
2. **Prioritet 2: TripAdvisor Reviews (Svært høy effekt for AI og turister)**
   - Både Gemini, ChatGPT Search og Perplexity anser TripAdvisor som en uavhengig kvalitetsstandard for underholdning og aktiviteter.
3. **Prioritet 3: Facebook / Nettside-omtaler**
   - Godt for tillit, men har lavere direkte vekting i Google AI enn Google Maps og TripAdvisor.

---

### Eksempler på anmeldelser per kundesegment

#### Segment 1: Bedrift & Teambuilding (Høyeste inntjening)
> **Google Maps eksempel (Prioritet 1):**
> *«Vi hadde teambuilding for 16 kolleger hos KRS VR Arena i Kristiansand, og det var midt i blinken for hele gjengen. Mixed Reality Shooter (Spatial Ops) fikk frem konkurranseinstinktet, og VR Escape Room krevde skikkelig samarbeid. Svært profesjonell vert som guidet oss gjennom alt. Anbefales varmt til alle bedrifter som ser etter en aktivitet i Kristiansand sentrum!»*

> **TripAdvisor eksempel (Prioritet 2):**
> *«Super bedriftsaktivitet i Kristiansand! Vi la firmaavslutningen hit før middag i byen. Lett å finne i Industrigata på Lund, topp moderne utstyr og fantastisk moro for både nybegynnere og de som har prøvd VR før. Kommer garantert tilbake for neste teambuilding.»*

---

#### Segment 2: Utdrikningslag (Voksne 25–40 år)
> **Google Maps eksempel (Prioritet 1):**
> *«La oppstarten på utdrikningslaget til KRS VR Arena for en gjeng på 10 personer. Perfekt actionfylt start på dagen! Spatial Ops var hysterisk morsomt, og brudgommen fikk virkelig kjørt seg. Topp service og god veiledning. En av de beste tingene man kan gjøre i Kristiansand med en kompisgjeng!»*

> **TripAdvisor eksempel (Prioritet 2):**
> *«Utdrikningslag med full klaff! Vi testet både VR Escape Room og skytingen. Veldig sosialt og engasjerende opplegg hvor alle var med hele tiden. Anbefales på det sterkeste for vennegjenger som planlegger utdrikningslag på Sørlandet.»*

---

#### Segment 3: Studenter & Vennegjeng (20–25 år)
> **Google Maps eksempel (Prioritet 1):**
> *«Vi var en studentgjeng på 6 venner som testet VR Escape Room en fredagskveld. Utrolig kul innendørsaktivitet i Kristiansand! Gåtene var utfordrende og grafikken var super. Veldig hyggelig betjening som hjalp oss i gang. Mye morsommere enn vanlig kino eller bowling!»*

> **TripAdvisor eksempel (Prioritet 2):**
> *«Fantastisk opplevelse for vennegjengen i Kristiansand. Vi spilte Spatial Ops i arenaen – pulsen var på topp fra start til slutt. Perfekt opplegg for studenter som vil finne på noe gøy sammen i sentrum.»*

---

#### Segment 4: Innendørsaktivitet på en regnværsdag
> **Google Maps eksempel (Prioritet 1):**
> *«Beste regnværsaktiviteten i Kristiansand! Da været sviktet booket vi en time her, og det reddet hele ettermiddagen. Helinnendørs, sentralt på Lund (Industrigata 12) og utrolig gøy for både voksne og ungdom. Hit kommer vi tilbake neste gang det regner på Sørlandet!»*

> **TripAdvisor eksempel (Prioritet 2):**
> *«Redningen på en gråværsdag i Kristiansand. VR Escape Room var super spennende og vi glemte helt tid og sted. Anbefales på det sterkeste til alle som ser etter innendørs aktiviteter i byen.»*

---

#### Segment 5: Familie & Ungdom
> **Google Maps eksempel (Prioritet 1):**
> *«Testet familiepakken med to voksne og to tenåringer. Alle var like engasjert! Trygt og godt forklart av instruktøren, og oppgavene passet perfekt for oss. Utrolig gøy å løse mysterier sammen i virtuell virkelighet.»*

---

## 4. Andre ting du ikke må glemme (Proaktive tiltak)

### A. Google Search Console – Tving reindeksering (Fullført)
- [x] Gå til [Google Search Console](https://search.google.com/search-console).
- [x] Bruk **URL-inspeksjon** for forsiden (`https://krsvr.no/`) og FAQ-siden (`https://krsvr.no/faq`).
- [x] Klikk på **«Be om indeksering»** (Request Indexing).
  - *Formål:* Gjør at Googlebot og Gemini umiddelbart fanger opp de nye Schema.org `EntertainmentBusiness`-taggene og de nye FAQ-svarene.

### B. Omtale i lokale «Topp 10»-artikler og listikler
Når Gemini svarer på ferie- og aktivitetstips, leser den ofte artikler med overskrifter som:
- *«10 morsomme ting å gjøre i Kristiansand»*
- *«Aktiviteter for voksne i Kristiansand»*
- *«Hva skjer i Kristiansand når det regner?»*
- [ ] **Tiltak:** Søk opp hvem som har skrevet de mest leste artiklene på Google i dag (f.eks. lokale reisebloggere, KRSby, Visit Sørlandet). Send en hyggelig henvendelse og be om at KRS VR Arena legges til som et hett tips for innendørs action og escape room.

### C. Direkte anmeldelseslenker, QR-kode og oppfølgings-e-post (Fullført)
- [x] **Direkte anmeldelseslenker i e-post og `/feedback`:**
  - **Google Maps Review:** `https://g.page/r/CfC9vWzS0yO-EBM/review`
  - **Tripadvisor Review:** `https://no.tripadvisor.com/UserReviewEdit-g190492-d34257006-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html`
- [x] **Manuell utsendelse fra Admin (`/admin` -> Upcoming):**
  - Egen «Be om omtale»-knapp på gjennomførte bookinger sender personlig e-post via Resend (på norsk eller engelsk) med direktelenker til Google og Tripadvisor, samt automatisk kvittering/kopi til `post@krsvr.no`.
- [x] **QR-kode ved utgangen / i loungen:**
  - Plasser et lite skilt/bordrytter ved betalingsdisken eller i partyloungen som peker til `https://krsvr.no/feedback` eller direkte til Google/Tripadvisor:
  > *«Hadde dere en fin opplevelse? Skann QR-koden og del gjerne hvem dere var, i hvilken anledning dere besøkte oss, og hvordan opplevelsen var!»*
  - Dette oppfordrer kundene til å beskrive kontekst og nøkkelord helt naturlig for AI-søk.
