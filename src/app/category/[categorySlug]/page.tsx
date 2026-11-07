// src/app/category/[categorySlug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { TOOLS_REGISTRY, ServiceCategory, ToolDefinition } from '@/config/tools-registry';

const CATEGORY_METADATA: Record<
  ServiceCategory,
  { name: string; title: string; description: string; heading: string }
> = {
  'pdf-to': {
    name: 'PDF to Other Formats',
    title: 'PDF to Word, Excel, JPG & Other Formats - PDFConverter',
    description: 'Convert PDF files into Microsoft Word, Excel spreadsheets, PowerPoint, JPG, and PNG images online for free.',
    heading: 'Convert From PDF',
  },
  'convert-to-pdf': {
    name: 'Convert to PDF',
    title: 'Convert Documents & Images to PDF Online Free - PDFConverter',
    description: 'Convert Word, Excel, PowerPoint, JPG, PNG, HTML, and text files into standard high-resolution PDF documents.',
    heading: 'Convert Any Document to PDF',
  },
  'document': {
    name: 'PDF Organization & Office',
    title: 'Merge, Split, Compress & Edit PDF Files - PDFConverter',
    description: 'Fast online tools to merge multiple PDFs, compress large files, split pages, rotate, and manage document formats.',
    heading: 'Organize, Merge & Compress Documents',
  },
  'image': {
    name: 'Image Converters',
    title: 'Universal Multi-Format Image Converter - PDFConverter',
    description: 'Batch convert between JPG, PNG, WebP, AVIF, HEIC, TIFF, and SVG images with alpha transparency and zero quality loss.',
    heading: 'Image Conversion Suite',
  },
  'utility': {
    name: 'Utilities & Viewers',
    title: 'Online Document Viewers & Editors - PDFConverter',
    description: 'Direct in-browser document previews for Word, Excel, PowerPoint, and live Markdown editing with instant export.',
    heading: 'Document Viewers & Markdown Utilities',
  },
};

export async function generateStaticParams() {
  const categories: ServiceCategory[] = ['pdf-to', 'convert-to-pdf', 'document', 'image', 'utility'];
  return categories.map((categorySlug) => ({ categorySlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const meta = CATEGORY_METADATA[categorySlug as ServiceCategory];
  if (!meta) return {};

  const canonical = `https://www.pdfconverter.space/category/${categorySlug}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      siteName: 'PDFConverter',
      type: 'website',
    },
  };
}

export default async function CategoryHubPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const meta = CATEGORY_METADATA[categorySlug as ServiceCategory];
  if (!meta) notFound();

  const tools = Object.values(TOOLS_REGISTRY).filter((t) => t.category === categorySlug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.pdfconverter.space' },
      { '@type': 'ListItem', position: 2, name: meta.name, item: `https://www.pdfconverter.space/category/${categorySlug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkBg py-12 px-4 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        <nav className="text-xs text-slate-400 flex items-center gap-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">{meta.name}</span>
        </nav>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {meta.heading}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {meta.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="p-5 bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-[#FF2E54] dark:hover:border-[#FF2E54] transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {tool.inputFormat.join(', ').replace(/\./g, '')} &rarr; {tool.outputFormat.toUpperCase()}
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF2E54] transition-colors mt-1">
                  {tool.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <span className="text-xs font-bold text-[#FF2E54] mt-4 flex items-center gap-1">Open Tool &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}