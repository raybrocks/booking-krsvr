import { prisma } from './prisma';

/**
 * Returnerer dagens dato i formatet 'YYYY-MM-DD' i norsk tidssone (Europe/Oslo).
 */
export function getTodayOslo(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Sjekker om generalSettings har unntaksdatoer i specialHours som er eldre enn i dag.
 * Dersom utgåtte datoer finnes, filtreres de ut og databasen oppdateres asynkront i bakgrunnen.
 * Dagens dato og alle fremtidige datoer forblir uendret.
 */
export function cleanupGeneralSettings(generalValue: any): any {
  if (!generalValue || typeof generalValue !== 'object') {
    return generalValue;
  }

  const specialHours = generalValue.specialHours;
  if (!specialHours || typeof specialHours !== 'object') {
    return generalValue;
  }

  const today = getTodayOslo();
  const dateKeys = Object.keys(specialHours);
  
  // Finn datoer som er strengt eldre enn i dag
  const expiredDates = dateKeys.filter(dateKey => dateKey < today);
  if (expiredDates.length === 0) {
    return generalValue;
  }

  // Lag et nytt specialHours-objekt kun med dagens dato og fremtidige datoer
  const cleanedSpecialHours: Record<string, any> = {};
  for (const dateKey of dateKeys) {
    if (dateKey >= today) {
      cleanedSpecialHours[dateKey] = specialHours[dateKey];
    }
  }

  const updatedGeneral = {
    ...generalValue,
    specialHours: cleanedSpecialHours,
  };

  // Asynkron lagring til databasen i bakgrunnen uten å forsinke API-responsen
  prisma.setting.update({
    where: { key: 'general' },
    data: { value: updatedGeneral },
  }).catch((err: any) => {
    console.error("Feil ved automatisk opprydding av utgåtte unntaksdatoer i DB:", err);
  });

  return updatedGeneral;
}
