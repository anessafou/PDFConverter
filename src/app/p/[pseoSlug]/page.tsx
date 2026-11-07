// src/app/p/[pseoSlug]/page.tsx
import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  TOOLS_REGISTRY,
  ToolDefinition,
  PSEO_CONFIG,
  PseoModifier,
  getAllValidPseoSlugs,
} from '@/config/tools-registry';
import ConverterWidget from '@/components/ConverterWidget';
import ReviewSection from '@/components/reviews/ReviewSection';
import ReviewSchema from '@/components/reviews/ReviewSchema';
import { reviewsRepository } from '@/core/reviews/reviews-repository';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = getAllValidPseoSlugs();
  return slugs.map((pseoSlug) => ({ pseoSlug }));
}

interface PseoContext {
  tool: ToolDefinition;
  modifier: PseoModifier;
  cleanModifierName: string;
  allowedModifiers: readonly PseoModifier[];
}

function parsePseoSlug(slug: string): PseoContext | null {
  const keys = Object.keys(TOOLS_REGISTRY).sort((a, b) => b.length - a.length);

  for (const baseSlug of keys) {
    if (slug.startsWith(baseSlug + '-')) {
      const modifier = slug.slice(baseSlug.length + 1) as PseoModifier;
      const allowedModifiers = PSEO_CONFIG[baseSlug];

      if (!allowedModifiers || !allowedModifiers.includes(modifier)) {
        return null;
      }

      return {
        tool: TOOLS_REGISTRY[baseSlug],
        modifier,
        cleanModifierName: formatModifierLabel(modifier),
        allowedModifiers,
      };
    }
  }
  return null;
}

function findToolForLegacySlug(slug: string): ToolDefinition | null {
  const keys = Object.keys(TOOLS_REGISTRY).sort((a, b) => b.length - a.length);
  for (const baseSlug of keys) {
    if (slug.startsWith(baseSlug + '-')) {
      return TOOLS_REGISTRY[baseSlug];
    }
  }
  return null;
}

function formatModifierLabel(modifier: PseoModifier): string {
  switch (modifier) {
    case 'for-mac':
      return 'for Mac';
    case 'for-windows':
      return 'for Windows';
    case 'on-iphone':
      return 'on iPhone';
    case 'without-watermark':
      return 'without Watermark';
  }
}

function cleanFormatsList(formats: string[]): string {
  return formats.map((ext) => ext.replace(/^\./, '').toUpperCase()).join(', ');
}

function getPlatformContent(tool: ToolDefinition, modifier: PseoModifier) {
  const inputExts = cleanFormatsList(tool.inputFormat);
  const outExt = tool.outputFormat.toUpperCase();

  switch (modifier) {
    case 'for-mac':
      return {
        heroBadge: 'macOS Compatible • Apple Silicon & Intel',
        guideTitle: `How to Use ${tool.name} on macOS`,
        guideText: `No need to purchase Adobe Acrobat or install native Mac apps. Our converter runs directly in Safari, Chrome, and Edge on macOS, preserving native Apple fonts (San Francisco, Helvetica) and exact document page bounds without license keys.`,
        steps: [
          { num: '1', title: 'Select File from Finder', desc: `Open Finder, drag your ${inputExts} file directly into Safari or Chrome, or click the upload button.` },
          { num: '2', title: 'In-Browser Conversion', desc: `Our engine processes your document locally using WebAssembly, maintaining vector paths, tables, and typography.` },
          { num: '3', title: 'Save to Downloads or iCloud', desc: `Click Download to save your ${outExt} file instantly to your macOS ~/Downloads folder or iCloud Drive.` },
        ],
        specs: [
          { label: 'Compatible Browsers', value: 'Safari, Chrome, Edge, Firefox' },
          { label: 'macOS Requirements', value: 'macOS Sonoma, Ventura, Monterey & older' },
          { label: 'Software Needed', value: 'None (Runs 100% in browser)' },
          { label: 'Privacy', value: 'Client-first RAM processing' },
        ],
        faqs: [
          { q: `Will my Mac system fonts be preserved?`, a: `Yes. Spacing, typography, and embedded fonts are mirrored precisely so that documents look identical on Mac and recipient PCs.` },
          { q: `Do I need to buy Microsoft 365 or Adobe Acrobat for Mac?`, a: `No. All conversion operations run independently in your web browser with zero software or subscription fees.` },
          { q: `Can I drag and drop files directly from Finder?`, a: `Yes. Simply drag any supported ${inputExts} file from your Finder desktop or folder straight into the browser window.` },
          { q: `Is it safe to convert confidential business files on Mac?`, a: `Yes. Files are converted directly in your browser's local memory and are never uploaded or permanently saved to external servers.` },
        ],
      };

    case 'for-windows':
      return {
        heroBadge: 'Windows 11 & 10 • No .EXE Installation',
        guideTitle: `Using ${tool.name} on Windows 11 & 10`,
        guideText: `Convert your documents without purchasing Microsoft 365 licenses or running suspicious third-party executable (.exe) utilities. Fully optimized for Microsoft Edge and Google Chrome on Windows.`,
        steps: [
          { num: '1', title: 'Choose from File Explorer', desc: `Open File Explorer and drag your ${inputExts} file into the browser, or click Choose File.` },
          { num: '2', title: 'Lossless Conversion', desc: `Converts your file without changing margins, text styles, or embedded high-DPI images.` },
          { num: '3', title: 'Download to PC', desc: `Click Download to save your new ${outExt} document directly to your Windows Downloads folder.` },
        ],
        specs: [
          { label: 'Operating System', value: 'Windows 11, Windows 10, Windows 8/7' },
          { label: 'Compatible Browsers', value: 'Microsoft Edge, Chrome, Firefox, Brave' },
          { label: 'MS Office License', value: 'Not required (100% standalone)' },
          { label: 'Installation', value: 'Zero software or .exe downloads' },
        ],
        faqs: [
          { q: `Do I need Microsoft Office installed on Windows?`, a: `No. Our conversion engine operates standalone in the browser and does not require Microsoft Word, Excel, or PowerPoint installed on your PC.` },
          { q: `Is this safe from Windows malware and viruses?`, a: `Yes. Because you do not download any executable (.exe or .msi) files, your Windows system remains completely secure.` },
          { q: `Does this support large documents on Windows?`, a: `Yes, you can convert files up to 100MB with zero performance bottlenecks directly in Microsoft Edge or Chrome.` },
          { q: `How do I locate my converted file in File Explorer?`, a: `Once downloaded, press Ctrl + J in your browser or open File Explorer and navigate to your 'Downloads' folder.` },
        ],
      };

    case 'on-iphone':
      return {
        heroBadge: 'iOS & iPadOS • Mobile Safari Ready',
        guideTitle: `Converting Documents on iPhone & iPad`,
        guideText: `Engineered specifically for mobile Safari on iOS. Select files directly from the Apple Files app, iCloud Drive, or camera roll, and convert smoothly without purchasing App Store subscriptions.`,
        steps: [
          { num: '1', title: 'Pick from Files or Photos', desc: `Tap Choose File and select your document from the iOS Files app, iCloud Drive, or your photo album.` },
          { num: '2', title: 'Instant Mobile Processing', desc: `The conversion runs smoothly in Mobile Safari without draining battery or uploading data to third parties.` },
          { num: '3', title: 'Share via AirDrop or Files', desc: `Tap Download and choose 'Save to Files' or share directly with contacts via AirDrop, Mail, or Messages.` },
        ],
        specs: [
          { label: 'iOS Compatibility', value: 'iOS 17, 16, 15 & iPadOS' },
          { label: 'Mobile Browser', value: 'Mobile Safari, Chrome for iOS' },
          { label: 'App Store Download', value: 'Not required (Web-based)' },
          { label: 'Storage Integration', value: 'Apple Files App & iCloud Drive' },
        ],
        faqs: [
          { q: `Where does the converted file go on my iPhone?`, a: `After clicking Download, iOS will prompt you to open the file in Safari. Tap the Share button to save it directly to the 'Files' app or send via AirDrop.` },
          { q: `Can I convert files stored in iCloud Drive?`, a: `Yes. When you tap the upload button, select 'Browse' to pick any document from your iCloud Drive or local iPhone storage.` },
          { q: `Do I need to install an iOS app from the App Store?`, a: `No. The entire conversion runs directly inside Mobile Safari, saving storage space on your device.` },
          { q: `Does this consume mobile data?`, a: `Because file processing runs locally in your browser memory, data usage is minimal compared to heavy cloud converter apps.` },
        ],
      };

    case 'without-watermark':
      return {
        heroBadge: '100% Clean Output • Zero Watermarks',
        guideTitle: `Professional Exports with Zero Watermarks`,
        guideText: `Unlike competitor tools that stamp promotional logos or restricted headers across your documents, PDFConverter exports pristine, professional files with original formatting intact.`,
        steps: [
          { num: '1', title: 'Upload Original Document', desc: `Upload your ${inputExts} file. We accept files up to 100MB with no registration required.` },
          { num: '2', title: 'Clean Vector Conversion', desc: `Our engine preserves original typography, layout, and images without adding stamps, headers, or overlays.` },
          { num: '3', title: 'Download Pristine File', desc: `Receive your ${outExt} file ready for official submission, business clients, legal use, or academic review.` },
        ],
        specs: [
          { label: 'Watermark Status', value: '0% (No logos, stamps, or ads)' },
          { label: 'Account Requirement', value: 'No account, sign-up, or email' },
          { label: 'Max File Size', value: '100MB per file' },
          { label: 'Usage Limits', value: 'Unlimited free conversions' },
        ],
        faqs: [
          { q: `Will my downloaded file have any logo or watermark?`, a: `No. All exported files remain completely clean and professional. We never insert promotional text, stamps, or logos.` },
          { q: `Do I need to create an account to remove watermarks?`, a: `No. Unlike other websites that require a paid subscription to remove their branding, our watermark-free service is 100% free for everyone.` },
          { q: `Is document quality compromised?`, a: `Never. Formatting, image resolution, fonts, and vector lines are preserved at 100% fidelity.` },
          { q: `Can I use these files for commercial and legal work?`, a: `Yes. Your converted files are completely yours and ready for commercial, legal, medical, or academic use.` },
        ],
      };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pseoSlug: string }>;
}): Promise<Metadata> {
  const { pseoSlug } = await params;
  const parsed = parsePseoSlug(pseoSlug);
  if (!parsed) return {};

  const { tool, modifier, cleanModifierName } = parsed;
  const canonical = `https://www.pdfconverter.space/p/${pseoSlug}`;

  return {
    title: `${tool.name} ${cleanModifierName} - Free Online Converter | PDFConverter`,
    description: `Fast and secure ${tool.name} ${cleanModifierName}. No software installation or account required. Runs 100% in browser.`,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${tool.name} ${cleanModifierName} - Free Online Converter`,
      description: `Fast and secure ${tool.name} ${cleanModifierName}. In-browser processing with zero registration.`,
      url: canonical,
      siteName: 'PDFConverter',
      type: 'website',
    },
  };
}

export default async function PseoPage({
  params,
}: {
  params: Promise<{ pseoSlug: string }>;
}) {
  const { pseoSlug } = await params;
  const parsed = parsePseoSlug(pseoSlug);

  if (!parsed) {
    const legacyTool = findToolForLegacySlug(pseoSlug);
    if (legacyTool) {
      permanentRedirect(`/${legacyTool.slug}`);
    }
    notFound();
  }

  const { tool, modifier, cleanModifierName, allowedModifiers } = parsed;
  const content = getPlatformContent(tool, modifier);

  const [stats, reviews] = await Promise.all([
    reviewsRepository.getAggregateStats(tool.slug),
    reviewsRepository.getPublishedReviews(tool.slug, { limit: 20 }),
  ]);

  const canonicalUrl = `https://www.pdfconverter.space/p/${pseoSlug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.pdfconverter.space' },
      { '@type': 'ListItem', position: 2, name: tool.name, item: `https://www.pdfconverter.space/${tool.slug}` },
      { '@type': 'ListItem', position: 3, name: cleanModifierName, item: canonicalUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />

      <ReviewSchema
        toolName={`${tool.name} (${cleanModifierName})`}
        toolDescription={`Fast and secure ${tool.name} ${cleanModifierName}. Completely free directly in your browser.`}
        toolSlug={`p/${pseoSlug}`}
        stats={stats}
        reviews={reviews}
      />

      <div className="max-w-4xl mx-auto text-center space-y-4">
        <nav className="text-xs text-slate-400 flex justify-center items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href={`/${tool.slug}`} className="hover:underline">{tool.name}</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">{cleanModifierName}</span>
        </nav>

        {stats && stats.reviewCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111625] rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">{stats.ratingValue.toFixed(1).replace('.', ',')}</span>
            <span className="text-amber-400 text-sm">★★★★★</span>
            <span className="text-slate-500">({stats.reviewCount.toLocaleString()})</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 font-bold">Free</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {tool.name} <span className="text-[#FF2E54]">{cleanModifierName}</span>
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {content.guideText}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto pt-2 text-left">
          {content.specs.map((spec, i) => (
            <div key={i} className="p-2.5 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{spec.label}</span>
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={spec.value}>{spec.value}</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <ConverterWidget tool={tool} />
        </div>

        {allowedModifiers.length > 1 && (
          <div className="p-3 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Other options:</span>
            {allowedModifiers
              .filter((m) => m !== modifier)
              .map((altMod) => (
                <Link
                  key={altMod}
                  href={`/p/${tool.slug}-${altMod}`}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-[#FF2E54] font-semibold rounded-lg transition-colors"
                >
                  {formatModifierLabel(altMod)}
                </Link>
              ))}
          </div>
        )}

        <section className="text-left mt-16 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="inline-block px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-[#FF2E54] text-xs font-bold rounded-lg mb-2">
            {content.heroBadge}
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            {content.guideTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Follow these simple steps to complete your conversion without installing third-party apps:
          </p>

          <div className="grid gap-3 mb-8">
            {content.steps.map((st) => (
              <div key={st.num} className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-lg bg-[#FF2E54] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {st.num}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{st.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {content.faqs.map((f, i) => (
              <div key={i} className="p-4 bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {f.q}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <ReviewSection
          itemSlug={tool.slug}
          toolName={tool.name}
          initialStats={stats}
          initialReviews={reviews}
        />
      </div>
    </main>
  );
}