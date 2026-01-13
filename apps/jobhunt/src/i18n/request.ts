import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locales.includes(locale as Locale) ? locale : 'en';

  return {
    messages: (await import(`../../messages/${safeLocale}.json`)).default,
  };
});
