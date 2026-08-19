import { useEffect, useMemo, useState } from "react";

import { setFormatLocale } from "../api/format";
import { DICTIONARY } from "./dictionary";
import { DEFAULT_LANG, LANGUAGES, LanguageContext, STORAGE_KEY, isSupported } from "./context";

/** 저장된 언어 → 브라우저 언어 → 한국어 순으로 초기값을 정한다. */
function readInitialLang() {
  if (typeof window === "undefined") return DEFAULT_LANG;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) return stored;
  } catch {
    // 사파리 프라이빗 모드처럼 localStorage 를 막는 환경에서는 그냥 넘어간다
  }

  const navigatorLang = window.navigator?.language?.slice(0, 2);
  return isSupported(navigatorLang) ? navigatorLang : DEFAULT_LANG;
}

/**
 * 한국어 원문을 키로 쓰는 번역 함수.
 * 사전에 없는 문구는 원문(한국어)을 그대로 돌려주므로, 번역이 빠져도 화면은 깨지지 않는다.
 * 서버가 내려주는 라벨(제품 종류·진행 상태 등)도 같은 방식으로 통과시킨다.
 *
 * @param {string} text 한국어 원문
 * @param {Record<string, string|number>} [vars] `{name}` 자리표시자에 채울 값
 */
function translate(lang, text, vars) {
  if (typeof text !== "string" || text === "") return text;

  const table = DICTIONARY[lang];
  let result = (table && table[text]) || text;

  if (vars) {
    result = result.replace(/\{(\w+)\}/g, (match, key) =>
      key in vars ? String(vars[key]) : match,
    );
  }

  return result;
}

export default function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readInitialLang);

  useEffect(() => {
    const language = LANGUAGES.find((item) => item.code === lang) ?? LANGUAGES[0];
    document.documentElement.lang = language.htmlLang;

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // 저장 실패는 무시한다 — 이번 세션 동안만 언어가 유지된다
    }
  }, [lang]);

  // 날짜·금액 포맷은 자식이 그려지기 전에 맞춰야 한다 — effect 는 렌더 뒤라 한 박자 늦는다.
  setFormatLocale(lang);

  const value = useMemo(
    () => ({
      lang,
      setLang: (next) => setLang(isSupported(next) ? next : DEFAULT_LANG),
      t: (text, vars) => translate(lang, text, vars),
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
