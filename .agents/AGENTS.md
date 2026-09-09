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
   * Spatial Ops Kristiansand
   * Mixed Reality Shooter
   * Teambuilding Kristiansand
   * Utdrikningslag Kristiansand
   * Bursdag Kristiansand
   * Firmaevent Kristiansand
2. **Bevar eksisterende SEO:** Ikke overskriv eksisterende god metadata og struktur (f.eks. JSON-LD, sitemap, robots, alt-tekster) uten god grunn. Utvid heller med nye relevante nøkkelord.
3. **Semantikk:** Hold strukturert og semantisk HTML (H1, H2, H3) vedlike, og ha alltid beskrivende alt-tekster for bilder.
4. **Visuelt design:** Ikke gjør store visuelle endringer i UI eller tekster for SEO-ens skyld. Endringer bør gjøres "under the hood" der det er mulig (metadata, aria-labels, json-ld).
5. **Kontekstuell bruk:** Innarbeid ord naturlig. Ikke fyll siden med overdreven "keyword stuffing". Fokus er på lokal tilstedeværelse i Kristiansand og å formidle opplevelsestypene tydelig til AI og søkemotorer.

# Utvikling og Kjøring
1. **Port:** Dev-serveren (`npm run dev`) skal *alltid* startes på port 3050.
2. **`lbp` (Lint -> Build -> Push):**
   Når brukeren skriver `lbp` (eller ber om «lint, build, push»), skal agenten automatisk gjennomføre følgende tre steg i rekkefølge:
   - **1. Lint:** Kjør `npm run lint` for å verifisere kodekvalitet. Eventuelle feil eller advarsler skal feilsøkes og rettes automatisk.
   - **2. Build:** Kjør `npm run build` for å sikre at prosjektet bygger og typer uten feil. Eventuelle byggfeil skal rettes opp.
   - **3. Push:** Når alt passerer med null feil, legg til endringer (`git add`), opprett en presis commit-melding og kjør `git push origin main`.

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
# Tone of Voice og Språk
1. **Rolig og profesjonell varm tone:** Tekster på nettsiden og i alle e-poster skal alltid skrives i en rolig, profesjonell, trygg og varm tone.
2. **Unngå overentusiasme og klisjeer:** Ikke bruk overentusiastiske vendinger som «uforglemmelig VR-opplevelse», «fantastisk opplevelse», «rå opplevelse fra første sekund» eller livlige emojier i overskrifter (f.eks. 🎉, 🎮, 🎯, ✨).
3. **Trygge og imøtekommende formuleringer:** Bruk formuleringer som «Vi gleder oss til å ta imot dere».
4. **Oppmøtetekst:** Bruk alltid «Møt presist for å ikke miste spilletid.» i stedet for referanser til 10-15 minutter før med klokke-emojier.
5. **Navneliste og justering i kvittering:** Formuler tydelig at kunden kan justere antall og navneliste helt frem til ankomst, men at sene endringer ved oppmøte kan skape forsinkelser og redusert spilletid.

