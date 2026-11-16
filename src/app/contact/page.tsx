import { existingPathAlternates, pageMetadata } from '@/config/page-metadata';
// src/app/contact/page.tsx
import { Metadata } from 'next';
import ContactClient from './ContactClient';

const languages = existingPathAlternates('/contact');
export const metadata: Metadata = pageMetadata('en',
  'Contact Support & Feedback - PDFConverter',
  'Get in touch with the PDFConverter team for questions, tool requests, bug reports, and support.',
  languages.en, languages,
);

export default function ContactPage() {
  return <ContactClient />;
}