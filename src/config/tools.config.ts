export interface ToolDefinition {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  category: 'convert-to' | 'convert-from' | 'organize' | 'optimize' | 'security';
  acceptedMimeTypes: Record<string, string[]>;
  maxFiles: number;
  maxSizeBytes: number;
  executionMode: 'client-only' | 'server-only' | 'hybrid';
  icon: string;
  colorAccent: string;
  badge?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    faq: { question: string; answer: string }[];
  };
}

export const TOOLS_REGISTRY: Record<string, ToolDefinition> = {
  'word-to-pdf': {
    id: 'word-to-pdf',
    slug: 'word-to-pdf',
    title: 'Word to PDF Converter',
    shortDesc: 'Convert DOCX and DOC files to PDF with 100% layout preservation.',
    category: 'convert-to',
    acceptedMimeTypes: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 10,
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    executionMode: 'hybrid',
    icon: 'FileText',
    colorAccent: '#2B579A', // Word Blue
    seo: {
      metaTitle: 'Word to PDF - Convert DOCX to PDF Online Free',
      metaDescription: 'Easily convert Word documents to high-quality PDF files online. Fast, secure, and preserves all formatting.',
      keywords: ['word to pdf', 'convert docx to pdf', 'doc to pdf online'],
      faq: [
        {
          question: 'Will my fonts and tables remain unchanged?',
          answer: 'Yes. Our conversion engine mirrors Microsoft Word rendering to ensure all spacing, tables, and typography stay intact.'
        }
      ]
    }
  },
  'merge-pdf': {
    id: 'merge-pdf',
    slug: 'merge-pdf',
    title: 'Merge PDF Files',
    shortDesc: 'Combine multiple PDF files into a single organized document in seconds.',
    category: 'organize',
    acceptedMimeTypes: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 50,
    maxSizeBytes: 100 * 1024 * 1024,
    executionMode: 'client-only',
    icon: 'Layers',
    colorAccent: '#E53E3E',
    seo: {
      metaTitle: 'Merge PDF - Combine Multiple PDFs Online',
      metaDescription: 'Join multiple PDF documents into one PDF file online for free. Drag, reorder, and combine securely.',
      keywords: ['merge pdf', 'combine pdf files', 'join pdf'],
      faq: [
        {
          question: 'Are my merged files uploaded to any server?',
          answer: 'No. Merge PDF runs entirely inside your browser using WebAssembly. Your files never leave your device.'
        }
      ]
    }
  }
};