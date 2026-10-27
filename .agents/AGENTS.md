# SEO og AI-Søk Retningslinjer for KRS VR Arena

Når du gjør endringer i kildekoden, spesielt for metadata, JSON-LD og semantikk, skal du alltid huske på følgende SEO- og AI-søk prinsipper for prosjektet:

1. **Viktige søkeord:**
   * Mixed Reality Kristiansand
   * VR Escape Room Kristiansand
   * Escape Room Kristiansand
   * VR Kristiansand
   * VR Arcade Kristiansand
   * Arcade Kristiansand
   * Zombie Shooter Kristiansand
   * Tactical Arena Kristiansand
   * Tactical Arena
   * Mixed Reality Shooter
   * Teambuilding Kristiansand
   * Utdrikningslag Kristiansand
   * Bachelor Party Kristiansand
   * Bachelorette Party Kristiansand
   * Bursdag Kristiansand
   * Barnebursdag Kristiansand
   * Firmaevent Kristiansand
   * Kickoff Kristiansand
   * Julebord Kristiansand
   * VR On-site Kristiansand
2. **Bevar eksisterende SEO:** Ikke overskriv eksisterende god metadata og struktur (f.eks. JSON-LD, sitemap, robots, alt-tekster) uten god grunn. Utvid heller med nye relevante nøkkelord.
3. **Semantikk:** Hold strukturert og semantisk HTML (H1, H2, H3) vedlike, og ha alltid beskrivende alt-tekster for bilder.
4. **Visuelt design:** Ikke gjør store visuelle endringer i UI eller tekster for SEO-ens skyld. Endringer bør gjøres "under the hood" der det er mulig (metadata, aria-labels, json-ld).
5. **Kontekstuell bruk:** Innarbeid ord naturlig. Ikke fyll siden med overdreven "keyword stuffing". Fokus er på lokal tilstedeværelse på Lund i Kristiansand (`Industrigata 12, 4632 Kristiansand`, GPS: `58.152302, 8.025888`) og å formidle opplevelsestypene tydelig til AI og søkemotorer.
6. **SEO/GEO-scanning og historisk målelogg (`docs/geo_ai_search_checklist.md`):**
   Når brukeren ber om en ny SEO/GEO-scanning, skal agenten sjekke og oppdatere tabellene i `docs/geo_ai_search_checklist.md` med en ny datokolonne for:
   - Antall sider i `https://www.krsvr.no/sitemap.xml`
   - Refererende domener (`"krsvr.no" -site:krsvr.no` og `"Krs VR Arena" -site:krsvr.no`) + Tranco Domain Rank (`https://tranco-list.eu/api/ranks/domain/<domene>`)
   - Brønnøysund NACE-bransjekode (`https://data.brreg.no/enhetsregisteret/api/enheter/936318878`)
   - Vurdering og antall anmeldelser på Google Maps og TripAdvisor
   - TripAdvisor-rangering målt spesifikt på leverandørsiden for lek og moro i Kristiansand: `https://no.tripadvisor.com/Attractions-g190492-Activities-c56-a_attractionType.SUPPLIERS-Kristiansand_Vest_Agder_Southern_Norway.html`
   - De 6 faste nøytrale kommersielle AI-søkene i Seksjon 0.C.
7. **Vedlikehold av `llms.txt` og `llms-full.txt` (AI-agenter og LLM-standard):**
   Hver gang det gjøres endringer i priser, kapasiteter, åpningstider, bar-/matkonsepter, regler for medbrakt eller nye opplevelser, **SKAL** både `public/llms.txt` og `public/llms-full.txt` oppdateres tilsvarende, slik at AI-agenter og språkmodeller alltid har oppdatert, presis og fullstendig forretningslogikk.

# Utvikling og Kjøring
1. **Port:** Dev-serveren (`npm run dev`) skal *alltid* startes på port 3050.
2. **`lbp` (Lint -> Build -> Push):**
   Når brukeren skriver `lbp` (eller ber om «lint, build, push»), skal agenten automatisk gjennomføre følgende steg i rekkefølge:
   - **1. Lint:** Kjør `npm run lint` for å verifisere kodekvalitet. Eventuelle feil eller advarsler skal feilsøkes og rettes automatisk.
   - **2. Build:** Kjør `npm run build` for å sikre at prosjektet bygger og typer uten feil. Eventuelle byggfeil skal rettes opp.
   - **3. Push:** Når alt passerer med null feil, legg til endringer (`git add`), opprett en presis commit-melding og kjør `git push origin main`.
   - **VIKTIG OM GSC / INDEKSERING:** Kjør **IKKE** `npm run gsc:submit` automatisk ved push! Overdreven innsending av sitemap og re-indeksering kan føre til at Google nedprioriterer eller kvotestenger domenet. GSC-innsending skal **KUN** kjøres når brukeren eksplisitt ber om det (f.eks. «send til gsc» eller «meld inn til google»).

# E-postmaler og Forhåndsvisning
1. **React Email:** Alle nye e-postmaler skal bygges som modulære React Email-komponenter under `components/emails/` og benytte `EmailLayout.tsx`.
2. **Sentralt register:** Hver gang en ny e-postmal opprettes eller en eksisterende endres, **SKAL** den registreres i `components/emails/registry.ts` med:
   - Unik `id` og beskrivende `title`
   - Kategori (`customer`, `internal` eller `marketing`) og `categoryLabel`
   - Realistiske testdata / mock-props
   - Foreslått emnefelt (`subject`)
   - Nøyaktig utsendelses-trigger (`trigger`)
   - Filsti i prosjektet (`filePath`)
3. **Logo-format (PNG fremfor SVG):** I alle e-postmaler og HTML-e-poster (Resend / React Email) skal det alltid benyttes PNG-format for logoer i stedet for SVG for å sikre stabil visning i e-postklienter:
   - Lys bakgrunn (standard): `https://krsvr.no/krsvrarena_logo_sort.png`
   - Mørk bakgrunn: `https://krsvr.no/krsvrarena_logo_hvit.png`
4. **Omtale-forespørsel etter besøk (`ReviewRequestEmail.tsx` & `AdminReviewRequestReceiptEmail.tsx`):**
   - Sendes manuelt fra `/admin` (under «Upcoming») på norsk eller engelsk.
   - **Ikke nevn spesifikt booket spill:** E-posten skal aldri nevne hvilken spesifikk opplevelse kunden booket, ettersom gjester ofte får prøve flere opplevelser under oppholdet.
   - **Automatisk admin-kopi:** Ved hver utsendelse skal det alltid gå en kvittering med full kopi av e-posten til `post@krsvr.no` (`AdminReviewRequestReceiptEmail.tsx`).
   - **Direktelenker til anmeldelser:**
     - Google Maps: `https://g.page/r/CfC9vWzS0yO-EBM/review`
     - Tripadvisor: `https://no.tripadvisor.com/UserReviewEdit-g190492-d34257006-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html`

# Tone of Voice og Språk
1. **Rolig og profesjonell varm tone:** Tekster på nettsiden og i alle e-poster skal alltid skrives i en rolig, profesjonell, trygg og varm tone.
2. **Unngå overentusiasme og klisjeer:** Ikke bruk overentusiastiske vendinger som «uforglemmelig VR-opplevelse», «fantastisk opplevelse», «rå opplevelse fra første sekund» eller livlige emojier i overskrifter/brødtekst (f.eks. 🎉, 🎮, 🎯, ✨).
3. **Trygge og imøtekommende formuleringer:** Bruk formuleringer som «Vi gleder oss til å ta imot dere».
4. **Oppmøtetekst:** Bruk alltid «Møt presist for å ikke miste spilletid.» i stedet for referanser til 10–15 minutter før med klokke-emojier.
5. **Navneliste og justering i kvittering:** Formuler tydelig at kunden kan justere antall og navneliste helt frem til ankomst, men at sene endringer ved oppmøte kan skape forsinkelser og redusert spilletid.

# Database og Supabase Data API (Krav fra 30. oktober)
1. **Obligatoriske GRANTs for nye tabeller:** Hver gang en ny tabell opprettes i `public`-skjemaet (i SQL-migrasjoner, skript eller databaseendringer), **MÅ** det alltid inkluderes eksplisitte `GRANT`-setninger i samme migrasjon:
   ```sql
   grant select on public.din_tabell to anon; -- (dersom tabellen skal leses av uinnloggede, styres videre av RLS)
   grant select, insert, update, delete on public.din_tabell to authenticated;
   grant select, insert, update, delete on public.din_tabell to service_role;
   ```
2. **Skille mellom GRANT og RLS:** `GRANT` gir Data API / PostgREST tillatelse til å nå tabellen. `RLS` (`alter table public.din_tabell enable row level security;` + policies) styrer hvilke rader som kan aksesseres. Begge deler må **alltid** settes opp sammen.

# Kapasitet, Bedriftsarrangementer, Teambuilding & Bar
1. **Kapasitet og gruppestørrelser (10 samtidige spillere):**
   - Opptil **10 personer** kan spille samtidig i arenaen.
   - **Selvbetjent booking (`/booking`):** Gjelder grupper på **2–10 personer** (90 min totalopplevelse). Merk at enkeltspill i databasen har sin egen tekniske maksgrense (`maxPlayers`, f.eks. 6 for enkelte Escape Rooms, 8 for enkelte spill, og 10+ for Tactical Arena / Mixed Reality Shooter).
   - **Turneringsformat for store grupper (10–64 personer):**
     - Store grupper bestilles via kontaktskjema (`/kontakt`) og kjøres i et dynamisk turneringsformat med opptil 10 aktive spillere samtidig i ~10-minutters runder.
     - Hvert lag får fargerike armbånd med egne teamnavn (f.eks. avdelingsnavn fra firmaet eller Team Alfa, Beta, Charlie, Delta).
     - De som har pause følger med på storskjerm (spectator), sjekker scorecards, tar en forfriskning og legger taktikk.
     - Felles kåring av vinnerlaget på slutten.
     - Alle opplever å delta på samme arrangement hele tiden &mdash; aldri isolert oppdelt i parallelle 4-timers økter.
2. **Bar og Servering (Kun ved forhåndsbestilling):**
   - Baren er ikke fast åpen drop-in, men klargjøres ved forhåndsbestilling til arrangementer.
   - **Pakke 1 (Øl & Cider):** Kald Tuborg, Corona Extra, Bacardi Breezer og mineralvann. Veldig trygt og uformelt med tanke på utstyr.
   - **Pakke 2 (Vin & Bobler):** Kvalitetsvin og musserende bobler fra samme anerkjente leverandør som Boen Gård (for hyggelige markeringer, nytes i loungen eller etter spill).
   - **Prislister:** Sendes uforpliktende ved bookingforespørsel.
   - **Pizza:** Lokal pizza kan leveres varmt direkte til partyloungen.
   - **Oppgjør:** Firmaet dekker samlet på EHF-faktura, eller vi åpner baren for deltakerbetaling.
3. **Pakkepriser og MVA-skille:**
   - **Normal booking / Privat (2–10 personer, 90 min):** Oppgis **inkl. mva** på `/priser` (2 pers: 460 kr/pers, 3–4 pers: 395 kr/pers, 5–7 pers: 385 kr/pers, 8–10 pers: 375 kr/pers).
   - **Teambuilding bedrift (2–10 personer):** 375 kr **+ mva** / pers (90 min).
   - **Teambuilding bedrift (10–50 personer):** 375 kr **+ mva** / pers (inntil 3 timer totaltid / hele lokalet for dere selv / 120 min aktivt turneringsformat).
   - **Utdrikningslag:** Fra 450 kr / pers (Varighet: 1,5–3 timer).
   - **VR Bursdag:** Fra 375 kr / pers (90 min totalopplevelse).
4. **Ingen medbrakt mat og drikke på teambuilding, voksenbursdag (18+) og utdrikningslag:**
   - Det er **ikke** anledning til medbrakt mat og drikke på teambuilding, firmaarrangementer, voksenbursdager (18+) og utdrikningslag.
   - Drikke serveres via våre to forhåndsbestilte barkonsepter (Pakke 1: Øl/cider/mineralvann eller Pakke 2: Vin & bobler).
   - Mat serveres ved at vi koordinerer levering av fersk, varm lokal pizza direkte til partyloungen.
   - **Unntak for barnebursdag:** Ved barnebursdager er det tillatt å ta med egen bursdagskake, godteri, snacks og brus.

# Leverandørkonfidensialitet og Interne Kilder
1. **Ingen eksponering av leverandørnavn:** Navn på eksterne plattform- og spill-leverandører (som Spawnpoint) skal ALDRI nevnes eller avsløres i offentlig kildekode, frontend-komponenter, metadata, JSON-LD, sitemap, llms.txt eller commit-meldinger.
2. **Interne ressurser for Browser Agent:** Interne spilldatabaser og markedsføringsressurser for oppslag og verifisering skal utelukkende lagres og leses fra den Git-ignorerte mappen `.antigravity/` (`.antigravity/internal_supplier_resources.md`).

