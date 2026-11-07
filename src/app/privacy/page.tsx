// src/app/privacy/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - PDFConverter',
  description: 'Learn how PDFConverter protects your documents and data with client-side in-browser processing.',
  alternates: {
    canonical: 'https://www.pdfconverter.space/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 py-16 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#111625] rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-8">
        <div>
          <nav className="text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:underline">Home</Link> / <span>Privacy Policy</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">Last updated: October 2026</p>
        </div>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Client-First Architecture</h2>
          <p>
            At PDFConverter (www.pdfconverter.space), user privacy is our core architectural priority. The vast majority of our document and image utilities (including image conversions, in-browser document previews, and text extraction) run directly inside your web browser via HTML5 Canvas, WebAssembly, and local memory buffers.
          </p>
          <p>
            When processing files client-side, your documents never leave your computer or mobile device and are never transmitted to our servers.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Server-Processed Files</h2>
          <p>
            For complex conversions requiring backend rendering, files sent to our processing endpoints are held strictly in temporary volatile memory for the duration of the conversion task. Converted output files are purged automatically within 60 minutes. We do not inspect, catalog, index, or share your document contents.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Information We Collect</h2>
          <p>
            We do not require account registration, usernames, or passwords to use our public converter tools.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Reviews and Feedback:</strong> If you voluntarily submit a user review, we store the name you provide, your rating, and any optional written commentary.</li>
            <li><strong>Abuse Prevention:</strong> To prevent denial-of-service attacks and automated review spam, we compute an irreversible cryptographic hash of your IP address. Raw IP addresses are not permanently stored in plain text.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Cookies and Local Storage</h2>
          <p>
            We use minimal browser cookies strictly for essential functionality, such as theme preference (Light/Dark mode) and administrative session verification. We do not use third-party tracking cookies or sell your personal data.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Contact Information</h2>
          <p>
            If you have any questions regarding this Privacy Policy or our data practices, please reach out via our <Link href="/contact" className="text-[#FF2E54] font-bold hover:underline">Contact Page</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}