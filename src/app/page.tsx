import { pageMetadata } from '@/config/page-metadata';
import { generateHreflangAlternates } from '@/config/i18n-registry';
import { DICTIONARIES } from '@/locales/dictionaries';
export const dynamic = 'force-dynamic';
// src/app/page.tsx
import React from 'react';
import { Metadata } from 'next';
import HomeTemplate from '@/components/pseo/templates/HomeTemplate';

export const revalidate = 60;

const home = DICTIONARIES.en.home;
const { canonical, languages } = generateHreflangAlternates();
export const metadata: Metadata = pageMetadata('en', home.title, home.description, canonical, languages);

export default async function HomePage() {
  return <HomeTemplate locale="en" />;
}