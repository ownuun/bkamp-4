const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bkamp/shared', '@bkamp/supabase'],
};

module.exports = withNextIntl(nextConfig);
