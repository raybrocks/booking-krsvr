"use strict";
const fs = require("fs");
const content = fs.readFileSync("components/BookingFlow.tsx", "utf8");
const strings = {
  "hero.title1": "Booking",
  "footer.cancel": "Avbryt booking",
  "step1.title": "Velg dato & tid",
  "step1.subtitle": "Velg n\xE5r dere vil bes\xF8ke Krs VR Arena.",
  "step1.available": "Ledige tider",
  "step1.notimes": "Ingen ledige tider p\xE5 denne datoen.",
  "step1.selectdate": "Vennligst velg en dato f\xF8rst.",
  "step1.booked": "(Booket)",
  "step2.title": "Gruppest\xF8rrelse",
  "step2.subtitle": "Hvor mange skal spille?",
  "step2.info1": "Prisene er per person og synker for st\xF8rre grupper.",
  "step2.info2": "For grupper over 8, vennligst kontakt oss p\xE5 telefon eller e-post for \xE5 arrangere teambuilding.",
  "info.capacity": "Merk: Du kan justere antall personer helt frem til spillet starter. Vennligst sjekk maks kapasitet p\xE5 spillet dere velger f\xF8r ankomst.",
  "step3.title": "Velg VR Opplevelse",
  "step3.subtitle": "Velg VR-eventyr for gruppen.",
  "step3.age": "Alder:",
  "step3.diff": "Vanskelighet:",
  "step3.familyfriendly": "Familievennlig",
  "step3.total": "Total for {players}",
  "step3.perperson": "per person",
  "step3.noexp": "Ingen opplevelser tilgjengelig for {players} personer med valgt filter.",
  "step3.booknow": "Book n\xE5",
  "step4.title": "Dine opplysninger",
  "step4.subtitle": "Hvem st\xE5r p\xE5 bookingen?",
  "step4.fname": "Fornavn",
  "step4.lname": "Etternavn",
  "step4.email": "E-postadresse",
  "step4.phone": "Telefonnummer",
  "step5.title": "Nesten ferdig",
  "step5.subtitle": "Vennligst se over v\xE5re vilk\xE5r.",
  "step5.terms": "Jeg har lest og aksepterer kj\xF8psvilk\xE5rene, inkludert avbestillingsregler.",
  "step5.termsdesc": "Avbestilling m\xE5 skje senest 48 timer f\xF8r aktiviteten.",
  "step5.news": "Meld meg p\xE5 nyhetsbrev",
  "step5.newsdesc": "F\xE5 oppdateringer om nye VR-opplevelser og tilbud.",
  "step6.title": "Betaling",
  "step6.subtitle": "Se over bookingen og velg betalingsmetode.",
  "step6.players": "Spillere",
  "step6.price": "Pris",
  "step6.total": "Totalt bel\xF8p",
  "step6.payopt": "Betalingsalternativ",
  "step6.payfull": "Betal hele bel\xF8pet",
  "step6.resfee": "Reservasjonsavgift",
  "step6.eq1person": "Tilsvarer 1 person",
  "step6.payrest": "Betal restbel\xF8pet i arenaen",
  "step6.closed.title": "Booking midlertidig stengt",
  "step6.closed.subtitle": "Send e-post til post@krsvr.no",
  "nav.back": "Tilbake",
  "nav.continue": "Fortsett",
  "nav.pay": "Betal {amount} NOK",
  "nav.processing": "Behandler...",
  "success.title": "Booking Bekreftet",
  "success.desc": "Takk, {name}. VR opplevelsen er booket {date} kl. {time}. Vi har sendt bekreftelse til {email}.",
  "success.bookanother": "Book en ny",
  "filter.all": "Alle",
  "error.datetime": "Vennligst velg dato og tid.",
  "error.experience": "Vennligst velg en opplevelse.",
  "error.personal": "Vennligst fyll inn alle felter.",
  "error.email": "Vennligst skriv inn en gyldig e-postadresse.",
  "error.phone": "Telefonnummeret m\xE5 inneholde minst 8 siffer.",
  "error.terms": "Du m\xE5 godta vilk\xE5rene."
};
let output = content;
output = output.replace(/t\("([^"]+)"\)\s*\|\|\s*"[^"]+"/g, (match, key) => {
  return `"${strings[key] || key}"`;
});
output = output.replace(/\{t\("([^"]+)"\)\s*\|\|\s*"[^"]+"\}/g, (match, key) => {
  return strings[key] || key;
});
output = output.replace(/t\("([^"]+)"\)/g, (match, key) => {
  return `"${strings[key] || key}"`;
});
output = output.replace(/\{t\("([^"]+)"\)\}/g, (match, key) => {
  return strings[key] || key;
});
output = output.replace(/{t\("step3.total", \{ players \}\) \|\| "Total pris"}/g, "Total for {players}");
output = output.replace(/t\("step3.total", \{ players \}\)/g, "`Total for ${players}`");
output = output.replace(/\{t\("step3.noexp", \{ players \}\)\}/g, "Ingen opplevelser tilgjengelig for {players} personer med valgt filter.");
output = output.replace(/\{t\("step6.players", \{ players \}\)\}/g, "{players} Spillere");
output = output.replace(/\{t\("nav.pay", \{ amount: amountToPay \}\)\}/g, "Betal {amountToPay} NOK");
output = output.replace(/t\("success.title"\)/g, '"Booking Bekreftet"');
output = output.replace(/\{t\("success.desc", \{ name: firstName, date: selectedDate \? format\(selectedDate, "MMMM do, yyyy"\) : "", time: selectedTime, email: email \}\)\}/g, 'Takk, {firstName}. VR opplevelsen er booket {selectedDate ? format(selectedDate, "MMMM do, yyyy") : ""} kl. {selectedTime}. Vi har sendt bekreftelse til {email}.');
output = output.replace(/\{"([^"]+)"\}/g, "$1");
output = output.replace(/import \{ useI18n \} from "@\/lib\/i18n";\n/g, "");
output = output.replace(/\s*const \{ t \} = useI18n\(\);\n/g, "\n");
fs.writeFileSync("components/BookingFlow.tsx", output);
console.log("Done");
