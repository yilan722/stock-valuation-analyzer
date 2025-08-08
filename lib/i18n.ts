export const locales = ['en', 'zh'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文'
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/')
  const locale = segments[1] as Locale
  return locales.includes(locale) ? locale : defaultLocale
}

export function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split('/')
  const locale = segments[1] as Locale
  if (locales.includes(locale)) {
    return '/' + segments.slice(2).join('/')
  }
  return pathname
} 