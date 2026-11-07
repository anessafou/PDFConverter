// src/app/contact/page.tsx
import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Support & Feedback - PDFConverter',
  description: 'Get in touch with the PDFConverter team for questions, tool requests, bug reports, and support.',
  alternates: {
    canonical: 'https://www.pdfconverter.space/contact',
  },
  openGraph: {
    title: 'Contact Support & Feedback - PDFConverter',
    description: 'Get in touch with the PDFConverter team for questions, tool requests, bug reports, and support.',
    url: 'https://www.pdfconverter.space/contact',
    siteName: 'PDFConverter',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Support & Feedback - PDFConverter',
    description: 'Get in touch with the PDFConverter team for questions, tool requests, bug reports, and support.',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}