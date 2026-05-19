import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvernerklæring | KRS VR Arena",
  description: "Les om hvordan KRS VR Arena samler inn og behandler personopplysninger i henhold til gjeldende regelverk.",
  openGraph: {
    title: "Personvernerklæring | KRS VR Arena",
    description: "Les om hvordan KRS VR Arena samler inn og behandler personopplysninger.",
    url: "https://www.krsvr.no/personvern",
    type: "website",
  }
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbake til forsiden
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-light text-white mb-10 tracking-tight">Personvernerklæring</h1>
        
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
            Denne personvernerklæringen forteller om hvordan KRS VR Arena samler inn og bruker personopplysninger.
            Vårt hovedfokus er å gi deg en fantastisk opplevelse, og vi lagrer kun den informasjonen som er helt nødvendig for å kunne ekspedere din bestilling og gjennomføre ditt besøk hos oss.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">1. Behandlingsansvarlig</h2>
            <p className="text-zinc-400 leading-relaxed">
              KRS VR Arena (heretter &quot;vi&quot; eller &quot;oss&quot;) er behandlingsansvarlig for virksomhetens behandling av personopplysninger.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">2. Formålet med innhenting av personopplysninger</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Vi samler utelukkende inn informasjon for å kunne:
            </p>
            <ul className="list-disc pl-6 text-zinc-400 space-y-2">
              <li>Motta, registrere og administrere din booking av VR-opplevelser.</li>
              <li>Sende deg ordrebekreftelse, kvittering og viktig informasjon knyttet til din bestilling.</li>
              <li>Kunne kontakte deg dersom det oppstår endringer eller problemer med din booking.</li>
              <li>Gjennomføre sikker betaling (via våre betalingspartnere).</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">3. Hvilke opplysninger vi behandler</h2>
            <p className="text-zinc-400 leading-relaxed">
              Når du bestiller hos oss, ber vi om nødvendig kontaktinformasjon som navn, e-postadresse og telefonnummer. Vi lagrer også detaljer om opplevelsen du har booket (tidspunkt, type spill, antall personer). Kredittkortinformasjon håndteres av våre sikre betalingsleverandører og lagres ikke i våre systemer.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">4. Deling av personopplysninger</h2>
            <p className="text-zinc-400 leading-relaxed">
              Vi selger aldri dine personopplysninger til tredjeparter. Informasjonen deles kun med våre systemleverandører (som leverandør av bookingsystem og betalingsløsning) i den grad det er nødvendig for å levere våre tjenester. Alle våre underleverandører er underlagt strenge databehandleravtaler for å sikre at informasjonen din er trygg.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">5. Lagringstid og sletting</h2>
            <p className="text-zinc-400 leading-relaxed">
              Vi lagrer dine personopplysninger bare så lenge det er nødvendig for det formålet de ble samlet inn for. Dette betyr at data knyttet til selve bookingen beholdes til gjennomføringen er ferdig og eventuelle lovpålagte krav til regnskap og bokføring er oppfylt.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">6. Dine rettigheter</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Som registrert har du rett til å kreve:
            </p>
            <ul className="list-disc pl-6 text-zinc-400 space-y-2">
              <li>Innsyn i hvilke personopplysninger vi behandler om deg.</li>
              <li>Retting av mangelfulle eller uriktige opplysninger.</li>
              <li>Sletting av dine personopplysninger, med unntak av opplysninger vi er lovpålagt å oppbevare.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">7. Kontakt oss</h2>
            <p className="text-zinc-400 leading-relaxed">
              Dersom du har spørsmål om vår behandling av personopplysninger, eller ønsker å benytte deg av dine rettigheter, ta gjerne kontakt med oss. Vår oppdaterte kontaktinformasjon finner du alltid på våre nettsider.
            </p>
          </section>
          
          <div className="mt-12 pt-8 border-t border-white/10 text-sm text-zinc-500">
            Sist oppdatert: {new Date().toLocaleDateString('no-NO')}
          </div>
        </div>
      </div>
    </main>
  );
}
