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
    why1: string;
    why1Sub: string;
    why2: string;
    why2Sub: string;
    why3: string;
    why3Sub: string;
    why4: string;
    why4Sub: string;
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
      description: 'Convert, compress, and edit PDF, Office, and image files online for free. In-browser processing with no account required.',
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
      why1: 'Super Fast & Reliable',
      why1Sub: 'High-speed conversion engine preserving your original layout and text formatting.',
      why2: 'Secure & Private',
      why2Sub: 'Client-supported conversions run in your browser. Server files are deleted automatically.',
      why3: 'Works on Any Device',
      why3Sub: 'Use it on your desktop, tablet, or mobile — anytime, anywhere.',
      why4: '100% Free to Use',
      why4Sub: 'Free conversions up to 100MB with no daily task caps. No registration required.'
    },
    tools: {
      'word-to-pdf': {
        title: 'Word to PDF - Free Online Converter | PDFConverter',
        h1: 'Word to PDF Converter',
        description: 'Convert Microsoft Word DOCX and DOC documents to high-quality PDF files online. Fast, secure, and preserves all formatting.',
        faqs: [
          { q: 'Will my fonts and tables remain unchanged?', a: 'Yes. Our conversion engine mirrors Microsoft Word rendering to ensure all spacing, tables, and typography stay intact.' },
          { q: 'Is this Word to PDF converter free?', a: 'Yes, it is 100% free with no account creation, email requirement, or watermarks.' },
        ],
      },
      'pdf-to-word': {
        title: 'PDF to Word - Free Online Converter | PDFConverter',
        h1: 'PDF to Word Converter',
        description: 'Convert PDF documents into editable Microsoft Word DOCX files. Preserves paragraphs, formatting, and layout.',
        faqs: [
          { q: 'Can I edit the converted Word document?', a: 'Yes. The output is a genuine, editable .docx file that opens in Microsoft Word, Google Docs, and LibreOffice.' },
          { q: 'Are my confidential documents secure?', a: 'Yes. Client operations run in browser memory, and any server-processed files are permanently deleted after 60 minutes.' },
        ],
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
      description: 'Convertissez, compressez et modifiez des PDF et images en ligne gratuitement. Traitement sécurisé sans compte requis.',
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
      why1: 'Ultra Rapide & Fiable',
      why1Sub: 'Moteur de conversion haute vitesse préservant votre mise en page originale.',
      why2: 'Sécurisé & Privé',
      why2Sub: 'Vos fichiers sont traités en sécurité et supprimés automatiquement de nos serveurs.',
      why3: 'Compatible Tous Appareils',
      why3Sub: 'Utilisez-le sur ordinateur, tablette ou mobile — partout et à tout moment.',
      why4: '100% Gratuit',
      why4Sub: 'Conversions gratuites jusqu\'à 100 Mo. Aucune inscription requise.'
    },
    tools: {
      'word-to-pdf': {
        title: 'Convertir Word en PDF - Gratuit et en Ligne | PDFConverter',
        h1: 'Convertir Word en PDF',
        description: 'Convertissez vos documents Word DOCX et DOC en fichiers PDF de haute qualité en ligne. Rapide, sécurisé et préserve la mise en page.',
        faqs: [
          { q: 'La mise en page de mon document Word sera-t-elle conservée ?', a: 'Oui. Notre moteur préserve fidèlement les polices, tableaux et marges de votre document d’origine.' },
          { q: 'Le convertisseur Word en PDF est-il gratuit ?', a: 'Oui, 100% gratuit, sans inscription, sans filigrane et sans limite cachée.' },
        ],
      },
      'pdf-to-word': {
        title: 'Convertir PDF en Word - Gratuit et en Ligne | PDFConverter',
        h1: 'Convertir PDF en Word',
        description: 'Convertissez vos documents PDF en fichiers Microsoft Word DOCX modifiables. Récupérez facilement vos textes et tableaux.',
        faqs: [
          { q: 'Puis-je modifier le fichier Word généré ?', a: 'Oui. Le document DOCX produit est totalement modifiable dans Microsoft Word, Google Docs et LibreOffice.' },
          { q: 'Mes documents sont-ils protégés ?', a: 'Absolument. Vos fichiers ne sont jamais conservés et sont automatiquement supprimés de nos serveurs.' },
        ],
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
      description: 'Convierte, comprime y edita archivos PDF, Office e imágenes online gratis. Procesamiento en el navegador sin cuenta.',
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
      why1: 'Súper Rápido y Fiable',
      why1Sub: 'Motor de conversión de alta velocidad que preserva el formato original.',
      why2: 'Seguro y Privado',
      why2Sub: 'Los archivos procesados se eliminan automáticamente de nuestros servidores.',
      why3: 'Funciona en cualquier dispositivo',
      why3Sub: 'Úsalo en tu PC, tablet o móvil — en cualquier momento y lugar.',
      why4: '100% Gratis',
      why4Sub: 'Conversiones gratis hasta 100MB. Sin necesidad de registrarse.'
    },
    tools: {
      'word-to-pdf': {
        title: 'Convertir Word a PDF - Gratis y Online | PDFConverter',
        h1: 'Convertir Word a PDF',
        description: 'Convierte tus documentos Word DOCX a PDF con máxima calidad online. Rápido, seguro y manteniendo todo el formato original.',
        faqs: [
          { q: '¿Se mantiene el formato y las fuentes originales?', a: 'Sí. El conversor respeta exactamente los márgenes, tablas, imágenes y tipografía de tu archivo Word.' },
          { q: '¿Es realmente gratis este conversor?', a: 'Sí, 100% gratuito, sin marcas de agua y sin necesidad de crear una cuenta.' },
        ],
      },
      'pdf-to-word': {
        title: 'Convertir PDF a Word - Gratis y Online | PDFConverter',
        h1: 'Convertir PDF a Word',
        description: 'Convierte documentos PDF a archivos Word DOCX editables en segundos con alta precisión de formato.',
        faqs: [
          { q: '¿El archivo Word resultante se puede editar?', a: 'Sí. Obtendrás un archivo DOCX totalmente editable compatible con Microsoft Word y Google Docs.' },
          { q: '¿Están seguros mis documentos?', a: 'Totalmente. Tus archivos se procesan de forma privada y segura.' },
        ],
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
      description: 'Konvertieren, komprimieren und bearbeiten Sie PDF, Office und Bilder kostenlos online. Keine Registrierung erforderlich.',
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
      why1: 'Superschnell & Zuverlässig',
      why1Sub: 'Hochgeschwindigkeits-Konvertierung, die das Original-Layout beibehält.',
      why2: 'Sicher & Privat',
      why2Sub: 'Server-Dateien werden nach der Verarbeitung automatisch dauerhaft gelöscht.',
      why3: 'Funktioniert auf jedem Gerät',
      why3Sub: 'Nutzen Sie es auf Desktop, Tablet oder Smartphone — jederzeit und überall.',
      why4: '100% Kostenlos',
      why4Sub: 'Kostenlose Konvertierungen bis zu 100 MB. Keine Registrierung nötig.'
    },
    tools: {
      'word-to-pdf': {
        title: 'Word in PDF umwandeln - Kostenlos Online | PDFConverter',
        h1: 'Word in PDF umwandeln',
        description: 'Konvertieren Sie Microsoft Word DOCX-Dokumente schnell und kostenlos online in hochwertige PDF-Dateien.',
        faqs: [
          { q: 'Bleibt das Layout meines Word-Dokuments erhalten?', a: 'Ja, alle Formatierungen, Tabellen und Schriftarten bleiben exakt wie im Originaldokument erhalten.' },
          { q: 'Ist das Tool wirklich kostenlos?', a: 'Ja, 100% kostenlos ohne Wasserzeichen oder Anmeldung.' },
        ],
      },
      'pdf-to-word': {
        title: 'PDF in Word umwandeln - Kostenlos Online | PDFConverter',
        h1: 'PDF in Word umwandeln',
        description: 'Wandeln Sie PDF-Dokumente online in bearbeitbare Word DOCX-Dateien um. Schnelle und sichere Textextraktion.',
        faqs: [
          { q: 'Kann das ausgegebene Word-Dokument bearbeitet werden?', a: 'Ja, Sie erhalten eine vollständig bearbeitbare DOCX-Datei.' },
          { q: 'Sind meine Daten geschützt?', a: 'Ja, Datenschutz hat höchste Priorität. Ihre Dateien werden streng vertraulich behandelt.' },
        ],
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
      description: 'قم بتحويل وضغط وتعديل ملفات PDF و Office والصور عبر الإنترنت مجانًا. معالجة سريعة وبدون الحاجة لإنشاء حساب.',
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
      why1: 'سريع جداً وموثوق',
      why1Sub: 'محرك تحويل عالي السرعة يحافظ على التنسيق والخطوط الأصلية.',
      why2: 'آمن وخاص',
      why2Sub: 'تتم معالجة الملفات بأمان وتُحذف تلقائياً من الخوادم بعد الانتهاء.',
      why3: 'يعمل على جميع الأجهزة',
      why3Sub: 'استخدمه على الكمبيوتر، الجهاز اللوحي أو الهاتف المحمول — في أي وقت ومكان.',
      why4: 'مجاني 100% للاستخدام',
      why4Sub: 'تحويل مجاني للملفات حتى 100 ميجابايت. لا حاجة لإنشاء حساب.'
    },
    tools: {
      'word-to-pdf': {
        title: 'تحويل وورد الى PDF - مجاناً وبسرعة عبر الإنترنت | PDFConverter',
        h1: 'تحويل وورد إلى PDF',
        description: 'قم بتحويل مستندات Word و DOCX إلى ملفات PDF عالية الجودة عبر الإنترنت مجاناً وبدون فقدان التنسيق.',
        faqs: [
          { q: 'هل يتم الحفاظ على الخطوط والجداول الأصلية؟', a: 'نعم، يحافظ محرك التحويل على دقة الجداول والخطوط وتنسيق الفقرات بالكامل.' },
          { q: 'هل الأداة مجانية وبدون علامات مائية؟', a: 'نعم، مجانية 100% بدون أي علامات مائية وبدون الحاجة إلى التسجيل أو البريد الإلكتروني.' },
        ],
      },
      'pdf-to-word': {
        title: 'تحويل PDF الى وورد - مستند Word قابل للتعديل مجاناً | PDFConverter',
        h1: 'تحويل PDF إلى Word',
        description: 'حوّل ملفات PDF إلى مستندات Word DOCX قابلة للتعديل بسهولة وسرعة فائقة مباشرة في متصفحك.',
        faqs: [
          { q: 'هل يمكنني تعديل ملف Word الناتج؟', a: 'نعم، ستحصل على ملف DOCX حقيقي قابل للتحرير والتعديل على أي برنامج معالجة نصوص.' },
          { q: 'هل ملفاتي آمنة ومحمية؟', a: 'نعم بكل تأكيد، تتم معالجة المستندات في ذاكرة المتصفح بأمان وتُحذف فوراً.' },
        ],
      },
    }
  }
};