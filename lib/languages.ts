export interface LanguageOption {
  id: string;
  label: string;
  labelNo: string;
  flag: string;
  iso: string;
}

export const COMMON_LANGUAGES: LanguageOption[] = [
  { id: "English", label: "English", labelNo: "Engelsk", flag: "🇬🇧", iso: "en" },
  { id: "Norwegian", label: "Norwegian", labelNo: "Norsk", flag: "🇳🇴", iso: "no" },
  { id: "German", label: "German", labelNo: "Tysk", flag: "🇩🇪", iso: "de" },
  { id: "French", label: "French", labelNo: "Fransk", flag: "🇫🇷", iso: "fr" },
  { id: "Spanish", label: "Spanish", labelNo: "Spansk", flag: "🇪🇸", iso: "es" },
  { id: "Italian", label: "Italian", labelNo: "Italiensk", flag: "🇮🇹", iso: "it" },
  { id: "Dutch", label: "Dutch", labelNo: "Nederlandsk", flag: "🇳🇱", iso: "nl" },
  { id: "Chinese", label: "Chinese", labelNo: "Kinesisk", flag: "🇨🇳", iso: "zh" },
  { id: "Arabic", label: "Arabic", labelNo: "Arabisk", flag: "🇸🇦", iso: "ar" },
  { id: "Polish", label: "Polish", labelNo: "Polsk", flag: "🇵🇱", iso: "pl" },
  { id: "Catalan", label: "Catalan", labelNo: "Katalansk", flag: "🇪🇸", iso: "ca" },
  { id: "Russian", label: "Russian", labelNo: "Russisk", flag: "🇷🇺", iso: "ru" },
  { id: "Portuguese", label: "Portuguese", labelNo: "Portugisisk", flag: "🇵🇹", iso: "pt" },
  { id: "Japanese", label: "Japanese", labelNo: "Japansk", flag: "🇯🇵", iso: "ja" },
  { id: "Korean", label: "Korean", labelNo: "Koreansk", flag: "🇰🇷", iso: "ko" },
  { id: "Swedish", label: "Swedish", labelNo: "Svensk", flag: "🇸🇪", iso: "sv" },
  { id: "Danish", label: "Danish", labelNo: "Dansk", flag: "🇩🇰", iso: "da" },
  { id: "Ukrainian", label: "Ukrainian", labelNo: "Ukrainsk", flag: "🇺🇦", iso: "uk" },
];

const LANGUAGE_LOOKUP = new Map<string, LanguageOption>();

COMMON_LANGUAGES.forEach((lang) => {
  LANGUAGE_LOOKUP.set(lang.id.toLowerCase(), lang);
  LANGUAGE_LOOKUP.set(lang.label.toLowerCase(), lang);
  LANGUAGE_LOOKUP.set(lang.labelNo.toLowerCase(), lang);
  LANGUAGE_LOOKUP.set(lang.iso.toLowerCase(), lang);
});

export function getLanguageInfo(name: string): { label: string; labelNo: string; flag: string; iso: string } {
  if (!name) {
    return { label: "", labelNo: "", flag: "🌐", iso: "und" };
  }
  const match = LANGUAGE_LOOKUP.get(name.trim().toLowerCase());
  if (match) {
    return match;
  }
  return {
    label: name,
    labelNo: name,
    flag: "🌐",
    iso: "und",
  };
}

export function formatLanguageDisplay(name: string, preferNorwegian = true): string {
  const info = getLanguageInfo(name);
  const text = preferNorwegian ? info.labelNo : info.label;
  return `${info.flag} ${text}`;
}
