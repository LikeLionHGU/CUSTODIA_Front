import { createContext, useContext } from "react";

/** 화면에 노출되는 언어 목록. Header 스위처와 Footer 하단이 같은 배열을 쓴다. */
export const LANGUAGES = [
  { code: "ko", label: "KR", htmlLang: "ko" },
  { code: "en", label: "EN", htmlLang: "en" },
  { code: "de", label: "DE", htmlLang: "de" },
];

export const DEFAULT_LANG = "ko";
export const STORAGE_KEY = "custodia.lang";

export function isSupported(code) {
  return LANGUAGES.some((language) => language.code === code);
}

export const LanguageContext = createContext(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage 는 LanguageProvider 안에서만 쓸 수 있습니다.");
  return context;
}

/** 문구만 필요한 대부분의 화면이 쓰는 축약 훅. */
export function useT() {
  return useLanguage().t;
}
