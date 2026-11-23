import { ENGLISH_SERVICE_EDITORIAL } from '@/config/english-service-editorial';
import { TOOLS_REGISTRY } from '@/config/tools-registry';
import { getToolContent } from '@/config/tool-content';
import uiCatalog from './ui-catalog.json';
// src/locales/dictionaries.ts
import { Locale } from '@/config/i18n-registry';

export interface TranslationDictionary {
  common: {
    freeBadge: string;
    noSignUp: string;
    chooseFile: string;
    dropFileText: string;
    dropFileSubtext: string;
    converting: string;
    convertNow: string;
    downloadFile: string;
    convertAnother: string;
    allTools: string;
    faqTitle: string;
    userReviewsTitle: string;
    userReviewsSub: string;
    writeReview: string;
    ratingBasedOn: string;
  };
  home: {
    title: string;
    description: string;
    heroH1Pre: string;
    heroH1Span: string;
    heroH1Post: string;
    heroSub: string;
    startNow: string;
    exploreAll: string;
    trust1: string;
    trust1Sub: string;
    trust2: string;
    trust2Sub: string;
    trust3: string;
    trust3Sub: string;
    popularTools: string;
    popularToolsSub: string;
    whyChoose: string;
  };
  tools: Record<string, {
    title: string;
    h1: string;
    description: string;
    faqs?: { q: string; a: string }[];
  }>;
}

export const DICTIONARIES: Record<Locale, TranslationDictionary> = {
  en: {
    common: {
      freeBadge: '100% Free • No Sign Up',
      noSignUp: 'No registration required',
      chooseFile: 'Choose File',
      dropFileText: 'Drag & drop your file here',
      dropFileSubtext: 'or click to browse from your device',
      converting: 'Converting...',
      convertNow: 'Convert Now',
      downloadFile: 'Download File',
      convertAnother: 'Convert Another',
      allTools: 'Explore All Tools',
      faqTitle: 'Frequently Asked Questions',
      userReviewsTitle: 'User Reviews & Ratings',
      userReviewsSub: 'Feedback submitted by real users.',
      writeReview: 'Write a Review',
      ratingBasedOn: 'user reviews',
    },
    home: {
      title: 'PDFConverter - Free Online PDF & Document Suite',
      description: "Convert, organize and preview PDF, Office and image files. Some tools run in your browser, and others use a conversion service.",
      heroH1Pre: 'We make ',
      heroH1Span: 'PDF',
      heroH1Post: ' easy.',
      heroSub: 'All the tools you need to convert, edit, compress and manage your PDF files — fast, secure, and free.',
      startNow: 'Start Now Free',
      exploreAll: 'Explore All PDF Tools',
      trust1: '100% Free',
      trust1Sub: 'No hidden subscriptions',
      trust2: 'Fast & Secure',
      trust2Sub: 'Client-first privacy',
      trust3: 'No Sign Up',
      trust3Sub: 'Start instantly',
      popularTools: 'Most Popular PDF Tools',
      popularToolsSub: 'The tools you need most, all in one place. Simple, fast and reliable.',
      whyChoose: 'Why Choose PDFConverter?',
    },
    tools: {
      'word-to-pdf': {
        title: 'Word to PDF - Free Online Converter | PDFConverter',
        h1: 'Word to PDF Converter',
        description: "",
      },
      'pdf-to-word': {
        title: 'PDF to Word - Free Online Converter | PDFConverter',
        h1: 'PDF to Word Converter',
        description: "",
      },
    }
  },
  fr: {
    common: {
      freeBadge: '100% Gratuit • Sans Inscription',
      noSignUp: 'Aucune inscription requise',
      chooseFile: 'Choisir un fichier',
      dropFileText: 'Glissez-déposez votre fichier ici',
      dropFileSubtext: 'ou cliquez pour parcourir vos dossiers',
      converting: 'Conversion en cours...',
      convertNow: 'Convertir maintenant',
      downloadFile: 'Télécharger le fichier',
      convertAnother: 'Convertir un autre fichier',
      allTools: 'Découvrir tous les outils',
      faqTitle: 'Foire Aux Questions',
      userReviewsTitle: 'Avis et Évaluations',
      userReviewsSub: 'Retours soumis par de vrais utilisateurs.',
      writeReview: 'Laisser un avis',
      ratingBasedOn: 'avis utilisateurs',
    },
    home: {
      title: 'PDFConverter - Suite d\'outils PDF et Documents Gratuite',
      description: "Convertissez, organisez et prévisualisez vos PDF, fichiers Office et images. Certains outils fonctionnent dans le navigateur, d’autres utilisent un service de conversion.",
      heroH1Pre: 'Nous rendons les ',
      heroH1Span: 'PDF',
      heroH1Post: ' faciles.',
      heroSub: 'Tous les outils dont vous avez besoin pour convertir, modifier et gérer vos fichiers PDF — rapide, sécurisé et gratuit.',
      startNow: 'Commencer Gratuitement',
      exploreAll: 'Explorer tous les outils',
      trust1: '100% Gratuit',
      trust1Sub: 'Sans abonnement caché',
      trust2: 'Rapide & Sécurisé',
      trust2Sub: 'Confidentialité absolue',
      trust3: 'Sans Inscription',
      trust3Sub: 'Utilisation instantanée',
      popularTools: 'Outils PDF les plus populaires',
      popularToolsSub: 'Les outils dont vous avez le plus besoin. Simples, rapides et fiables.',
      whyChoose: 'Pourquoi choisir PDFConverter ?',
    },
    tools: {
      'word-to-pdf': {
        title: 'Convertir Word en PDF - Gratuit et en Ligne | PDFConverter',
        h1: 'Convertir Word en PDF',
        description: "",
      },
      'pdf-to-word': {
        title: 'Convertir PDF en Word - Gratuit et en Ligne | PDFConverter',
        h1: 'Convertir PDF en Word',
        description: "",
      },
    }
  },
  es: {
    common: {
      freeBadge: '100% Gratis • Sin Registro',
      noSignUp: 'Sin necesidad de registrarse',
      chooseFile: 'Seleccionar archivo',
      dropFileText: 'Arrastra y suelta tu archivo aquí',
      dropFileSubtext: 'o haz clic para explorar en tu dispositivo',
      converting: 'Convirtiendo...',
      convertNow: 'Convertir ahora',
      downloadFile: 'Descargar archivo',
      convertAnother: 'Convertir otro archivo',
      allTools: 'Ver todas las herramientas',
      faqTitle: 'Preguntas Frecuentes',
      userReviewsTitle: 'Opiniones y Valoraciones',
      userReviewsSub: 'Comentarios enviados por usuarios reales.',
      writeReview: 'Escribir una opinión',
      ratingBasedOn: 'opiniones de usuarios',
    },
    home: {
      title: 'PDFConverter - Herramientas PDF y Documentos Gratis',
      description: "Convierte, organiza y previsualiza PDF, archivos de Office e imágenes. Algunas herramientas funcionan en el navegador y otras usan un servicio de conversión.",
      heroH1Pre: 'Hacemos el ',
      heroH1Span: 'PDF',
      heroH1Post: ' muy fácil.',
      heroSub: 'Todas las herramientas que necesitas para convertir, editar, comprimir y gestionar tus archivos PDF: rápido, seguro y gratis.',
      startNow: 'Empezar Gratis',
      exploreAll: 'Explorar herramientas',
      trust1: '100% Gratis',
      trust1Sub: 'Sin suscripciones ocultas',
      trust2: 'Rápido y Seguro',
      trust2Sub: 'Privacidad garantizada',
      trust3: 'Sin Registro',
      trust3Sub: 'Uso instantáneo',
      popularTools: 'Herramientas PDF Populares',
      popularToolsSub: 'Las herramientas que más necesitas, en un solo lugar. Simples y fiables.',
      whyChoose: '¿Por qué elegir PDFConverter?',
    },
    tools: {
      'word-to-pdf': {
        title: 'Convertir Word a PDF - Gratis y Online | PDFConverter',
        h1: 'Convertir Word a PDF',
        description: "",
      },
      'pdf-to-word': {
        title: 'Convertir PDF a Word - Gratis y Online | PDFConverter',
        h1: 'Convertir PDF a Word',
        description: "",
      },
    }
  },
  de: {
    common: {
      freeBadge: '100% Kostenlos • Ohne Anmeldung',
      noSignUp: 'Keine Registrierung erforderlich',
      chooseFile: 'Datei auswählen',
      dropFileText: 'Datei hierher ziehen und ablegen',
      dropFileSubtext: 'oder klicken, um auf dem Gerät zu suchen',
      converting: 'Wird konvertiert...',
      convertNow: 'Jetzt konvertieren',
      downloadFile: 'Datei herunterladen',
      convertAnother: 'Weitere Datei',
      allTools: 'Alle Tools entdecken',
      faqTitle: 'Häufig gestellte Fragen',
      userReviewsTitle: 'Nutzerbewertungen',
      userReviewsSub: 'Echtes Feedback von unseren Nutzern.',
      writeReview: 'Bewertung schreiben',
      ratingBasedOn: 'Nutzerbewertungen',
    },
    home: {
      title: 'PDFConverter - Kostenlose Online PDF-Suite',
      description: "Konvertieren, organisieren und prüfen Sie PDF-, Office- und Bilddateien. Manche Werkzeuge arbeiten im Browser, andere nutzen einen Konvertierungsdienst.",
      heroH1Pre: 'Wir machen ',
      heroH1Span: 'PDF',
      heroH1Post: ' ganz einfach.',
      heroSub: 'Alle Tools, die Sie benötigen, um Ihre PDF-Dateien zu konvertieren, bearbeiten und zu verwalten — schnell, sicher und kostenlos.',
      startNow: 'Jetzt kostenlos starten',
      exploreAll: 'Alle PDF-Tools anzeigen',
      trust1: '100% Kostenlos',
      trust1Sub: 'Keine versteckten Kosten',
      trust2: 'Schnell & Sicher',
      trust2Sub: 'Höchster Datenschutz',
      trust3: 'Ohne Anmeldung',
      trust3Sub: 'Sofort startklar',
      popularTools: 'Beliebteste PDF-Tools',
      popularToolsSub: 'Die wichtigsten Tools an einem Ort. Einfach, schnell und zuverlässig.',
      whyChoose: 'Warum PDFConverter wählen?',
    },
    tools: {
      'word-to-pdf': {
        title: 'Word in PDF umwandeln - Kostenlos Online | PDFConverter',
        h1: 'Word in PDF umwandeln',
        description: "",
      },
      'pdf-to-word': {
        title: 'PDF in Word umwandeln - Kostenlos Online | PDFConverter',
        h1: 'PDF in Word umwandeln',
        description: "",
      },
    }
  },
  ar: {
    common: {
      freeBadge: '100% مجاناً • بدون تسجيل',
      noSignUp: 'لا يلزم إنشاء حساب',
      chooseFile: 'اختر الملف',
      dropFileText: 'اسحب وأفلت الملف هنا',
      dropFileSubtext: 'أو انقر للتصفح من جهازك',
      converting: 'جاري التحويل...',
      convertNow: 'تحويل الآن',
      downloadFile: 'تحميل الملف',
      convertAnother: 'تحويل ملف آخر',
      allTools: 'استكشف جميع الأدوات',
      faqTitle: 'الأسئلة الشائعة',
      userReviewsTitle: 'تقييمات وآراء المستخدمين',
      userReviewsSub: 'آراء وملاحظات المستخدمين الحقيقيين.',
      writeReview: 'اكتب تقييماً',
      ratingBasedOn: 'تقييمات مستخدمين',
    },
    home: {
      title: 'PDFConverter - أدوات PDF والمستندات المجانية',
      description: "حوّل ملفات PDF وOffice والصور ونظّمها وعاينها. تعمل بعض الأدوات في المتصفح وتستخدم أخرى خدمة تحويل.",
      heroH1Pre: 'نجعل التعامل مع ',
      heroH1Span: 'PDF',
      heroH1Post: ' سهلاً للغاية.',
      heroSub: 'كل الأدوات التي تحتاجها لتحويل، تعديل، ضغط وإدارة ملفات PDF الخاصة بك — بسرعة، أمان، ومجاناً.',
      startNow: 'ابدأ الآن مجاناً',
      exploreAll: 'استكشف جميع أدوات PDF',
      trust1: 'مجاني 100%',
      trust1Sub: 'بدون اشتراكات مخفية',
      trust2: 'سريع وآمن',
      trust2Sub: 'خصوصية تامة لملفاتك',
      trust3: 'بدون تسجيل',
      trust3Sub: 'استخدمه فوراً',
      popularTools: 'أدوات PDF الأكثر استخداماً',
      popularToolsSub: 'الأدوات التي تحتاجها أكثر، في مكان واحد. بسيطة وسريعة وموثوقة.',
      whyChoose: 'لماذا تختار PDFConverter؟',
    },
    tools: {
      'word-to-pdf': {
        title: 'تحويل وورد الى PDF - مجاناً وبسرعة عبر الإنترنت | PDFConverter',
        h1: 'تحويل وورد إلى PDF',
        description: "",
      },
      'pdf-to-word': {
        title: 'تحويل PDF الى وورد - مستند Word قابل للتعديل مجاناً | PDFConverter',
        h1: 'تحويل PDF إلى Word',
        description: "",
      },
    }
  }
};
// Complete every service while retaining the original editorial translations.
const nonEnglish = ['fr', 'es', 'de', 'ar'] as const;
for (const tool of Object.values(TOOLS_REGISTRY)) {
  DICTIONARIES.en.tools[tool.slug] ||= { title: tool.name + ' - PDFConverter', h1: tool.name, description: tool.description };
  for (const [index, locale] of nonEnglish.entries()) {
    if (DICTIONARIES[locale].tools[tool.slug]) continue;
    const special = uiCatalog.find(row => row[0] === tool.name)?.[index + 1];
    const pair = tool.name.split(' to ');
    const h1 = special || (pair.length === 2 ? (
      locale === 'fr' ? 'Convertir ' + pair[0] + ' en ' + pair[1] :
      locale === 'es' ? 'Convertir ' + pair[0] + ' a ' + pair[1] :
      locale === 'de' ? pair[0] + ' in ' + pair[1] + ' umwandeln' :
      'تحويل ' + pair[0] + ' إلى ' + pair[1]
    ) : tool.name);
    const description = getToolContent(tool, locale).description;
    const label = ({ fr: 'Gratuit en ligne', es: 'Gratis en línea', de: 'Kostenlos online', ar: 'مجاني عبر الإنترنت' })[locale];
    DICTIONARIES[locale].tools[tool.slug] = { title: h1 + ' - ' + label + ' | PDFConverter', h1, description };
  }
}

// Use the same processing facts on tool pages and platform guides.
for (const tool of Object.values(TOOLS_REGISTRY)) {
  for (const locale of ['en', ...nonEnglish] as const) {
    const { description, faqs } = getToolContent(tool, locale);
    Object.assign(DICTIONARIES[locale].tools[tool.slug], { description, faqs });
  }
}

for (const [slug, copy] of Object.entries(ENGLISH_SERVICE_EDITORIAL)) {
  Object.assign(DICTIONARIES.en.tools[slug], { title: copy.title, h1: copy.h1, description: copy.description, faqs: copy.faqs });
}
