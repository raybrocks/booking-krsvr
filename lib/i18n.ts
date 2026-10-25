export type Locale = "no" | "en" | "de" | "nl";

/**
 * Maps Norwegian paths to their English equivalents and vice versa.
 */
const NO_TO_EN_MAP: Record<string, string> = {
  "/": "/en",
  "/vr-opplevelser": "/en/experiences",
  "/vr-opplevelser/familie": "/en/experiences/family",
  "/vr-opplevelser/escape-room": "/en/experiences/escape-room",
  "/vr-opplevelser/action-strategi": "/en/experiences/action-strategy",
  "/vr-opplevelser/tactical-arena": "/en/experiences/tactical-arena",
  "/vr-opplevelser/zombie-shooter": "/en/experiences/zombie-shooter",
  "/booking": "/en/booking",
  "/priser": "/en/prices",
  "/arrangementer": "/en/events",
  "/arrangementer/vr-teambuilding": "/en/events#teambuilding",
  "/arrangementer/vr-utdrikningslag": "/en/events#bachelor-party",
  "/arrangementer/vr-bursdag": "/en/events#birthday",
  "/arrangementer/vr-on-site": "/en/events#on-site",
  "/faq": "/en/faq",
  "/kontakt": "/en/contact",
  "/vilkar": "/en/terms",
  "/personvern": "/en/privacy",
  "/feedback": "/en/feedback",
};

const EN_TO_NO_MAP: Record<string, string> = {
  "/en": "/",
  "/en/experiences": "/vr-opplevelser",
  "/en/experiences/family": "/vr-opplevelser/familie",
  "/en/experiences/escape-room": "/vr-opplevelser/escape-room",
  "/en/experiences/action-strategy": "/vr-opplevelser/action-strategi",
  "/en/experiences/tactical-arena": "/vr-opplevelser/tactical-arena",
  "/en/experiences/zombie-shooter": "/vr-opplevelser/zombie-shooter",
  "/en/booking": "/booking",
  "/en/prices": "/priser",
  "/en/events": "/arrangementer",
  "/en/faq": "/faq",
  "/en/contact": "/kontakt",
  "/en/terms": "/vilkar",
  "/en/privacy": "/personvern",
  "/en/feedback": "/feedback",
};

export function detectLocaleFromPath(pathname: string | null): Locale {
  if (!pathname) return "no";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/de" || pathname.startsWith("/de/")) return "de";
  if (pathname === "/nl" || pathname.startsWith("/nl/")) return "nl";
  return "no";
}

export function getTranslatedPath(currentPath: string | null, targetLocale: Locale): string {
  const path = currentPath || "/";

  if (targetLocale === "de") return "/de";
  if (targetLocale === "nl") return "/nl";

  if (targetLocale === "en") {
    if (path === "/en" || path.startsWith("/en/")) return path;
    if (path === "/de" || path === "/nl") return "/en";
    if (NO_TO_EN_MAP[path]) return NO_TO_EN_MAP[path];
    if (path.startsWith("/booking/manage/")) {
      return `/en${path}`;
    }
    if (path.startsWith("/vr-opplevelser/")) {
      const rest = path
        .replace("/vr-opplevelser/", "")
        .replace(/^familie/, "family")
        .replace(/^action-strategi/, "action-strategy");
      return `/en/experiences/${rest}`;
    }
    return "/en";
  }

  // targetLocale === "no"
  if (path === "/de" || path === "/nl") return "/";
  if (EN_TO_NO_MAP[path]) return EN_TO_NO_MAP[path];
  if (path.startsWith("/en/booking/manage/")) {
    return path.replace("/en/booking/manage/", "/booking/manage/");
  }
  if (path.startsWith("/en/experiences/")) {
    const rest = path
      .replace("/en/experiences/", "")
      .replace(/^family/, "familie")
      .replace(/^action-strategy/, "action-strategi");
    return `/vr-opplevelser/${rest}`;
  }
  if (path.startsWith("/en")) return "/";
  return path;
}

/**
 * Generates standard hreflang alternates metadata for Next.js pages
 */
export function buildHreflangAlternates(noPath: string, enPath: string, canonicalLocale: Locale = "no") {
  const baseUrl = "https://www.krsvr.no";
  const noUrl = `${baseUrl}${noPath === "/" ? "" : noPath}`;
  const enUrl = `${baseUrl}${enPath}`;
  const isHome = noPath === "/" || enPath === "/en";

  const canonical =
    canonicalLocale === "en"
      ? enUrl
      : canonicalLocale === "de"
      ? `${baseUrl}/de`
      : canonicalLocale === "nl"
      ? `${baseUrl}/nl`
      : noUrl;

  const languages: Record<string, string> = {
    "nb-NO": noUrl,
    "en": enUrl,
    "x-default": enUrl,
  };

  if (isHome) {
    languages["de"] = `${baseUrl}/de`;
    languages["nl"] = `${baseUrl}/nl`;
  }

  return {
    canonical,
    languages,
  };
}

/**
 * Translates common Norwegian suitableFor / difficulty / type strings if English DB fields are empty
 */
const SUITABLE_FOR_MAP_EN: Record<string, string> = {
  "Barn fra 8 år": "Kids from age 8",
  "Barn fra 8 år sammen med voksne": "Kids from age 8 with adults",
  "Ungdom": "Teens (12+)",
  "Ungdom sammen med voksne": "Teens with adults",
  "Voksne": "Adults",
};

const TYPE_MAP_EN: Record<string, string> = {
  "Familie": "Family",
  "Action Strategi": "Action & Strategy",
  "Escape Room": "Escape Room",
};

export function localizeExperience(exp: any, locale: "no" | "en" = "no") {
  if (locale === "no") return exp;

  const translatedSuitable =
    Array.isArray(exp.suitableForEn) && exp.suitableForEn.length > 0
      ? exp.suitableForEn
      : Array.isArray(exp.suitableFor)
      ? exp.suitableFor.map((s: string) => SUITABLE_FOR_MAP_EN[s] || s)
      : [];

  return {
    ...exp,
    name: exp.nameEn || exp.name,
    subName: exp.subNameEn !== undefined && exp.subNameEn !== null && exp.subNameEn !== "" ? exp.subNameEn : exp.subName,
    shortDescription: exp.shortDescriptionEn || exp.shortDescription,
    difficulty: exp.difficultyEn || exp.difficulty,
    suitableFor: translatedSuitable,
    displayType: TYPE_MAP_EN[exp.type || ""] || exp.type,
  };
}
